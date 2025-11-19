import React, { useState, useCallback, useEffect } from 'react';
import { DesmosGraph } from './components/DesmosGraph';
import { Button } from './components/Button';
import { MathInput } from './components/MathInput';
import { getMysteryFunction, getDifficultyFromLevel, initializeQuestions, getTotalLevels } from './services/questionService';
import { validateGuessWithPython, initPyodide } from './services/pythonService';
import { AppStatus, GameDifficulty, GraphingCalculator, MysteryFunction } from './types';

const App: React.FC = () => {
  const [calculator, setCalculator] = useState<GraphingCalculator | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOADING);
  
  // Game State
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GameDifficulty.EASY);
  
  const [mysteryData, setMysteryData] = useState<MysteryFunction | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [pythonReady, setPythonReady] = useState(false);

  // Initialize Python Engine
  useEffect(() => {
    initPyodide()
      .then(() => {
        setPythonReady(true);
        setStatus(AppStatus.IDLE);
      })
      .catch((e) => {
        console.error(e);
        setFeedback("Failed to load Python Engine. Please refresh.");
        setStatus(AppStatus.ERROR);
      });
  }, []);

  // Update Difficulty based on Level
  useEffect(() => {
    // Only update if we are in a game with questions loaded
    if (status !== AppStatus.IDLE && status !== AppStatus.LOADING) {
       const newDifficulty = getDifficultyFromLevel(level);
       setDifficulty(newDifficulty);
    }
  }, [level, status]);

  // Initialize calculator reference
  const handleCalculatorReady = useCallback((instance: GraphingCalculator) => {
    setCalculator(instance);
  }, []);

  // Start a New Game
  const handleStartGame = (mode: 'CAMPAIGN' | GameDifficulty) => {
    initializeQuestions(mode);
    setLevel(1);
    setScore(0);
    loadLevel(1);
  };

  // Continue to Next Level
  const nextLevel = () => {
    const totalLevels = getTotalLevels();
    const nextLvl = level + 1;

    // Check for victory condition
    if (nextLvl > totalLevels) {
      setStatus(AppStatus.COMPLETED);
      // Clear the graph for the victory screen
      if (calculator) {
        calculator.setBlank();
      }
      return;
    }

    setLevel(nextLvl);
    loadLevel(nextLvl);
  };

  const loadLevel = (lvl: number) => {
    if (!calculator) return;
    
    // Reset round state
    setFeedback('');
    setAttempts(0);
    setUserGuess('');
    setMysteryData(null);
    setStatus(AppStatus.PLAYING);
    
    // Reset Graph
    calculator.setBlank();
    
    try {
      // Get question by sequential level number
      const data = getMysteryFunction(lvl);
      setMysteryData(data);
      
      // Plot the mystery function
      calculator.setExpression({
        id: 'graph_guesser',
        latex: data.latex,
        color: '#ef4444', // Tailwind Red-500
        lineStyle: 'DASHED',
        lineWidth: 5,
      });

      // Center view roughly
      calculator.setMathBounds({ left: -10, right: 10, bottom: -10, top: 10 });

    } catch (error) {
      console.error(error);
      setFeedback('Failed to load question.');
      setStatus(AppStatus.ERROR);
    }
  };

  // Handle User Input Change (Live Plotting)
  const handleInputChange = (latex: string) => {
    setUserGuess(latex);
    
    if (calculator && status === AppStatus.PLAYING) {
      // Plot user guess in real-time: Blue, Solid
      if (!latex || latex.trim() === '') {
        calculator.removeExpression('user_guess');
      } else {
        calculator.setExpression({
          id: 'user_guess',
          latex: latex,
          color: '#6366f1', // Tailwind Indigo-500
          lineStyle: 'SOLID',
          lineWidth: 3
        });
      }
    }
  };

  // Check Answer with Python
  const handleCheckAnswer = async () => {
    if (!mysteryData || !userGuess) return;
    
    setStatus(AppStatus.CHECKING);
    
    try {
      const result = await validateGuessWithPython(mysteryData.latex, userGuess);
      
      if (result.correct) {
        setStatus(AppStatus.WON);
        
        // Calculate Score
        const baseScore = 1000;
        const penalty = attempts * 100;
        // Increase score multiplier for harder single-mode settings or later levels
        const roundScore = Math.max(100, (baseScore - penalty));
        
        setScore(prev => prev + Math.floor(roundScore));
        setFeedback(`Correct! +${Math.floor(roundScore)} Points`);

        // Turn the mystery line green to celebrate
        if (calculator) {
          calculator.setExpression({
            id: 'graph_guesser',
            latex: mysteryData.latex,
            color: '#22c55e', // Green
            lineStyle: 'SOLID',
            lineWidth: 6
          });
        }
      } else {
        setStatus(AppStatus.PLAYING);
        setAttempts(p => p + 1);
        setFeedback(result.message || "Not quite right yet.");
      }
    } catch (error) {
      setStatus(AppStatus.PLAYING);
      setFeedback("Calculation error. Check your syntax.");
    }
  };

  // Reset to menu
  const returnToMenu = () => {
    setStatus(AppStatus.IDLE);
    if (calculator) calculator.setBlank();
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Game Sidebar */}
      <aside className="w-96 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur flex flex-col h-full shadow-xl z-10">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-1 cursor-pointer" onClick={returnToMenu}>
            Graph Guesser
          </h1>
          
          {/* Stats Bar */}
          {(status !== AppStatus.IDLE && status !== AppStatus.LOADING) && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-800 rounded p-2 border border-slate-700">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Level</div>
                <div className="text-xl font-mono font-bold text-white">
                  {status === AppStatus.COMPLETED ? "DONE" : `${level}/${getTotalLevels()}`}
                </div>
              </div>
              <div className="bg-slate-800 rounded p-2 border border-slate-700">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
                <div className="text-xl font-mono font-bold text-indigo-400">{score.toLocaleString()}</div>
              </div>
            </div>
          )}

          {!pythonReady && status !== AppStatus.ERROR && (
             <div className="mt-2 text-xs text-yellow-400 flex items-center animate-pulse">
               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Loading Python Engine...
             </div>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          
          {/* Difficulty Selection / Idle Screen */}
          {status === AppStatus.IDLE || status === AppStatus.ERROR || status === AppStatus.LOADING ? (
            <section className="space-y-6 animate-fadeIn">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-2">Select Difficulty</h3>
                <p className="text-sm text-slate-400 mb-4">Choose a specific skill level or play the full campaign.</p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleStartGame('CAMPAIGN')}
                    disabled={!pythonReady}
                    className="w-full py-3 text-left flex items-center justify-between group"
                  >
                    <span>Full Campaign (Mixed)</span>
                    <span className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="secondary"
                      onClick={() => handleStartGame(GameDifficulty.EASY)}
                      disabled={!pythonReady}
                      className="py-3 text-sm"
                    >
                      Lines
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleStartGame(GameDifficulty.MEDIUM)}
                      disabled={!pythonReady}
                      className="py-3 text-sm"
                    >
                      Parabolas
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleStartGame(GameDifficulty.HARD)}
                      disabled={!pythonReady}
                      className="py-3 text-sm"
                    >
                      Trig/Cubic
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleStartGame(GameDifficulty.EXTREME)}
                      disabled={!pythonReady}
                      className="py-3 text-sm"
                    >
                      Extreme
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 text-center">
                {status === AppStatus.LOADING ? "Initializing..." : "Engine Ready"}
              </div>
            </section>
          ) : null}

          {/* Game Completed Victory Screen */}
          {status === AppStatus.COMPLETED && (
            <section className="space-y-6 animate-fadeIn text-center pt-8">
              <div className="mb-4">
                <div className="inline-block p-4 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 mb-4 border border-yellow-500/30 shadow-lg shadow-orange-500/10">
                  <svg className="w-16 h-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 mb-2">
                  Victory!
                </h2>
                <p className="text-slate-300">You have mastered this set.</p>
              </div>
              
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mx-2">
                <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Final Score</div>
                <div className="text-4xl font-mono font-bold text-white">
                  {score.toLocaleString()}
                </div>
              </div>

              <Button 
                onClick={returnToMenu} 
                variant="secondary"
                className="w-full py-4 text-lg font-bold mt-8"
              >
                Back to Menu
              </Button>
            </section>
          )}

          {/* Active Game Controls */}
          {(status === AppStatus.PLAYING || status === AppStatus.CHECKING || status === AppStatus.WON) && (
             <section className="space-y-6 animate-fadeIn">
                {/* Round Info */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <span>Current Difficulty</span>
                  <span className={`px-2 py-0.5 rounded ${
                    difficulty === GameDifficulty.EASY ? 'bg-green-500/20 text-green-400' :
                    difficulty === GameDifficulty.MEDIUM ? 'bg-yellow-500/20 text-yellow-400' :
                    difficulty === GameDifficulty.HARD ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {difficulty.split(' ')[0]}
                  </span>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-red-400 font-bold">MYSTERY CURVE</span>
                      {status === AppStatus.WON && <span className="text-xs text-green-400 font-bold">REVEALED</span>}
                   </div>
                   {status === AppStatus.WON ? (
                     <div className="font-mono text-xl text-center text-white py-2 animate-fadeIn">{mysteryData?.latex}</div>
                   ) : (
                     <div className="h-8 w-full bg-slate-800/80 rounded flex items-center justify-center">
                        <span className="text-slate-500 text-sm italic">Equation Hidden</span>
                     </div>
                   )}
                   {mysteryData?.hint && status !== AppStatus.WON && (
                     <p className="mt-3 text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                       <span className="text-indigo-400 font-bold">Hint:</span> {mysteryData.hint}
                     </p>
                   )}
                </div>

                <div className="space-y-3">
                   <label className="block text-sm font-medium text-indigo-300">Your Guess</label>
                   
                   <MathInput
                    value={userGuess}
                    onChange={handleInputChange}
                    disabled={status === AppStatus.WON || status === AppStatus.CHECKING}
                    placeholder="y = x^2"
                   />

                   <div className="flex gap-2">
                     {status === AppStatus.WON ? (
                       <Button onClick={nextLevel} className="w-full py-3 bg-green-600 hover:bg-green-500 shadow-green-500/20">
                         {level >= getTotalLevels() ? "Finish" : "Next Level →"}
                       </Button>
                     ) : (
                        <Button 
                          onClick={handleCheckAnswer} 
                          isLoading={status === AppStatus.CHECKING}
                          disabled={!userGuess}
                          className="w-full shadow-indigo-500/20"
                        >
                          Check Answer
                        </Button>
                     )}
                   </div>
                </div>

                {/* Feedback Area */}
                {feedback && (
                  <div className={`p-3 rounded border ${status === AppStatus.WON ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'}`}>
                    <p className="text-sm font-medium">{feedback}</p>
                    {status === AppStatus.PLAYING && attempts > 0 && (
                      <p className="text-xs mt-1 opacity-70">Attempts: {attempts}</p>
                    )}
                  </div>
                )}
                
                <div className="text-center">
                  <button onClick={returnToMenu} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                    Quit to Menu
                  </button>
                </div>
             </section>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
             <div className="flex justify-center gap-4 text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1">
                   <div className="w-3 h-1 bg-red-500"></div> Target
                </div>
                <div className="flex items-center gap-1">
                   <div className="w-3 h-1 bg-indigo-500"></div> Your Guess
                </div>
             </div>
        </div>
      </aside>

      {/* Main Graph Area */}
      <main className="flex-1 relative bg-slate-950">
        <DesmosGraph onInstanceReady={handleCalculatorReady} />
        
        {/* Overlay to force focus on our game sidebar if needed, or just styling adjustments */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded border border-slate-700 text-slate-400 text-xs">
            Interact with graph to zoom/pan
          </div>
        </div>
      </main>

    </div>
  );
};

export default App;