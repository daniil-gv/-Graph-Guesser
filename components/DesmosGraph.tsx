import React, { useEffect, useRef } from 'react';
import { GraphingCalculator } from '../types';

interface DesmosGraphProps {
  onInstanceReady: (instance: GraphingCalculator) => void;
}

export const DesmosGraph: React.FC<DesmosGraphProps> = ({ onInstanceReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<GraphingCalculator | null>(null);

  useEffect(() => {
    if (!containerRef.current || calculatorRef.current) return;

    // Initialize Desmos
    if (window.Desmos) {
      calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
        invertedColors: true, // Dark mode by default
        expressions: false, // Hide the sidebar so user can't see the answer
        keypad: false,      // Disable on-screen keypad
        settingsMenu: true, // Keep settings for grid adjustments
        zoomButtons: true,
        border: false,
        lockViewport: false,
      });

      onInstanceReady(calculatorRef.current);
    }

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900"
      id="calculator"
    />
  );
};