// Desmos API Type Definitions (Minimal subset)
export interface DesmosExpression {
  id: string;
  latex?: string;
  color?: string;
  lineStyle?: 'SOLID' | 'DASHED' | 'DOTTED';
  lineWidth?: number;
  hidden?: boolean;
  secret?: boolean; // Custom flag to indicate if this is the mystery function (internal logic)
}

export interface DesmosState {
  expressions: {
    list: DesmosExpression[];
  };
}

export interface GraphingCalculator {
  setExpression: (expression: DesmosExpression) => void;
  removeExpression: (id: string) => void;
  getExpressions: () => DesmosExpression[];
  setBlank: () => void;
  destroy: () => void;
  getState: () => DesmosState;
  setState: (state: DesmosState) => void;
  screenshot: (opts: { width: number; height: number; targetPixelRatio: number }) => string;
  setMathBounds: (bounds: { left: number; right: number; bottom: number; top: number }) => void;
}

// Extend Window interface to include Desmos
declare global {
  interface Window {
    Desmos: {
      GraphingCalculator: (element: HTMLElement, options?: any) => GraphingCalculator;
      Styles: {
        SOLID: 'SOLID';
        DASHED: 'DASHED';
        DOTTED: 'DOTTED';
      };
    };
  }
}

// Application Types
export enum GameDifficulty {
  EASY = 'Easy (Lines)',
  MEDIUM = 'Medium (Parabolas)',
  HARD = 'Hard (Trig/Cubic)',
  EXTREME = 'Extreme (Rational/Parametric)'
}

export interface MysteryFunction {
  latex: string;
  description: string;
  hint: string;
}

export interface ValidationResult {
  correct: boolean;
  message: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  CHECKING = 'CHECKING',
  WON = 'WON',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
}