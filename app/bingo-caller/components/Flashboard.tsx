"use client";

import { useMemo } from "react";
import s from "../bingo-caller.module.css";

const LETTERS = ["B", "I", "N", "G", "O"];

export default function Flashboard({
  calledNumbers,
  currentNumber,
}: {
  calledNumbers: number[];
  currentNumber: number | null;
}) {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  return (
    <section className={s.flashboard} aria-label="Number board">
      <div className={s.board}>
        {LETTERS.map((letter, rowIndex) => (
          <div key={letter} className={s["board-row"]} data-letter={letter}>
            <div className={s["board-letter"]}>{letter}</div>
            {Array.from({ length: 15 }, (_, i) => {
              const number = rowIndex * 15 + i + 1;
              const className =
                number === currentNumber
                  ? `${s["number-cell"]} ${s.current}`
                  : calledSet.has(number)
                    ? `${s["number-cell"]} ${s.called}`
                    : s["number-cell"];
              return (
                <div key={number} className={className}>
                  {number}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
