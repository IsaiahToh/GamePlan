"use client";

import type React from "react";
import { useEffect, useRef } from "react";

const Logout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = canvas.getContext("2d");
    if (!x) return;

    let t = 0;
    let animationFrameId: number;

    const r = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      d();
    };

    const d = () => {
      if (!canvas || !x) return;
      const s = Math.min(canvas.width, canvas.height) / 15;
      const g = Math.ceil(canvas.width / s) * 2;
      const h = Math.ceil(canvas.height / (s * 0.5)) * 2;
      const w = canvas.width / 2;
      const v = canvas.height / 2;

      for (let y = -h; y < h; y++) {
        for (let i = -g; i < g; i++) {
          const p = w + ((i - y) * s) / 2;
          const q = v + ((i + y) * s) / 4;
          const m = Math.sqrt(i * i + y * y);
          const n = Math.sqrt(g * g + h * h);
          const e = 1 - m / n;
          const f = s * e * Math.abs(Math.sin(m * 0.5 + t));

          x.beginPath();
          x.moveTo(p, q - f);
          x.lineTo(p + s / 2, q - s / 2 - f);
          x.lineTo(p + s, q - f);
          x.lineTo(p + s, q);
          x.lineTo(p + s / 2, q + s / 2);
          x.lineTo(p, q);
          x.closePath();

          const l = x.createLinearGradient(p, q - f, p + s, q);
          l.addColorStop(0, "rgba(31, 41, 55, 1)");
          l.addColorStop(1, "rgba(255,0,255,.8)");
          x.fillStyle = l;
          x.fill();
          x.strokeStyle = "rgba(255,255,0,.5)";
          x.stroke();

          x.beginPath();
          x.moveTo(p, q);
          x.lineTo(p, q - f);
          x.moveTo(p + s, q);
          x.lineTo(p + s, q - f);
          x.moveTo(p + s / 2, q + s / 2);
          x.lineTo(p + s / 2, q - s / 2 - f);
          x.strokeStyle = "rgba(255,255,255,0)";
          x.stroke();
        }
      }
    };

    const a = () => {
      if (!canvas || !x) return;
      x.fillStyle = "rgba(0,0,0,.1)";
      x.fillRect(0, 0, canvas.width, canvas.height);
      d();
      t += 0.05;
      animationFrameId = requestAnimationFrame(a);
    };

    window.addEventListener("resize", r);
    r();
    a();

    return () => {
      window.removeEventListener("resize", r);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ display: "block" }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1
          className="text-white text-2xl md:text-4xl font-bold text-center drop-shadow-lg"
          style={{
            animation: "bob 4.5s infinite cubic-bezier(.1, .1, .1, .1)",
          }}
        >
          Uh oh.... seems like you're logged out
        </h1>
      </div>
    </div>
  );
};

export default Logout;
