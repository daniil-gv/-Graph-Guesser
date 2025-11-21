
/**
 * Helper function to replace parentheses with curly braces for specific commands.
 * Handles nested parentheses correctly by counting depth.
 * Example: "sqrt(x + (1))" -> "\sqrt{x + (1)}"
 */
const convertCommandParensToBraces = (text: string, commandName: string): string => {
  let result = text;
  let searchIndex = 0;
  while (true) {
    const rawIdx = result.indexOf(`${commandName}(`, searchIndex);
    if (rawIdx === -1) break;

    const isPrecededByBackslash = rawIdx > 0 && result[rawIdx - 1] === '\\';
    const isWordStart = rawIdx === 0 || /[^a-zA-Z0-9]/.test(result[rawIdx - 1]);

    if (!isWordStart && !isPrecededByBackslash) {
      searchIndex = rawIdx + 1;
      continue;
    }

    let depth = 1;
    let closeIdx = -1;
    const openParenIdx = rawIdx + commandName.length; 
    
    for (let i = openParenIdx + 1; i < result.length; i++) {
      if (result[i] === '(') depth++;
      else if (result[i] === ')') depth--;

      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }

    if (closeIdx !== -1) {
      const before = result.substring(0, rawIdx - (isPrecededByBackslash ? 1 : 0));
      const content = result.substring(openParenIdx + 1, closeIdx);
      const after = result.substring(closeIdx + 1);

      const replacement = `\\${commandName}{${content}}`;
      result = before + replacement + after;
      searchIndex = before.length + replacement.length;
    } else {
      searchIndex = rawIdx + 1;
    }
  }
  return result;
};

/**
 * Specifically handles power/exponent operator "^".
 * Converts "x^(expression)" to "x^{expression}".
 */
const convertPowerParensToBraces = (text: string): string => {
  let result = text;
  let searchIndex = 0;

  while (true) {
    // Look for "^("
    const idx = result.indexOf('^(', searchIndex);
    if (idx === -1) break;

    // Found "^(". Find matching ")".
    let depth = 1;
    let closeIdx = -1;
    const openParenIdx = idx + 1; // Index of '('

    for (let i = openParenIdx + 1; i < result.length; i++) {
      const char = result[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;

      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }

    if (closeIdx !== -1) {
      const before = result.substring(0, idx);
      const content = result.substring(openParenIdx + 1, closeIdx);
      const after = result.substring(closeIdx + 1);

      // Replace with "^{content}"
      // We continue searching from idx + 1 to allow processing nested powers inside the content
      const replacement = `^{${content}}`;
      result = before + replacement + after;
      searchIndex = idx + 1;
    } else {
      // Unbalanced parentheses, skip
      searchIndex = idx + 2;
    }
  }
  return result;
};

/**
 * Handles chained exponents without parentheses like "x^x^x".
 * Converts "x^y^z" to "x^{y^{z}}" (right-associative).
 */
const convertChainedExponents = (text: string): string => {
  // Matches a word/number followed by at least two (^word) groups.
  // Example: matches "x^x^x" or "2^x^5"
  const regex = /([a-zA-Z0-9]+)(?:\^([a-zA-Z0-9]+)){2,}/g;
  
  return text.replace(regex, (match) => {
    const parts = match.split('^');
    // parts[0] is base, parts[1..n] are exponents
    
    // Build from right to left
    // Start with the last exponent
    let currentExp = parts[parts.length - 1];
    
    // Iterate backwards from the second to last item down to the first exponent (index 1)
    for (let i = parts.length - 2; i >= 1; i--) {
      currentExp = `${parts[i]}^{${currentExp}}`;
    }
    
    // Attach the base (index 0)
    return `${parts[0]}^{${currentExp}}`;
  });
};

/**
 * Formats user input into Desmos-compatible LaTeX.
 * Handles function mapping (abs -> \operatorname{abs}) and 
 * ensures proper backslashes for standard functions.
 */
export const formatLatexForDesmos = (input: string): string => {
  if (!input) return "";
  let latex = input;
  
  // 1. Handle chained exponents x^x^x -> x^{x^{x}}
  latex = convertChainedExponents(latex);
  
  // 2. Intelligent Exponent Conversion: x^(...) -> x^{...}
  latex = convertPowerParensToBraces(latex);

  // 3. Handle specific words that need operator syntax
  // Using \operatorname{} is the most robust way to ensure Desmos treats them as functions
  latex = latex.replace(/\babs\(/g, '\\operatorname{abs}(');
  latex = latex.replace(/\bround\(/g, '\\operatorname{round}(');
  latex = latex.replace(/\bfloor\(/g, '\\operatorname{floor}(');
  latex = latex.replace(/\bceil\(/g, '\\operatorname{ceil}(');

  // 4. Intelligent Bracket Conversion for commands that REQUIRE braces
  latex = convertCommandParensToBraces(latex, 'sqrt');
  latex = convertCommandParensToBraces(latex, 'frac'); 

  // 5. Ensure standard trig/log/misc functions have backslashes
  const funcs = [
    'arcsin', 'arccos', 'arctan', 
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 
    'sinh', 'cosh', 'tanh',
    'ln', 'log', 'min', 'max',
    'sqrt' 
  ];
  
  funcs.forEach(fn => {
     const regex = new RegExp(`(\\\\)?\\b${fn}\\b`, 'g');
     latex = latex.replace(regex, (match, existingSlash) => {
        if (existingSlash) return match;
        return `\\${fn}`;
     });
  });
  
  // 6. Clean up any double backslashes
  latex = latex.replace(/\\\\/g, '\\');
  
  return latex;
};