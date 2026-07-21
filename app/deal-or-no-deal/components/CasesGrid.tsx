"use client";

import type { CaseItem } from "../useDealGame";
import s from "../deal-or-no-deal.module.css";

export default function CasesGrid({
  cases,
  playerCase,
  gameStarted,
  onSelect,
  onOpen,
}: {
  cases: CaseItem[] | null;
  playerCase: number | null;
  gameStarted: boolean;
  onSelect: (n: number) => void;
  onOpen: (n: number) => void;
}) {
  // Pre-init placeholder: 26 closed cases (numbers are deterministic, values are not)
  const items =
    cases ??
    Array.from({ length: 26 }, (_, i) => ({
      number: i + 1,
      value: 0,
      opened: false,
      justRevealed: false,
    }));

  return (
    <div className={s["cases-grid"]}>
      {items.map((c) => {
        if (c.opened) {
          return (
            <button
              key={c.number}
              type="button"
              className={
                c.justRevealed
                  ? `${s.case} ${s.opened} ${s.revealed}`
                  : `${s.case} ${s.opened}`
              }
              disabled
              aria-label={`Case ${c.number}, opened, contained ₱${c.value}`}
            >
              ₱{c.value}
            </button>
          );
        }
        if (c.number === playerCase) {
          return (
            <button
              key={c.number}
              type="button"
              className={`${s.case} ${s.selected}`}
              disabled
              aria-label={`Case ${c.number}, your case`}
            >
              {c.number}
            </button>
          );
        }
        return (
          <button
            key={c.number}
            type="button"
            className={s.case}
            disabled={!cases}
            onClick={() =>
              gameStarted ? onOpen(c.number) : onSelect(c.number)
            }
            aria-label={
              gameStarted
                ? `Open case ${c.number}`
                : `Pick case ${c.number} as your case`
            }
          >
            {c.number}
          </button>
        );
      })}
    </div>
  );
}
