"use client";

import { useState } from "react";

type BoxColor = "neutral" | "red" | "yellow";

const nextColor: Record<BoxColor, BoxColor> = {
  neutral: "red",
  red: "yellow",
  yellow: "neutral",
};

const colorClasses: Record<BoxColor, string> = {
  neutral:
    "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
  red: "border-red-600 bg-red-500 text-white",
  yellow: "border-yellow-500 bg-yellow-400 text-zinc-900",
};

export default function Home() {
  const [colors, setColors] = useState<BoxColor[]>([
    "neutral",
    "neutral",
    "neutral",
  ]);

  const handleClick = (index: number) => {
    setColors((prev) =>
      prev.map((color, i) => (i === index ? nextColor[color] : color))
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="flex w-full max-w-5xl flex-row gap-6">
        {colors.map((color, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            aria-label={`Box ${index + 1}, currently ${color}`}
            className={`flex h-48 flex-1 items-center justify-center rounded-xl border text-lg font-semibold shadow-sm transition-colors ${colorClasses[color]}`}
          >
            Box {index + 1}
          </button>
        ))}
      </div>
    </main>
  );
}