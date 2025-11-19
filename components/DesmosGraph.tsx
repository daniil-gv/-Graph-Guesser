import React, { useEffect, useRef, useState } from 'react';
import { GraphingCalculator } from '../types';

interface DesmosGraphProps {
  onInstanceReady: (instance: GraphingCalculator) => void;
}

export const DesmosGraph: React.FC<DesmosGraphProps> = ({ onInstanceReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<GraphingCalculator | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Function to check if Desmos is ready
    const checkDesmos = () => {
      if (window.Desmos && containerRef.current && !calculatorRef.current) {
        
        // Initialize Desmos
        calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
          invertedColors: true, // Dark mode by default
          expressions: false, // Hide the sidebar
          keypad: false,      // Disable on-screen keypad
          settingsMenu: true, // Keep settings for grid
          zoomButtons: true,
          border: false,
          lockViewport: false,
        });

        onInstanceReady(calculatorRef.current);
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (!checkDesmos()) {
      // If not ready, poll every 100ms for up to 10 seconds
      const interval = setInterval(() => {
        if (checkDesmos()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 10 seconds to stop checking
      const timeout = setTimeout(() => clearInterval(interval), 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        if (calculatorRef.current) {
          calculatorRef.current.destroy();
          calculatorRef.current = null;
        }
      };
    }

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm z-10">
          Loading Graph Engine...
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        id="calculator"
      />
    </div>
  );
};