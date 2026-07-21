"use client";

import { useState } from "react";
import type { CallerSettings } from "../useBingoCaller";
import s from "../bingo-caller.module.css";

export default function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: CallerSettings;
  onSave: (settings: CallerSettings) => void;
  onClose: () => void;
}) {
  const [speechRate, setSpeechRate] = useState(String(settings.speechRate));
  const [speechPitch, setSpeechPitch] = useState(String(settings.speechPitch));
  const [speechVolume, setSpeechVolume] = useState(
    String(settings.speechVolume)
  );
  const [defaultInterval, setDefaultInterval] = useState(
    String(settings.defaultInterval)
  );

  const save = () => {
    onSave({
      speechRate: parseFloat(speechRate),
      speechPitch: parseFloat(speechPitch),
      speechVolume: parseFloat(speechVolume),
      defaultInterval: parseInt(defaultInterval),
    });
    onClose();
  };

  return (
    <div
      className={s.modal}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s["modal-content"]}>
        <div className={s["modal-header"]}>
          <h2>Settings</h2>
          <button
            className={s["close-btn"]}
            aria-label="Close settings"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className={s["modal-body"]}>
          <div className={s["settings-group"]}>
            <h3>Caller voice</h3>
            <div className={s["setting-item"]}>
              <label htmlFor="speechRate">Speed</label>
              <input
                type="range"
                id="speechRate"
                min={0.5}
                max={2}
                step={0.1}
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
              />
              <span className={s["value-display"]}>
                {parseFloat(speechRate).toFixed(1)}
              </span>
            </div>
            <div className={s["setting-item"]}>
              <label htmlFor="speechPitch">Pitch</label>
              <input
                type="range"
                id="speechPitch"
                min={0.5}
                max={2}
                step={0.1}
                value={speechPitch}
                onChange={(e) => setSpeechPitch(e.target.value)}
              />
              <span className={s["value-display"]}>
                {parseFloat(speechPitch).toFixed(1)}
              </span>
            </div>
            <div className={s["setting-item"]}>
              <label htmlFor="speechVolume">Volume</label>
              <input
                type="range"
                id="speechVolume"
                min={0}
                max={1}
                step={0.1}
                value={speechVolume}
                onChange={(e) => setSpeechVolume(e.target.value)}
              />
              <span className={s["value-display"]}>
                {parseFloat(speechVolume).toFixed(1)}
              </span>
            </div>
          </div>
          <div className={s["settings-group"]}>
            <h3>Game</h3>
            <div className={s["setting-item"]}>
              <label htmlFor="defaultInterval">Seconds between calls</label>
              <input
                type="number"
                id="defaultInterval"
                min={1}
                max={10}
                value={defaultInterval}
                onChange={(e) => setDefaultInterval(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={s["modal-footer"]}>
          <button className={`${s.btn} ${s["btn-start"]}`} onClick={save}>
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
