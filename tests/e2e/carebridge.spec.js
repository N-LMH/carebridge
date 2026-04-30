import { expect, test } from "@playwright/test";

test("user can complete a triage flow and save a follow-up", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Patient name").fill("Demo Patient");
  await page.getByLabel("Age").fill("31");
  await page.getByLabel("Region").fill("County clinic area");
  await page.getByLabel("Main symptoms").fill("fever, cough");
  await page.getByLabel("Symptom notes").fill("Fever for three days and cough is worse today");
  await page.getByLabel("How many days").fill("3");
  await page.getByLabel("Severity").selectOption("moderate");

  await page.getByRole("button", { name: "Continue assessment" }).click();
  await page.getByLabel("Breathing difficulty").selectOption("mild");
  await page.getByLabel("Max temperature").fill("38.7");
  await page.getByLabel("Symptoms worsening?").selectOption("yes");
  await page.getByRole("button", { name: "Generate guidance" }).click();

  await expect(
    page.getByRole("heading", { name: "24小时内线下就医" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Printable handoff for the doctor" })
  ).toBeVisible();

  await page.getByLabel("Current temperature").fill("38.1");
  await page.getByLabel("Symptom change").fill("Less cough tonight");
  await page.getByLabel("Medication taken").fill("paracetamol");
  await page.getByLabel("Follow-up note").fill("Able to rest");
  await page.getByRole("button", { name: "Save follow-up" }).click();

  await expect(page.getByText("Follow-up saved")).toBeVisible();
  await expect(page.getByText("Able to rest")).toBeVisible();
});
