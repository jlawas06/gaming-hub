"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeech } from "../lib/useSpeech";

export interface CallerSettings {
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  defaultInterval: number;
}

const DEFAULT_SETTINGS: CallerSettings = {
  speechRate: 0.9,
  speechPitch: 1,
  speechVolume: 1,
  defaultInterval: 5,
};

export function getLetterForNumber(number: number): string {
  if (number >= 1 && number <= 15) return "B";
  if (number >= 16 && number <= 30) return "I";
  if (number >= 31 && number <= 45) return "N";
  if (number >= 46 && number <= 60) return "G";
  if (number >= 61 && number <= 75) return "O";
  return "";
}

export function useBingoCaller() {
  const { speak, cancel } = useSpeech();

  // Ordered list of calls — the single source of truth the rest derives from
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [intervalSec, setIntervalSec] = useState(
    DEFAULT_SETTINGS.defaultInterval
  );
  const [settings, setSettings] = useState<CallerSettings>(DEFAULT_SETTINGS);
  const [celebrating, setCelebrating] = useState(false);
  const [showBingoBtn, setShowBingoBtn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Refs mirror state so the async call loop never reads stale closures
  const calledRef = useRef<number[]>([]);
  const playingRef = useRef(false);
  const mutedRef = useRef(false);
  const intervalRef = useRef(DEFAULT_SETTINGS.defaultInterval);
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const loopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimeouts = useRef<Set<ReturnType<typeof setTimeout>>>(
    new Set()
  );
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted settings after mount (localStorage is browser-only)
  useEffect(() => {
    const loaded: CallerSettings = {
      speechRate:
        parseFloat(localStorage.getItem("speechRate") ?? "") ||
        DEFAULT_SETTINGS.speechRate,
      speechPitch:
        parseFloat(localStorage.getItem("speechPitch") ?? "") ||
        DEFAULT_SETTINGS.speechPitch,
      speechVolume:
        parseFloat(localStorage.getItem("speechVolume") ?? "") ||
        DEFAULT_SETTINGS.speechVolume,
      defaultInterval:
        parseInt(localStorage.getItem("defaultInterval") ?? "") ||
        DEFAULT_SETTINGS.defaultInterval,
    };
    settingsRef.current = loaded;
    setSettings(loaded);
    intervalRef.current = loaded.defaultInterval;
    setIntervalSec(loaded.defaultInterval);
  }, []);

  // Clear every pending timer on unmount
  useEffect(() => {
    const pending = completeTimeouts.current;
    return () => {
      if (loopTimeout.current) clearTimeout(loopTimeout.current);
      if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const pause = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
      loopTimeout.current = null;
    }
  }, []);

  const gameComplete = useCallback(() => {
    pause();
    const speakId = setTimeout(() => {
      completeTimeouts.current.delete(speakId);
      speak("Bingo game complete! All numbers have been called.", {
        rate: 0.7,
      });
    }, 1000);
    completeTimeouts.current.add(speakId);

    const toastId = setTimeout(() => {
      completeTimeouts.current.delete(toastId);
      showToast(
        "🎉 All 75 numbers have been called! Press New game to play again."
      );
    }, 1500);
    completeTimeouts.current.add(toastId);
  }, [pause, showToast, speak]);

  const callNext = useCallback(async () => {
    if (!playingRef.current) return;

    const called = calledRef.current;
    const available: number[] = [];
    for (let i = 1; i <= 75; i++) {
      if (!called.includes(i)) available.push(i);
    }
    if (available.length === 0) {
      pause();
      return;
    }

    const number = available[Math.floor(Math.random() * available.length)];
    const next = [...called, number];
    calledRef.current = next;
    setCalledNumbers(next);

    // Announce and wait for the voice to finish
    if (!mutedRef.current) {
      const { speechRate, speechPitch, speechVolume } = settingsRef.current;
      await speak(`${getLetterForNumber(number)}, ${number}`, {
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume,
      });
    }

    if (next.length === 75) {
      gameComplete();
      return;
    }

    if (playingRef.current) {
      // Speech adds roughly a second; when muted there is no
      // speech to wait for, so use the full interval
      const delay = mutedRef.current
        ? intervalRef.current * 1000
        : Math.max(0, intervalRef.current * 1000 - 1000);
      loopTimeout.current = setTimeout(callNext, delay);
    }
  }, [gameComplete, pause, speak]);

  const start = useCallback(() => {
    if (calledRef.current.length === 75) {
      showToast("All 75 numbers have been called. Press New game to start over.");
      return;
    }
    playingRef.current = true;
    setIsPlaying(true);
    setShowBingoBtn(true);
    callNext();
  }, [callNext, showToast]);

  const toggleGame = useCallback(() => {
    if (playingRef.current) {
      pause();
    } else {
      start();
    }
  }, [pause, start]);

  const clearCelebration = useCallback(() => {
    setCelebrating(false);
    if (celebrationTimeout.current) {
      clearTimeout(celebrationTimeout.current);
      celebrationTimeout.current = null;
    }
  }, []);

  const newGame = useCallback(() => {
    pause();
    calledRef.current = [];
    setCalledNumbers([]);
    setShowBingoBtn(false);
    cancel();
    clearCelebration();
  }, [cancel, clearCelebration, pause]);

  const toggleMute = useCallback(() => {
    const muted = !mutedRef.current;
    mutedRef.current = muted;
    setIsMuted(muted);
    // Stop any call that is mid-announcement
    if (muted) cancel();
  }, [cancel]);

  const changeInterval = useCallback((seconds: number) => {
    intervalRef.current = seconds;
    setIntervalSec(seconds);
  }, []);

  const celebrateWinner = useCallback(() => {
    if (playingRef.current) pause();
    setCelebrating(true);
    speak("Congratulations! We have a BINGO winner! Well done!", {
      rate: 1,
      pitch: 1.2,
      volume: 1,
    });
    if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
    celebrationTimeout.current = setTimeout(() => setCelebrating(false), 5000);
  }, [pause, speak]);

  const saveSettings = useCallback(
    (next: CallerSettings) => {
      localStorage.setItem("speechRate", String(next.speechRate));
      localStorage.setItem("speechPitch", String(next.speechPitch));
      localStorage.setItem("speechVolume", String(next.speechVolume));
      localStorage.setItem("defaultInterval", String(next.defaultInterval));
      settingsRef.current = next;
      setSettings(next);
      if (!playingRef.current) {
        intervalRef.current = next.defaultInterval;
        setIntervalSec(next.defaultInterval);
      }
    },
    []
  );

  const currentNumber = calledNumbers[calledNumbers.length - 1] ?? null;
  const lastNumber = calledNumbers[calledNumbers.length - 2] ?? null;

  return {
    calledNumbers,
    currentNumber,
    lastNumber,
    isPlaying,
    isMuted,
    intervalSec,
    settings,
    celebrating,
    showBingoBtn,
    toast,
    toggleGame,
    newGame,
    toggleMute,
    changeInterval,
    celebrateWinner,
    saveSettings,
  };
}
