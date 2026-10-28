"use client";

import { useState } from "react";
import { useFormatter } from "next-intl";
import { starFill } from "@/app/stars";

// Click a star for a whole star; click the same star again for a half star (and again to toggle back).
export function StarPicker() {
  const [value, setValue] = useState<number | null>(null);
  const format = useFormatter();
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${starFill(value, n)}`}
          aria-label={`${n}/5`}
          aria-pressed={value === n || value === n - 0.5}
          onClick={() => setValue(value === n ? n - 0.5 : n)}
        >
          ★
        </button>
      ))}
      {value != null && <span className="muted">{format.number(value)} / 5</span>}
      {/* carries the value and makes the browser require a rating before submit (readOnly would skip validation) */}
      <input className="star-required" name="stars" value={value ?? ""} onChange={() => {}} required tabIndex={-1} aria-hidden="true" />
    </div>
  );
}
