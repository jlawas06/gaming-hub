"use client";

import { useCallback, useEffect } from "react";

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

const supported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export function useSpeech() {
  // Silence the caller when navigating away
  useEffect(() => {
    return () => {
      if (supported()) speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, options: SpeechOptions = {}): Promise<void> => {
      if (!supported()) return Promise.resolve();

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (options.rate !== undefined) utterance.rate = options.rate;
        if (options.pitch !== undefined) utterance.pitch = options.pitch;
        if (options.volume !== undefined) utterance.volume = options.volume;

        // Resolve on error too (Chrome fires it on cancel) so callers never hang
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const cancel = useCallback(() => {
    if (supported()) speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
}
