import React from 'react';
import { Button } from './Button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            About Project
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm">
            Desmos Graph Guesser is an educational math puzzle game designed to test and improve your intuition for mathematical functions and their graphical representations.
          </p>

          <div className="space-y-3">
            <h4 className="text-slate-500 font-bold uppercase text-xs tracking-wider">Developer Links</h4>
            
          

            <a 
              href="https://t.me/emaN_r_e_s_U"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all group"
            >
              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               <div>
                <div className="text-sm font-medium text-slate-200 group-hover:text-sky-400 transition-colors">Contact Support</div>
                <div className="text-xs text-slate-500">Report bugs or suggest features</div>
              </div>
            </a>
          </div>
          
          <div className="pt-4 border-t border-slate-800 text-center">
             <p className="text-xs text-slate-600">2025 Graph Guesser. Built with React & Desmos API.</p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <Button onClick={onClose} className="w-full" variant="secondary">Close</Button>
        </div>
      </div>
    </div>
  );
};