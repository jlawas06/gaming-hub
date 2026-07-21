"use client";

import { useEffect, useRef } from "react";
import { getLetterForNumber } from "../useBingoCaller";
import s from "../bingo-caller.module.css";

export default function CallLog({ calledNumbers }: { calledNumbers: number[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep the newest entry in view
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  }, [calledNumbers.length]);

  return (
    <section className={s["call-history"]} aria-label="Call history">
      <h2 className={s["history-label"]}>Call history</h2>
      <div className={s["logs-container"]} ref={containerRef}>
        {calledNumbers.length === 0 ? (
          <div className={s["no-logs"]}>No numbers called yet</div>
        ) : (
          [...calledNumbers].reverse().map((number, i) => {
            const sequence = calledNumbers.length - i;
            return (
              <div
                key={number}
                className={
                  i === 0 ? `${s["log-entry"]} ${s.latest}` : s["log-entry"]
                }
              >
                <span className={s["log-number"]}>
                  {getLetterForNumber(number)}-{number}
                </span>
                <span className={s["log-sequence"]}>#{sequence}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
