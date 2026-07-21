"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import s from "./color-game.module.css";

export const COLORS = ["red", "green", "blue", "yellow", "white", "pink"] as const;
export type Color = (typeof COLORS)[number];

// 3D dice: cube rotation (rotateX, rotateY) that brings each color's face to the front
const faceOrientations: Record<Color, { x: number; y: number }> = {
  red: { x: 0, y: 0 },
  blue: { x: 0, y: 180 },
  green: { x: 0, y: -90 },
  yellow: { x: 0, y: 90 },
  white: { x: -90, y: 0 },
  pink: { x: 90, y: 0 },
};

export interface DieElements {
  bounce: HTMLDivElement | null;
  cube: HTMLDivElement | null;
  shadow: HTMLDivElement | null;
}

interface DieState {
  z: number;
  x: number;
  y: number;
}

export function useDiceRoll(
  diceRef: RefObject<DieElements[]>,
  stageRef: RefObject<HTMLDivElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
) {
  const [isRolling, setIsRolling] = useState(false);
  const isRollingRef = useRef(false);

  // Accumulated rotation per die (angles only ever grow so every roll re-animates)
  const diceState = useRef<DieState[]>([
    { z: 0, x: 0, y: 0 },
    { z: 0, x: 0, y: 0 },
    { z: 0, x: 0, y: 0 },
  ]);

  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    const pending = timeouts.current;
    return () => {
      unmounted.current = true;
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeouts.current.delete(id);
      fn();
    }, ms);
    timeouts.current.add(id);
    return id;
  }, []);

  const applyDieTransform = useCallback(
    (i: number) => {
      const st = diceState.current[i];
      const cube = diceRef.current[i]?.cube;
      if (cube) {
        cube.style.transform = `rotateZ(${st.z}deg) rotateX(${st.x}deg) rotateY(${st.y}deg)`;
      }
    },
    [diceRef]
  );

  const roll = useCallback((): Promise<Color[] | null> => {
    if (isRollingRef.current || unmounted.current) return Promise.resolve(null);
    isRollingRef.current = true;
    setIsRolling(true);

    // Decide the result FIRST — the animation is purely cosmetic
    const results: Color[] = [];
    for (let i = 0; i < 3; i++) {
      results.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }

    return new Promise((resolve) => {
      let finished = false;
      let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
      const commitFinals: Array<() => void> = [];

      const finish = () => {
        if (finished) return;
        finished = true;
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          timeouts.current.delete(fallbackTimer);
        }
        commitFinals.forEach((commit) => commit());
        isRollingRef.current = false;
        if (!unmounted.current) {
          setIsRolling(false);
          resolve(results);
        } else {
          resolve(null);
        }
      };

      const dice = diceRef.current;
      const container = containerRef.current;
      const stage = stageRef.current;

      // Reduced motion: quick fade to the result instead of tumbling
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        container?.classList.add(s["fade-out"]);
        schedule(() => {
          results.forEach((color, i) => {
            const base = faceOrientations[color];
            diceState.current[i] = { z: 0, x: base.x, y: base.y };
            applyDieTransform(i);
            const die = dice[i];
            if (die.bounce) die.bounce.style.transform = "";
            if (die.shadow) die.shadow.style.transform = "";
          });
          container?.classList.remove(s["fade-out"]);
          schedule(finish, 250);
        }, 200);
        return;
      }

      const windUpMs = 180;
      let maxEndTime = windUpMs;
      const settlePromises: Promise<unknown>[] = [];
      let shakeScheduled = false;

      const triggerStageShake = () => {
        if (shakeScheduled || !stage) return;
        shakeScheduled = true;
        stage.classList.remove(s.shake);
        void stage.offsetWidth;
        stage.classList.add(s.shake);
        stage.addEventListener(
          "animationend",
          () => stage.classList.remove(s.shake),
          { once: true }
        );
      };

      // Brief wind-up before the throw
      dice.forEach((die) => die.bounce?.classList.add(s["wind-up"]));

      results.forEach((color, i) => {
        const { cube, bounce, shadow } = dice[i];
        if (!cube || !bounce || !shadow) return;
        const size = cube.offsetWidth || 100;
        const base = faceOrientations[color];
        const state = diceState.current[i];

        const delay = windUpMs + i * 280 + Math.random() * 100;
        const duration = 2200 + Math.random() * 800;

        const spinX = 1440 + Math.floor(Math.random() * 3) * 360;
        const spinY = 1440 + Math.floor(Math.random() * 3) * 360;
        const targetX = base.x + 360 * Math.ceil((state.x + spinX - base.x) / 360);
        const targetY = base.y + 360 * Math.ceil((state.y + spinY - base.y) / 360);

        // Mid-air sideways drift that snaps back to center on land
        const scatterPeak = Math.random() * 22 - 11;
        const txAt = (p: number) => {
          if (p <= 0.34) return scatterPeak * (p / 0.34);
          if (p <= 0.76) return scatterPeak * (1 - ((p - 0.34) / 0.42) * 0.35);
          return scatterPeak * 0.65 * (1 - (p - 0.76) / 0.24);
        };

        const h1 = size * (0.85 + Math.random() * 0.25);
        const h2 = h1 * 0.4;
        const h3 = h1 * 0.16;
        const h4 = h1 * 0.06;

        const rise = "cubic-bezier(0.22, 0.61, 0.36, 1)";
        const fall = "cubic-bezier(0.55, 0.06, 0.68, 0.19)";

        const pos = (p: number, y: number, sx?: number, sy?: number) =>
          `translate(${txAt(p).toFixed(2)}px, ${(-y).toFixed(2)}px) scale(${sx || 1}, ${sy || 1})`;

        const bounceAnim = bounce.animate(
          [
            { offset: 0, transform: pos(0, 0), easing: rise },
            { offset: 0.15, transform: pos(0.15, h1), easing: fall },
            { offset: 0.34, transform: pos(0.34, 0, 1.09, 0.82), easing: rise },
            { offset: 0.46, transform: pos(0.46, h2), easing: fall },
            { offset: 0.58, transform: pos(0.58, 0, 1.05, 0.9), easing: rise },
            { offset: 0.67, transform: pos(0.67, h3), easing: fall },
            { offset: 0.76, transform: pos(0.76, 0, 1.03, 0.95), easing: rise },
            { offset: 0.82, transform: pos(0.82, h4), easing: fall },
            { offset: 0.88, transform: pos(0.88, 0, 1.01, 0.98), easing: rise },
            { offset: 1, transform: pos(1, 0) },
          ],
          { duration, delay, fill: "both" }
        );

        const rot = (share: number, z: number) =>
          `rotateZ(${z.toFixed(2)}deg) ` +
          `rotateX(${(state.x + (targetX - state.x) * share).toFixed(2)}deg) ` +
          `rotateY(${(state.y + (targetY - state.y) * share).toFixed(2)}deg)`;

        const z1 = state.z + (Math.random() * 140 - 70);
        const z2 = Math.random() * 28 - 14;
        const z3 = Math.random() * 10 - 5;

        const cubeAnim = cube.animate(
          [
            { offset: 0, transform: rot(0, state.z), easing: "linear" },
            { offset: 0.28, transform: rot(0.42, z1), easing: "linear" },
            { offset: 0.5, transform: rot(0.72, z1), easing: "linear" },
            { offset: 0.68, transform: rot(0.86, z2), easing: "linear" },
            { offset: 0.82, transform: rot(0.93, z3), easing: "linear" },
            { offset: 0.92, transform: rot(0.97, z3 * 0.35), easing: "ease-out" },
            { offset: 1, transform: rot(1, 0), easing: "ease-out" },
          ],
          { duration, delay, fill: "both" }
        );

        const sh = (p: number, scale: number, o: number) => ({
          transform: `translateX(${txAt(p).toFixed(2)}px) scale(${scale})`,
          opacity: o,
        });
        const shadowAnim = shadow.animate(
          [
            { offset: 0, ...sh(0, 1, 0.4), easing: rise },
            { offset: 0.15, ...sh(0.15, 0.55, 0.15), easing: fall },
            { offset: 0.34, ...sh(0.34, 1.06, 0.45), easing: rise },
            { offset: 0.46, ...sh(0.46, 0.75, 0.25), easing: fall },
            { offset: 0.58, ...sh(0.58, 1.03, 0.42), easing: rise },
            { offset: 0.67, ...sh(0.67, 0.87, 0.32), easing: fall },
            { offset: 0.76, ...sh(0.76, 1, 0.4) },
            { offset: 1, ...sh(1, 1, 0.4) },
          ],
          { duration, delay, fill: "both" }
        );

        diceState.current[i] = { z: 0, x: targetX, y: targetY };

        commitFinals.push(() => {
          applyDieTransform(i);
          bounce.style.transform = "";
          shadow.style.transform = "";
          bounce.classList.remove(s["wind-up"]);
          [bounceAnim, cubeAnim, shadowAnim].forEach((anim) => {
            try {
              anim.cancel();
            } catch {
              /* already canceled */
            }
          });
        });

        if (i === 0) {
          schedule(triggerStageShake, delay + duration * 0.34);
        }

        maxEndTime = Math.max(maxEndTime, delay + duration);
        settlePromises.push(cubeAnim.finished);
      });

      schedule(() => {
        dice.forEach((die) => die.bounce?.classList.remove(s["wind-up"]));
      }, windUpMs);

      Promise.all(settlePromises)
        .then(finish)
        .catch(() => {});

      fallbackTimer = schedule(finish, maxEndTime + 400);
    });
  }, [applyDieTransform, containerRef, diceRef, schedule, stageRef]);

  return { isRolling, roll };
}
