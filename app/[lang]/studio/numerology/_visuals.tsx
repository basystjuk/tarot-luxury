"use client";

/**
 * Numerology visualisations (Phase Н2).
 *
 * Three lightweight SVG-based charts that turn the otherwise-textual
 * numerology output into something glanceable.
 *
 *   1. KarmicLessonsScale — 1-9 grid showing which letter-values are
 *      present in the name (dark gold) vs. missing (faint outline).
 *      Missing = karmic lessons to learn this lifetime.
 *
 *   2. PersonalYearGraph — 12-month line of Personal Month numbers for
 *      the current calendar year. Shows the "weather" of the year in
 *      one glance. Today's month is highlighted.
 *
 *   3. CoreNumbersWheel — 9-spoke wheel with the 4 core numbers
 *      (Life Path / Destiny / Soul / Personality) plotted as filled
 *      arcs. Shows the gestalt of the personality at a glance.
 *
 * All components are pure SVG — no chart library. Mobile-responsive
 * via viewBox; no JS animations to keep render snappy.
 */

import React from "react";

// ── 1. Karmic Lessons scale ─────────────────────────────────────────────────

interface KarmicLessonsScaleProps {
  /** The missing numerical values 1..9 (Karmic Lessons). Empty = no lessons. */
  missing: number[];
  /** Optional: cap upper bound to 8 for Chaldean (no 9). Defaults 9. */
  max?: number;
  labels?: {
    title: string;
    missing: string;
    present: string;
    all_present: string;
  };
}

export function KarmicLessonsScale({ missing, max = 9, labels }: KarmicLessonsScaleProps) {
  const missingSet = new Set(missing);
  const nums = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      {labels && (
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
          {labels.title}
        </p>
      )}
      <div className="grid grid-cols-9 gap-1.5">
        {nums.map(n => {
          const isMissing = missingSet.has(n);
          return (
            <div
              key={n}
              className={`aspect-square rounded-lg flex items-center justify-center text-base transition-colors ${
                isMissing
                  ? "bg-[rgba(212,168,83,0.18)] border-2 border-dashed border-[rgba(184,136,58,0.6)] text-[#9A6E28]"
                  : "bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)] text-[#9A8A78]/40 line-through"
              }`}
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              title={isMissing ? `${labels?.missing ?? "Missing"}: ${n}` : `${labels?.present ?? "Present"}: ${n}`}
            >
              {n}
            </div>
          );
        })}
      </div>
      {labels && (
        <div className="flex items-center gap-4 text-[11px] text-[#7A6A58] pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[rgba(212,168,83,0.18)] border-2 border-dashed border-[rgba(184,136,58,0.6)]" />
            {labels.missing}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)]" />
            {labels.present}
          </span>
        </div>
      )}
      {missing.length === 0 && labels && (
        <p className="text-xs text-[#3F6A35] italic pt-1">✓ {labels.all_present}</p>
      )}
    </div>
  );
}

// ── 2. Personal Year graph (12 months) ───────────────────────────────────────
// Each month's Personal Month number plotted as a vertical bar 1..9, with
// today's month highlighted in gold.

interface PersonalYearGraphProps {
  /** Personal Year number for the current calendar year. */
  personalYear: number;
  /** Personal Month values [Jan..Dec]. Length 12, values 1..9 or 11/22. */
  months: number[];
  /** 0-indexed current month for highlight. */
  currentMonthIdx: number;
  labels?: {
    title: string;
    months: [string, string, string, string, string, string, string, string, string, string, string, string];
    today: string;
  };
}

export function PersonalYearGraph({ personalYear, months, currentMonthIdx, labels }: PersonalYearGraphProps) {
  const W = 360;
  const H = 140;
  const PAD = 18;
  const stepX = (W - 2 * PAD) / 11; // 11 gaps between 12 points
  const maxScale = 11; // accommodate master numbers up to 11
  const yOf = (v: number) => H - PAD - (Math.min(v, maxScale) / maxScale) * (H - 2 * PAD);

  // Line path connecting all 12 month points.
  const path = months.map((v, i) => `${i === 0 ? "M" : "L"} ${PAD + i * stepX} ${yOf(v)}`).join(" ");

  return (
    <div className="space-y-2">
      {labels && (
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
          {labels.title} — <span className="text-[#B8883A]">{personalYear}</span>
        </p>
      )}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Personal Year graph">
          {/* Horizontal gridlines (every 3 values) */}
          {[3, 6, 9].map(v => (
            <line
              key={v}
              x1={PAD} x2={W - PAD} y1={yOf(v)} y2={yOf(v)}
              stroke="rgba(196,169,122,0.25)" strokeDasharray="2 4"
            />
          ))}
          {/* Line connecting points */}
          <path d={path} stroke="#B8883A" strokeWidth="1.5" fill="none" />
          {/* Filled area below line */}
          <path d={`${path} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="rgba(184,136,58,0.10)" stroke="none" />
          {/* Point markers */}
          {months.map((v, i) => {
            const cx = PAD + i * stepX;
            const cy = yOf(v);
            const isToday = i === currentMonthIdx;
            return (
              <g key={i}>
                <circle
                  cx={cx} cy={cy}
                  r={isToday ? 5 : 3}
                  fill={isToday ? "#B8883A" : "#FDFBF7"}
                  stroke={isToday ? "#FDFBF7" : "#B8883A"}
                  strokeWidth={isToday ? 2 : 1.5}
                />
                <text
                  x={cx} y={cy - 8}
                  textAnchor="middle"
                  className="fill-[#5C4530]"
                  fontSize="10"
                  fontFamily="var(--font-cormorant)"
                  fontWeight={isToday ? 600 : 400}
                >
                  {v}
                </text>
              </g>
            );
          })}
          {/* Month labels along x-axis */}
          {labels && months.map((_, i) => (
            <text
              key={i}
              x={PAD + i * stepX} y={H - 4}
              textAnchor="middle"
              fontSize="8"
              className={i === currentMonthIdx ? "fill-[#B8883A] font-medium" : "fill-[#9A8A78]"}
              fontFamily="var(--font-jost)"
            >
              {labels.months[i]}
            </text>
          ))}
        </svg>
        {labels && (
          <div className="text-[11px] text-[#7A6A58] italic flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8883A] inline-block" />
            {labels.today}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Core Numbers Wheel (9 segments) ──────────────────────────────────────
// 9 wedges, each labelled 1-9. Each of the 4 core numbers (Life Path /
// Destiny / Soul / Personality) draws a dot in its wedge with a colour
// hue. Master numbers (11/22/33) reduce to their root for placement and
// get a special star marker.

interface CoreNumbersWheelProps {
  lifePath: number;
  destiny: number;
  soul: number;
  personality: number;
  labels?: {
    title: string;
    lifePath: string;
    destiny: string;
    soul: string;
    personality: string;
  };
}

function reduceForWheel(n: number): number {
  if (n === 11) return 2;
  if (n === 22) return 4;
  if (n === 33) return 6;
  return n;
}

export function CoreNumbersWheel({ lifePath, destiny, soul, personality, labels }: CoreNumbersWheelProps) {
  const cx = 110, cy = 110, r = 90, inner = 30;
  const points = [
    { num: lifePath,    color: "#B8883A", label: labels?.lifePath ?? "LP" },
    { num: destiny,     color: "#7A6A58", label: labels?.destiny  ?? "D"  },
    { num: soul,        color: "#C84A3A", label: labels?.soul     ?? "S"  },
    { num: personality, color: "#4A6A35", label: labels?.personality ?? "P" },
  ];

  // Build 9 wedge paths
  function wedge(i: number): string {
    const a1 = (i / 9) * 2 * Math.PI - Math.PI / 2;
    const a2 = ((i + 1) / 9) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const ix1 = cx + inner * Math.cos(a1), iy1 = cy + inner * Math.sin(a1);
    const ix2 = cx + inner * Math.cos(a2), iy2 = cy + inner * Math.sin(a2);
    return `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 0 0 ${ix1} ${iy1} Z`;
  }
  function wedgeCenter(num: number): { x: number; y: number } {
    const i = reduceForWheel(num) - 1; // 0..8
    const a = ((i + 0.5) / 9) * 2 * Math.PI - Math.PI / 2;
    const rr = (r + inner) / 2;
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) };
  }

  return (
    <div className="space-y-2">
      {labels && (
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">{labels.title}</p>
      )}
      <div className="grid sm:grid-cols-[220px_1fr] gap-4 items-center">
        <svg viewBox="0 0 220 220" className="w-full h-auto max-w-[220px] mx-auto" role="img" aria-label="Core numbers wheel">
          {/* Wedges */}
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={wedge(i)}
              fill="rgba(196,169,122,0.08)"
              stroke="rgba(196,169,122,0.35)"
              strokeWidth="0.5"
            />
          ))}
          {/* Numbers on each wedge */}
          {Array.from({ length: 9 }, (_, i) => {
            const a = ((i + 0.5) / 9) * 2 * Math.PI - Math.PI / 2;
            const rr = (r + inner) / 2;
            return (
              <text
                key={i}
                x={cx + rr * Math.cos(a)}
                y={cy + rr * Math.sin(a)}
                textAnchor="middle" dominantBaseline="central"
                fontSize="11"
                className="fill-[#9A8A78]"
                fontFamily="var(--font-cormorant)"
              >
                {i + 1}
              </text>
            );
          })}
          {/* Point markers — 4 core numbers */}
          {points.map((p, idx) => {
            const c = wedgeCenter(p.num);
            // Small offset so points in the same wedge don't overlap.
            const offsetA = (idx - 1.5) * 0.18;
            const ox = c.x + Math.cos(offsetA + Math.PI / 4) * 8;
            const oy = c.y + Math.sin(offsetA + Math.PI / 4) * 8;
            const isMaster = [11, 22, 33].includes(p.num);
            return (
              <g key={idx}>
                <circle cx={ox} cy={oy} r={6} fill={p.color} stroke="#FDFBF7" strokeWidth={1.5} />
                {isMaster && (
                  <text x={ox} y={oy + 0.5} textAnchor="middle" dominantBaseline="central"
                        fontSize="7" fill="#FDFBF7" fontWeight="bold">★</text>
                )}
              </g>
            );
          })}
        </svg>
        {/* Legend */}
        <ul className="space-y-1 text-xs text-[#5C4530]">
          {points.map((p, idx) => {
            const isMaster = [11, 22, 33].includes(p.num);
            return (
              <li key={idx} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <span className="flex-1">{p.label}</span>
                <span className="font-medium" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {p.num}{isMaster && <span className="text-[#B8883A] ml-1">★</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
