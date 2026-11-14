"use client";

import { useState } from "react";
import { runExampleConfirm } from "./example-confirm";

function OutcomeFace({ label, marks }: { label: string; marks?: Record<string, string> }) {
  const src = marks?.[label];
  if (!src) return <span>{label}</span>;
  return (
    <span className="team-lockup">
      <img className="team-mark" src={src} alt="" />
      <span>{label}</span>
    </span>
  );
}

export function LivePosition({
  id,
  outcomes,
  marks,
}: {
  id: string;
  outcomes: readonly string[];
  marks?: Record<string, string>;
}) {
  const [selected, setSelected] = useState(outcomes[0] ?? "");
  const [amount, setAmount] = useState("25");
  const [signInRequired, setSignInRequired] = useState(false);
  const amountId = `position-amount-${id}`;

  return (
    <div className="live-position">
      <div className="position-choices" aria-label="Position outcome">
        {outcomes.map((label) => (
          <button key={label} type="button" aria-pressed={selected === label} onClick={() => setSelected(label)}>
            <OutcomeFace label={label} marks={marks} />
          </button>
        ))}
      </div>
      <label className="position-amount" htmlFor={amountId}>
        <span>Virtual credits</span>
        <input
          id={amountId}
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, "").slice(0, 7))}
        />
      </label>
      <div className="quick-amounts" aria-label="Choose virtual credits">
        {[25, 50, 100].map((value) => (
          <button key={value} type="button" aria-pressed={amount === String(value)} onClick={() => setAmount(String(value))}>
            {value}
          </button>
        ))}
      </div>
      <div className="position-selection">
        <span>Selected outcome</span>
        <strong><OutcomeFace label={selected} marks={marks} /></strong>
      </div>
      {signInRequired ? (
        <div className="access-notice">
          <h3>Sign in to continue</h3>
          <p>You need an account to open a position. Nothing was written. Virtual credits and points are unchanged.</p>
          <a className="confirm access-signin" href="/login">Continue to sign in <span aria-hidden="true">→</span></a>
        </div>
      ) : (
        <button
          type="button"
          className="confirm"
          onClick={() => {
            runExampleConfirm();
            setSignInRequired(true);
          }}
        >
          Confirm
        </button>
      )}
    </div>
  );
}
