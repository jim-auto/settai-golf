import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseUrl = process.env.SETTAI_GOLF_URL ?? "http://127.0.0.1:5173/settai-golf/";
const outDir = new URL("../docs/screenshots/", import.meta.url);
const outPath = fileURLToPath(outDir);

async function clickFirstChoice(page) {
  await page.locator(".choice-button").first().click();
  await page.waitForTimeout(250);
}

async function playHole(page, shotLabel = "忖度ショット") {
  await clickFirstChoice(page);
  await clickFirstChoice(page);
  const shot = page.getByRole("button", { name: new RegExp(shotLabel) });
  if (await shot.count()) {
    await shot.first().click();
  } else {
    await clickFirstChoice(page);
  }
  await page.waitForTimeout(450);
  await page.getByRole("button", { name: "タイミングを止める" }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "空気を読む" }).click();
  await page.waitForTimeout(250);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${outPath}title.png`, fullPage: true });

await page.getByRole("button", { name: "接待を開始" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${outPath}conversation.png`, fullPage: true });

await clickFirstChoice(page);
await clickFirstChoice(page);
await page.getByRole("button", { name: /忖度ショット/ }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${outPath}shot-minigame.png`, fullPage: true });

await page.getByRole("button", { name: "タイミングを止める" }).click();
await page.waitForTimeout(250);
await page.getByRole("button", { name: "空気を読む" }).click();
await page.waitForTimeout(250);
await page.getByRole("button", { name: "次のホールへ" }).click();
await page.waitForTimeout(250);

await playHole(page, "盛り上げ優先");
await page.getByRole("button", { name: "次のホールへ" }).click();
await page.waitForTimeout(250);
await playHole(page, "安全プレイ");
await page.getByRole("button", { name: "次のホールへ" }).click();
await page.waitForTimeout(250);
await playHole(page, "ドラマ演出");
await page.getByRole("button", { name: "最終評価へ" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${outPath}result.png`, fullPage: true });

await browser.close();

console.log(`Screenshots written to ${outDir.pathname}`);
