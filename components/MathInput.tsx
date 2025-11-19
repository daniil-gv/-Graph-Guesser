import React from 'react';

interface MathInputProps {
  value: string;
  onChange: (latex: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MathInput: React.FC<MathInputProps> = ({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Type an equation...",
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none 
          transition-all font-mono text-lg text-white placeholder-slate-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        spellCheck={false}
        autoComplete="off"
      />
      {/* Helper hint for LaTeX format */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </div>
    </div>
  );
};