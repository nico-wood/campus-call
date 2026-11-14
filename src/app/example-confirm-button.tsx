"use client";

import { useState } from "react";
import { runExampleConfirm } from "./example-confirm";

const BEFORE = "This confirm does not open a position, change virtual credits, or add points.";
const AFTER = "Nothing was written. Virtual credits and points are unchanged.";

export function ExampleConfirmButton() {
  const [note, setNote] = useState(BEFORE);

  return (
    <div className="confirm-panel">
      <p id="example-confirm-note" className="confirm-note">
        {note}
      </p>
      <button
        type="button"
        className="confirm"
        aria-describedby="example-confirm-note"
        onClick={() => {
          runExampleConfirm();
          setNote(AFTER);
        }}
      >
        Confirm
      </button>
    </div>
  );
}
