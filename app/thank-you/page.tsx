"use client";

import { useEffect } from "react";
import { Starfield } from "@/app/components/starfield";
import { IceStrip } from "@/app/components/ice-strip";

// Edit sponsors here. `dark` cards use a navy background and an ice caption for logos meant for dark backgrounds.
const SPONSORS = [
  { name: "DoiT", file: "/sponsors/doit.png", dark: true },
  { name: "Eberly", file: "/sponsors/Eberly_Logo_Color.eps.gif", dark: false },
  { name: "Northshore Media", file: "/sponsors/nmp-logo-black-1_orig.jpg", dark: false },
  { name: "Q-Branch", file: "/sponsors/q_branch_hq_logo.jpg", dark: false },
];

const IDLE_MS = 2500;

export default function ThankYouPage() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const wake = () => {
      document.body.classList.remove("idle");
      clearTimeout(timer);
      timer = setTimeout(() => document.body.classList.add("idle"), IDLE_MS);
    };
    const toggleFullscreen = () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      else void document.documentElement.requestFullscreen().catch(() => {});
    };

    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("mousedown", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("dblclick", toggleFullscreen);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove("idle");
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("mousedown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("dblclick", toggleFullscreen);
    };
  }, []);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-navy">
      <style>{`
        body.idle, body.idle * { cursor: none !important; }
        .ty-logos { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .ty-card { height: min(38vh, 23vw); }
        .ty-img { width: 100%; }
        @media (min-width: 1600px) and (orientation: landscape) {
          .ty-card { height: min(34vh, 21vw); }
          .ty-img { width: 88%; }
        }
        @media (orientation: portrait) {
          .ty-logos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .ty-card { height: min(20vh, 38vw); }
        }
      `}</style>
      <Starfield />

      <div
        className="relative z-10 grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] px-[4vw] pb-[3vh]"
        style={{ paddingTop: "7vh", rowGap: "4vh" }}
      >
        <header
          className="flex flex-col items-center text-center"
          style={{ gap: "clamp(10px, 1.8vh, 22px)", fontSize: "clamp(2.2rem, min(8.5vw, 10vh), 8rem)" }}
        >
          <p className="m-0 font-serif text-ice" style={{ lineHeight: 1, fontSize: "max(0.8rem, 0.17em)" }}>
            Presented by Haha Hidalgo and Fabric
          </p>
          <h1
            className="title-gradient m-0 font-display uppercase tracking-[0.02em] whitespace-nowrap"
            // Padding keeps the gradient (painted only inside the box) from cutting off the letters at this tight
            // line-height. The margins cancel it in the layout; their small imbalance centers the ink between the lines.
            style={{
              lineHeight: 0.78,
              paddingTop: "0.1em",
              marginTop: "-0.07em",
              paddingBottom: "0.1em",
              marginBottom: "-0.115em",
              fontSize: "1em",
            }}
          >
            Thank you
          </h1>
          <p
            className="m-0 font-display uppercase text-lavender"
            style={{ lineHeight: 1, letterSpacing: ".16em", fontSize: "max(1rem, 0.34em)" }}
          >
            To our sponsors
          </p>
        </header>

        <div
          className="ty-logos grid min-h-0 content-center items-center"
          style={{ gap: "clamp(12px, 2vw, 32px)" }}
        >
          {SPONSORS.map((s) => (
            <div
              key={s.name}
              className="ty-card flex min-h-0 flex-col items-center"
              style={{
                background: s.dark ? "#141936" : "#fff",
                borderRadius: "clamp(10px, 1.4vw, 20px)",
                boxShadow: "0 0 0 1px rgba(242,196,141,.3)",
                padding: "clamp(14px, 2.2vw, 32px)",
                gap: "clamp(8px, 1.2vh, 16px)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.file}
                alt={s.name}
                className="ty-img"
                style={{ flex: 1, minHeight: 0, maxWidth: "100%", objectFit: "contain" }}
              />
              <span
                className="font-display uppercase text-center"
                style={{
                  letterSpacing: ".1em",
                  lineHeight: 1,
                  color: s.dark ? "#c9d3f0" : "#4a5068",
                  fontSize: "clamp(0.7rem, min(1.3vw, 2.2vh), 1.2rem)",
                }}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>

        <footer className="flex flex-col items-center text-center" style={{ gap: "clamp(8px, 1.4vh, 16px)" }}>
          <div className="h-px w-[min(60vw,900px)] bg-line" />
          <p
            className="title-gradient m-0 font-display uppercase tracking-[0.02em]"
            style={{ lineHeight: 1, fontSize: "clamp(1.4rem, min(3.6vw, 5vh), 3.5rem)" }}
          >
            Tastemakers
          </p>
          <p
            className="m-0 font-display uppercase text-lavender"
            style={{ lineHeight: 1, letterSpacing: ".16em", fontSize: "clamp(0.8rem, min(1.6vw, 2.6vh), 1.6rem)" }}
          >
            Sept 24 at Eberly, Austin
          </p>
        </footer>
      </div>

      <IceStrip />
    </div>
  );
}
