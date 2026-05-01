import { expect, test } from "@playwright/test";

test("user can complete a triage flow and save a follow-up", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN" }).click();

  await page.getByLabel(/^Patient Name$/).fill("Demo Patient");
  await page.getByRole("spinbutton", { name: /^Age$/ }).fill("31");
  await page.getByLabel(/^Region$/).fill("County clinic area");
  await page.getByLabel(/Primary Symptoms/).fill("fever, cough");
  await page
    .getByLabel(/^Symptom Details$/)
    .fill("Fever for three days and cough is worse today");
  await page.getByRole("spinbutton", { name: /^Days With Symptoms$/ }).fill("3");
  await page.getByRole("combobox", { name: /^Self-Rated Severity$/ }).selectOption("moderate");

  await page.getByRole("button", { name: "Start Assessment" }).click();
  await page.getByLabel("Breathing difficulty").selectOption("mild");
  await page.getByLabel("Cough type").selectOption("dry");
  await page.getByLabel("Night symptoms").selectOption("yes");
  await page.getByLabel("Max temperature").fill("38.7");
  await page.getByLabel("Chills or sweats").selectOption("none");
  await page.getByLabel("Symptoms worsening?").selectOption("yes");
  await page.getByRole("button", { name: "Generate Assessment" }).click();

  await expect(page.locator(".risk-action", { hasText: "Visit offline care within 24 hours" })).toBeVisible();
  await page.getByRole("tab", { name: /Visit Summary/ }).click();
  await expect(page.getByRole("heading", { name: "Printable doctor handoff summary" })).toBeVisible();

  await page.getByRole("tab", { name: /Follow-up/ }).click();
  await page.getByLabel("Current Temperature (°C)").fill("38.1");
  await page.getByLabel("Symptom Change").fill("Less cough tonight");
  await page.getByLabel("Medication Taken").fill("paracetamol");
  await page.getByLabel("Follow-up Note").fill("Able to rest");
  await page.getByRole("button", { name: "Save Follow-up" }).click();

  await expect(page.getByText("Follow-up saved")).toBeVisible();
  await expect(page.getByText("Able to rest")).toBeVisible();
});
