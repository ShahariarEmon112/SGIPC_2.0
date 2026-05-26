"use client";

import { useEffect, useRef } from "react";

// Lightweight code-rain canvas. Tuned subtle so it sits behind text without distracting.
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cols = 0;
    let drops: number[] = [];
    const fontSize = 14;
    const chars =
      "01{}();<>+-*/=!?#abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      cols = Math.floor(canvas.offsetWidth / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * 100);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(10, 14, 26, 0.08)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${fontSize}px ui-monospace, monospace`;

      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const isHead = Math.random() > 0.985;
        ctx.fillStyle = isHead ? "rgba(255,255,255,0.85)" : "rgba(0, 212, 255, 0.5)";
        ctx.fillText(ch, x, y);

        if (y > canvas.offsetHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-50"
    />
  );
}
