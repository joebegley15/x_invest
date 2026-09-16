"use client";

import { useId } from "react";

type Vote = "neutral" | "red" | "green";
type DisplayState = "waiting" | "novote" | "in" | "out";

const C = {
  navy: "#0d1130",
  line: "#3d4380",
  ice: "#c9d3f0",
  mountain: "#2a2f5c",
  snow: "#e6ecfb",
  snowMuted: "#5a6390",
  in: "#3fd48a",
  out: "#e5484d",
};

const FONT = "var(--font-anton), Impact, sans-serif";

export function getDisplayState(vote: Vote): DisplayState {
  if (vote === "green") return "in";
  if (vote === "red") return "out";
  return "novote";
}

export default function SummitFlag({
  vote,
  judgeName,
  className = "",
}: {
  vote: Vote;
  judgeName: string;
  className?: string;
}) {
  const clipId = useId();
  const state = getDisplayState(vote);
  const active = state === "in" || state === "out";
  const color = state === "in" ? C.in : state === "out" ? C.out : C.ice;

  const label =
    state === "in" ? `${judgeName} voted in`
    : state === "out" ? `${judgeName} voted out`
    : state === "novote" ? `${judgeName} did not vote`
    : `${judgeName}: waiting`;

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className={`summit-flag block h-auto w-full ${className}`}
      data-state={state}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="2.5" y="2.5" width="115" height="115" rx="11" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="120" height="120" fill={C.navy} />

        {/* stars */}
        <circle cx="16" cy="14" r="1.3" fill={C.ice} />
        <circle cx="104" cy="50" r="1.1" fill={C.ice} />
        <circle cx="26" cy="42" r="1" fill={C.ice} />
        <circle cx="94" cy="12" r="1" fill={C.ice} />

        {/* aurora */}
        {active && (
          <path
            className="summit-aurora"
            d="M0 30 Q32 16 60 28 T120 20 L120 36 Q88 44 60 38 T0 48Z"
            fill={color}
            opacity={0.7}
          />
        )}

        {/* flag */}
        {state === "in" && (
          <g className="summit-flag-up">
            <line x1="60" y1="16" x2="60" y2="58" stroke="#fff" strokeWidth="3" />
            <path d="M60 16 L100 25 L60 35Z" fill={C.in} stroke="#fff" strokeWidth="1.5" />
          </g>
        )}
        {state === "out" && (
          <g className="summit-flag-down">
            <line x1="72" y1="76" x2="96" y2="90" stroke="#fff" strokeWidth="3" />
            <path d="M72 76 L76 94 L88 86Z" fill={C.out} stroke="#fff" strokeWidth="1.5" />
          </g>
        )}
        {!active && (
          <line x1="60" y1="24" x2="60" y2="58" stroke={C.line} strokeWidth="3" strokeDasharray="4 3" />
        )}

        {/* mountain */}
        <path d="M0 100 L60 58 L120 100Z" fill={C.mountain} />
        <path
          d="M60 58 L48 68 L55 66 L60 72 L66 66 L72 68Z"
          fill={active ? C.snow : C.snowMuted}
        />

        {/* snowfield label bar */}
        <rect x="0" y="94" width="120" height="26" fill={color} />
        {active ? (
          <text
            x="60" y="111.5" textAnchor="middle"
            fontFamily={FONT} fontSize="18" letterSpacing="1"
            fill={state === "in" ? C.navy : "#fff"}
          >
            {state === "in" ? "IN" : "OUT"}
          </text>
        ) : (
          <text
            x="60" y="109" textAnchor="middle"
            fontFamily={FONT} fontSize="11" letterSpacing="1"
            fill={C.navy}
          >
            {state === "novote" ? "NO VOTE" : "WAITING"}
          </text>
        )}
      </g>

      {/* frame drawn last so nothing covers it */}
      <rect
        x="2.5" y="2.5" width="115" height="115" rx="11"
        fill="none"
        stroke={active ? color : C.line}
        strokeWidth={active ? 5 : 1.5}
      />
    </svg>
  );
}
