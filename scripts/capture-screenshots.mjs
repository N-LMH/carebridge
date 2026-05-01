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
  await selectIfVisible(page, "Breathing difficulty", "mild");
  await selectIfVisible(page, "Cough type", "dry");
  await selectIfVisible(page, "Night symptoms", "yes");
  await fillIfVisible(page, "Max temperature", "38.7");
  await selectIfVisible(page, "Chills or sweats", "none");
  await selectIfVisible(page, "Chest pain present?", "no");
  await selectIfVisible(page, "Pain radiation", "none");
  await selectIfVisible(page, "Activity relation", "exertion");
  await selectIfVisible(page, "Symptoms worsening?", "yes");
}

async function fillIfVisible(page, label, value) {
  const locator = page.getByLabel(label);
  try {
    await locator.waitFor({ timeout: 1000 });
    await locator.fill(value);
  } catch {
    // Some follow-up questions are conditional and may not be present.
  }
}

async function selectIfVisible(page, label, value) {
  const locator = page.getByLabel(label);
  try {
    await locator.waitFor({ timeout: 1000 });
    await locator.selectOption(value);
  } catch {
    // Some follow-up questions are conditional and may not be present.
  }
}

async function fillIntake(page) {
  await page.getByLabel("患者姓名").fill("Demo Patient");
  await page.getByLabel("年龄").fill("31");
  await page.getByLabel("所在地区").fill("County clinic area");
  await page.getByLabel(/主要症状/).fill("fever, cough");
  await page.getByLabel("症状详细描述").fill("Fever for three days and cough is worse today");
  await page.getByLabel("症状持续天数").fill("3");
  await page.getByLabel("自评严重程度").selectOption("moderate");
}

async function captureElement(locator, outputPath) {
  await locator.screenshot({ path: outputPath });
}

async function captureElementTop(locator, outputPath, height) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`Unable to capture ${outputPath}; element has no bounding box.`);
  }

  await locator.page().screenshot({
    path: outputPath,
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: Math.min(box.height, height)
    }
  });
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
    await page.addStyleTag({ content: ".nav { position: static !important; }" });
    await fillIntake(page);
    await page.screenshot({
      path: path.join(screenshotDir, "home.png"),
      fullPage: true
    });
    await page.screenshot({
      path: path.join(cropDir, "hero-crop.png"),
      clip: { x: 0, y: 0, width: 1440, height: 420 }
    });
    await captureElementTop(page.locator(".layout-sidebar .sidebar-card").first(), path.join(cropDir, "caseboard-crop.png"), 130);
    await captureElement(page.locator(".layout-primary > .card").first(), path.join(cropDir, "form-crop.png"));

    await page.getByRole("button", { name: "开始评估" }).click();
    await page.getByRole("button", { name: "生成评估" }).waitFor();
    await fillClarifyingQuestions(page);
    await page.getByRole("button", { name: "生成评估" }).click();
    await page.locator(".risk-action").waitFor();
    await page.screenshot({
      path: path.join(screenshotDir, "triage-result.png"),
      fullPage: true
    });
    await captureElement(page.locator(".risk-tab"), path.join(cropDir, "result-panel-crop.png"));
    await page.getByRole("tab", { name: /就诊摘要/ }).click();
    await page.getByRole("heading", { name: "可打印的医生交接摘要" }).waitFor();
    await captureElement(page.locator(".summary-tab"), path.join(cropDir, "summary-crop.png"));

    await page.getByRole("tab", { name: /随访记录/ }).click();
    await page.getByLabel("当前体温 (°C)").fill("38.1");
    await page.getByLabel("症状变化").fill("Less cough tonight");
    await page.getByLabel("已服药物").fill("paracetamol");
    await page.getByLabel("随访备注").fill("Able to rest");
    await page.getByRole("button", { name: "保存随访" }).click();
    await page.getByText("随访已保存").waitFor();
    await page.screenshot({
      path: path.join(screenshotDir, "follow-up.png"),
      fullPage: true
    });
    await captureElement(page.locator(".followup-tab"), path.join(cropDir, "followup-crop.png"));
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
