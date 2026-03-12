"use client";

import { useState, useEffect } from "react";

function getTimeLeft(endDate: Date) {
  const now = new Date().getTime();
  const diff = endDate.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownBanner() {
  // Sale ends 3 days from now (always fresh for demo)
  const [endDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 0);
    return d;
  });
  const [time, setTime] = useState(getTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite] bg-[length:200%_100%]" />
      <div className="relative flex items-center justify-center gap-3 py-2.5 px-4 text-sm font-semibold tracking-wide">
        <span className="hidden sm:inline">🌸</span>
        <span>DevEx SPRING SALE — 30% OFF EVERYTHING</span>
        <span className="mx-2 text-white/40">|</span>
        <span className="font-mono tabular-nums">
          {pad(time.days)}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
        </span>
        <span className="text-white/70 text-xs font-medium ml-1">remaining</span>
      </div>
    </div>
  );
}
