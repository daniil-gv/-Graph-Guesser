
import React, { useEffect, useState } from 'react';
import { formatLatexForDesmos } from '../utils/latexUtils';

interface TestResult {
  name: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  error?: string;
}

export const TestRunner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0 });

  useEffect(() => {
    const runTests = () => {
      const tests: TestResult[] = [];
      
      // Helper assertion function
      const expect = (input: string, expected: string, testName: string) => {
        try {
          const actual = formatLatexForDesmos(input);
          if (actual === expected) {
            tests.push({ name: testName, passed: true });
          } else {
            tests.push({ name: testName, passed: false, expected, actual });
          }
        } catch (e: any) {
          tests.push({ name: testName, passed: false, error: e.message });
        }
      };

      // --- Test Cases ---
      expect('x^2', 'x^2', 'Implied y= (x^2)');
      expect('y = x^2', 'y = x^2', 'Explicit y= (y = x^2)');
      expect('sin(x)', '\\sin(x)', 'Trig func without y=');
      expect('y = abs(x)', 'y = \\operatorname{abs}(x)', 'Converts abs operator');
      expect('sin x', '\\sin x', 'Relaxed syntax (no parens)');
      
      // Sqrt tests
      expect('sqrt(x)', '\\sqrt{x}', 'Converts sqrt(x) -> \\sqrt{x}');
      expect('sqrt((x+1))', '\\sqrt{(x+1)}', 'Nested parens in sqrt');

      // Exponent tests
      expect('x^(n+1)', 'x^{n+1}', 'Complex exponent x^(n+1)');
      expect('x^(x^x)', 'x^{x^x}', 'Recursive exponent x^(x^x)');
      expect('x^x^x', 'x^{x^{x}}', 'Chained exponent x^x^x');
      expect('e^(sin(x))', 'e^{\\sin(x)}', 'Exponent with function');
      expect('x^(a^(b))', 'x^{a^{b}}', 'Nested exponent parentheses');
      
      // Special functions
      expect('round(x)', '\\operatorname{round}(x)', 'Round function');
      expect('floor(x)', '\\operatorname{floor}(x)', 'Floor function');

      setResults(tests);
      setSummary({
        total: tests.length,
        passed: tests.filter(t => t.passed).length
      });
    };

    runTests();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white">Internal Diagnostics</h3>
            <span className={`text-xs font-mono px-2 py-1 rounded ${summary.passed === summary.total ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {summary.passed}/{summary.total} Passing
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 font-mono text-sm">
          {results.map((test, idx) => (
            <div key={idx} className={`p-3 rounded border ${test.passed ? 'border-green-900/50 bg-green-900/10' : 'border-red-900/50 bg-red-900/10'}`}>
              <div className="flex items-center gap-2">
                <span className={test.passed ? "text-green-400" : "text-red-400"}>
                  {test.passed ? "✓" : "✗"}
                </span>
                <span className="text-slate-300">{test.name}</span>
              </div>
              {!test.passed && (
                <div className="mt-2 ml-5 text-xs text-slate-400 bg-slate-950/50 p-2 rounded">
                  <div>Expected: <span className="text-green-400">{test.expected}</span></div>
                  <div>Actual:   <span className="text-red-400">{test.actual}</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};