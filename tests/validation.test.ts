import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { hexColors, optionalIsoDate, phraseList, time, website } from "../src/server/validation";

test("optional fields may be omitted entirely", () => {
  const schema = z.object({ date: optionalIsoDate, at: time });
  assert.deepEqual(schema.parse({}), { date: null, at: null });
  assert.deepEqual(schema.parse({ date: "", at: "" }), { date: null, at: null });
  assert.deepEqual(schema.parse({ date: "2026-10-18", at: "09:30" }), { date: "2026-10-18", at: "09:30" });
  assert.equal(schema.safeParse({ date: "2026-02-30" }).success, false);
  assert.equal(schema.safeParse({ at: "25:00" }).success, false);
});

test("phrase lists split lines and drop duplicates", () => {
  assert.deepEqual(phraseList(5, 50).parse("Bis gleich\n\nBis gleich\n Hallo "), ["Bis gleich", "Hallo"]);
});

test("brand colours must be hex values", () => {
  assert.deepEqual(hexColors.parse("#fff, #2F5D50"), ["#fff", "#2F5D50"]);
  assert.equal(hexColors.safeParse("rot").success, false);
});

test("websites are normalised to https", () => {
  assert.equal(website.parse("beispiel.de"), "https://beispiel.de");
  assert.equal(website.parse(""), "");
  assert.equal(website.safeParse("javascript:alert(1)").success, false);
});
