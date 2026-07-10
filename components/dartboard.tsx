"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface DartboardProps {
  onSubmit: (total: number, darts: number[]) => void;
}

const SECTORS = [
  { number: 20, angle: 0 },
  { number: 1, angle: 18 },
  { number: 18, angle: 36 },
  { number: 4, angle: 54 },
  { number: 13, angle: 72 },
  { number: 6, angle: 90 },
  { number: 10, angle: 108 },
  { number: 15, angle: 126 },
  { number: 2, angle: 144 },
  { number: 17, angle: 162 },
  { number: 3, angle: 180 },
  { number: 19, angle: 198 },
  { number: 7, angle: 216 },
  { number: 16, angle: 234 },
  { number: 8, angle: 252 },
  { number: 11, angle: 270 },
  { number: 14, angle: 288 },
  { number: 9, angle: 306 },
  { number: 12, angle: 324 },
  { number: 5, angle: 342 },
];

interface ContextMenuState {
  sectorIndex: number;
  x: number;
  y: number;
}

export function Dartboard({ onSubmit }: DartboardProps) {
  const [darts, setDarts] = useState<number[]>([]);
  const [multipliers, setMultipliers] = useState<Record<number, number>>({});
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addDart = useCallback(
    (value: number, sectorIndex: number) => {
      const multiplier = multipliers[sectorIndex] || 1;
      const finalValue = value * multiplier;

      setDarts((prev) => {
        const next = [...prev, finalValue];
        if (next.length === 3) {
          const total = next.reduce((a, b) => a + b, 0);
          setTimeout(() => {
            onSubmit(total, next);
          }, 0);
          return [];
        }
        return next;
      });
      setMultipliers((prev) => {
        const updated = { ...prev };
        delete updated[sectorIndex];
        return updated;
      });
      setContextMenu(null);
    },
    [multipliers, onSubmit]
  );

  const handleContextMenu = (e: React.MouseEvent, sectorIndex: number) => {
    e.preventDefault();
    setContextMenu({ sectorIndex, x: e.clientX, y: e.clientY });
  };

  const setMultiplier = (mult: number) => {
    if (!contextMenu) return;
    setMultipliers((prev) => ({
      ...prev,
      [contextMenu.sectorIndex]: mult,
    }));
    setContextMenu(null);
  };

  const undoLastDart = () => {
    setDarts((prev) => prev.slice(0, -1));
  };

  const addMiss = () => {
    setDarts((prev) => {
      const next = [...prev, 0];
      if (next.length === 3) {
        const total = next.reduce((a, b) => a + b, 0);
        setTimeout(() => {
          onSubmit(total, next);
        }, 0);
        return [];
      }
      return next;
    });
  };

  const radius = 160;
  const center = 180;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Броски: {darts.length}/3
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < darts.length ? "bg-primary neon-glow" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {darts.length > 0 && (
            <Button variant="outline" size="sm" onClick={undoLastDart}>
              Отменить бросок
            </Button>
          )}
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: 360, height: 360 }}>
        <svg
          width="360"
          height="360"
          viewBox="0 0 360 360"
          className="cursor-pointer"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Background circle */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#2a2a3e" strokeWidth="1" />

          {SECTORS.map((sector, index) => {
            const startAngle = sector.angle - 9;
            const endAngle = sector.angle + 9;
            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const endRad = ((endAngle - 90) * Math.PI) / 180;
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
            const labelR = radius * 0.75;
            const lx = center + labelR * Math.cos(midAngle);
            const ly = center + labelR * Math.sin(midAngle);
            const isEven = index % 2 === 0;
            const multiplier = multipliers[index];
            const isActive = multiplier !== undefined;

            return (
              <g key={index}>
                <path
                  d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={isActive ? "#00ff88" : isEven ? "#1a1a2e" : "#12121a"}
                  stroke={isActive ? "#00ff88" : "#2a2a3e"}
                  strokeWidth="1"
                  className="hover:opacity-80 transition-opacity"
                  onClick={() => addDart(sector.number, index)}
                  onContextMenu={(e) => handleContextMenu(e, index)}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? "#0a0a0f" : "#e0e0e0"}
                  fontSize="14"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {multiplier ? `${sector.number}×${multiplier}` : sector.number}
                </text>
              </g>
            );
          })}

          {/* Outer center ring */}
          <circle
            cx={center}
            cy={center}
            r={32}
            fill="#1a1a2e"
            stroke="#2a2a3e"
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity cursor-pointer"
            onClick={() => addDart(25, -1)}
          />
          <circle
            cx={center}
            cy={center}
            r={28}
            fill="none"
            stroke="#00ff88"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#e0e0e0"
            fontSize="14"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            25
          </text>

          {/* Inner center (bullseye) */}
          <circle
            cx={center}
            cy={center}
            r={14}
            fill="#2a2a3e"
            stroke="#ff3355"
            strokeWidth="1.5"
            className="hover:opacity-80 transition-opacity cursor-pointer"
            onClick={() => addDart(50, -2)}
          />
          <circle
            cx={center}
            cy={center}
            r={8}
            fill="#ff3355"
            className="animate-pulse-glow"
          />
          <text
            x={center}
            y={center + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ff3355"
            fontSize="11"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            50
          </text>
        </svg>

        {contextMenu && (
          <div
            ref={menuRef}
            className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {[1, 2, 3].map((mult) => (
              <button
                key={mult}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-primary/10 rounded transition-colors"
                onClick={() => setMultiplier(mult)}
              >
                ×{mult}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={addMiss}
          disabled={darts.length >= 3}
          className="text-muted-foreground border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          Мимо (0)
        </Button>
      </div>
    </div>
  );
}
