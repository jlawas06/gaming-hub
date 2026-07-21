"use client";

import { useEffect, useRef } from "react";

/**
 * Registers document-level keyboard shortcuts. Keys are matched by
 * event.key, lowercased (use " " for the spacebar). Shortcuts are
 * ignored while typing in form fields.
 */
export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      const handler = handlersRef.current[e.key.toLowerCase()];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
