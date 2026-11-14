"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  browserDeviceStore,
  readDeviceDemo,
  startDeviceDemo,
  type DeviceDemo,
} from "./participant-session";

const DEMO_COPY =
  "This stays on this device. It is not a verified account. It does not grant virtual credits. Entering an email is not verified ownership.";

export function QrEnrollment() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [demo, setDemo] = useState<DeviceDemo | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const store = browserDeviceStore();
    if (!store) return;
    const existing = readDeviceDemo(store);
    if (!existing) return;
    setDemo(existing);
    setNotice("Demo is on this device. It is not a verified account and does not grant virtual credits.");
  }, []);

  function onStartDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const store = browserDeviceStore();
    if (!store) {
      setNotice("This demo cannot stay on this device in this browser.");
      return;
    }
    const started = startDeviceDemo(store, { name, email });
    if (!started.ok) {
      setNotice(
        started.reason === "name"
          ? "Enter a name."
          : started.reason === "email"
            ? "Enter an email address. Entering an email is not verified ownership."
            : "This demo cannot stay on this device in this browser.",
      );
      return;
    }
    setDemo(started.demo);
    setNotice("Demo is on this device. It is not a verified account and does not grant virtual credits.");
  }

  return (
    <form id="qr-enrollment" className="enrollment" aria-labelledby="qr-demo-title" noValidate onSubmit={onStartDemo}>
      <h3 id="qr-demo-title" className="enrollment-title">
        Demo
      </h3>
      <p className="written-note">{DEMO_COPY}</p>
      {demo ? <p className="door-status">Demo on this device for {demo.name}</p> : null}
      {notice ? (
        <p className="enrollment-notice" role="status">
          {notice}
        </p>
      ) : null}
      <div className="enrollment-field">
        <label className="enrollment-label" htmlFor="qr-demo-name">
          Name
        </label>
        <input
          id="qr-demo-name"
          className="enrollment-input"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="enrollment-field">
        <label className="enrollment-label" htmlFor="qr-demo-email">
          Email
        </label>
        <input
          id="qr-demo-email"
          className="enrollment-input"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <button type="submit" className="confirm">
        Start demo
      </button>
    </form>
  );
}
