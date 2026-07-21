"use client";

import { useState } from "react";
import s from "../deal-or-no-deal.module.css";

export default function SettingsPopup({
  highValues,
  regularValues,
  onSave,
  onRestoreDefaults,
  onCancel,
}: {
  highValues: number[];
  regularValues: number[];
  onSave: (high: number[], regular: number[]) => void;
  onRestoreDefaults: () => void;
  onCancel: () => void;
}) {
  const [high, setHigh] = useState(highValues.map(String));
  const [regular, setRegular] = useState(regularValues.map(String));

  const updateAt =
    (setter: typeof setHigh, index: number) => (value: string) =>
      setter((prev) => prev.map((v, i) => (i === index ? value : v)));

  const save = () => {
    onSave(
      high.map((v) => parseInt(v) || 1),
      regular.map((v) => parseInt(v) || 1)
    );
  };

  return (
    <div className={s.popup}>
      <div className={`${s["popup-content"]} ${s["settings-card"]}`}>
        <h2>Settings</h2>
        <div className={s["settings-form"]}>
          <div className={s["prize-inputs"]}>
            <div className={s["prize-list-input"]}>
              <label>Top prizes (₱)</label>
              <div className={s["prize-input-group"]}>
                {high.map((value, i) => (
                  <input
                    key={i}
                    type="number"
                    className={s["prize-input"]}
                    value={value}
                    min={1}
                    onChange={(e) => updateAt(setHigh, i)(e.target.value)}
                  />
                ))}
              </div>
            </div>
            <div className={s["prize-list-input"]}>
              <label>Regular prizes (₱)</label>
              <div className={`${s["prize-input-group"]} ${s["regular-prizes"]}`}>
                {regular.map((value, i) => (
                  <input
                    key={i}
                    type="number"
                    className={s["prize-input"]}
                    value={value}
                    min={1}
                    onChange={(e) => updateAt(setRegular, i)(e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={s["settings-buttons"]}>
            <button
              className={`${s.btn} ${s["btn-plain"]}`}
              onClick={onRestoreDefaults}
            >
              Restore defaults
            </button>
            <button className={`${s.btn} ${s["btn-plain"]}`} onClick={onCancel}>
              Cancel
            </button>
            <button className={`${s.btn} ${s.deal}`} onClick={save}>
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
