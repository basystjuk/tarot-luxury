/**
 * Sanity checks — not a real test runner; run with:
 *   npx tsx lib/numerology/__sanity__.ts
 *
 * Verifies the new calculators against worked examples from Hans Decoz's
 * "Numerology: Key to Your Inner Self". Throws on mismatch.
 */

import {
  calcPinnacles,
  calcChallenges,
  calcCornerstone,
  calcCapstone,
  calcFirstVowel,
  calcPlaneOfExpression,
  calcMasterPhase,
  calcPersonalYear,
  calcPersonalMonth,
  calcPersonalDays,
} from "./calculators";

function eq(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL ${label}\n  expected: ${e}\n  actual:   ${a}`);
    process.exitCode = 1;
  } else {
    console.log(`OK   ${label}`);
  }
}

// ─── Pinnacles ──────────────────────────────────────────────────────────────
// Example: born 12 May 1985 (Life Path = 5+1+2+3=11→never reduces; for window
// math 11 → 2). Pinnacles:
//   P1 = reduce(5+3) = 8         (3 = 12 reduced)
//   P2 = reduce(3+5) = 8         (5 = 1+9+8+5=23→5)
//   P3 = reduce(8+8) = 16→7
//   P4 = reduce(5+5) = 10→1
// Window: end1 = 36 - 2 = 34
{
  const pins = calcPinnacles(12, 5, 1985, 11);
  eq("Pinnacle 1985-05-12", pins.map(p => p.number), [8, 8, 7, 1]);
  eq("Pinnacle window 1985-05-12", pins.map(p => [p.startAge, p.endAge]),
    [[0, 34], [35, 43], [44, 52], [53, null]]);
}

// ─── Challenges ─────────────────────────────────────────────────────────────
// Same DOB.
//   C1 = |5 - 3| = 2
//   C2 = |3 - 5| = 2
//   C3 = |2 - 2| = 0
//   C4 = |5 - 5| = 0
{
  const ch = calcChallenges(12, 5, 1985, 11);
  eq("Challenge 1985-05-12", ch.map(c => c.number), [2, 2, 0, 0]);
}

// ─── Cornerstone / Capstone / First Vowel ───────────────────────────────────
{
  // "Anna" → A (cornerstone), A (capstone), A (first vowel)
  eq("Cornerstone Anna", calcCornerstone("Anna Maria").letter, "a");
  eq("Capstone Anna",    calcCapstone("Anna Maria").letter,    "a");
  eq("FirstVowel Anna",  calcFirstVowel("Anna Maria").letter,  "a");
  // Cyrillic: "Олена" → О (cornerstone), а (capstone), О (first vowel)
  eq("Cornerstone Олена",  calcCornerstone("Олена").letter, "о");
  eq("Capstone Олена",     calcCapstone("Олена").letter,    "а");
  eq("FirstVowel Олена",   calcFirstVowel("Олена").letter,  "о");
  // Values
  eq("Cornerstone Олена value", calcCornerstone("Олена").value, 1); // о = 1
}

// ─── Plane of Expression ────────────────────────────────────────────────────
{
  // "ANNA" → A=mental, N=mental, N=mental, A=mental → all 4 mental
  const p = calcPlaneOfExpression("Anna");
  eq("PlaneOfExpression Anna mental", p.mental, 4);
  eq("PlaneOfExpression Anna dominant", p.dominant, "mental");
  eq("PlaneOfExpression Anna total", p.total, 4);
  // "AEIOU" → mixed
  const m = calcPlaneOfExpression("AEIOU");
  eq("PlaneOfExpression AEIOU total", m.total, 5);
  // a=mental, e=physical, i=emotional, o=emotional, u=intuitive
  eq("PlaneOfExpression AEIOU emotional", m.emotional, 2);
}

// ─── Master Number Phase ────────────────────────────────────────────────────
{
  eq("Master 11 at age 25", calcMasterPhase(11, 25),
    { isMaster: true, masterNumber: 11, baseNumber: 2, activationAge: 30, currentlyActive: false });
  eq("Master 11 at age 35", calcMasterPhase(11, 35),
    { isMaster: true, masterNumber: 11, baseNumber: 2, activationAge: 30, currentlyActive: true });
  eq("Master 22 at age 30", calcMasterPhase(22, 30),
    { isMaster: true, masterNumber: 22, baseNumber: 4, activationAge: 36, currentlyActive: false });
  eq("Non-master 7", calcMasterPhase(7, 50), { isMaster: false });
}

// ─── Personal Year / Month / Days ───────────────────────────────────────────
// Born 12 May 1985, calendar year 2024:
//   reduce(12)=3, reduce(5)=5, reduce(2024)=2+0+2+4=8 → personalYear = 3+5+8=16→7
{
  const py = calcPersonalYear(12, 5, 2024);
  eq("PersonalYear 1985-05-12 in 2024", py, 7);
  // PersonalMonth for May 2024 = py(7) + reduce(5)=5 → 12 → 3
  const pm = calcPersonalMonth(py, 5);
  eq("PersonalMonth May 2024", pm, 3);
  // PersonalDay = pm(3) + reduce(day); day 1 → 3+1=4
  const days = calcPersonalDays(12, 5, 2024, 5);
  eq("PersonalDays length May 2024", days.length, 31);
  eq("PersonalDay May 1 2024", days[0].number, 4);
  // Day 12 → 3 + (1+2)=3 → 6
  eq("PersonalDay May 12 2024", days[11].number, 6);
  // Day 9 → 3 + 9 = 12 → 3
  eq("PersonalDay May 9 2024", days[8].number, 3);
  // February in a leap year = 29 days
  eq("PersonalDays length Feb 2024 (leap)", calcPersonalDays(12, 5, 2024, 2).length, 29);
  eq("PersonalDays length Feb 2023 (non-leap)", calcPersonalDays(12, 5, 2023, 2).length, 28);
}

console.log("\nsanity checks done");
