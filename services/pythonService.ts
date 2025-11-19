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
from sympy import simplify, trigsimp, parse_expr, Symbol, sin, cos, tan, cot, sec, csc, log, ln, sqrt, pi, exp, E
from sympy.parsing.sympy_parser import standard_transformations, implicit_multiplication_application

def parse_latex_fractions_and_groups(s):
    """
    Manually replaces \frac{num}{den} with (num)/(den) using a stack to track braces.
    """
    # Handle \\frac (double backslash) and \frac (single backslash)
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

def clean_and_parse(latex_str):
    if not latex_str: return ""
    
    # 1. Remove LHS if present
    if '=' in latex_str:
        latex_str = latex_str.split('=')[-1]
    
    s = latex_str.strip()
    
    # 2. Basic token replacements
    s = s.replace(r'\\left', '').replace(r'\left', '')
    s = s.replace(r'\\right', '').replace(r'\right', '')
    s = s.replace(r'\\cdot', '*').replace(r'\cdot', '*')
    s = s.replace(r'\\operatorname', '').replace(r'\operatorname', '')
    s = s.replace('^', '**')
    
    # 3. Handle specific functions
    funcs = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'ln', 'log', 'sqrt', 'exp']
    for f in funcs:
        s = s.replace(rf'\\{f}', f).replace(rf'\{f}', f)
    
    s = s.replace(r'\\pi', 'pi').replace(r'\pi', 'pi')

    # 4. Handle fractions
    s = parse_latex_fractions_and_groups(s)
    
    # 5. Final cleanup
    s = s.replace('{', '(').replace('}', ')')
    
    return s

def compare_expressions(target_latex, user_latex):
    try:
        s_target = clean_and_parse(target_latex)
        s_user = clean_and_parse(user_latex)
        
        if not s_user:
             return {"correct": False, "message": "Please enter an equation."}

        transformations = (standard_transformations + (implicit_multiplication_application,))
        
        expr_target = parse_expr(s_target, transformations=transformations)
        expr_user = parse_expr(s_user, transformations=transformations)
        
        # Substitute 'e' symbol with Euler's number E for correct comparison
        # This ensures e^x and exp(x) are treated as equivalent
        sym_e = Symbol('e')
        expr_target = expr_target.subs(sym_e, E)
        expr_user = expr_user.subs(sym_e, E)
        
        diff = expr_target - expr_user
        result = simplify(diff)
        
        if result != 0:
            result = trigsimp(result)
        
        is_correct = (result == 0)
        
        return {
            "correct": is_correct, 
            "message": "Correct! The functions are equivalent." if is_correct else "Incorrect. Keep trying!"
        }
    
    except Exception as e:
        return {"correct": False, "message": f"Math Error: {str(e)}"}

compare_expressions(target_expr, user_expr)
`;

export const initPyodide = async () => {
  if (pyodideReadyPromise) return pyodideReadyPromise;

  pyodideReadyPromise = (async () => {
    try {
      // 1. Dynamically load the script if it's not available
      if (typeof window.loadPyodide !== 'function') {
        console.log("Loading Pyodide script...");
        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${PYODIDE_BASE_URL}pyodide.js`;
            script.crossOrigin = "anonymous";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN"));
            document.head.appendChild(script);
        });
      }
      
      console.log("Initializing Pyodide...");
      // Explicitly set indexURL to the CDN base.
      window.pyodideInstance = await window.loadPyodide({
        indexURL: PYODIDE_BASE_URL,
      });
      
      console.log("Loading SymPy package...");
      await window.pyodideInstance.loadPackage("sympy");
      
      console.log("Python Engine Ready");
    } catch (err) {
      console.error("Failed to initialize Pyodide", err);
      pyodideReadyPromise = null; // Allow retry
      throw err;
    }
  })();

  return pyodideReadyPromise;
};

export const validateGuessWithPython = async (targetLatex: string, userLatex: string): Promise<ValidationResult> => {
  try {
    await initPyodide();
    
    if (!window.pyodideInstance) {
        throw new Error("Pyodide instance not found");
    }

    // Pass variables to Python global scope
    window.pyodideInstance.globals.set("target_expr", targetLatex);
    window.pyodideInstance.globals.set("user_expr", userLatex);
    
    // Run
    const resultProxy = await window.pyodideInstance.runPythonAsync(PYTHON_COMPARATOR_SCRIPT);
    const result = resultProxy.toJs();
    resultProxy.destroy();
    
    if (result instanceof Map) {
        return {
            correct: result.get("correct"),
            message: result.get("message")
        };
    }
    return result as ValidationResult;
    
  } catch (e: any) {
    console.error("Python Comparison Error:", e);
    return { correct: false, message: `Engine Error: ${e.message || "Unknown error"}` };
  }
};