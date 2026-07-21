"use client";

import { useState } from "react";
import { COLS, type CardData } from "../generateCard";
import s from "../bingo-card-generator.module.css";

function Cell({ value }: { value: number | "FREE" }) {
  const isFree = value === "FREE";
  const [dabbed, setDabbed] = useState(isFree);

  if (isFree) {
    return <div className={`${s.cell} ${s.free} ${s.dabbed}`}>FREE</div>;
  }

  return (
    <div
      className={dabbed ? `${s.cell} ${s.dabbed}` : s.cell}
      onClick={() => setDabbed((d) => !d)}
    >
      {value}
    </div>
  );
}

export default function BingoCard({
  card,
  index,
}: {
  card: CardData;
  index: number;
}) {
  return (
    <section className={s.card}>
      <div className={s["card-head"]}>
        <span className={s["card-title"]}>Bingo</span>
        <span className={s["card-no"]}>
          CARD {String(index).padStart(2, "0")}
        </span>
      </div>
      <div className={s.grid}>
        {COLS.map((c) => (
          <div key={c.letter} className={`${s["col-head"]} ${s[c.cls]}`}>
            {c.letter}
          </div>
        ))}
        {Array.from({ length: 5 }, (_, row) =>
          card.columns.map((column, col) => (
            <Cell key={`${row}-${col}`} value={column[row]} />
          ))
        )}
      </div>
    </section>
  );
}
