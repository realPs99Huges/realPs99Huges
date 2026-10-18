import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, addMonths, isIsoDate, isoWeekNumber, monthGrid, startOfWeek, todayIso, weekdayIndex } from "../src/lib/dates";

test("isIsoDate rejects impossible dates", () => {
  assert.equal(isIsoDate("2026-02-29"), false);
  assert.equal(isIsoDate("2028-02-29"), true);
  assert.equal(isIsoDate("2026-13-01"), false);
  assert.equal(isIsoDate("18.10.2026"), false);
});

test("week starts on Monday", () => {
  assert.equal(weekdayIndex("2026-10-18"), 6); // Sunday
  assert.equal(startOfWeek("2026-10-18"), "2026-10-12");
  assert.equal(startOfWeek("2026-10-12"), "2026-10-12");
});

test("date arithmetic crosses month and DST boundaries", () => {
  assert.equal(addDays("2026-10-24", 2), "2026-10-26");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addMonths("2026-01-31", 1), "2026-02-01");
});

test("month grid covers full weeks", () => {
  const grid = monthGrid("2026-10-18");
  assert.equal(grid.length % 7, 0);
  assert.equal(grid[0], "2026-09-28");
  assert.ok(grid.includes("2026-10-31"));
});

test("ISO week numbers", () => {
  assert.equal(isoWeekNumber("2026-10-18"), 42);
  assert.equal(isoWeekNumber("2027-01-01"), 53);
});

test("todayIso respects the time zone", () => {
  const lateUtc = new Date("2026-10-18T23:30:00Z");
  assert.equal(todayIso("Europe/Berlin", lateUtc), "2026-10-19");
  assert.equal(todayIso("UTC", lateUtc), "2026-10-18");
});
