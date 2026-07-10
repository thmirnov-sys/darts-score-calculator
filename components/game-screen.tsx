"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dartboard } from "@/components/dartboard";
import { GameType, Player, RoundEntry } from "@/app/page";
import { toast } from "sonner";

interface GameScreenProps {
  gameType: GameType;
  players: Player[];
  onBackToMenu: () => void;
}

export function GameScreen({ gameType, players: initialPlayers, onBackToMenu }: GameScreenProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [lastMove, setLastMove] = useState<{ playerIndex: number; score: number; historyEntry: RoundEntry } | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  const nextPlayer = useCallback((currentPlayers: Player[], currentIndex: number) => {
    let next = (currentIndex + 1) % currentPlayers.length;
    let attempts = 0;
    while (currentPlayers[next].finished && attempts < currentPlayers.length) {
      next = (next + 1) % currentPlayers.length;
      attempts++;
    }
    return next;
  }, []);

  const addRound = useCallback((score: number, darts?: number[]) => {
    if (score <= 0) return;

    setPlayers((prev) => {
      const updated = [...prev];
      const player = { ...updated[currentPlayerIndex] };

      let finalScore = score;
      let displayScore = score;

      if (gameType === "51") {
        if (score % 5 !== 0) {
          toast.error("В игре 51 засчитываются только суммы, кратные 5");
          return prev;
        }
        finalScore = Math.floor(score / 5);
        displayScore = score;
      }

      if (player.score === 1) {
        toast.error("Перебор! Нельзя закончить с остатком 1");
        return prev;
      }

      if (finalScore > player.score) {
        toast.error("Перебор! Введённая сумма превышает остаток");
        return prev;
      }

      const newScore = player.score - finalScore;
      const entry: RoundEntry = { total: displayScore, darts };
      player.history = [...player.history, entry];
      player.score = newScore;
      if (newScore === 0) {
        player.finished = true;
        toast.success(`${player.name} победил! 🎯`);
      }
      updated[currentPlayerIndex] = player;
      return updated;
    });

    setLastMove({
      playerIndex: currentPlayerIndex,
      score,
      historyEntry: { total: score, darts },
    });

    setCurrentPlayerIndex((prev) => nextPlayer(players, prev));
    setInputValue("");
  }, [currentPlayerIndex, players, nextPlayer, gameType]);

  const handleSubmit = () => {
    const score = parseInt(inputValue, 10);
    if (isNaN(score) || score <= 0) {
      toast.error("Введите корректное число");
      return;
    }
    addRound(score);
  };

  const handleDartboardSubmit = (total: number, darts: number[]) => {
    addRound(total, darts);
  };

  const handleUndo = () => {
    if (!lastMove) return;

    setPlayers((prev) => {
      const updated = [...prev];
      const player = { ...updated[lastMove.playerIndex] };
      player.history = player.history.slice(0, -1);
      player.score += lastMove.score;
      player.finished = false;
      updated[lastMove.playerIndex] = player;
      return updated;
    });

    setCurrentPlayerIndex(lastMove.playerIndex);
    setLastMove(null);
  };

  const maxRounds = Math.max(...players.map((p) => p.history.length));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/DS.png" alt="Darts Score" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold neon-text">Darts Score</h1>
            <p className="text-sm text-muted-foreground">Игра {gameType}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onBackToMenu}>
          В меню
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium">Игрок</th>
              {Array.from({ length: maxRounds }, (_, i) => (
                <th key={i} className="p-4 text-muted-foreground font-medium text-center">
                  {i + 1}
                </th>
              ))}
              <th className="p-4 text-muted-foreground font-medium text-center">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={index}
                className={`border-b border-border transition-colors ${
                  index === currentPlayerIndex && !player.finished
                    ? "bg-primary/5"
                    : ""
                } ${player.finished ? "opacity-60" : ""}`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {index === currentPlayerIndex && !player.finished && (
                      <span className="w-2 h-2 rounded-full bg-primary neon-glow animate-pulse-glow" />
                    )}
                    {player.finished && (
                      <span className="text-xs text-primary font-bold neon-text">🏆</span>
                    )}
                  </div>
                </td>
                {Array.from({ length: maxRounds }, (_, i) => (
                  <td key={i} className="p-3 text-center">
                    {player.history[i] && (
                      <div className="flex items-center justify-center gap-1">
                        {player.history[i].darts ? (
                          player.history[i].darts.map((dart, di) => (
                            <span
                              key={di}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold"
                            >
                              {dart}
                            </span>
                          ))
                        ) : (
                          <span className="text-foreground/80">
                            {player.history[i].total}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                ))}
                <td className="p-4 text-center">
                  <span
                    className={`text-3xl font-bold ${
                      player.finished ? "text-primary neon-text" : ""
                    }`}
                  >
                    {player.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentPlayer && !currentPlayer.finished && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Ход игрока:{" "}
              <span className="text-primary neon-text">{currentPlayer.name}</span>
            </h2>
            <div className="flex gap-2">
              {lastMove && (
                <Button variant="outline" onClick={handleUndo} size="sm">
                  Отменить
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">
                Сумма трёх бросков
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Например: 60"
                  className="flex-1"
                />
                <Button onClick={handleSubmit}>Ввести</Button>
              </div>
            </div>
          </div>

          <Dartboard onSubmit={handleDartboardSubmit} />
        </div>
      )}

      {players.every((p) => p.finished) && (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-3xl font-bold neon-text">Игра окончена! 🎯</h2>
          <Button onClick={onBackToMenu} size="lg" className="neon-glow">
            Новая игра
          </Button>
        </div>
      )}
    </div>
  );
}
