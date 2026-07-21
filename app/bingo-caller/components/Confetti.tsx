"use client";

import { useMemo, type CSSProperties } from "react";
import s from "../bingo-caller.module.css";

interface Piece {
  id: number;
  style: CSSProperties;
}

function buildBatch(count: number, delay: number, startId: number): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const size = Math.random() * 12 + 4; // 4-16px
    const duration = Math.random() * 3.5 + 1.5; // 1.5-5s
    return {
      id: startId + i,
      style: {
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    };
  });
}

export default function Confetti() {
  // Only mounts while celebrating (client-side), so randomness is safe here
  const pieces = useMemo(
    () => [
      ...buildBatch(300, 0, 0),
      ...buildBatch(150, 1, 300),
      ...buildBatch(100, 2, 450),
    ],
    []
  );

  return (
    <div className={s["confetti-container"]}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={s["confetti-piece"]}
          style={piece.style}
        ></div>
      ))}
    </div>
  );
}
