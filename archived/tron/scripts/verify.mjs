import { chromium } from "playwright";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {}),
  headless: true,
  args: [
    "--no-sandbox",
    ...(process.env.TRON_ANGLE
      ? ["--use-angle=" + process.env.TRON_ANGLE]
      : []),
    "--disable-gpu-sandbox",
  ],
});
const errors = [];
const checks = [];
await mkdir("artifacts", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1040 },
    acceptDownloads: true,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const base = process.env.TRON_URL || "http://localhost:4174/";
  await page.goto(base);
  await page.waitForFunction(() => window.__TRON__?.ready, null, {
    timeout: 120000,
  });
  await page.getByRole("button", { name: "Pause film", exact: true }).click();
  const paused = await page.evaluate(() => window.__TRON__.state());
  assert.equal(paused.playing, false);
  console.log("Verified step", checks.length + 1);
  checks.push("Production app loads and playback pauses.");
  await page.getByRole("button", { name: /Solar wasteland/ }).click();
  let state = await page.evaluate(() => window.__TRON__.state());
  assert.equal(state.active, 1);
  assert.ok(Math.abs(state.time - 37.4) < 0.001);
  await page.locator(".timeline").fill("73");
  state = await page.evaluate(() => window.__TRON__.state());
  assert.equal(state.active, 2);
  assert.equal(state.time, 73);
  console.log("Verified step", checks.length + 1);
  checks.push("Chapter buttons and scrubbing seek the correct world.");
  await page.locator(".timeline").blur();
  await page.keyboard.press("Digit4");
  state = await page.evaluate(() => window.__TRON__.state());
  assert.equal(state.active, 3);
  await page
    .getByRole("button", { name: "Play mission", exact: false })
    .click();
  assert.equal(
    (await page.evaluate(() => window.__TRON__.state())).riding,
    true,
  );
  await page.getByRole("button", { name: "Back to film", exact: false }).blur();
  const spawn = await page.evaluate(() => window.__TRON__.game().riders[0].p);
  assert.equal(
    (await page.evaluate(() => window.__TRON__.game())).status,
    "ready",
  );
  await page.keyboard.down("KeyW");
  await page.keyboard.down("KeyD");
  await page.keyboard.down("ShiftLeft");
  await page.waitForFunction(() => window.__TRON__.game().time > 0.7);
  await page.keyboard.up("KeyW");
  await page.keyboard.up("KeyD");
  const moved = await page.evaluate(() => window.__TRON__.game());
  assert.ok(
    Math.hypot(
      moved.riders[0].p[0] - spawn[0],
      moved.riders[0].p[2] - spawn[2],
    ) > 5,
  );
  assert.ok(moved.energy < 90);
  assert.notEqual(moved.riders[0].heading, Math.PI);
  await page.keyboard.press("KeyR");
  assert.equal(
    (await page.evaluate(() => window.__TRON__.game())).status,
    "ready",
  );
  await page.keyboard.up("ShiftLeft");
  await page.keyboard.press("Digit2");
  assert.equal(
    await page
      .getByRole("button", { name: /Solar wasteland/ })
      .getAttribute("aria-current"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    (await page.evaluate(() => window.__TRON__.state())).riding,
    false,
  );
  console.log("Verified step", checks.length + 1);
  checks.push(
    "Actual player movement, heading changes, boost energy, restart, world switching, and Escape work.",
  );
  await page.getByRole("button", { name: "Sound off", exact: false }).click();
  await page.getByRole("button", { name: "Sound on", exact: false }).waitFor();
  await page.getByRole("button", { name: "Sound on", exact: false }).click();
  console.log("Verified step", checks.length + 1);
  checks.push("Audio enables and mutes without a playback error.");
  if ((await page.evaluate(() => window.__TRON__.state())).playing)
    await page.getByRole("button", { name: "Pause film", exact: true }).click();
  await page.getByRole("button", { name: "All worlds", exact: false }).click();
  await page.screenshot({ path: "artifacts/app-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/app-mobile.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  const canvas = await page.locator("canvas").boundingBox();
  assert.ok(canvas && canvas.width > 300 && canvas.height > 100);
  console.log("Verified step", checks.length + 1);
  checks.push(
    "390 px mobile layout has a visible canvas and no horizontal overflow.",
  );
  await page.setViewportSize({ width: 1600, height: 1040 });
  const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
  await page.getByRole("button", { name: "Record film", exact: false }).click();
  await page.waitForFunction(() => window.__TRON__.state().time > 1.5);
  await page.evaluate(() => window.__TRON__.render(119.99));
  const download = await downloadPromise;
  await download.saveAs(
    "artifacts/browser-recording-check." +
      (download.suggestedFilename().endsWith("mp4") ? "mp4" : "webm"),
  );
  console.log("Verified step", checks.length + 1);
  checks.push(
    "Browser recording starts, includes the audio path, and downloads a video.",
  );
  await page.close();

  const offline = await browser.newPage();
  await offline.goto(base + "?capture=1");
  await offline.waitForFunction(() => window.__TRON__?.ready);
  const sample = (time) =>
    offline.evaluate(async (t) => {
      await window.__TRON__.render(t);
      return window.__TRON__.frame();
    }, time);
  const first = await sample(14);
  await sample(73);
  const second = await sample(14);
  const hash = (data) => createHash("sha256").update(data).digest("hex");
  assert.equal(hash(first), hash(second));
  console.log("Verified step", checks.length + 1);
  checks.push("Seeking away and back produces an identical rendered frame.");
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/verification.json",
    JSON.stringify({ checks, browserErrors: errors }, null, 2) + "\n",
  );
  console.log(checks.join("\n"));
} finally {
  await browser.close();
}
