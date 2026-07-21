"use client";

import { useCallback, useEffect, useState } from "react";
import { COLORS, type Color } from "./useDiceRoll";

export type ColorCounts = Record<Color, number>;

const STORAGE_KEY = "diceGameStats";

function zeroCounts(): ColorCounts {
  return { red: 0, green: 0, blue: 0, yellow: 0, white: 0, pink: 0 };
}

interface Stats {
  totalRolls: number;
  colorCounts: ColorCounts;
}

export function useDiceStats() {
  const [stats, setStats] = useState<Stats>({
    totalRolls: 0,
    colorCounts: zeroCounts(),
  });
  const [loaded, setLoaded] = useState(false);

  // localStorage is browser-only, so stats load after mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const counts: ColorCounts = { ...zeroCounts(), ...data.colorCounts };
        // Ensure pink stats exist (in case of black -> pink transition)
        if (data.colorCounts?.black && !data.colorCounts?.pink) {
          counts.pink = data.colorCounts.black;
        }
        delete (counts as Record<string, number>).black;
        setStats({ totalRolls: data.totalRolls ?? 0, colorCounts: counts });
      } catch {
        // Corrupt data: keep zeroed stats
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (stats.totalRolls === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats, loaded]);

  const recordRoll = useCallback((results: Color[]) => {
    setStats((prev) => {
      const colorCounts = { ...prev.colorCounts };
      results.forEach((color) => colorCounts[color]++);
      return { totalRolls: prev.totalRolls + 1, colorCounts };
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats({ totalRolls: 0, colorCounts: zeroCounts() });
  }, []);

  const totalDice = COLORS.reduce((sum, c) => sum + stats.colorCounts[c], 0);
  const percentages = Object.fromEntries(
    COLORS.map((c) => [
      c,
      totalDice > 0
        ? ((stats.colorCounts[c] / totalDice) * 100).toFixed(1)
        : "0.0",
    ])
  ) as Record<Color, string>;

  return { totalRolls: stats.totalRolls, percentages, recordRoll, resetStats };
}
