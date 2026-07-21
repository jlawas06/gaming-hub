"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Die from "./components/Die";
import { COLORS, useDiceRoll, type Color, type DieElements } from "./useDiceRoll";
import { useDiceStats } from "./useDiceStats";
import s from "./color-game.module.css";

interface HistoryEntry {
  id: string;
  colors: Color[];
  time: string;
}

const COLOR_LABELS: Record<Color, string> = {
  red: "Red",
  green: "Green",
  blue: "Blue",
  yellow: "Yellow",
  white: "White",
  pink: "Pink",
};

function buildResultMessage(results: Color[]): string {
  const allSame = results.every((color) => color === results[0]);
  if (allSame) {
    return `All three dice are ${results[0]}!`;
  }
  const counts: Partial<Record<Color, number>> = {};
  results.forEach((color) => {
    counts[color] = (counts[color] ?? 0) + 1;
  });
  const summary = COLORS.filter((color) => counts[color])
    .map((color) => `${counts[color]} ${color}`)
    .join(", ");
  return `Results: ${summary}`;
}

export default function ColorGame() {
  const diceRef = useRef<DieElements[]>([
    { bounce: null, cube: null, shadow: null },
    { bounce: null, cube: null, shadow: null },
    { bounce: null, cube: null, shadow: null },
  ]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { isRolling, roll } = useDiceRoll(diceRef, stageRef, containerRef);
  const { totalRolls, percentages, recordRoll, resetStats } = useDiceStats();

  const [resultMessage, setResultMessage] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pulsing, setPulsing] = useState([false, false, false]);
  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
    };
  }, []);

  const handleRoll = async () => {
    if (isRolling) return;
    setResultMessage("Rolling...");
    setPulsing([false, false, false]);

    const results = await roll();
    if (!results) return;

    recordRoll(results);
    setResultMessage(buildResultMessage(results));
    setHistory((prev) =>
      [
        {
          id: crypto.randomUUID(),
          colors: results,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 100)
    );

    // Pulse dice that landed in a pair or triple
    const counts: Partial<Record<Color, number>> = {};
    results.forEach((color) => {
      counts[color] = (counts[color] ?? 0) + 1;
    });
    const matches = results.map((color) => (counts[color] ?? 0) >= 2);
    if (matches.some(Boolean)) {
      setPulsing(matches);
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
      pulseTimeout.current = setTimeout(
        () => setPulsing([false, false, false]),
        950
      );
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all statistics?")) {
      resetStats();
      setHistory([]);
      setResultMessage("Statistics have been reset");
    }
  };

  return (
    <div className={s.page}>
      <div className={s.bunting} aria-hidden="true"></div>
      <Link href="/" className={s["back-link"]}>
        &larr; All booths
      </Link>
      <div className={s.container}>
        <header className={s["site-header"]}>
          <p className={s.eyebrow}>Perya Classic</p>
          <h1>Color Game</h1>
        </header>

        <div className={s["game-layout"]}>
          <div className={s["stats-section"]}>
            <h3>Color Board</h3>
            <div className={s["stats-grid"]}>
              {COLORS.map((color) => (
                <div key={color} className={`${s["color-stat"]} ${s[color]}`}>
                  <span className={s["color-name"]}>{COLOR_LABELS[color]}</span>
                  <span className={s["color-percent"]}>
                    {percentages[color]}%
                  </span>
                </div>
              ))}
            </div>
            <p className={s["total-rolls"]}>
              Total Rolls: <span>{totalRolls}</span>
            </p>
          </div>

          <div className={s["game-section"]}>
            <div className={s["dice-stage"]} ref={stageRef}>
              <div className={s["dice-container"]} ref={containerRef}>
                {diceRef.current.map((elements, i) => (
                  <Die key={i} elements={elements} pulsing={pulsing[i]} />
                ))}
              </div>

              <div className={s["result-section"]}>
                <p className={s["result-message"]} aria-live="polite">
                  {resultMessage}
                </p>
              </div>
            </div>

            <div className={s.controls}>
              <button
                className={s["roll-btn"]}
                onClick={handleRoll}
                disabled={isRolling}
              >
                {isRolling ? "Rolling…" : "Roll Dice"}
              </button>
              <button className={s["reset-btn"]} onClick={handleReset}>
                Reset Stats
              </button>
            </div>
          </div>

          <div className={s["history-section"]}>
            <h3>Roll History</h3>
            <ul className={s["game-history"]}>
              {history.map((entry) => (
                <li key={entry.id}>
                  <span className={s["roll-chips"]}>
                    {entry.colors.map((color, i) => (
                      <span
                        key={i}
                        className={`${s.chip} ${s[color]}`}
                        title={color}
                      ></span>
                    ))}
                  </span>
                  <span className={s.timestamp}>{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
