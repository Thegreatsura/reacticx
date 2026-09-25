"use client";

import * as React from "react";

import { CHAR, DURATION, EASE_NUMERIC } from "./motion";

/**
 * numeric-text's content transition, driven by a value rather than a timer.
 *
 * The mechanic is numeric-text's (MIT, shizukushq — see THIRD-PARTY.md): the
 * outgoing string leaves
 * along the same axis the incoming one arrives on — glyphs rise, shrink to
 * 0.6, rotate 2deg and blur, staggered across a fixed share of the duration —
 * while the wrapper animates its own width so whatever sits beside it slides
 * instead of snapping. numeric-text gets that last part by FLIP-translating
 * its prefix and suffix around the changed middle; a width tween on the same
 * curve is indistinguishable for a label that swaps wholesale.
 */

export function SwapText({
  value,
  className,
  spread = 1,
}: {
  value: string;
  className?: string;
  /** Multiplier on the stagger budget; >1 spreads the string out further. */
  spread?: number;
}) {
  const [outgoing, setOutgoing] = React.useState<string | null>(null);
  const previous = React.useRef(value);
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [width, setWidth] = React.useState<number | null>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (previous.current === value) return;
    setOutgoing(previous.current);
    previous.current = value;
  }, [value]);

  // The outgoing copy only needs to live as long as its exit animation.
  React.useEffect(() => {
    if (outgoing === null) return;
    const id = window.setTimeout(
      () => setOutgoing(null),
      DURATION * 1000 * (1 + CHAR.stagger * spread),
    );
    return () => window.clearTimeout(id);
  }, [outgoing, spread]);

  React.useLayoutEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const update = () => setWidth(node.getBoundingClientRect().width);
    update();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        verticalAlign: "top",
        whiteSpace: "nowrap",
        width: width ?? undefined,
        transition: reduced ? undefined : `width ${DURATION}s ${EASE_NUMERIC}`,
      }}
    >
      {/* Sizes the wrapper without taking part in layout. */}
      <span
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0"
        ref={measureRef}
      >
        {value}
      </span>

      {outgoing === null ? null : (
        <span aria-hidden className="absolute top-0 left-0">
          <Phrase key={`out-${outgoing}`} mode="out" spread={spread} text={outgoing} />
        </span>
      )}

      <span className="relative inline-block">
        <Phrase key={`in-${value}`} mode="in" spread={spread} text={value} />
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   phrase                                   */
/* -------------------------------------------------------------------------- */

/**
 * Every glyph is its own `inline-block` so it can be transformed, and a plain
 * space inside one collapses to zero width — "muscle memory" renders as
 * "musclememory". numeric-text solves it the same way, with its `SPACE` const.
 */
const NBSP = "\u00A0";

/** One copy of a string, either arriving or leaving. */
export function Phrase({
  text,
  mode,
  spread,
}: {
  text: string;
  mode: "in" | "out";
  spread: number;
}) {
  /**
   * Whether this copy has been handed its motion yet.
   *
   * The movement is a keyframe animation in `globals.css`, which carries its
   * own start frame, so there is no longer a start state that has to survive a
   * round of style first — the two-frame wait this used to need for exactly
   * that is gone. What is kept is the start *time*: the first phrase on the
   * hero still waits for hydration, so it arrives with the `Chars` beside it
   * rather than a second ahead of them, and an arriving and a leaving copy
   * that mount together are armed in the same commit.
   */
  const [armed, setArmed] = React.useState(false);

  React.useEffect(() => setArmed(true), []);

  const chars = [...text];
  const animating = text.replace(/\s/g, "").length;
  const step = (DURATION * CHAR.stagger * spread) / Math.max(animating, 1);

  // Total time from the first glyph starting to the last one settling.
  const span = Math.max(animating - 1, 0) * step + DURATION;

  /**
   * The blur is one filter on the phrase rather than one per glyph.
   *
   * With an outgoing phrase overlapping an incoming one, per-glyph blurs had a
   * four-word headline running two dozen of them at once while the wrapper's
   * width tween relaid out the line each frame. Lifting it to the wrapper
   * leaves two, and because the glyphs underneath still carry the stagger, the
   * string still reads as resolving letter by letter. The wrapper's blur runs
   * across the phrase's whole span; enter rises from below, exit continues
   * upward — one direction of travel.
   */
  return (
    <span
      aria-label={mode === "in" ? text : undefined}
      data-rx-phrase={armed ? mode : `${mode}-idle`}
      style={{ display: "inline-block", animationDuration: `${span}s` }}
    >
      {chars.map((char, charIndex) => (
        <span
          aria-hidden
          className="rx-glyph inline-block"
          key={`${char}-${charIndex}`}
          style={{ animationDelay: `${charIndex * step}s` }}
        >
          {char === " " ? NBSP : char}
        </span>
      ))}
    </span>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
