import assert from "node:assert/strict";
import { nextOccurrenceDates } from "./repeat.js";

const monWedFri = [0, 2, 4];

const cases = [
  {
    name: "daily, due only",
    input: { dueDate: "2026-08-26", repeatType: "daily" as const },
    expected: { dueDate: "2026-08-27" },
  },
  {
    name: "daily, start and due",
    input: {
      startDate: "2026-08-01",
      dueDate: "2026-08-26",
      repeatType: "daily" as const,
    },
    expected: { startDate: "2026-08-02", dueDate: "2026-08-27" },
  },
  {
    name: "weekly Mon anchor",
    input: {
      dueDate: "2026-08-24",
      repeatType: "weekly" as const,
      repeatWeekdays: monWedFri,
    },
    expected: { dueDate: "2026-08-26" },
  },
  {
    name: "weekly Fri anchor",
    input: {
      dueDate: "2026-08-28",
      repeatType: "weekly" as const,
      repeatWeekdays: monWedFri,
    },
    expected: { dueDate: "2026-08-31" },
  },
  {
    name: "monthly Jan 31",
    input: { dueDate: "2026-01-31", repeatType: "monthly" as const },
    expected: { dueDate: "2026-02-28" },
  },
  {
    name: "yearly Feb 29",
    input: { dueDate: "2024-02-29", repeatType: "yearly" as const },
    expected: { dueDate: "2025-02-28" },
  },
];

for (const testCase of cases) {
  const result = nextOccurrenceDates(testCase.input);
  assert.deepEqual(result, testCase.expected, testCase.name);
}

console.log(`All ${cases.length} nextOccurrenceDates cases passed.`);
