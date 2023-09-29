// Import necessary modules and assets
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // For making HTTP requests
import './App.css'; // CSS styles

// Import sound assets
import correctSound from './sounds/correct.wav';
import hintSound from './sounds/hint.wav';
import resetSound from './sounds/reset.mp3';
import startSound from './sounds/start.wav';
import wrongSound from './sounds/wrong.wav';

function App() {
  // Define React state variables
  const [scrambledWord, setScrambledWord] = useState(''); // Scrambled word displayed to the user
  const [originalWord, setOriginalWord] = useState(''); // Original unscrambled word
  const [userGuess, setUserGuess] = useState(''); // User's input guess
  const [isCorrect, setIsCorrect] = useState(null); // Indicates if the user's guess is correct
  const [correctCount, setCorrectCount] = useState(0); // Count of correct guesses
  const [totalCount, setTotalCount] = useState(0); // Total number of guesses
  const [timeRemaining, setTimeRemaining] = useState(30); // Remaining time for the game
  const [isGameStarted, setIsGameStarted] = useState(false); // Flag indicating if the game is in progress
  const [isHintVisible, setIsHintVisible] = useState(false); // Flag for displaying a hint

  // Function to fetch a new scrambled word from the server
  const getScrambledWord = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/word');
      setScrambledWord(data.scrambled);
      setOriginalWord(data.original);
      setIsCorrect(null);
      setUserGuess('');
      setIsHintVisible(false);
    } catch (error) {
      console.error("Error fetching scrambled word", error);
    }
  }, []);

  // Function to start the game
  const startGame = () => {
    setIsGameStarted(true);
    getScrambledWord(); // Fetch the first word
    playStartSound(); // Play a start sound
  };

  // Function to restart the game
  const restartGame = () => {
    setIsGameStarted(false);
    setScrambledWord('');
    setOriginalWord('');
    setUserGuess('');
    setIsCorrect(null);
    setCorrectCount(0);
    setTotalCount(0);
    setTimeRemaining(30);
    playResetSound(); // Play a reset sound
  };

  // Function to handle user form submission (guess)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGameStarted || timeRemaining === 0) return; // Prevent submissions when not in a game or when time is up

    try {
      const { data } = await axios.post('http://localhost:3000/validate', {
        original: originalWord,
        answer: userGuess,
      });
      setIsCorrect(data.correct); // Set whether the guess is correct
      setTotalCount(totalCount + 1); // Increment total guess count
      if (data.correct) {
        setCorrectCount(correctCount + 1); // Increment correct guess count
        playCorrectSound(); // Play a correct sound
      } else {
        playWrongSound(); // Play a wrong sound
      }
      getScrambledWord(); // Fetch the next word
    } catch (error) {
      console.error("Error validating user guess", error);
    }
  };

  // Use effect to manage the game timer
  useEffect(() => {
    let timerId;
    if (isGameStarted && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsGameStarted(false); // Stop the game when time runs out
    }

    return () => clearInterval(timerId); // Cleanup interval on component unmount or if game stops
  }, [isGameStarted, timeRemaining]);

  // Functions to play different sound effects
  const playCorrectSound = () => {
    const audio = new Audio(correctSound);
    audio.play();
  };

  const playHintSound = () => {
    const audio = new Audio(hintSound);
    audio.play();
  };

  const playResetSound = () => {
    const audio = new Audio(resetSound);
    audio.play();
  };

  const playStartSound = () => {
    const audio = new Audio(startSound);
    audio.play();
  };

  const playWrongSound = () => {
    const audio = new Audio(wrongSound);
    audio.play();
  };

  // Calculate and display accuracy percentage
  const accuracy = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(2) : 'N/A';

  return (
    <div className="app-container">
      <h1 className="header-title">Word Scramble Game</h1>
      <div className="game-container">
        <p className="time-remaining">Time Remaining: {timeRemaining}s</p>
        <p className="scrambled-word">Scrambled Word: <strong>{scrambledWord}</strong></p>

        {/* User input form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1rem', color: '#333' }}>
            Your Guess:
            <input type="text" value={userGuess} onChange={(e) => setUserGuess(e.target.value)} disabled={!isGameStarted || timeRemaining === 0} style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="submit" disabled={!isGameStarted || timeRemaining === 0} className="submit-button">Submit</button>
            <button type="button" onClick={() => { setIsHintVisible(true); playHintSound(); }} disabled={!isGameStarted || timeRemaining === 0} className="hint-button">Hint</button>
          </div>
          {isHintVisible && <p className="hint-text">Hint: The word starts with '{originalWord[0]}'</p>}
        </form>

        {/* Display correct/incorrect message */}
        {isCorrect !== null && (
          <p className={isCorrect ? 'correct-message' : 'incorrect-message'}>{isCorrect ? "Correct!" : "Incorrect! Try Again!"}</p>
        )}

        {/* Display accuracy */}
        <p className="accuracy">Accuracy: <strong>{accuracy}%</strong></p>

        {/* Display start or restart button based on game state */}
        {!isGameStarted ?
          (timeRemaining === 0 ?
            <button onClick={restartGame} className="restart-button">Restart</button>
            : <button onClick={startGame} className="start-button">Start</button>)
          : null}

      </div>
    </div>
  );
}

export default App;
