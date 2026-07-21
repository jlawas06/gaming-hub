"use client";

import { getLetterForNumber } from "../useBingoCaller";
import s from "../bingo-caller.module.css";

export default function BallDisplay({
  currentNumber,
  callCount,
}: {
  currentNumber: number | null;
  callCount: number;
}) {
  const letter = currentNumber ? getLetterForNumber(currentNumber) : "";

  return (
    // Keyed on call count so each call remounts the ball and replays the pop
    <div
      key={callCount}
      className={currentNumber ? `${s.ball} ${s.pop}` : s.ball}
      data-letter={letter}
    >
      <div className={s["ball-face"]}>
        <div className={s["ball-letter"]}>{letter}</div>
        <div className={s["ball-number"]}>{currentNumber ?? "–"}</div>
      </div>
    </div>
  );
}
