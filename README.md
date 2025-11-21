# Desmos Graph Guesser

A math game where you have to guess the equation that draws it.

## How to Play

1. **Observe**: Look at the **Red Dashed Line** on the graph. This is the mystery curve.
2. **Guess**: Type an equation into the input box (e.g., `x^2` or `sin(x)`).
3. **Visualize**: Your guess will appear as a **Purple Solid Line**.
4. **Refine**: Adjust your equation until your purple line matches the red line perfectly.
5. **Check**: Click "Check Answer" to confirm.

## Supported Functions & Syntax

The app uses a relaxed syntax parser, so you can type math the way you would write it in a text message or calculator.

### Basic Math
| Operation | Type this... | Result |
|-----------|-------------|--------|
| **Powers** | `x^2` | $x^2$ |
| **Complex Powers** | `x^(n+1)` | $x^{n+1}$ (Use parens to group) |
| **Square Root** | `sqrt(x)` | $\sqrt{x}$ |
| **Fractions** | `1/x` | $\frac{1}{x}$ |
| **Grouped Fraction** | `(x+1)/(x-1)` | $\frac{x+1}{x-1}$ |

### Special Functions
| Function | Type this... | Description |
|----------|-------------|-------------|
| **Absolute Value** | `abs(x)` or `|x|` | Returns the absolute value |
| **Round** | `round(x)` | Rounds to the nearest integer (Step function) |
| **Floor** | `floor(x)` | Rounds down to the nearest integer |
| **Ceiling** | `ceil(x)` | Rounds up to the nearest integer |
| **Min/Max** | `min(x, 1)` | Returns the smaller/larger of two values |

### Trigonometry
| Function | Type this... |
|----------|-------------|
| **Standard** | `sin(x)`, `cos(x)`, `tan(x)` |
| **Inverse** | `arcsin(x)`, `arccos(x)`, `arctan(x)` |
| **Reciprocal** | `sec(x)`, `csc(x)`, `cot(x)` |
| **Hyperbolic** | `sinh(x)`, `cosh(x)`, `tanh(x)` |

### Logarithms & Constants
| Name | Type this... | Result |
|------|-------------|--------|
| **Natural Log** | `ln(x)` | $\ln(x)$ |
| **Log Base 10** | `log(x)` | $\log(x)$ |
| **Pi** | `pi` | $\pi$ |
| **Euler's Number** | `e` | $e$ |

### Pro Tips
1. **Implicit `y=`**: You don't need to type `y =`. Typing `x^2 + 1` is automatically treated as `y = x^2 + 1`.
2. **Implicit Multiplication**: `2x` works just like `2*x`.
3. **Nested Powers**: You can chain powers like `x^x^x`.

## Development

To run this project locally:

```bash
npm install
npm run dev
```
