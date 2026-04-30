import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseUrl = "http://127.0.0.1:4173";
const screenshotDir = path.join(root, "doc", "screenshots");
const cropDir = path.join(screenshotDir, "crops");
const dataFile = path.join(root, "data", "carebridge-db.json");

async function isHealthy() {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await isHealthy()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("CareBridge server did not become ready in time.");
}

async function ensureServer() {
  if (await isHealthy()) return null;

  const server = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: { ...process.env, PORT: "4173" },
    stdio: "ignore",
    windowsHide: true
  });

  await waitForServer();
  return server;
}

async function fillClarifyingQuestions(page) {
  await page.getByLabel("Breathing difficulty").selectOption("mild");
  await page.getByLabel("Max temperature").fill("38.7");
  await page.getByLabel("Symptoms worsening?").selectOption("yes");
}

async function captureElement(locator, outputPath) {
  await locator.screenshot({ path: outputPath });
}

async function main() {
  await fs.mkdir(cropDir, { recursive: true });
  await fs.rm(dataFile, { force: true });

  const server = await ensureServer();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Load case" }).first().click();
    await page.screenshot({
      path: path.join(screenshotDir, "home.png"),
      fullPage: true
    });
    await page.screenshot({
      path: path.join(cropDir, "hero-crop.png"),
      clip: { x: 0, y: 0, width: 1440, height: 420 }
    });
    await captureElement(page.locator(".workspace-rail"), path.join(cropDir, "caseboard-crop.png"));
    await captureElement(page.locator(".intake-panel"), path.join(cropDir, "form-crop.png"));

    await page.getByRole("button", { name: "Continue assessment" }).click();
    await fillClarifyingQuestions(page);
    await page.getByRole("button", { name: "Generate guidance" }).click();
    await page.getByRole("heading", { name: "Printable handoff for the doctor" }).waitFor();
    await page.screenshot({
      path: path.join(screenshotDir, "triage-result.png"),
      fullPage: true
    });
    await captureElement(page.locator(".result-card"), path.join(cropDir, "result-panel-crop.png"));
    await captureElement(page.locator(".summary-card"), path.join(cropDir, "summary-crop.png"));

    await page.getByLabel("Current temperature").fill("38.1");
    await page.getByLabel("Symptom change").fill("Less cough tonight");
    await page.getByLabel("Medication taken").fill("paracetamol");
    await page.getByLabel("Follow-up note").fill("Able to rest");
    await page.getByRole("button", { name: "Save follow-up" }).click();
    await page.getByText("Follow-up saved").waitFor();
    await page.screenshot({
      path: path.join(screenshotDir, "follow-up.png"),
      fullPage: true
    });
    await captureElement(page.locator(".timeline-card").last(), path.join(cropDir, "followup-crop.png"));
  } finally {
    await browser.close();
    if (server) server.kill();
  }

  console.log(`Screenshots written to ${screenshotDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
