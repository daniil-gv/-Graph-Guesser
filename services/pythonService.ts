import { ValidationResult } from "../types";

declare global {
  interface Window {
    loadPyodide: any;
    pyodideInstance: any;
  }
}

let pyodideReadyPromise: Promise<void> | null = null;

// Using a newer, more stable version of Pyodide
const PYODIDE_VERSION = "v0.26.2";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

// We use String.raw to treat backslashes literally in the Python source code string.
const PYTHON_COMPARATOR_SCRIPT = String.raw`
import json
from sympy import simplify, trigsimp, parse_expr, Symbol, sin, cos, tan, cot, sec, csc, log, ln, sqrt, pi, exp, E, Abs, asin, acos, atan, Min, Max, floor, ceiling, Function
from sympy.parsing.sympy_parser import standard_transformations, implicit_multiplication_application
import re

# Define custom functions that might not be standard in SymPy's global namespace for parsing
# This is crucial for 'round' to prevent it from using Python's built-in round()
custom_round = Function('round')

def parse_latex_fractions_and_groups(s):
    """
    Manually replaces \frac{num}{den} with (num)/(den) using a stack to track braces.
    """
    target_token = None
    if r'\\frac' in s: target_token = r'\\frac'
    elif r'\frac' in s: target_token = r'\frac'
    
    while target_token and target_token in s:
        idx = s.find(target_token)
        if idx == -1: break
        
        # Find start of numerator
        start_num = s.find('{', idx)
        if start_num == -1: break 
        
        # Find end of numerator
        depth = 0
        end_num = -1
        for i in range(start_num, len(s)):
            if s[i] == '{': depth += 1
            elif s[i] == '}': depth -= 1
            if depth == 0:
                end_num = i
                break
        
        if end_num == -1: break 
        
        # Find start of denominator
        start_den = s.find('{', end_num + 1)
        if start_den == -1: break 
        
        # Find end of denominator
        depth = 0
        end_den = -1
        for i in range(start_den, len(s)):
            if s[i] == '{': depth += 1
            elif s[i] == '}': depth -= 1
            if depth == 0:
                end_den = i
                break
        
        if end_den == -1: break
        
        # Extract content
        numer = s[start_num+1 : end_num]
        denom = s[start_den+1 : end_den]
        
        replacement = f"({numer})/({denom})"
        s = s[:idx] + replacement + s[end_den+1:]

    return s

def preprocess_latex_content(s):
    """
    Cleans LaTeX string for SymPy parsing WITHOUT splitting equations.
    Handles replacements of functions, braces, and operators.
    """
    if not s: return "0"
    s = s.strip()
    
    # 1. Handle \operatorname{name} -> name
    # This fixes the bug where \operatorname{abs} became {abs} which parsed as variable multiplication
    s = re.sub(r'\\operatorname\s*\{([^\}]+)\}', r'\1', s)
    s = re.sub(r'\\operatorname\s*([a-zA-Z0-9]+)', r'\1', s) # fallback without braces

    # 2. Remove formatting tokens
    s = s.replace(r'\\left', '').replace(r'\left', '')
    s = s.replace(r'\\right', '').replace(r'\right', '')
    s = s.replace(r'\\cdot', '*').replace(r'\cdot', '*')
    s = s.replace('^', '**')
    
    # 3. Handle explicit LaTeX \abs{x} -> Abs(x) (if user typed strict latex)
    s = re.sub(r'\\abs\s*\{([^\}]+)\}', r'Abs(\1)', s)
    
    # 4. Handle dictionary replacements
    # IMPORTANT: Order matters! Longer strings first.
    replacements = {
        # Inverse trig first (longer)
        r'\\arcsin': 'asin', r'\arcsin': 'asin', 'arcsin': 'asin',
        r'\\arccos': 'acos', r'\arccos': 'acos', 'arccos': 'acos',
        r'\\arctan': 'atan', r'\arctan': 'atan', 'arctan': 'atan',
        
        # Basic trig
        r'\\sin': 'sin', r'\sin': 'sin',
        r'\\cos': 'cos', r'\cos': 'cos',
        r'\\tan': 'tan', r'\tan': 'tan',
        r'\\sec': 'sec', r'\sec': 'sec',
        r'\\csc': 'csc', r'\csc': 'csc',
        r'\\cot': 'cot', r'\cot': 'cot',
        
        # Other functions
        r'\\min': 'Min', r'\min': 'Min', 'min': 'Min',
        r'\\max': 'Max', r'\max': 'Max', 'max': 'Max',
        r'\\round': 'round', r'\round': 'round', 'round': 'round',
        r'\\floor': 'floor', r'\floor': 'floor',
        r'\\ceil': 'ceiling', r'\ceil': 'ceiling',
        r'\\ln': 'ln', r'\ln': 'ln',
        r'\\log': 'log', r'\log': 'log',
        r'\\sqrt': 'sqrt', r'\sqrt': 'sqrt',
        r'\\exp': 'exp', r'\exp': 'exp',
        r'\\pi': 'pi', r'\pi': 'pi',
        r'\\abs': 'Abs', r'\abs': 'Abs', 'abs': 'Abs'
    }

    # Apply replacements.
    for old, new in replacements.items():
        s = s.replace(old, new)

    # 5. Handle fractions
    s = parse_latex_fractions_and_groups(s)
    
    # 6. Handle absolute value pipes |x| -> Abs(x)
    # Regex matches |content| where content is not |
    if '|' in s:
        s = re.sub(r'\|([^|]+)\|', r'Abs(\1)', s)

    # 7. Final cleanup: replace braces with parens
    s = s.replace('{', '(').replace('}', ')')
    
    return s

def get_zero_form_expression(latex_str):
    """
    Parses a latex string into a SymPy expression that represents 'Function = 0'.
    """
    transformations = (standard_transformations + (implicit_multiplication_application,))
    
    # Prepare parsing context. We copy globals to ensure standard functions (sin, cos) are available,
    # but explicitly inject our symbolic 'round' function to override Python's built-in.
    parse_context = globals().copy()
    parse_context['round'] = custom_round

    try:
        if '=' in latex_str:
            parts = latex_str.split('=')
            lhs_raw = parts[0]
            rhs_raw = "=".join(parts[1:])
            
            lhs_clean = preprocess_latex_content(lhs_raw)
            rhs_clean = preprocess_latex_content(rhs_raw)
            
            e_lhs = parse_expr(lhs_clean, local_dict=parse_context, transformations=transformations)
            e_rhs = parse_expr(rhs_clean, local_dict=parse_context, transformations=transformations)
            
            return e_lhs - e_rhs
        else:
            clean = preprocess_latex_content(latex_str)
            e_rhs = parse_expr(clean, local_dict=parse_context, transformations=transformations)
            return Symbol('y') - e_rhs
    except Exception as e:
        raise ValueError(f"Parsing Error: {str(e)}")

def compare_expressions(target_latex, user_latex):
    try:
        if not user_latex or not user_latex.strip():
             return json.dumps({"correct": False, "message": "Please enter an equation."})

        expr_target = get_zero_form_expression(target_latex)
        expr_user = get_zero_form_expression(user_latex)
        
        sym_e = Symbol('e')
        expr_target = expr_target.subs(sym_e, E)
        expr_user = expr_user.subs(sym_e, E)
        
        # Check difference
        diff = simplify(expr_target - expr_user)
        
        if diff == 0:
            return json.dumps({"correct": True, "message": "Correct!"})
            
        if diff != 0:
            diff = trigsimp(diff)
            if diff == 0:
                return json.dumps({"correct": True, "message": "Correct!"})
            
        # Check additive inverse
        diff_inv = simplify(expr_target + expr_user)
        if diff_inv == 0:
             return json.dumps({"correct": True, "message": "Correct!"})

        # Expand check
        if simplify(diff.expand()) == 0:
            return json.dumps({"correct": True, "message": "Correct!"})

        return json.dumps({
            "correct": False, 
            "message": "Incorrect. Keep trying!"
        })
    
    except Exception as e:
        return json.dumps({"correct": False, "message": f"Syntax Error: {str(e)}"})

compare_expressions(target_expr, user_expr)
`;

export const initPyodide = async (): Promise<void> => {
  if (pyodideReadyPromise) return pyodideReadyPromise;

  pyodideReadyPromise = new Promise((resolve, reject) => {
    if (window.pyodideInstance) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${PYODIDE_BASE_URL}pyodide.js`;
    script.onload = async () => {
      try {
        window.pyodideInstance = await window.loadPyodide({
          indexURL: PYODIDE_BASE_URL,
        });
        await window.pyodideInstance.loadPackage("sympy");
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });

  return pyodideReadyPromise;
};

export const validateGuessWithPython = async (
  targetLatex: string, 
  userLatex: string
): Promise<ValidationResult> => {
  if (!window.pyodideInstance) {
    throw new Error("Pyodide not initialized");
  }

  try {
    // Set variables in Python scope
    window.pyodideInstance.globals.set("target_expr", targetLatex);
    window.pyodideInstance.globals.set("user_expr", userLatex);

    // Run the comparison script
    const resultJson = await window.pyodideInstance.runPythonAsync(PYTHON_COMPARATOR_SCRIPT);
    
    return JSON.parse(resultJson);
  } catch (error: any) {
    console.error("Python execution error:", error);
    return {
      correct: false,
      message: "Error processing equation. Please check your syntax."
    };
  }
};