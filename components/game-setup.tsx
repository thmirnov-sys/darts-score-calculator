"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameType } from "@/app/page";

interface GameSetupProps {
  onStartGame: (type: GameType, names: string[]) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [gameType, setGameType] = useState<GameType>("501");
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);

  const addPlayer = () => {
    if (playerNames.length < 5) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const canStart = playerNames.every((name) => name.trim().length > 0);

  const handleStart = () => {
    if (canStart) {
      onStartGame(gameType, playerNames.map((n) => n.trim()));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <img src="/DS.png" alt="Darts Score" className="w-20 h-20 mx-auto" />
        <h1 className="text-4xl font-bold neon-text">Darts Score</h1>
        <p className="text-muted-foreground">Калькулятор для игры в дартс</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Выберите игру
          </label>
          <div className="flex gap-2">
            {(["501", "301", "51"] as const).map((type) => (
              <Button
                key={type}
                variant={gameType === type ? "default" : "outline"}
                onClick={() => setGameType(type)}
                className={`flex-1 text-lg font-bold ${
                  gameType === type ? "neon-glow" : ""
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Игроки ({playerNames.length})
          </label>
          <div className="space-y-2">
            {playerNames.map((name, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => updateName(index, e.target.value)}
                  placeholder={`Игрок ${index + 1}`}
                  className="flex-1"
                />
                {playerNames.length > 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < 5 && (
            <Button
              variant="outline"
              onClick={addPlayer}
              className="mt-2 w-full text-primary border-primary/30 hover:bg-primary/10"
            >
              + Добавить игрока
            </Button>
          )}
        </div>

        <Button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full text-lg font-bold neon-glow"
          size="lg"
        >
          Начать игру
        </Button>
      </div>
    </div>
  );
}
