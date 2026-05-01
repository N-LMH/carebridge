import { describe, expect, it } from "vitest";
import {
  assessTriage,
  buildFollowUpQuestions,
  buildVisitSummary
} from "../src/triage-engine.js";

describe("buildFollowUpQuestions", () => {
  it("asks category-relevant follow-up questions after a respiratory complaint", () => {
    const questions = buildFollowUpQuestions({
      age: 67,
      symptoms: ["cough", "fever", "chest tightness"],
      symptomNotes: "Fever for three days and now chest feels tight",
      symptomDays: 3,
      severity: "moderate",
      breathingDifficulty: null,
      symptomsWorsening: null,
      maxTemperatureC: null,
      chronicConditions: []
    });

    const ids = questions.map((q) => q.id);
    expect(ids).toContain("breathingDifficulty");
    expect(ids).toContain("maxTemperatureC");
    expect(ids).toContain("symptomsWorsening");
    expect(ids).toContain("coughType");
    expect(ids).toContain("chestPain");
  });

  it("does not ask follow-up questions when enough data already exists", () => {
    const questions = buildFollowUpQuestions({
      age: 29,
      symptoms: ["fever", "cough"],
      symptomNotes: "Low fever and cough since yesterday",
      symptomDays: 1,
      severity: "mild",
      breathingDifficulty: "none",
      symptomsWorsening: false,
      maxTemperatureC: 37.9,
      chronicConditions: [],
      chestPain: false,
      coughType: "dry",
      nightSymptoms: "no",
      chillsOrSweats: "none",
      painRadiation: "none",
      activityRelation: "rest"
    });

    expect(questions).toEqual([]);
  });

  it("asks gastrointestinal questions for GI symptoms", () => {
    const questions = buildFollowUpQuestions({
      age: 40,
      symptoms: ["diarrhea", "vomiting"],
      symptomNotes: "拉肚子两天",
      symptomDays: 2,
      severity: "moderate",
      breathingDifficulty: null,
      symptomsWorsening: null,
      maxTemperatureC: null,
      chronicConditions: []
    });

    const ids = questions.map((q) => q.id);
    expect(ids).toContain("stoolFrequency");
    expect(ids).toContain("foodIntake");
    expect(ids).toContain("dehydrationSigns");
    expect(ids).not.toContain("breathingDifficulty");
  });
});

describe("assessTriage", () => {
  it("returns emergency guidance for red-flag breathing difficulty", () => {
    const result = assessTriage({
      patientName: "Lin",
      age: 58,
      gender: "female",
      region: "county",
      symptoms: ["cough", "chest tightness"],
      symptomNotes: "Breathing is getting harder and chest feels tight",
      symptomDays: 1,
      severity: "severe",
      breathingDifficulty: "severe",
      symptomsWorsening: true,
      maxTemperatureC: 38.3,
      chronicConditions: ["asthma"],
      medications: "none",
      allergies: "none",
      chestPain: true
    });

    expect(result.riskLevel).toBe("Level 1");
    expect(result.actionLabel).toBe("立即急诊");
    expect(result.suggestedDepartment).toContain("急诊");
    expect(result.redFlags.length).toBeGreaterThan(0);
  });

  it("returns 24-hour care guidance for persistent fever with worsening symptoms", () => {
    const result = assessTriage({
      patientName: "Wei",
      age: 34,
      gender: "male",
      region: "township",
      symptoms: ["fever", "cough"],
      symptomNotes: "Fever for three days with more coughing today",
      symptomDays: 3,
      severity: "moderate",
      breathingDifficulty: "mild",
      symptomsWorsening: true,
      maxTemperatureC: 38.6,
      chronicConditions: [],
      medications: "paracetamol",
      allergies: "none",
      chestPain: false
    });

    expect(result.riskLevel).toBe("Level 2");
    expect(result.actionLabel).toBe("24小时内线下就医");
    expect(result.suggestedDepartment).toContain("呼吸");
  });

  it("returns home observation for mild short-duration symptoms", () => {
    const result = assessTriage({
      patientName: "Ming",
      age: 22,
      gender: "male",
      region: "city",
      symptoms: ["sore throat"],
      symptomNotes: "Mild sore throat since this morning",
      symptomDays: 1,
      severity: "mild",
      breathingDifficulty: "none",
      symptomsWorsening: false,
      maxTemperatureC: 37.2,
      chronicConditions: [],
      medications: "none",
      allergies: "none",
      chestPain: false
    });

    expect(result.riskLevel).toBe("Level 4");
    expect(result.actionLabel).toBe("居家观察并持续记录");
    expect(result.suggestedDepartment).toBe("暂不需要线下科室");
  });

  it("includes score breakdown in assessment", () => {
    const result = assessTriage({
      patientName: "Test",
      age: 70,
      symptoms: ["fever"],
      symptomNotes: "发热三天",
      symptomDays: 3,
      severity: "moderate",
      maxTemperatureC: 39.1,
      symptomsWorsening: true,
      chronicConditions: ["hypertension"]
    });

    expect(result.scoreBreakdown).toBeDefined();
    expect(result.scoreBreakdown.total).toBeGreaterThanOrEqual(0);
    expect(result.scoreBreakdown.details.length).toBeGreaterThan(0);
  });
});

describe("buildVisitSummary", () => {
  it("creates a doctor-friendly structured summary", () => {
    const assessment = assessTriage({
      patientName: "Auntie Chen",
      age: 63,
      gender: "female",
      region: "rural village",
      symptoms: ["fever", "cough", "chest tightness"],
      symptomNotes: "Three days of fever and coughing with mild chest tightness",
      symptomDays: 3,
      severity: "moderate",
      breathingDifficulty: "mild",
      symptomsWorsening: true,
      maxTemperatureC: 38.5,
      chronicConditions: ["hypertension"],
      medications: "ibuprofen",
      allergies: "penicillin",
      chestPain: false
    });

    const summary = buildVisitSummary(assessment);

    expect(summary.chiefComplaint).toContain("发热");
    expect(summary.summaryText).toContain("患者");
    expect(summary.summaryText).toContain("建议科室");
    expect(summary.doctorQuestions.length).toBeGreaterThanOrEqual(2);
  });
});
