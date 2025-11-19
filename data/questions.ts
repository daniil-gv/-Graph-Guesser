import { GameDifficulty, MysteryFunction } from "../types";

export const QUESTIONS: Record<GameDifficulty, MysteryFunction[]> = {
  [GameDifficulty.EASY]: [
    { latex: "y = x", description: "Identity Line", hint: "For every step right, you go one step up." },
    { latex: "y = 2x", description: "Steep Line", hint: "It rises twice as fast as the standard line." },
    { latex: "y = 0.5x", description: "Shallow Line", hint: "For every two steps right, you go one step up." },
    { latex: "y = -x", description: "Negative Slope", hint: "Going down hill at a 45 degree angle." },
    { latex: "y = x + 2", description: "Shifted Line", hint: "Crosses the y-axis at 2." },
    { latex: "y = 2x - 3", description: "Linear Equation", hint: "Slope is 2, y-intercept is -3." },
    { latex: "y = 3", description: "Horizontal Line", hint: "No matter what x is, y stays the same." },
  ],
  [GameDifficulty.MEDIUM]: [
    { latex: "y = x^2", description: "Standard Parabola", hint: "The most basic quadratic curve." },
    { latex: "y = -x^2", description: "Inverted Parabola", hint: "Like a cup turned upside down." },
    { latex: "y = x^2 + 2", description: "Lifted Parabola", hint: "Standard parabola shifted up by 2." },
    { latex: "y = (x-2)^2", description: "Shifted Parabola", hint: "Vertex is at x = 2." },
    { latex: "y = x^2 - 4", description: "Dropped Parabola", hint: "Crosses the x-axis at -2 and 2." },
    { latex: "y = 0.5x^2", description: "Wide Parabola", hint: "It opens up wider than normal." },
    { latex: "y = 2x^2", description: "Narrow Parabola", hint: "It rises very quickly." },
    { latex: "y = (x+1)^2 - 3", description: "Vertex Form", hint: "Vertex is at (-1, -3)." }
  ],
  [GameDifficulty.HARD]: [
    { latex: "y = x^3", description: "Cubic Function", hint: "S-shaped curve passing through origin." },
    { latex: "y = \\sin(x)", description: "Sine Wave", hint: "Starts at 0, goes up to 1, down to -1." },
    { latex: "y = \\cos(x)", description: "Cosine Wave", hint: "Starts at 1, drops to 0 at pi/2." },
    { latex: "y = \\tan(x)", description: "Tangent", hint: "Repeating vertical asymptotes." },
    { latex: "y = 2\\sin(x)", description: "Tall Wave", hint: "Amplitude is 2." },
    { latex: "y = \\sin(2x)", description: "Fast Wave", hint: "Completes a cycle twice as fast." },
    { latex: "y = |x|", description: "Absolute Value", hint: "V-shaped graph." },
    { latex: "y = \\sqrt{x}", description: "Square Root", hint: "Only exists for positive x." }
  ],
  [GameDifficulty.EXTREME]: [
    { latex: "y = 1/x", description: "Hyperbola", hint: "Has asymptotes at x=0 and y=0." },
    { latex: "y = e^x", description: "Exponential", hint: "Growth that gets faster and faster." },
    { latex: "y = \\ln(x)", description: "Logarithm", hint: "Inverse of exponential, slow growth." },
    { latex: "y = \\frac{1}{x^2 + 1}", description: "Bell Shape", hint: "A bump centered at x=0." },
    { latex: "y = x^3 - x", description: "Wavy Cubic", hint: "Crosses x axis at -1, 0, 1." },
    { latex: "y = \\frac{x}{x-1}", description: "Rational Function", hint: "Vertical asymptote at x=1." },
    { latex: "y = \\sin(x) + x", description: "Sloped Wave", hint: "A wave climbing up a hill." }
  ]
};