"use client";

import s from "../deal-or-no-deal.module.css";

export default function DealPopup({
  offer,
  onDeal,
  onNoDeal,
}: {
  offer: number;
  onDeal: () => void;
  onNoDeal: () => void;
}) {
  return (
    <div className={s.popup}>
      <div className={`${s["popup-content"]} ${s["banker-card"]}`}>
        <p className={s["banker-eyebrow"]}>The banker is on the phone</p>
        <h2>Deal or no deal?</h2>
        <p className={s["banker-offer-line"]}>His offer for your case:</p>
        <p className={s["popup-offer"]}>₱{offer}</p>
        <div className={s["popup-buttons"]}>
          <button className={`${s.btn} ${s.deal}`} onClick={onDeal}>
            Deal
          </button>
          <button className={`${s.btn} ${s["no-deal"]}`} onClick={onNoDeal}>
            No deal
          </button>
        </div>
      </div>
    </div>
  );
}
