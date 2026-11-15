"use client";

/**
 * Pattern: 21st.dev-style confetti burst, hand-built in plain canvas/JS (no
 * library). Fires once on mount from JoinForm's granted-credits success
 * state. Renders nothing at all under prefers-reduced-motion: reduce, per
 * the brief — not a reduced version, no burst.
 */
import { useEffect, useRef } from "react";

const COLORS = ["#C9A75A", "#1F6B4A", "#2E8F63", "#ECEFE9"];
const PIECE_COUNT = 70;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
};

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pieces: Piece[] = Array.from({ length: PIECE_COUNT }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 120,
      y: height * 0.3,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -9 - 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      size: 5 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));

    let frame = 0;
    let raf = 0;
    const gravity = 0.32;

    function draw() {
      if (!ctx || !canvas) return;
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      for (const piece of pieces) {
        piece.vy += gravity;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
        ctx.restore();
      }
      if (frame < 130) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
