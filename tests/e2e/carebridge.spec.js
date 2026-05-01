import { expect, test } from "@playwright/test";

test("user can complete a triage flow and save a follow-up", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("患者姓名").fill("Demo Patient");
  await page.getByLabel("年龄").fill("31");
  await page.getByLabel("所在地区").fill("County clinic area");
  await page.getByLabel(/主要症状/).fill("fever, cough");
  await page
    .getByLabel("症状详细描述")
    .fill("Fever for three days and cough is worse today");
  await page.getByLabel("症状持续天数").fill("3");
  await page.getByLabel("自评严重程度").selectOption("moderate");

  await page.getByRole("button", { name: "开始评估" }).click();
  await page.getByLabel("Breathing difficulty").selectOption("mild");
  await page.getByLabel("Cough type").selectOption("dry");
  await page.getByLabel("Night symptoms").selectOption("yes");
  await page.getByLabel("Max temperature").fill("38.7");
  await page.getByLabel("Chills or sweats").selectOption("none");
  await page.getByLabel("Symptoms worsening?").selectOption("yes");
  await page.getByRole("button", { name: "生成评估" }).click();

  await expect(page.locator(".risk-action", { hasText: "24小时内线下就医" })).toBeVisible();
  await page.getByRole("tab", { name: /就诊摘要/ }).click();
  await expect(page.getByRole("heading", { name: "可打印的医生交接摘要" })).toBeVisible();

  await page.getByRole("tab", { name: /随访记录/ }).click();
  await page.getByLabel("当前体温 (°C)").fill("38.1");
  await page.getByLabel("症状变化").fill("Less cough tonight");
  await page.getByLabel("已服药物").fill("paracetamol");
  await page.getByLabel("随访备注").fill("Able to rest");
  await page.getByRole("button", { name: "保存随访" }).click();

  await expect(page.getByText("随访已保存")).toBeVisible();
  await expect(page.getByText("Able to rest")).toBeVisible();
});
