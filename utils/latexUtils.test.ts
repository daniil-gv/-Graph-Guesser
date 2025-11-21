
import { describe, it, expect } from 'vitest';
import { formatLatexForDesmos } from './latexUtils';

describe('formatLatexForDesmos', () => {
  it('passes through simple variables and numbers', () => {
    expect(formatLatexForDesmos('y = x^2')).toBe('y = x^2');
    expect(formatLatexForDesmos('2*x + 5')).toBe('2*x + 5');
  });

  it('converts "abs" to Desmos operator syntax', () => {
    expect(formatLatexForDesmos('y = abs(x)')).toBe('y = \\operatorname{abs}(x)');
  });
  
  it('preserves pipe notation for absolute value', () => {
    expect(formatLatexForDesmos('y = |x|')).toBe('y = |x|');
    expect(formatLatexForDesmos('|x| + 1')).toBe('|x| + 1');
  });

  it('converts standard trig functions', () => {
    expect(formatLatexForDesmos('sin(x)')).toBe('\\sin(x)');
    expect(formatLatexForDesmos('cos(x)')).toBe('\\cos(x)');
    expect(formatLatexForDesmos('tan(x)')).toBe('\\tan(x)');
  });

  it('handles inverse trig functions correctly', () => {
    expect(formatLatexForDesmos('arcsin(x)')).toBe('\\arcsin(x)');
    expect(formatLatexForDesmos('arccos(x)')).toBe('\\arccos(x)');
  });

  it('handles multiple functions in one expression', () => {
    expect(formatLatexForDesmos('sin(x) + abs(x)')).toBe('\\sin(x) + \\operatorname{abs}(x)');
  });

  // Sqrt tests
  it('converts sqrt(x) to sqrt{x}', () => {
    expect(formatLatexForDesmos('sqrt(x)')).toBe('\\sqrt{x}');
  });

  it('converts nested parenthesis in sqrt correctly', () => {
    expect(formatLatexForDesmos('sqrt((x+1))')).toBe('\\sqrt{(x+1)}');
  });

  // Relaxed Syntax tests
  it('handles functions with exponents (sin^2)', () => {
    expect(formatLatexForDesmos('sin^2(x)')).toBe('\\sin^2(x)');
  });

  it('handles functions without parentheses (sin x)', () => {
    expect(formatLatexForDesmos('sin x')).toBe('\\sin x');
  });
  
  // Exponent Tests
  it('converts exponents with parentheses to curly braces', () => {
    expect(formatLatexForDesmos('x^(n+1)')).toBe('x^{n+1}');
  });

  it('converts nested exponents correctly', () => {
    expect(formatLatexForDesmos('x^(x^x)')).toBe('x^{x^x}');
  });

  it('converts complex nested exponents', () => {
    // x^(a^(b)) -> x^{a^{b}}
    expect(formatLatexForDesmos('x^(a^(b))')).toBe('x^{a^{b}}');
  });

  // Chained Exponent Tests (x^x^x)
  it('converts chained exponents without braces', () => {
    expect(formatLatexForDesmos('x^x^x')).toBe('x^{x^{x}}');
  });

  it('converts long chained exponents', () => {
    expect(formatLatexForDesmos('x^a^b^c')).toBe('x^{a^{b^{c}}}');
  });
  
  it('handles chained exponents mixed with other math', () => {
    expect(formatLatexForDesmos('y = x^2^3 + 1')).toBe('y = x^{2^{3}} + 1');
  });

  it('works mixed with functions', () => {
    expect(formatLatexForDesmos('e^(sin(x))')).toBe('e^{\\sin(x)}');
  });
  
  it('converts round function correctly', () => {
    expect(formatLatexForDesmos('round(x)')).toBe('\\operatorname{round}(x)');
  });
});