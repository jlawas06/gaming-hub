"use client";

import type { DieElements } from "../useDiceRoll";
import s from "../color-game.module.css";

const FACES = [
  { face: "face-front", color: "red" },
  { face: "face-back", color: "blue" },
  { face: "face-right", color: "green" },
  { face: "face-left", color: "yellow" },
  { face: "face-top", color: "white" },
  { face: "face-bottom", color: "pink" },
];

export default function Die({
  elements,
  pulsing,
}: {
  elements: DieElements;
  pulsing: boolean;
}) {
  return (
    <div
      className={
        pulsing ? `${s["die-scene"]} ${s["die-pulse"]}` : s["die-scene"]
      }
    >
      <div
        className={s["die-shadow"]}
        ref={(el) => {
          elements.shadow = el;
        }}
      ></div>
      <div
        className={s["die-bounce"]}
        ref={(el) => {
          elements.bounce = el;
        }}
      >
        <div
          className={s["die-cube"]}
          ref={(el) => {
            elements.cube = el;
          }}
        >
          {FACES.map(({ face, color }) => (
            <div key={face} className={`${s["die-face"]} ${s[face]} ${s[color]}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
