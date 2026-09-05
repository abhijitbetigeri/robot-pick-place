import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { readFile } from "node:fs/promises";
const source = await readFile(
  new URL("./timeline.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { frameAt, WORLDS, DURATION, formatTime } = await import(
  "data:text/javascript;base64," + Buffer.from(outputText).toString("base64")
);

test("film opens and closes on all four worlds", () => {
  for (const time of [0, 4, 7.9, 34, 61, 88, 115, DURATION]) {
    assert.equal(frameAt(time).active, -1);
    assert.equal(frameAt(time).zoom, 0);
  }
  assert.equal(frameAt(115).closing, true);
});

test("every chapter expands smoothly, holds, and returns to its tile", () => {
  WORLDS.forEach((world, index) => {
    assert.equal(frameAt(world.start).zoom, 0);
    assert.equal(frameAt(world.start + 0.9).zoom.toFixed(5), "0.50000");
    assert.ok(frameAt(world.start + 1.8).zoom > 0.999999);
    assert.equal(frameAt((world.start + world.end) / 2).active, index);
    assert.equal(frameAt(world.end - 0.9).zoom.toFixed(5), "0.50000");
    assert.equal(frameAt(world.end).zoom, 0);
  });
});

test("scrubbing is stable and never leaves timeline bounds", () => {
  for (let frame = 0; frame <= DURATION * 30; frame++) {
    const state = frameAt(frame / 30);
    assert.ok(state.zoom >= 0 && state.zoom <= 1);
    assert.ok(state.active >= -1 && state.active <= 3);
    assert.deepEqual(state, frameAt(frame / 30));
  }
  assert.equal(frameAt(-20).time, 0);
  assert.equal(frameAt(Infinity).time, 0);
  assert.equal(frameAt(200).time, 120);
  assert.equal(formatTime(120), "02:00");
});
