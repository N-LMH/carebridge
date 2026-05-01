const RISK_MAP = {
  LEVEL_1: { riskLevel: "Level 1", actionLabel: "立即急诊" },
  LEVEL_2: { riskLevel: "Level 2", actionLabel: "24小时内线下就医" },
  LEVEL_3: { riskLevel: "Level 3", actionLabel: "可预约普通门诊" },
  LEVEL_4: { riskLevel: "Level 4", actionLabel: "居家观察并持续记录" }
};

const SYNONYM_MAP = {
  fever: ["fever", "发烧", "发热", "high temperature", "temperature", "pyrexia"],
  cough: ["cough", "咳嗽", "咳"],
  chest_tightness: ["chest tightness", "胸闷", "胸憋", "chest pressure"],
  chest_pain: ["chest pain", "胸痛", "chest hurt"],
  sore_throat: ["sore throat", "咽痛", "喉咙痛", "throat pain"],
  headache: ["headache", "头痛", "头疼", "head pain"],
  vomiting: ["vomiting", "呕吐", "恶心", "nausea", "throwing up"],
  diarrhea: ["diarrhea", "腹泻", "拉肚子", "loose stool"],
  abdominal_pain: ["abdominal", "腹痛", "肚子疼", "stomach pain", "belly pain"],
  dyspnea: ["breath", "呼吸困难", "气短", "shortness of breath", "dyspnea", "喘"],
  dizziness: ["dizziness", "头晕", "dizzy", "眩晕", "vertigo"],
  rash: ["rash", "皮疹", "红疹"],
  bleeding: ["bleeding", "出血", "便血", "blood"]
};

const SYMPTOM_WEIGHTS = {
  chest_pain: { weight: 8, categories: ["cardiac", "respiratory"] },
  dyspnea: { weight: 8, categories: ["respiratory", "cardiac"] },
  chest_tightness: { weight: 6, categories: ["respiratory", "cardiac"] },
  vomiting: { weight: 4, categories: ["gastrointestinal"] },
  diarrhea: { weight: 3, categories: ["gastrointestinal"] },
  abdominal_pain: { weight: 4, categories: ["gastrointestinal"] },
  fever: { weight: 3, categories: ["systemic"] },
  headache: { weight: 3, categories: ["neurological"] },
  dizziness: { weight: 4, categories: ["neurological"] },
  cough: { weight: 2, categories: ["respiratory"] },
  sore_throat: { weight: 2, categories: ["ent"] },
  rash: { weight: 3, categories: ["dermatological"] },
  bleeding: { weight: 6, categories: ["hematological"] }
};

const SYMPTOM_LABELS = {
  fever: "发热",
  cough: "咳嗽",
  chest_tightness: "胸闷",
  chest_pain: "胸痛",
  sore_throat: "咽痛",
  headache: "头痛",
  vomiting: "呕吐",
  diarrhea: "腹泻",
  abdominal_pain: "腹痛",
  dyspnea: "呼吸困难",
  dizziness: "头晕",
  rash: "皮疹",
  bleeding: "出血"
};

const COMBINATION_BONUSES = [
  { symptoms: ["fever", "dyspnea"], bonus: 3 },
  { symptoms: ["chest_pain", "dyspnea"], bonus: 5 },
  { symptoms: ["fever", "elderly"], bonus: 3 },
  { symptoms: ["vomiting", "abdominal_pain"], bonus: 2 },
  { symptoms: ["fever", "rash"], bonus: 4 },
  { symptoms: ["bleeding", "_any_other"], bonus: 3 }
];

const SCORE_THRESHOLDS = {
  LEVEL_1: 12,
  LEVEL_2: 7,
  LEVEL_3: 4
};

function normalizeSymptoms(symptoms = [], symptomNotes = "") {
  const base = Array.isArray(symptoms)
    ? symptoms
    : String(symptoms)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const allInput = [...base, String(symptomNotes || "")];
  const merged = new Set();

  for (const canonical in SYNONYM_MAP) {
    const synonyms = SYNONYM_MAP[canonical];
    for (const input of allInput) {
      const lowered = input.toLowerCase().trim();
      if (!lowered) continue;
      for (const synonym of synonyms) {
        if (lowered.includes(synonym.toLowerCase())) {
          merged.add(canonical);
          break;
        }
      }
    }
  }

  // Also check each individual symptom token against synonyms
  for (const token of base) {
    const lowered = token.toLowerCase().trim();
    if (!lowered) continue;
    for (const canonical in SYNONYM_MAP) {
      if (merged.has(canonical)) continue;
      const synonyms = SYNONYM_MAP[canonical];
      for (const synonym of synonyms) {
        if (lowered === synonym.toLowerCase() || lowered.includes(synonym.toLowerCase())) {
          merged.add(canonical);
          break;
        }
      }
    }
  }

  return [...merged];
}

function computeScore(payload, symptoms) {
  const breakdown = { base: 0, modifiers: 0, combinations: 0, details: [] };

  // Base symptom weights
  for (const symptom of symptoms) {
    const entry = SYMPTOM_WEIGHTS[symptom];
    if (entry) {
      breakdown.base += entry.weight;
      breakdown.details.push({ type: "base", symptom, value: entry.weight });
    }
  }

  // Risk modifiers
  const age = Number(payload.age || 0);
  const temp = Number(payload.maxTemperatureC || 0);
  const days = Number(payload.symptomDays || 0);
  const severity = String(payload.severity || "").toLowerCase();
  const chronicCount = Array.isArray(payload.chronicConditions)
    ? payload.chronicConditions.filter(Boolean).length
    : 0;

  if (age >= 80) {
    breakdown.modifiers += 5;
    breakdown.details.push({ type: "modifier", reason: "高龄（≥80岁）", value: 5 });
  } else if (age >= 65) {
    breakdown.modifiers += 3;
    breakdown.details.push({ type: "modifier", reason: "老年（≥65岁）", value: 3 });
  }

  if (chronicCount > 0) {
    breakdown.modifiers += 2;
    breakdown.details.push({ type: "modifier", reason: "合并慢性疾病", value: 2 });
  }

  if (payload.symptomsWorsening) {
    breakdown.modifiers += 2;
    breakdown.details.push({ type: "modifier", reason: "症状加重", value: 2 });
  }

  if (temp >= 39) {
    breakdown.modifiers += 3;
    breakdown.details.push({ type: "modifier", reason: "高热（≥39°C）", value: 3 });
  }

  if (days >= 7) {
    breakdown.modifiers += 2;
    breakdown.details.push({ type: "modifier", reason: "病程≥7天", value: 2 });
  } else if (days >= 3) {
    breakdown.modifiers += 1;
    breakdown.details.push({ type: "modifier", reason: "病程≥3天", value: 1 });
  }

  if (severity === "severe") {
    breakdown.modifiers += 2;
    breakdown.details.push({ type: "modifier", reason: "自评严重", value: 2 });
  }

  // Combination bonuses
  const hasElderly = age >= 65;
  for (const combo of COMBINATION_BONUSES) {
    if (combo.symptoms.includes("_any_other")) {
      // Special: bleeding + any other symptom
      const primary = combo.symptoms.find((s) => s !== "_any_other");
      if (symptoms.includes(primary) && symptoms.length > 1) {
        breakdown.combinations += combo.bonus;
        breakdown.details.push({
          type: "combination",
          reason: `${SYMPTOM_LABELS[primary] || primary}合并其他症状`,
          value: combo.bonus
        });
      }
      continue;
    }
    if (combo.symptoms.includes("elderly")) {
      // Special: fever + elderly
      const symptomPart = combo.symptoms.find((s) => s !== "elderly");
      if (symptoms.includes(symptomPart) && hasElderly) {
        breakdown.combinations += combo.bonus;
        breakdown.details.push({
          type: "combination",
          reason: `${SYMPTOM_LABELS[symptomPart] || symptomPart}合并高龄`,
          value: combo.bonus
        });
      }
      continue;
    }
    // Standard: all listed symptoms must be present
    if (combo.symptoms.every((s) => symptoms.includes(s))) {
      breakdown.combinations += combo.bonus;
      const labels = combo.symptoms.map((s) => SYMPTOM_LABELS[s] || s).join("+");
      breakdown.details.push({
        type: "combination",
        reason: `症状组合 ${labels}`,
        value: combo.bonus
      });
    }
  }

  breakdown.total = breakdown.base + breakdown.modifiers + breakdown.combinations;
  return breakdown;
}

function getRiskFromScore(score) {
  if (score >= SCORE_THRESHOLDS.LEVEL_1) return RISK_MAP.LEVEL_1;
  if (score >= SCORE_THRESHOLDS.LEVEL_2) return RISK_MAP.LEVEL_2;
  if (score >= SCORE_THRESHOLDS.LEVEL_3) return RISK_MAP.LEVEL_3;
  return RISK_MAP.LEVEL_4;
}

function detectCategories(symptoms) {
  const categories = new Set();
  for (const symptom of symptoms) {
    const entry = SYMPTOM_WEIGHTS[symptom];
    if (entry) {
      for (const cat of entry.categories) {
        categories.add(cat);
      }
    }
  }
  return [...categories];
}

function humanSymptomList(symptoms) {
  return symptoms
    .map((symptom) => SYMPTOM_LABELS[symptom] || symptom)
    .join("、");
}

export function buildFollowUpQuestions(payload) {
  const symptoms = normalizeSymptoms(payload.symptoms, payload.symptomNotes);
  const categories = detectCategories(symptoms);
  const questions = [];

  // Respiratory category questions
  if (categories.includes("respiratory") && payload.breathingDifficulty == null) {
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

  if (categories.includes("respiratory") && payload.coughType == null) {
    questions.push({
      id: "coughType",
      label: "Cough type",
      type: "select",
      options: [
        { value: "none", label: "No cough" },
        { value: "dry", label: "Dry cough" },
        { value: "productive", label: "Productive cough" }
      ]
    });
  }

  if (categories.includes("respiratory") && payload.nightSymptoms == null) {
    questions.push({
      id: "nightSymptoms",
      label: "Night symptoms",
      type: "select",
      options: [
        { value: "yes", label: "Yes, symptoms worsen at night" },
        { value: "no", label: "No night worsening" }
      ]
    });
  }

  // Systemic / Fever category questions
  if (
    (categories.includes("systemic") || symptoms.includes("fever")) &&
    payload.maxTemperatureC == null
  ) {
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

  if (categories.includes("systemic") && payload.chillsOrSweats == null) {
    questions.push({
      id: "chillsOrSweats",
      label: "Chills or sweats",
      type: "select",
      options: [
        { value: "chills", label: "Chills" },
        { value: "sweats", label: "Night sweats" },
        { value: "both", label: "Both chills and sweats" },
        { value: "none", label: "Neither" }
      ]
    });
  }

  // Gastrointestinal category questions
  if (categories.includes("gastrointestinal") && payload.stoolFrequency == null) {
    questions.push({
      id: "stoolFrequency",
      label: "Stool frequency (times per day)",
      type: "number",
      min: 0,
      max: 30,
      step: 1,
      placeholder: "e.g. 5"
    });
  }

  if (categories.includes("gastrointestinal") && payload.foodIntake == null) {
    questions.push({
      id: "foodIntake",
      label: "Food intake",
      type: "select",
      options: [
        { value: "normal", label: "Normal" },
        { value: "reduced", label: "Reduced" },
        { value: "minimal", label: "Minimal / unable to eat" }
      ]
    });
  }

  if (categories.includes("gastrointestinal") && payload.dehydrationSigns == null) {
    questions.push({
      id: "dehydrationSigns",
      label: "Dehydration signs",
      type: "select",
      options: [
        { value: "yes", label: "Yes (dry mouth, reduced urine, dizziness)" },
        { value: "no", label: "No signs of dehydration" }
      ]
    });
  }

  // Cardiac category questions
  if (categories.includes("cardiac") && payload.chestPain == null) {
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

  if (categories.includes("cardiac") && payload.painRadiation == null) {
    questions.push({
      id: "painRadiation",
      label: "Pain radiation",
      type: "select",
      options: [
        { value: "none", label: "No radiation" },
        { value: "left_arm", label: "Radiates to left arm/jaw" },
        { value: "back", label: "Radiates to back" },
        { value: "other", label: "Radiates elsewhere" }
      ]
    });
  }

  if (categories.includes("cardiac") && payload.activityRelation == null) {
    questions.push({
      id: "activityRelation",
      label: "Activity relation",
      type: "select",
      options: [
        { value: "rest", label: "Occurs at rest" },
        { value: "exertion", label: "Worsens with exertion" },
        { value: "both", label: "Both at rest and with exertion" }
      ]
    });
  }

  // Neurological category questions
  if (categories.includes("neurological") && payload.consciousnessChanges == null) {
    questions.push({
      id: "consciousnessChanges",
      label: "Consciousness changes",
      type: "select",
      options: [
        { value: "yes", label: "Yes (confusion, drowsiness, fainting)" },
        { value: "no", label: "No changes" }
      ]
    });
  }

  if (categories.includes("neurological") && payload.visionChanges == null) {
    questions.push({
      id: "visionChanges",
      label: "Vision changes",
      type: "select",
      options: [
        { value: "yes", label: "Yes (blurred vision, double vision, visual loss)" },
        { value: "no", label: "No vision changes" }
      ]
    });
  }

  if (categories.includes("neurological") && payload.numbness == null) {
    questions.push({
      id: "numbness",
      label: "Numbness or weakness",
      type: "select",
      options: [
        { value: "yes", label: "Yes (limb weakness or numbness)" },
        { value: "no", label: "No numbness or weakness" }
      ]
    });
  }

  // General question always asked if not already provided
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

  return questions;
}

function buildRedFlags(payload, symptoms) {
  const redFlags = [];
  const notes = String(payload.symptomNotes).toLowerCase();

  if (payload.breathingDifficulty === "severe") {
    redFlags.push("严重呼吸困难");
  }

  if (
    payload.chestPain &&
    String(payload.severity).toLowerCase() === "severe"
  ) {
    redFlags.push("严重胸痛");
  }

  if (notes.includes("confusion") || notes.includes("faint") || notes.includes("昏") || notes.includes("晕倒")) {
    redFlags.push("可能意识状态改变");
  }

  if (Number(payload.maxTemperatureC) >= 39.5 && payload.symptomsWorsening) {
    redFlags.push("高热伴症状加重");
  }

  if (
    symptoms.includes("chest_tightness") &&
    (payload.breathingDifficulty === "moderate" || payload.breathingDifficulty === "severe")
  ) {
    redFlags.push("胸闷伴中重度呼吸困难");
  }

  if (symptoms.includes("bleeding") && symptoms.length > 1) {
    redFlags.push("出血合并其他症状");
  }

  if (symptoms.includes("chest_pain") && symptoms.includes("dyspnea")) {
    redFlags.push("胸痛伴呼吸困难");
  }

  return redFlags;
}

function chooseDepartment(payload, symptoms, risk, categories) {
  if (risk.riskLevel === "Level 1") {
    if (categories.includes("cardiac")) return "急诊 / 心内科";
    if (categories.includes("respiratory")) return "急诊 / 呼吸科";
    if (categories.includes("gastrointestinal")) return "急诊 / 消化科";
    if (categories.includes("neurological")) return "急诊 / 神经内科";
    return "急诊";
  }

  if (risk.riskLevel === "Level 2") {
    if (categories.includes("cardiac")) return "心内科";
    if (categories.includes("respiratory")) return "呼吸内科";
    if (categories.includes("gastrointestinal")) return "消化内科";
    if (categories.includes("neurological")) return "神经内科";
    if (categories.includes("ent")) return "耳鼻喉科";
    return "全科门诊";
  }

  if (risk.riskLevel === "Level 3") {
    const specialist = [];
    if (categories.includes("cardiac")) specialist.push("心内科");
    if (categories.includes("respiratory")) specialist.push("呼吸内科");
    if (categories.includes("gastrointestinal")) specialist.push("消化内科");
    if (categories.includes("neurological")) specialist.push("神经内科");
    if (categories.includes("ent")) specialist.push("耳鼻喉科");
    if (categories.includes("dermatological")) specialist.push("皮肤科");
    if (categories.includes("hematological")) specialist.push("血液科");
    const suffix = specialist.length > 0 ? `（建议${specialist.join("或")}）` : "";
    return `全科门诊${suffix}`;
  }

  return "暂不需要线下科室";
}

function chooseRisk(payload, symptoms, redFlags, scoreBreakdown) {
  if (redFlags.length > 0) {
    // Red flags force Level 1, but still record the score
    return RISK_MAP.LEVEL_1;
  }
  return getRiskFromScore(scoreBreakdown.total);
}

function buildReasoning(payload, risk, redFlags, symptoms, scoreBreakdown) {
  const reasons = [];

  if (redFlags.length > 0) {
    reasons.push("检测到需要优先线下评估的危险信号。");
  }

  // Explain the score composition
  const baseDetails = scoreBreakdown.details.filter((d) => d.type === "base");
  if (baseDetails.length > 0) {
    const symptomNames = baseDetails
      .map((d) => `${SYMPTOM_LABELS[d.symptom] || d.symptom}(+${d.value})`)
      .join("、");
    reasons.push(`症状基础分：${symptomNames}。`);
  }

  const modifierDetails = scoreBreakdown.details.filter((d) => d.type === "modifier");
  if (modifierDetails.length > 0) {
    const modifierNames = modifierDetails
      .map((d) => `${d.reason}(+${d.value})`)
      .join("、");
    reasons.push(`风险修正：${modifierNames}。`);
  }

  const comboDetails = scoreBreakdown.details.filter((d) => d.type === "combination");
  if (comboDetails.length > 0) {
    const comboNames = comboDetails
      .map((d) => `${d.reason}(+${d.value})`)
      .join("、");
    reasons.push(`组合加成：${comboNames}。`);
  }

  if (risk.riskLevel === "Level 2") {
    reasons.push("综合评分建议24小时内线下就医。");
    if (payload.symptomsWorsening) {
      reasons.push("症状呈加重趋势，不适合继续单纯观察。");
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

function buildDoctorQuestions(symptoms, categories) {
  const base = [
    "症状最早是什么时候开始的？",
    "近 24 小时内症状是否明显加重？"
  ];

  if (categories.includes("systemic") || symptoms.includes("fever")) {
    base.push("发热最高温度是多少，退烧药后的变化如何？");
  }

  if (categories.includes("respiratory")) {
    base.push("是否出现活动后气促、胸闷或夜间咳嗽加重？");
  }

  if (categories.includes("gastrointestinal")) {
    base.push("每日大便次数？是否有脱水表现（口干、尿量减少）？");
  }

  if (categories.includes("cardiac")) {
    base.push("胸痛是否向左臂或下颌放射？与体力活动是否相关？");
  }

  if (categories.includes("neurological")) {
    base.push("是否出现意识模糊、视物不清或肢体麻木无力？");
  }

  return base;
}

export function assessTriage(payload) {
  const symptoms = normalizeSymptoms(payload.symptoms, payload.symptomNotes);
  const categories = detectCategories(symptoms);
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

  const scoreBreakdown = computeScore(normalizedPayload, symptoms);
  const redFlags = buildRedFlags(normalizedPayload, symptoms);
  const risk = chooseRisk(normalizedPayload, symptoms, redFlags, scoreBreakdown);
  const suggestedDepartment = chooseDepartment(normalizedPayload, symptoms, risk, categories);
  const reasoning = buildReasoning(normalizedPayload, risk, redFlags, symptoms, scoreBreakdown);
  const immediateSteps = buildImmediateSteps(risk);
  const doctorQuestions = buildDoctorQuestions(symptoms, categories);

  return {
    ...normalizedPayload,
    ...risk,
    redFlags,
    suggestedDepartment,
    reasoning,
    immediateSteps,
    doctorQuestions,
    scoreBreakdown,
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
    ` 风险评分：${assessment.scoreBreakdown?.total ?? "未计算"}分；` +
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
