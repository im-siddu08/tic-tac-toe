import { useEffect, useState } from "react";
import { RotateCcw, Trophy, Bot, Users, Zap } from "lucide-react";

const wins = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function winner(board) {
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function minimax(board, maximizing, depth = 0) {
  const w = winner(board);

  if (w === "O") return 10 - depth;
  if (w === "X") return depth - 10;
  if (board.every(Boolean)) return 0;

  let best = maximizing ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const next = [...board];
      next[i] = maximizing ? "O" : "X";

      const score = minimax(next, !maximizing, depth + 1);

      best = maximizing
        ? Math.max(best, score)
        : Math.min(best, score);
    }
  }

  return best;
}

function computerMove(board) {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const next = [...board];
      next[i] = "O";

      const score = minimax(next, false);

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [mode, setMode] = useState("computer");
  const [scores, setScores] = useState({
    X: 0, O: 0, draw: 0
  });
  const [result, setResult] = useState("");
  const [thinking, setThinking] = useState(false);

  function finishGame(next) {
    const w = winner(next);

    if (w) {
      setResult(w);
      setScores(old => ({
        ...old,
        [w]: old[w] + 1
      }));
    } else if (next.every(Boolean)) {
      setResult("draw");
      setScores(old => ({
        ...old,
        draw: old.draw + 1
      }));
    }
  }

  function play(index) {
    if (
      board[index] ||
      result ||
      thinking ||
      (mode === "computer" && turn === "O")
    ) return;

    const next = [...board];
    next[index] = turn;

    setBoard(next);
    finishGame(next);

    if (winner(next) || next.every(Boolean)) return;

    setTurn(turn === "X" ? "O" : "X");
  }

  useEffect(() => {
    if (mode !== "computer" || turn !== "O" || result) return;

    setThinking(true);

    const timer = setTimeout(() => {
      const index = computerMove(board);

      if (index !== -1) {
        const next = [...board];
        next[index] = "O";

        setBoard(next);
        finishGame(next);
        setTurn("X");
      }

      setThinking(false);
    }, 550);

    return () => clearTimeout(timer);
  }, [board, mode, turn, result]);

  function newGame() {
    setBoard(Array(9).fill(""));
    setTurn("X");
    setResult("");
    setThinking(false);
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draw: 0 });
    newGame();
  }

  function changeMode(value) {
    setMode(value);
    newGame();
  }

  let message = "YOUR TURN";

  if (result === "draw") message = "IT'S A DRAW!";
  else if (result === "X") message = "PLAYER X WINS!";
  else if (result === "O") {
    message = mode === "computer"
      ? "COMPUTER WINS!"
      : "PLAYER O WINS!";
  } else if (thinking) {
    message = "COMPUTER IS THINKING...";
  } else if (mode === "computer") {
    message = "YOUR TURN · X";
  } else {
    message = `PLAYER ${turn} · YOUR TURN`;
  }

  return (
    <main className="app">
      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>

      <div className="container">

        <header className="header">
          <div className="brand-icon">✦</div>
          <p className="eyebrow">THE ULTIMATE MINI GAME</p>
          <h1>TIC <span>TAC</span> TOE</h1>
          <p className="subtitle">
            Think smart. Play bold. Own the board.
          </p>
        </header>

        <section className="mode-section">
          <p className="label">CHOOSE YOUR BATTLE</p>

          <div className="mode-buttons">
            <button
              className={mode === "computer" ? "mode active" : "mode"}
              onClick={() => changeMode("computer")}
            >
              <Bot size={18} /> VS COMPUTER
            </button>

            <button
              className={mode === "two" ? "mode active" : "mode"}
              onClick={() => changeMode("two")}
            >
              <Users size={18} /> TWO PLAYERS
            </button>
          </div>
        </section>

        <section className="scoreboard">
          <div className="score">
            <span className="symbol x">X</span>
            <p>{mode === "computer" ? "YOU" : "PLAYER X"}</p>
            <h2>{scores.X}</h2>
          </div>

          <div className="score">
            <span className="symbol draw">=</span>
            <p>DRAWS</p>
            <h2>{scores.draw}</h2>
          </div>

          <div className="score">
            <span className="symbol o">O</span>
            <p>{mode === "computer" ? "CPU" : "PLAYER O"}</p>
            <h2>{scores.O}</h2>
          </div>
        </section>

        <div className={`status ${result ? "finished" : ""}`}>
          <Zap size={17} />
          {message}
        </div>

        <section className="game-board">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ""}`}
              onClick={() => play(index)}
              disabled={
                !!cell ||
                !!result ||
                thinking ||
                (mode === "computer" && turn === "O")
              }
              aria-label={`Square ${index + 1}${cell ? `: ${cell}` : ": empty"}`}
            >
              {cell}
            </button>
          ))}
        </section>

        {result && (
          <div className="result-banner">
            <Trophy size={21} />
            {result === "draw"
              ? "WELL PLAYED! IT'S A DRAW"
              : `${result} IS THE CHAMPION!`}
          </div>
        )}

        <div className="actions">
          <button className="primary-btn" onClick={newGame}>
            <RotateCcw size={18} />
            NEW GAME
          </button>

          <button className="secondary-btn" onClick={resetScores}>
            RESET SCORES
          </button>
        </div>

        <footer>
          <span>✦</span> BUILT FOR THE LOVE OF GAMING
          <span>✦</span>
        </footer>

      </div>
    </main>
  );
}
