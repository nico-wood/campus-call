"use client";

import { useEffect, useState } from "react";
import { LogoBurst } from "./logo-burst";
import { Brand } from "./brand";

export default function Loading() {
  const [color, setColor] = useState<string>();
  useEffect(() => { setColor(getComputedStyle(document.documentElement).getPropertyValue("--loader-color").trim()); }, []);
  return <div className="route-loader" role="status" aria-live="polite" aria-label="Loading Campus Call">
    <div className="route-loader-burst"><LogoBurst color={color} tentacleCount={150} radius={0.46} duration={1.6} particleRatio={0.35} coreSize={100} theme="dark" replayOnClick={false} label="Campus Call loading"><Brand /></LogoBurst></div>
    <p className="route-loader-name">Campus Call</p>
    <p>Loading your forecasts<span aria-hidden="true">…</span></p>
  </div>;
}
