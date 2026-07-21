"use client";

import { useState } from "react";
import Link from "next/link";
import { getLetterForNumber, useBingoCaller } from "./useBingoCaller";
import { useKeyboardShortcuts } from "../lib/useKeyboardShortcuts";
import Flashboard from "./components/Flashboard";
import BallDisplay from "./components/BallDisplay";
import CallLog from "./components/CallLog";
import Confetti from "./components/Confetti";
import SettingsModal from "./components/SettingsModal";
import s from "./bingo-caller.module.css";

export default function BingoCallerGame() {
  const {
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
  } = useBingoCaller();
  const [showSettings, setShowSettings] = useState(false);

  useKeyboardShortcuts({
    " ": toggleGame,
    n: newGame,
    m: toggleMute,
    b: celebrateWinner,
  });

  return (
    <div className={s.page}>
      <main className={s.hall}>
        <header className={s.topbar}>
          <Link href="/" className={s["back-link"]}>
            &larr; All booths
          </Link>
          <h1 className={s["hall-title"]}>Bingo Caller</h1>
          <div className={s["topbar-actions"]}>
            <button
              className={isMuted ? `${s["icon-btn"]} ${s.muted}` : s["icon-btn"]}
              aria-label={
                isMuted ? "Unmute the caller voice" : "Mute the caller voice"
              }
              onClick={toggleMute}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <button
              className={s["icon-btn"]}
              aria-label="Open settings"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          </div>
        </header>

        <section className={s.stage} aria-label="Current call and controls">
          <BallDisplay
            currentNumber={currentNumber}
            callCount={calledNumbers.length}
          />

          <div className={s["stage-panel"]}>
            <p className={s["stage-status"]}>
              <span className={s["status-label"]}>Previous</span>
              <span className={s["status-value"]}>
                {lastNumber
                  ? `${getLetterForNumber(lastNumber)}-${lastNumber}`
                  : "—"}
              </span>
              <span className={s["status-sep"]} aria-hidden="true">
                ·
              </span>
              <span className={s["status-value"]}>
                <span>{calledNumbers.length}</span>/75
              </span>
              <span className={s["status-label"]}>called</span>
              <span className={s["status-sep"]} aria-hidden="true">
                ·
              </span>
              <span className={s["status-value"]}>
                {75 - calledNumbers.length}
              </span>
              <span className={s["status-label"]}>to go</span>
            </p>

            <div className={s["main-controls"]}>
              <button
                className={
                  isPlaying
                    ? `${s.btn} ${s["btn-start"]} ${s["is-playing"]}`
                    : `${s.btn} ${s["btn-start"]}`
                }
                onClick={toggleGame}
              >
                {isPlaying ? "Pause" : "Start"}
              </button>
              <button
                className={`${s.btn} ${s["btn-ghost"]}`}
                onClick={newGame}
              >
                New game
              </button>
              {showBingoBtn && (
                <button
                  className={`${s.btn} ${s["btn-bingo"]}`}
                  onClick={celebrateWinner}
                >
                  Bingo!
                </button>
              )}
            </div>

            <div className={s["secondary-controls"]}>
              <label className={s["interval-control"]} htmlFor="intervalSelect">
                Call every
                <select
                  id="intervalSelect"
                  className={s["interval-select"]}
                  value={intervalSec}
                  onChange={(e) => changeInterval(parseInt(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}s
                    </option>
                  ))}
                </select>
              </label>
              <p className={s["shortcut-hint"]}>
                Space start/pause · N new game · M mute · B bingo
              </p>
            </div>
          </div>
        </section>

        <Flashboard
          calledNumbers={calledNumbers}
          currentNumber={currentNumber}
        />

        <CallLog calledNumbers={calledNumbers} />
      </main>

      {celebrating && (
        <>
          <Confetti />
          <div className={s["winner-message"]}>
            🎉 BINGO WINNER! 🎉
            <br />
            <span className={s["winner-subtext"]}>Congratulations!</span>
          </div>
        </>
      )}

      {toast && (
        <div className={s["hall-toast"]} role="status">
          {toast}
        </div>
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
