"use client";

import { useState } from "react";
import { GameSetup } from "@/components/game-setup";
import { GameScreen } from "@/components/game-screen";

export type GameType = "501" | "301" | "51";

export interface Player {
  name: string;
  score: number;
  history: RoundEntry[];
  finished: boolean;
}

export interface RoundEntry {
  total: number;
  darts?: number[];
}

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState<GameType>("501");
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = (type: GameType, names: string[]) => {
    const initialScore = type === "501" ? 501 : type === "301" ? 301 : 51;
    setGameType(type);
    setPlayers(
      names.map((name) => ({
        name,
        score: initialScore,
        history: [],
        finished: false,
      }))
    );
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setPlayers([]);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <GameSetup onStartGame={handleStartGame} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <GameScreen
        gameType={gameType}
        players={players}
        onBackToMenu={handleBackToMenu}
      />
    </div>
  );
}
