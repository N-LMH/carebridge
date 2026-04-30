const RISK_MAP = {
  LEVEL_1: { riskLevel: "Level 1", actionLabel: "立即急诊" },
  LEVEL_2: { riskLevel: "Level 2", actionLabel: "24小时内线下就医" },
  LEVEL_3: { riskLevel: "Level 3", actionLabel: "可预约普通门诊" },
  LEVEL_4: { riskLevel: "Level 4", actionLabel: "居家观察并持续记录" }
};

const SYMPTOM_LABELS = {
  fever: "发热",
  cough: "咳嗽",
  "chest tightness": "胸闷",
  "sore throat": "咽痛",
  headache: "头痛",
  vomiting: "呕吐",
  diarrhea: "腹泻",
  abdominal: "腹痛"
};

function normalizeSymptoms(symptoms = [], symptomNotes = "") {
  const base = Array.isArray(symptoms)
    ? symptoms
    : String(symptoms)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const merged = new Set(
    base.map((item) => item.toLowerCase().trim()).filter(Boolean)
  );
  const notes = String(symptomNotes).toLowerCase();

  if (notes.includes("fever")) merged.add("fever");
  if (notes.includes("cough")) merged.add("cough");
  if (notes.includes("tight")) merged.add("chest tightness");
  if (notes.includes("throat")) merged.add("sore throat");
  if (notes.includes("pain")) merged.add("pain");

  return [...merged];
}

function hasRespiratoryConcern(symptoms, symptomNotes) {
  const notes = String(symptomNotes).toLowerCase();
  return (
    symptoms.includes("cough") ||
    symptoms.includes("chest tightness") ||
    notes.includes("breath") ||
    notes.includes("chest")
  );
}

function hasFeverConcern(symptoms, maxTemperatureC, symptomNotes) {
  const notes = String(symptomNotes).toLowerCase();
  return (
    symptoms.includes("fever") ||
    Number(maxTemperatureC) >= 37.8 ||
    notes.includes("fever") ||
    notes.includes("temperature")
  );
}

function humanSymptomList(symptoms) {
  return symptoms
    .map((symptom) => SYMPTOM_LABELS[symptom] || symptom)
    .join("、");
}

export function buildFollowUpQuestions(payload) {
  const symptoms = normalizeSymptoms(payload.symptoms, payload.symptomNotes);
  const questions = [];

  if (hasRespiratoryConcern(symptoms, payload.symptomNotes) && !payload.breathingDifficulty) {
    questions.push({
      id: "breathingDifficulty",
      label: "Breathing difficulty",
      type: "select",
      options: [
        { value: "none", label: "No breathing difficulty" },
        { value: "mild", label: "Mild shortness of breath" },
        { value: "moderate", label: "Moderate breathing difficulty" },
        { value: "severe", label: "Severe breathing difficulty" }
      ]
    });
  }

  if (hasFeverConcern(symptoms, payload.maxTemperatureC, payload.symptomNotes) && payload.maxTemperatureC == null) {
    questions.push({
      id: "maxTemperatureC",
      label: "Max temperature",
      type: "number",
      min: 35,
      max: 43,
      step: 0.1,
      placeholder: "e.g. 38.5"
    });
  }

  if (payload.symptomsWorsening == null) {
    questions.push({
      id: "symptomsWorsening",
      label: "Symptoms worsening?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
      ]
    });
  }

  if (symptoms.includes("chest pain") && payload.chestPain == null) {
    questions.push({
      id: "chestPain",
      label: "Chest pain present?",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
      ]
    });
  }

  return questions;
}

function buildRedFlags(payload, symptoms) {
  const redFlags = [];
  const notes = String(payload.symptomNotes).toLowerCase();

  if (payload.breathingDifficulty === "severe") {
    redFlags.push("Severe breathing difficulty");
  }

  if (payload.chestPain && String(payload.severity).toLowerCase() === "severe") {
    redFlags.push("Severe chest pain");
  }

  if (notes.includes("confusion") || notes.includes("faint")) {
    redFlags.push("Possible altered mental status");
  }

  if (Number(payload.maxTemperatureC) >= 39.5 && payload.symptomsWorsening) {
    redFlags.push("High fever with worsening condition");
  }

  if (symptoms.includes("chest tightness") && payload.breathingDifficulty === "moderate") {
    redFlags.push("Chest tightness with moderate breathing difficulty");
  }

  return redFlags;
}

function chooseDepartment(payload, symptoms, risk) {
  if (risk.riskLevel === "Level 1") {
    if (hasRespiratoryConcern(symptoms, payload.symptomNotes)) {
      return "急诊 / 呼吸科";
    }
    return "急诊";
  }

  if (risk.riskLevel === "Level 4") {
    return "暂不需要线下科室";
  }

  if (hasRespiratoryConcern(symptoms, payload.symptomNotes)) {
    return "呼吸内科 / 全科门诊";
  }

  if (symptoms.includes("sore throat")) {
    return "耳鼻喉科 / 全科门诊";
  }

  return "全科门诊";
}

function chooseRisk(payload, symptoms, redFlags) {
  if (redFlags.length > 0) {
    return RISK_MAP.LEVEL_1;
  }

  const age = Number(payload.age || 0);
  const temp = Number(payload.maxTemperatureC || 0);
  const days = Number(payload.symptomDays || 0);
  const severity = String(payload.severity || "").toLowerCase();
  const chronicCount = Array.isArray(payload.chronicConditions)
    ? payload.chronicConditions.filter(Boolean).length
    : 0;

  const urgentRespiratory =
    hasRespiratoryConcern(symptoms, payload.symptomNotes) &&
    (payload.symptomsWorsening ||
      payload.breathingDifficulty === "mild" ||
      symptoms.includes("chest tightness"));

  if (
    (temp >= 38.5 && days >= 3) ||
    (urgentRespiratory && severity !== "mild") ||
    (age >= 65 && chronicCount > 0 && (temp >= 37.8 || days >= 2))
  ) {
    return RISK_MAP.LEVEL_2;
  }

  if (severity === "moderate" || days >= 2 || chronicCount > 0) {
    return RISK_MAP.LEVEL_3;
  }

  return RISK_MAP.LEVEL_4;
}

function buildReasoning(payload, risk, redFlags, symptoms) {
  const reasons = [];

  if (redFlags.length > 0) {
    reasons.push("检测到需要优先线下评估的危险信号。");
  }

  if (risk.riskLevel === "Level 2") {
    if (Number(payload.maxTemperatureC) >= 38.5) {
      reasons.push("发热已达到较高温度，且病程持续。");
    }
    if (payload.symptomsWorsening) {
      reasons.push("症状呈加重趋势，不适合继续单纯观察。");
    }
    if (symptoms.includes("chest tightness")) {
      reasons.push("伴随胸闷，需要尽快进行线下评估。");
    }
  }

  if (risk.riskLevel === "Level 3") {
    reasons.push("当前未见明显红旗症状，但仍建议门诊进一步评估。");
  }

  if (risk.riskLevel === "Level 4") {
    reasons.push("当前信息显示症状较轻，可先短期观察并记录变化。");
  }

  return reasons;
}

function buildImmediateSteps(risk) {
  if (risk.riskLevel === "Level 1") {
    return [
      "尽快前往最近急诊或呼叫急救支持。",
      "避免独自前往，尽量由家属陪同。",
      "携带当前用药和既往病史信息。"
    ];
  }

  if (risk.riskLevel === "Level 2") {
    return [
      "建议在 24 小时内完成线下就医。",
      "持续记录体温、呼吸和症状变化。",
      "如胸痛、呼吸困难加重，请立即升级为急诊处理。"
    ];
  }

  if (risk.riskLevel === "Level 3") {
    return [
      "尽快预约普通门诊或全科门诊。",
      "准备好症状变化和既往病史，便于医生快速判断。"
    ];
  }

  return [
    "先居家观察 24-48 小时。",
    "补充休息和水分，持续记录体温和症状变化。",
    "若出现加重或新危险信号，请立即线下就医。"
  ];
}

function buildDoctorQuestions(symptoms) {
  const base = [
    "症状最早是什么时候开始的？",
    "近 24 小时内症状是否明显加重？"
  ];

  if (symptoms.includes("fever")) {
    base.push("发热最高温度是多少，退烧药后的变化如何？");
  }

  if (hasRespiratoryConcern(symptoms, "")) {
    base.push("是否出现活动后气促、胸闷或夜间咳嗽加重？");
  }

  return base;
}

export function assessTriage(payload) {
  const symptoms = normalizeSymptoms(payload.symptoms, payload.symptomNotes);
  const normalizedPayload = {
    ...payload,
    symptoms,
    symptomDays: Number(payload.symptomDays || 0),
    maxTemperatureC:
      payload.maxTemperatureC == null || payload.maxTemperatureC === ""
        ? null
        : Number(payload.maxTemperatureC),
    chronicConditions: Array.isArray(payload.chronicConditions)
      ? payload.chronicConditions
      : String(payload.chronicConditions || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
  };

  const redFlags = buildRedFlags(normalizedPayload, symptoms);
  const risk = chooseRisk(normalizedPayload, symptoms, redFlags);
  const suggestedDepartment = chooseDepartment(normalizedPayload, symptoms, risk);
  const reasoning = buildReasoning(normalizedPayload, risk, redFlags, symptoms);
  const immediateSteps = buildImmediateSteps(risk);
  const doctorQuestions = buildDoctorQuestions(symptoms);

  return {
    ...normalizedPayload,
    ...risk,
    redFlags,
    suggestedDepartment,
    reasoning,
    immediateSteps,
    doctorQuestions,
    warning:
      "本结果仅用于就医前辅助判断，不能替代医生面诊、检查或正式诊断。"
  };
}

export function buildVisitSummary(assessment) {
  const symptomText = humanSymptomList(assessment.symptoms);
  const chiefComplaint = `患者因${symptomText || "不适"}就诊`;
  const onset = `${assessment.symptomDays || "未知"} 天前开始出现症状`;
  const history = assessment.chronicConditions?.length
    ? assessment.chronicConditions.join("、")
    : "无明确慢病史";

  const summaryText =
    `患者 ${assessment.patientName || "未署名"}，${assessment.age || "未知"} 岁，` +
    `主诉为${symptomText || "多项不适"}，病程约 ${assessment.symptomDays || "未知"} 天。` +
    ` 当前分诊建议为：${assessment.actionLabel}；建议科室：${assessment.suggestedDepartment}。` +
    ` 既往病史：${history}。`;

  return {
    chiefComplaint,
    onset,
    mainSymptoms: symptomText || "未填写",
    associatedSymptoms: assessment.symptomNotes || "未填写详细症状说明",
    medicalHistory: history,
    currentMedication: assessment.medications || "未填写",
    allergies: assessment.allergies || "未填写",
    riskNotes: assessment.redFlags.length
      ? assessment.redFlags.join("；")
      : "当前未识别明确红旗症状",
    suggestedDepartment: assessment.suggestedDepartment,
    doctorQuestions: assessment.doctorQuestions,
    summaryText
  };
}

