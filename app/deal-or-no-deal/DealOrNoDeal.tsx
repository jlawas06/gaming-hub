"use client";

import { useState } from "react";
import Link from "next/link";
import { useDealGame } from "./useDealGame";
import CasesGrid from "./components/CasesGrid";
import PrizeBoard from "./components/PrizeBoard";
import DealPopup from "./components/DealPopup";
import CelebrationPopup from "./components/CelebrationPopup";
import SettingsPopup from "./components/SettingsPopup";
import s from "./deal-or-no-deal.module.css";

export default function DealOrNoDeal() {
  const {
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
  } = useDealGame();
  const [showSettings, setShowSettings] = useState(false);

  const openSettings = () => {
    if (state.gameStarted) {
      setMessage("Cannot change settings during a game!");
      return;
    }
    setShowSettings(true);
  };

  return (
    <div className={s.page}>
      <main className={s.studio}>
        <header className={s.topbar}>
          <Link href="/" className={s["back-link"]}>
            &larr; All booths
          </Link>
          <h1 className={s["studio-title"]}>Deal or No Deal</h1>
          <div className={s["topbar-actions"]}>
            <button
              className={s["icon-btn"]}
              aria-label="Open settings"
              onClick={openSettings}
            >
              ⚙️
            </button>
          </div>
        </header>

        <p className={s["game-message"]} role="status">
          {state.message}
        </p>

        <div className={s["game-info"]}>
          <div className={`${s.podium} ${s["current-offer"]}`}>
            <h2>Banker&apos;s offer</h2>
            <div className={s["offer-amount"]}>₱{state.currentOffer}</div>
          </div>
          <div className={`${s.podium} ${s["player-case"]}`}>
            <h2>Your case</h2>
            <div className={s["case-label"]}>
              Case #<span>{state.playerCase ?? "?"}</span>
            </div>
          </div>
          <div className={`${s.podium} ${s["cases-counter"]}`}>
            <h2>Open this round</h2>
            <div className={s.counter}>{state.casesToOpen}</div>
          </div>
        </div>

        <div className={s["game-content"]}>
          <div className={s["game-main"]}>
            <CasesGrid
              cases={state.cases}
              playerCase={state.playerCase}
              gameStarted={state.gameStarted}
              onSelect={selectCase}
              onOpen={openCase}
            />

            {state.gameOver ? (
              <div className={s["game-controls"]}>
                <button className={`${s.btn} ${s.deal}`} onClick={restart}>
                  Play Again
                </button>
              </div>
            ) : state.finalDecision ? (
              <div className={s["game-controls"]}>
                <button className={`${s.btn} ${s.deal}`} onClick={makeDeal}>
                  Keep case
                </button>
                <button
                  className={`${s.btn} ${s["no-deal"]}`}
                  onClick={noDeal}
                >
                  Switch case
                </button>
              </div>
            ) : null}
          </div>

          <PrizeBoard cases={state.cases} />
        </div>
      </main>

      {state.dealPopupOffer !== null && (
        <DealPopup
          offer={state.dealPopupOffer}
          onDeal={makeDeal}
          onNoDeal={noDeal}
        />
      )}

      {showSettings && (
        <SettingsPopup
          highValues={state.highValues}
          regularValues={state.regularValues}
          onSave={(high, regular) => {
            saveSettings(high, regular);
            setShowSettings(false);
          }}
          onRestoreDefaults={() => {
            restoreDefaults();
            setShowSettings(false);
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {state.celebration && (
        <CelebrationPopup
          celebration={state.celebration}
          onClose={closeCelebration}
        />
      )}
    </div>
  );
}
