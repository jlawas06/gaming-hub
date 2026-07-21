"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CaseItem {
  number: number;
  value: number;
  opened: boolean;
  /* drives the flip animation on the case that was just opened */
  justRevealed: boolean;
}

export interface Celebration {
  title: string;
  subtitle: string;
  amount: number;
  message: string;
}

export interface GameState {
  cases: CaseItem[] | null;
  playerCase: number | null;
  currentRound: number;
  casesToOpen: number;
  gameStarted: boolean;
  gameOver: boolean;
  dealAccepted: boolean;
  acceptedOffer: number;
  currentOffer: number;
  message: string;
  /* final two cases, no deal taken: show Keep case / Switch case */
  finalDecision: boolean;
  dealPopupOffer: number | null;
  celebration: Celebration | null;
  highValues: number[];
  regularValues: number[];
}

const ROUNDS = [6, 5, 4, 3, 2, 1, 1, 1, 1];
export const DEFAULT_HIGH_VALUES = [50, 100, 200];
export const DEFAULT_REGULAR_VALUES = Array.from(
  { length: 23 },
  (_, i) => i + 1
);

const HIGH_KEY = "deal_highValues";
const REGULAR_KEY = "deal_regularValues";

function buildCases(highValues: number[], regularValues: number[]): CaseItem[] {
  const values = [...highValues, ...regularValues];
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return Array.from({ length: 26 }, (_, i) => ({
    number: i + 1,
    value: values[i],
    opened: false,
    justRevealed: false,
  }));
}

function freshGame(
  highValues: number[],
  regularValues: number[],
  message: string
): GameState {
  return {
    cases: buildCases(highValues, regularValues),
    playerCase: null,
    currentRound: 1,
    casesToOpen: ROUNDS[0],
    gameStarted: false,
    gameOver: false,
    dealAccepted: false,
    acceptedOffer: 0,
    currentOffer: 0,
    message,
    finalDecision: false,
    dealPopupOffer: null,
    celebration: null,
    highValues,
    regularValues,
  };
}

function computeOffer(cases: CaseItem[], currentRound: number): number {
  const unopened = cases.filter((c) => !c.opened);
  const average =
    unopened.reduce((sum, c) => sum + c.value, 0) / unopened.length;
  if (unopened.length <= 2) {
    return Math.round(Math.floor(average * 0.8));
  }
  const roundMultiplier = 0.3 + currentRound * 0.1;
  return Math.round(Math.floor(average * roundMultiplier));
}

const INITIAL_STATE: GameState = {
  cases: null,
  playerCase: null,
  currentRound: 1,
  casesToOpen: ROUNDS[0],
  gameStarted: false,
  gameOver: false,
  dealAccepted: false,
  acceptedOffer: 0,
  currentOffer: 0,
  message: "",
  finalDecision: false,
  dealPopupOffer: null,
  celebration: null,
  highValues: DEFAULT_HIGH_VALUES,
  regularValues: DEFAULT_REGULAR_VALUES,
};

export function useDealGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const stateRef = useRef(state);
  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeouts.current.delete(id);
      fn();
    }, ms);
    timeouts.current.add(id);
  }, []);

  const clearScheduled = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current.clear();
  }, []);

  useEffect(() => clearScheduled, [clearScheduled]);

  // Case values are shuffled and settings come from localStorage,
  // so the game initializes after mount to keep SSR markup stable
  useEffect(() => {
    const savedHigh = localStorage.getItem(HIGH_KEY);
    const savedRegular = localStorage.getItem(REGULAR_KEY);
    let highValues = DEFAULT_HIGH_VALUES;
    let regularValues = DEFAULT_REGULAR_VALUES;
    try {
      if (savedHigh) highValues = JSON.parse(savedHigh);
      if (savedRegular) regularValues = JSON.parse(savedRegular);
    } catch {
      // Corrupt data: fall back to defaults
    }
    commit(freshGame(highValues, regularValues, "Select your case to begin!"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endGame = useCallback(() => {
    const st = stateRef.current;
    if (!st.cases) return;
    const player = st.cases.find((c) => c.number === st.playerCase);
    if (!player) {
      commit({ ...st, message: "Game Over! Something went wrong." });
      return;
    }
    const other = st.cases.find(
      (c) => !c.opened && c.number !== st.playerCase
    );
    const cases = st.cases.map((c) =>
      c.number === player.number || c.number === other?.number
        ? { ...c, opened: true, justRevealed: false }
        : c
    );

    let celebration: Celebration;
    let message: string;
    if (st.dealAccepted) {
      const goodDeal = st.acceptedOffer - player.value >= 0;
      celebration = {
        title: goodDeal ? "Good deal!" : "Bad deal!",
        subtitle: "You took the Banker's offer:",
        amount: st.acceptedOffer,
        message: goodDeal
          ? `Your case only had ₱${player.value}. You made the right choice!`
          : `Your case had ₱${player.value}. The banker got you!`,
      };
      message = `${celebration.title} ${celebration.message}`;
    } else {
      celebration = {
        title: "Congratulations!",
        subtitle: "You won what was in your case:",
        amount: player.value,
        message: other ? `The other case contained ₱${other.value}.` : "",
      };
      message = other
        ? `Game Over! Your case contained ₱${player.value} and the other case contained ₱${other.value}!`
        : `Game Over! Your case contained ₱${player.value}!`;
    }

    commit({ ...st, cases, gameOver: true, finalDecision: false, message });

    // Delay popup slightly for suspense
    schedule(() => {
      commit({ ...stateRef.current, celebration });
    }, 1200);
  }, [commit, schedule]);

  // Applies final-round handling to a pending state and returns it
  const withFinalRound = useCallback(
    (st: GameState): GameState => {
      if (st.dealAccepted) {
        schedule(endGame, 1500);
        return { ...st, message: "Final cases! Let's see what was in your case!" };
      }
      return {
        ...st,
        finalDecision: true,
        message:
          "Final round! You can switch your case or keep it. Make your decision!",
      };
    },
    [endGame, schedule]
  );

  const withNextRound = useCallback(
    (st: GameState): GameState => {
      if (!st.cases) return st;
      const currentRound = st.currentRound + 1;
      const unopened = st.cases.filter((c) => !c.opened);
      if (currentRound > ROUNDS.length || unopened.length === 2) {
        return withFinalRound({ ...st, currentRound });
      }
      const casesToOpen = ROUNDS[currentRound - 1];
      const prefix = st.dealAccepted
        ? `You dealt for ₱${st.acceptedOffer}. `
        : `Round ${currentRound}: `;
      return {
        ...st,
        currentRound,
        casesToOpen,
        message: `${prefix}Open ${casesToOpen} cases`,
      };
    },
    [withFinalRound]
  );

  const selectCase = useCallback(
    (n: number) => {
      const st = stateRef.current;
      if (st.gameStarted || st.gameOver || !st.cases) return;
      commit({
        ...st,
        playerCase: n,
        gameStarted: true,
        message: `You selected case #${n}. Now open ${st.casesToOpen} cases!`,
      });
    },
    [commit]
  );

  const openCase = useCallback(
    (n: number) => {
      const st = stateRef.current;
      if (!st.cases || st.gameOver || st.casesToOpen <= 0 || !st.gameStarted)
        return;
      if (n === st.playerCase) return;
      const target = st.cases.find((c) => c.number === n);
      if (!target || target.opened) return;

      const cases = st.cases.map((c) =>
        c.number === n
          ? { ...c, opened: true, justRevealed: true }
          : { ...c, justRevealed: false }
      );
      let next: GameState = {
        ...st,
        cases,
        casesToOpen: st.casesToOpen - 1,
        message: `Case ${n} contains ₱${target.value}!`,
      };

      const unopened = cases.filter((c) => !c.opened);
      if (unopened.length === 2) {
        next = withFinalRound(next);
      } else if (next.casesToOpen === 0) {
        next.currentOffer = computeOffer(cases, st.currentRound);
        // Give the reveal a beat before the banker calls
        if (!st.dealAccepted) {
          schedule(() => {
            const cur = stateRef.current;
            commit({ ...cur, dealPopupOffer: cur.currentOffer });
          }, 900);
        } else {
          schedule(() => commit(withNextRound(stateRef.current)), 900);
        }
      }
      commit(next);
    },
    [commit, schedule, withFinalRound, withNextRound]
  );

  const makeDeal = useCallback(() => {
    const st = stateRef.current;
    if (!st.cases) return;
    if (!st.gameStarted) {
      commit({ ...st, message: "Please select your case first!" });
      return;
    }
    const unopened = st.cases.filter((c) => !c.opened);
    if (unopened.length === 2) {
      // Final round - keep current case
      commit({ ...st, dealPopupOffer: null });
      endGame();
    } else {
      commit({
        ...st,
        dealPopupOffer: null,
        dealAccepted: true,
        acceptedOffer: st.currentOffer,
        message: `You accepted ₱${st.currentOffer}! Let's play it out.`,
      });
      schedule(() => commit(withNextRound(stateRef.current)), 1500);
    }
  }, [commit, endGame, schedule, withNextRound]);

  const noDeal = useCallback(() => {
    const st = stateRef.current;
    if (!st.cases) return;
    if (!st.gameStarted) {
      commit({ ...st, message: "Please select your case first!" });
      return;
    }
    const unopened = st.cases.filter((c) => !c.opened);
    if (unopened.length === 2) {
      // Final round - switch cases
      const other = unopened.find((c) => c.number !== st.playerCase);
      commit({
        ...st,
        dealPopupOffer: null,
        playerCase: other ? other.number : st.playerCase,
      });
      endGame();
    } else {
      commit(withNextRound({ ...st, dealPopupOffer: null }));
    }
  }, [commit, endGame, withNextRound]);

  const restart = useCallback(() => {
    clearScheduled();
    const st = stateRef.current;
    commit(
      freshGame(st.highValues, st.regularValues, "Select your case to begin!")
    );
  }, [clearScheduled, commit]);

  const saveSettings = useCallback(
    (highValues: number[], regularValues: number[]) => {
      clearScheduled();
      localStorage.setItem(HIGH_KEY, JSON.stringify(highValues));
      localStorage.setItem(REGULAR_KEY, JSON.stringify(regularValues));
      commit(
        freshGame(
          highValues,
          regularValues,
          "Settings saved! Select your case to begin!"
        )
      );
    },
    [clearScheduled, commit]
  );

  const restoreDefaults = useCallback(() => {
    clearScheduled();
    localStorage.removeItem(HIGH_KEY);
    localStorage.removeItem(REGULAR_KEY);
    commit(
      freshGame(
        DEFAULT_HIGH_VALUES,
        DEFAULT_REGULAR_VALUES,
        "Defaults restored! Select your case to begin!"
      )
    );
  }, [clearScheduled, commit]);

  const closeCelebration = useCallback(() => {
    commit({ ...stateRef.current, celebration: null });
  }, [commit]);

  const setMessage = useCallback(
    (message: string) => {
      commit({ ...stateRef.current, message });
    },
    [commit]
  );

  return {
    state,
    selectCase,
    openCase,
    makeDeal,
    noDeal,
    restart,
    saveSettings,
    restoreDefaults,
    closeCelebration,
    setMessage,
  };
}
