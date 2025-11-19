import { GameDifficulty, MysteryFunction } from "../types";
import { QUESTIONS } from "../data/questions";

interface QuestionWithDifficulty extends MysteryFunction {
  difficulty: GameDifficulty;
}

// Mutable state for the current game session
let currentQuestions: QuestionWithDifficulty[] = [];

export const initializeQuestions = (mode: 'CAMPAIGN' | GameDifficulty) => {
  currentQuestions = [];

  if (mode === 'CAMPAIGN') {
    // Load all questions in order
    currentQuestions = [
      ...QUESTIONS[GameDifficulty.EASY].map(q => ({ ...q, difficulty: GameDifficulty.EASY })),
      ...QUESTIONS[GameDifficulty.MEDIUM].map(q => ({ ...q, difficulty: GameDifficulty.MEDIUM })),
      ...QUESTIONS[GameDifficulty.HARD].map(q => ({ ...q, difficulty: GameDifficulty.HARD })),
      ...QUESTIONS[GameDifficulty.EXTREME].map(q => ({ ...q, difficulty: GameDifficulty.EXTREME })),
    ];
  } else {
    // Load only specific difficulty
    if (QUESTIONS[mode]) {
      currentQuestions = QUESTIONS[mode].map(q => ({ ...q, difficulty: mode }));
    }
  }
};

export const getTotalLevels = (): number => {
  return currentQuestions.length;
};

export const getMysteryFunction = (level: number): MysteryFunction => {
  if (currentQuestions.length === 0) {
    throw new Error("Questions not initialized. Call initializeQuestions first.");
  }
  // Ensure level 1 gets index 0
  const index = (level - 1) % currentQuestions.length;
  return currentQuestions[index];
};

export const getDifficultyFromLevel = (level: number): GameDifficulty => {
  if (currentQuestions.length === 0) return GameDifficulty.EASY;
  
  const index = (level - 1) % currentQuestions.length;
  return currentQuestions[index].difficulty;
};