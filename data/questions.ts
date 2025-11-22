
import { GameDifficulty, MysteryFunction } from "../types";

export const QUESTIONS: Record<GameDifficulty, MysteryFunction[]> = {
  [GameDifficulty.EASY]: [
    { latex: "y = \\sqrt{x}", description: "Square Root", hint: "Only exists for positive x." },
    { latex: "y = \\operatorname{abs}(x)", description: "Absolute Value", hint: "V-shaped graph." },
    { latex: "y = x", description: "Identity Line", hint: "For every step right, you go one step up." },
    { latex: "y = x^2", description: "Standard Parabola", hint: "The most basic quadratic curve." },
    { latex: "y = \\sin(x)", description: "Sine Wave", hint: "Starts at 0, goes up to 1, down to -1." },
    { latex: "y = \\tan(x)", description: "Tangent", hint: "Repeating vertical asymptotes." },
    { latex: "y = 2x - 3", description: "Linear Equation", hint: "Slope is 2, y-intercept is -3." },
  ],
  [GameDifficulty.MEDIUM]: [
    { latex: "y = \\sin(x) + x", description: "Sloped Wave", hint: "A wave climbing up a hill." },
    { latex: "y = \\frac{x}{x-1}", description: "Rational Function", hint: "Vertical asymptote at x=1." },
    { latex: "y = x^3 - x", description: "Wavy Cubic", hint: "Crosses x axis at -1, 0, 1." },
    { latex: "y = \\min(x^2, 4)", description: "Capped Parabola", hint: "Looks like a parabola until it flattens." },
    {
      latex: "y = x^x",
      description: "Self-Powered Curve",
      hint: "Explodes extremely fast; has a minimum for x > 0 from derivative."
    },
  ],
  [GameDifficulty.HARD]: [
    {
      latex: "y = \\operatorname{abs}(\\sin(x)) + \\ln(x)",
      description: "Absolute Sine with Log",
      hint: "Starts only for x > 0; oscillations sit on top of a rising log curve."
    },
    {
      latex: "(x^2 + y^2 - 1)^3 = x^2 y^3",
      description: "Heart Curve",
      hint: "A classic heart shape."
    },
    {
      latex: "y = x^2 \\ln(x)",
      description: "Quadratic Times Log",
      hint: "Negative until x > 1; derivative gives a point of fastest growth."
    },
    {
      latex: "y^2 = x^3 - x",
      description: "Cubic Implicit Curve",
      hint: "A curve with two lobes touching at the origin."
    },
    {
      latex: "x^{2/3} + y^{2/3} = 1",
      description: "Astroid",
      hint: "A smooth star-like curve with 4 rounded corners."
    },
    {
      latex: "y = \\frac{1}{x} + \\sin(x)",
      description: "Sinusoid on a Decaying Envelope",
      hint: "Vertical asymptote at 0; oscillations shrink asymptotically."
    }
  ],
  [GameDifficulty.EXTREME]: [
    {
      latex: "\\sin(xy) = 0.5",
      description: "Sinusoidal Level Curve",
      hint: "Repeating structure based on diagonal waves."
    },
    {
      latex: "y = \\sqrt{x} - \\ln(x)",
      description: "Root Minus Log",
      hint: "Crosses zero once; derivative shows a global minimum."
    }
  ]
};
