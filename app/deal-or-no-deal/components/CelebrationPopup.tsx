"use client";

import type { Celebration } from "../useDealGame";
import s from "../deal-or-no-deal.module.css";

export default function CelebrationPopup({
  celebration,
  onClose,
}: {
  celebration: Celebration;
  onClose: () => void;
}) {
  return (
    <div className={s.popup}>
      <div className={`${s["popup-content"]} ${s["banker-card"]}`}>
        <p className={s["banker-eyebrow"]}>{celebration.subtitle}</p>
        <h2 style={{ marginBottom: "0.5rem" }}>{celebration.title}</h2>
        <p
          className={s["popup-offer"]}
          style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }}
        >
          ₱{celebration.amount}
        </p>
        <p
          style={{
            color: "rgba(251, 243, 226, 0.8)",
            marginBottom: "1.5rem",
          }}
        >
          {celebration.message}
        </p>
        <div className={s["popup-buttons"]}>
          <button className={`${s.btn} ${s.deal}`} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
