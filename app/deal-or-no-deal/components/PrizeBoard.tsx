"use client";

import { useMemo } from "react";
import type { CaseItem } from "../useDealGame";
import s from "../deal-or-no-deal.module.css";

export default function PrizeBoard({ cases }: { cases: CaseItem[] | null }) {
  // Sort by value but key on case number, so duplicate values keep a stable slot
  const sorted = useMemo(
    () => (cases ? [...cases].sort((a, b) => a.value - b.value) : []),
    [cases]
  );

  return (
    <aside className={s["prize-list"]} aria-label="Money board">
      <h2>The board</h2>
      <div className={s["prizes-grid"]}>
        {sorted.map((c) => (
          <div
            key={c.number}
            className={
              c.opened
                ? `${s["prize-item"]} ${s.opened}`
                : `${s["prize-item"]} ${s.unopened}`
            }
          >
            <div className={s["prize-value"]}>₱{c.value}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
