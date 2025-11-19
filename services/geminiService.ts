import { GoogleGenAI, Type } from "@google/genai";
import { MysteryFunction, GameDifficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMysteryFunction = async (difficulty: GameDifficulty): Promise<MysteryFunction> => {
  try {
    const model = "gemini-2.5-flash";
    let promptContext = "";

    switch (difficulty) {
      case GameDifficulty.EASY:
        promptContext = "linear equations in slope-intercept form (y = mx + b). Keep integers small.";
        break;
      case GameDifficulty.MEDIUM:
        promptContext = "quadratic equations (vertex form or standard form).";
        break;
      case GameDifficulty.HARD:
        promptContext = "basic trigonometric functions (sin, cos) with simple shifts or cubic polynomials.";
        break;
      case GameDifficulty.EXTREME:
        promptContext = "rational functions, circles, or ellipses.";
        break;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a random single mathematical equation for a "Guess the Graph" game.
      Difficulty Level: ${promptContext}
      
      The equation must be valid LaTeX for Desmos (e.g. "y = 2x + 1").
      Provide a subtle hint that doesn't give away the answer directly.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latex: { type: Type.STRING, description: "The mathematical equation in Desmos-compatible LaTeX (e.g. 'y=x^2')" },
            description: { type: Type.STRING, description: "Name of the curve type" },
            hint: { type: Type.STRING, description: "A helpful hint for the user" }
          },
          required: ["latex", "description", "hint"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MysteryFunction;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
