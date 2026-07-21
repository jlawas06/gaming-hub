"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildCards, type CardData } from "./generateCard";
import BingoCard from "./components/BingoCard";
import s from "./bingo-card-generator.module.css";

export default function BingoCardGenerator() {
  const [count, setCount] = useState("1");
  const [cards, setCards] = useState<CardData[] | null>(null);

  // Cards are random, so generate only after mount to keep SSR markup stable
  useEffect(() => {
    setCards(buildCards(1));
  }, []);

  const generate = () => {
    const n = Math.min(24, Math.max(1, parseInt(count) || 1));
    setCount(String(n));
    setCards(buildCards(n));
  };

  const single = cards !== null && cards.length === 1;

  return (
    <div className={s.page}>
      <Link href="/" className={s["back-link"]}>
        &larr; All booths
      </Link>
      <header className={s.header}>
        <div className={s.wordmark}>
          <span>B</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
          <span>O</span>
        </div>
        <p className={s.tagline}>
          75-ball card generator &middot; tap a number to dab it
        </p>
      </header>

      <div className={s.controls}>
        <div className={s.field}>
          <label htmlFor="count">Cards</label>
          <input
            id="count"
            type="number"
            min={1}
            max={24}
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
        <button className={`${s.btn} ${s["btn-primary"]}`} onClick={generate}>
          Generate
        </button>
        <button
          className={`${s.btn} ${s["btn-ghost"]}`}
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>

      <main className={single ? `${s.cards} ${s.single}` : s.cards}>
        {cards?.map((card, i) => (
          <BingoCard key={card.id} card={card} index={i + 1} />
        ))}
      </main>

      <footer className={s.footer}>
        Standard US bingo &middot; B 1&ndash;15 &middot; I 16&ndash;30 &middot;
        N 31&ndash;45 &middot; G 46&ndash;60 &middot; O 61&ndash;75
      </footer>
    </div>
  );
}
