
import React from 'react';
import { Button } from './Button';

interface SyntaxGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyntaxGuide: React.FC<SyntaxGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="font-bold text-indigo-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Math Syntax Guide
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-0 overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-500 uppercase bg-slate-800/50 sticky top-0 backdrop-blur">
              <tr>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3">How to type it</th>
                <th className="px-4 py-3">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Basic</td><td className="px-4 py-3 font-mono text-indigo-300">y = ...</td><td className="px-4 py-3 font-mono text-xs text-slate-500">y = x^2 <span className="text-slate-600">(or just x^2)</span></td></tr>
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Exponent</td><td className="px-4 py-3 font-mono text-indigo-300">^</td><td className="px-4 py-3 font-mono text-xs text-slate-500">x^(n+1)</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Division</td><td className="px-4 py-3 font-mono text-indigo-300">/</td><td className="px-4 py-3 font-mono text-xs text-slate-500">1/x</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Square Root</td><td className="px-4 py-3 font-mono text-indigo-300">sqrt(x)</td><td className="px-4 py-3 font-mono text-xs text-slate-500">sqrt&#123;x&#125;</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Trig</td><td className="px-4 py-3 font-mono text-indigo-300">sin, cos</td><td className="px-4 py-3 font-mono text-xs text-slate-500">sin(x)</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Logarithm</td><td className="px-4 py-3 font-mono text-indigo-300">ln, log</td><td className="px-4 py-3 font-mono text-xs text-slate-500">ln(x)</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="px-4 py-3 text-slate-400">Constants</td><td className="px-4 py-3 font-mono text-indigo-300">pi, e</td><td className="px-4 py-3 font-mono text-xs text-slate-500">2*pi*x</td></tr>
            </tbody>
          </table>
          
          <div className="p-4 text-xs text-slate-500 bg-slate-900/50">
            <p className="mb-2"><strong className="text-indigo-400">Pro Tip:</strong> We handle the heavy lifting!</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
               <li>You don't need to type <code>y =</code>. Just type <code>x^2</code>.</li>
               <li><code>x^(a+b)</code> becomes <code>x&#123;a+b&#125;</code> automatically.</li>
               <li><code>sin(x)</code> becomes <code>\sin(x)</code>.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <Button onClick={onClose} className="w-full">Close</Button>
        </div>
      </div>
    </div>
  );
};
