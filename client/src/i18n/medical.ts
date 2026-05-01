import type {
  AdminSessionSummary,
  DemoPreset,
  DoctorSessionSummary,
  FollowUpQuestion,
  Locale,
  QuestionOption,
  RiskAssessment,
  ScoreDetail,
  Session,
  SessionSummary,
  VisitSummary
} from '@/types'

type LocalizedText = Record<Locale, string>
type AssessmentRuntimeFields = RiskAssessment & {
  symptoms?: string[]
  symptomsWorsening?: boolean | null
}

function pick(text: LocalizedText, locale: Locale) {
  return text[locale]
}

const symptomLabels: Record<string, LocalizedText> = {
  fever: { zh: '发热', en: 'Fever' },
  cough: { zh: '咳嗽', en: 'Cough' },
  chest_tightness: { zh: '胸闷', en: 'Chest tightness' },
  chest_pain: { zh: '胸痛', en: 'Chest pain' },
  sore_throat: { zh: '咽痛', en: 'Sore throat' },
  headache: { zh: '头痛', en: 'Headache' },
  vomiting: { zh: '呕吐', en: 'Vomiting' },
  diarrhea: { zh: '腹泻', en: 'Diarrhea' },
  abdominal_pain: { zh: '腹痛', en: 'Abdominal pain' },
  dyspnea: { zh: '呼吸困难', en: 'Shortness of breath' },
  dizziness: { zh: '头晕', en: 'Dizziness' },
  rash: { zh: '皮疹', en: 'Rash' },
  bleeding: { zh: '出血', en: 'Bleeding' }
}

const modifierLabels: Record<string, LocalizedText> = {
  '高龄（≥80岁）': { zh: '高龄（≥80岁）', en: 'Age 80 or above' },
  '老年（≥65岁）': { zh: '老年（≥65岁）', en: 'Age 65 or above' },
  '合并慢性疾病': { zh: '合并慢性疾病', en: 'Chronic conditions present' },
  '症状加重': { zh: '症状加重', en: 'Symptoms worsening' },
  '高热（≥39°C）': { zh: '高热（≥39°C）', en: 'High fever (>=39°C)' },
  '病程≥7天': { zh: '病程≥7天', en: 'Symptoms >= 7 days' },
  '病程≥3天': { zh: '病程≥3天', en: 'Symptoms >= 3 days' },
  '自评严重': { zh: '自评严重', en: 'Self-rated severe' }
}

const actionLabels: Record<RiskAssessment['riskLevel'], LocalizedText> = {
  'Level 1': { zh: '立即急诊', en: 'Seek emergency care immediately' },
  'Level 2': { zh: '24小时内线下就医', en: 'Visit offline care within 24 hours' },
  'Level 3': { zh: '可预约普通门诊', en: 'Schedule a standard outpatient visit' },
  'Level 4': { zh: '居家观察并持续记录', en: 'Observe at home and keep tracking symptoms' }
}

const departmentLabels: Record<string, LocalizedText> = {
  '急诊 / 心内科': { zh: '急诊 / 心内科', en: 'Emergency / Cardiology' },
  '急诊 / 呼吸科': { zh: '急诊 / 呼吸科', en: 'Emergency / Respiratory' },
  '急诊 / 消化科': { zh: '急诊 / 消化科', en: 'Emergency / Gastroenterology' },
  '急诊 / 神经内科': { zh: '急诊 / 神经内科', en: 'Emergency / Neurology' },
  '急诊': { zh: '急诊', en: 'Emergency' },
  '心内科': { zh: '心内科', en: 'Cardiology' },
  '呼吸内科': { zh: '呼吸内科', en: 'Respiratory' },
  '消化内科': { zh: '消化内科', en: 'Gastroenterology' },
  '神经内科': { zh: '神经内科', en: 'Neurology' },
  '耳鼻喉科': { zh: '耳鼻喉科', en: 'ENT' },
  '全科门诊': { zh: '全科门诊', en: 'General practice' },
  '全科门诊（建议心内科或呼吸内科）': { zh: '全科门诊（建议心内科或呼吸内科）', en: 'General practice (cardiology or respiratory recommended)' },
  '全科门诊（建议心内科）': { zh: '全科门诊（建议心内科）', en: 'General practice (cardiology recommended)' },
  '全科门诊（建议呼吸内科）': { zh: '全科门诊（建议呼吸内科）', en: 'General practice (respiratory recommended)' },
  '全科门诊（建议消化内科）': { zh: '全科门诊（建议消化内科）', en: 'General practice (gastroenterology recommended)' },
  '全科门诊（建议神经内科）': { zh: '全科门诊（建议神经内科）', en: 'General practice (neurology recommended)' },
  '全科门诊（建议耳鼻喉科）': { zh: '全科门诊（建议耳鼻喉科）', en: 'General practice (ENT recommended)' },
  '全科门诊（建议皮肤科）': { zh: '全科门诊（建议皮肤科）', en: 'General practice (dermatology recommended)' },
  '全科门诊（建议血液科）': { zh: '全科门诊（建议血液科）', en: 'General practice (hematology recommended)' },
  '暂不需要线下科室': { zh: '暂不需要线下科室', en: 'No offline department needed yet' }
}

const redFlagLabels: Record<string, LocalizedText> = {
  '严重呼吸困难': { zh: '严重呼吸困难', en: 'Severe breathing difficulty' },
  '严重胸痛': { zh: '严重胸痛', en: 'Severe chest pain' },
  '可能意识状态改变': { zh: '可能意识状态改变', en: 'Possible altered mental status' },
  '高热伴症状加重': { zh: '高热伴症状加重', en: 'High fever with worsening symptoms' },
  '胸闷伴中重度呼吸困难': { zh: '胸闷伴中重度呼吸困难', en: 'Chest tightness with moderate to severe breathing difficulty' },
  '出血合并其他症状': { zh: '出血合并其他症状', en: 'Bleeding with additional symptoms' },
  '胸痛伴呼吸困难': { zh: '胸痛伴呼吸困难', en: 'Chest pain with shortness of breath' }
}

const doctorQuestionLabels: Record<string, LocalizedText> = {
  '症状最早是什么时候开始的？': { zh: '症状最早是什么时候开始的？', en: 'When did the symptoms first begin?' },
  '近 24 小时内症状是否明显加重？': { zh: '近 24 小时内症状是否明显加重？', en: 'Have the symptoms become noticeably worse in the last 24 hours?' },
  '发热最高温度是多少，退烧药后的变化如何？': { zh: '发热最高温度是多少，退烧药后的变化如何？', en: 'What was the highest temperature, and how did it change after fever medication?' },
  '是否出现活动后气促、胸闷或夜间咳嗽加重？': { zh: '是否出现活动后气促、胸闷或夜间咳嗽加重？', en: 'Do they have exertional shortness of breath, chest tightness, or worse coughing at night?' },
  '每日大便次数？是否有脱水表现（口干、尿量减少）？': { zh: '每日大便次数？是否有脱水表现（口干、尿量减少）？', en: 'How many bowel movements occur per day? Are there dehydration signs such as dry mouth or reduced urine?' },
  '胸痛是否向左臂或下颌放射？与体力活动是否相关？': { zh: '胸痛是否向左臂或下颌放射？与体力活动是否相关？', en: 'Does the chest pain radiate to the left arm or jaw, and is it related to exertion?' },
  '是否出现意识模糊、视物不清或肢体麻木无力？': { zh: '是否出现意识模糊、视物不清或肢体麻木无力？', en: 'Are there any signs of confusion, blurred vision, numbness, or weakness?' }
}

const questionCatalog: Record<string, { label: LocalizedText, placeholder?: LocalizedText, options?: Record<string, LocalizedText> }> = {
  breathingDifficulty: {
    label: { zh: '呼吸困难程度', en: 'Breathing difficulty' },
    options: {
      none: { zh: '无呼吸困难', en: 'No breathing difficulty' },
      mild: { zh: '轻度气短', en: 'Mild shortness of breath' },
      moderate: { zh: '中度呼吸困难', en: 'Moderate breathing difficulty' },
      severe: { zh: '重度呼吸困难', en: 'Severe breathing difficulty' }
    }
  },
  coughType: {
    label: { zh: '咳嗽类型', en: 'Cough type' },
    options: {
      none: { zh: '无咳嗽', en: 'No cough' },
      dry: { zh: '干咳', en: 'Dry cough' },
      productive: { zh: '有痰咳嗽', en: 'Productive cough' }
    }
  },
  nightSymptoms: {
    label: { zh: '夜间症状', en: 'Night symptoms' },
    options: {
      yes: { zh: '是，夜间加重', en: 'Yes, symptoms worsen at night' },
      no: { zh: '否，夜间无明显加重', en: 'No night worsening' }
    }
  },
  maxTemperatureC: {
    label: { zh: '最高体温', en: 'Max temperature' },
    placeholder: { zh: '例如：38.5', en: 'e.g. 38.5' }
  },
  chillsOrSweats: {
    label: { zh: '寒战或盗汗', en: 'Chills or sweats' },
    options: {
      chills: { zh: '寒战', en: 'Chills' },
      sweats: { zh: '盗汗', en: 'Night sweats' },
      both: { zh: '两者都有', en: 'Both chills and sweats' },
      none: { zh: '都没有', en: 'Neither' }
    }
  },
  stoolFrequency: {
    label: { zh: '每日排便次数', en: 'Stool frequency (times per day)' },
    placeholder: { zh: '例如：5', en: 'e.g. 5' }
  },
  foodIntake: {
    label: { zh: '进食情况', en: 'Food intake' },
    options: {
      normal: { zh: '正常', en: 'Normal' },
      reduced: { zh: '减少', en: 'Reduced' },
      minimal: { zh: '很少 / 无法进食', en: 'Minimal / unable to eat' }
    }
  },
  dehydrationSigns: {
    label: { zh: '脱水表现', en: 'Dehydration signs' },
    options: {
      yes: { zh: '有（口干、尿量减少、头晕）', en: 'Yes (dry mouth, reduced urine, dizziness)' },
      no: { zh: '无脱水表现', en: 'No signs of dehydration' }
    }
  },
  chestPain: {
    label: { zh: '是否有胸痛', en: 'Chest pain present?' },
    options: {
      yes: { zh: '有', en: 'Yes' },
      no: { zh: '无', en: 'No' }
    }
  },
  painRadiation: {
    label: { zh: '放射痛情况', en: 'Pain radiation' },
    options: {
      none: { zh: '无放射', en: 'No radiation' },
      left_arm: { zh: '放射到左臂 / 下颌', en: 'Radiates to left arm/jaw' },
      back: { zh: '放射到背部', en: 'Radiates to back' },
      other: { zh: '放射到其他部位', en: 'Radiates elsewhere' }
    }
  },
  activityRelation: {
    label: { zh: '与活动关系', en: 'Activity relation' },
    options: {
      rest: { zh: '静息时发生', en: 'Occurs at rest' },
      exertion: { zh: '活动时加重', en: 'Worsens with exertion' },
      both: { zh: '静息和活动时都有', en: 'Both at rest and with exertion' }
    }
  },
  consciousnessChanges: {
    label: { zh: '意识状态改变', en: 'Consciousness changes' },
    options: {
      yes: { zh: '有（意识模糊、嗜睡、晕厥）', en: 'Yes (confusion, drowsiness, fainting)' },
      no: { zh: '无变化', en: 'No changes' }
    }
  },
  visionChanges: {
    label: { zh: '视力变化', en: 'Vision changes' },
    options: {
      yes: { zh: '有（视物模糊、复视、视力下降）', en: 'Yes (blurred vision, double vision, visual loss)' },
      no: { zh: '无视力变化', en: 'No vision changes' }
    }
  },
  numbness: {
    label: { zh: '麻木或无力', en: 'Numbness or weakness' },
    options: {
      yes: { zh: '有（肢体麻木或无力）', en: 'Yes (limb weakness or numbness)' },
      no: { zh: '无麻木或无力', en: 'No numbness or weakness' }
    }
  },
  symptomsWorsening: {
    label: { zh: '症状是否加重', en: 'Symptoms worsening?' },
    options: {
      yes: { zh: '是', en: 'Yes' },
      no: { zh: '否', en: 'No' }
    }
  }
}

const validationMessages: Record<string, LocalizedText> = {
  'Symptoms are required': { zh: '必须填写主要症状', en: 'Symptoms are required' },
  'Symptom days must be between 0 and 365': { zh: '症状持续天数必须在 0 到 365 之间', en: 'Symptom days must be between 0 and 365' },
  'Age must be between 0 and 150': { zh: '年龄必须在 0 到 150 之间', en: 'Age must be between 0 and 150' },
  'Severity must be one of: mild, moderate, severe': { zh: '严重程度必须是 mild、moderate 或 severe', en: 'Severity must be one of: mild, moderate, severe' },
  'Max temperature must be between 30 and 45': { zh: '最高体温必须在 30 到 45 之间', en: 'Max temperature must be between 30 and 45' },
  'Patient name must be at most 100 characters': { zh: '患者姓名最多 100 个字符', en: 'Patient name must be at most 100 characters' },
  'Symptom notes must be at most 2000 characters': { zh: '症状详细描述最多 2000 个字符', en: 'Symptom notes must be at most 2000 characters' },
  'At least one field must be provided': { zh: '至少需要填写一项随访信息', en: 'At least one field must be provided' },
  'Temperature must be between 30 and 45': { zh: '体温必须在 30 到 45 之间', en: 'Temperature must be between 30 and 45' },
  'Note must be at most 1000 characters': { zh: '备注最多 1000 个字符', en: 'Note must be at most 1000 characters' }
}

const presetOverrides: Record<string, Partial<Record<Locale, Partial<DemoPreset>>>> = {
  'respiratory-watch': {
    en: {
      title: 'Respiratory Observation Case',
      patientName: 'Auntie Chen',
      region: 'County clinic area',
      symptoms: 'fever, cough, chest tightness',
      symptomNotes: 'Fever for three days, cough worse at night, mild chest tightness today',
      chronicConditions: 'hypertension',
      medications: 'acetaminophen',
      allergies: 'none'
    }
  },
  'mild-observation': {
    en: {
      title: 'Mild Home Observation Case',
      patientName: 'Xiaoming',
      region: 'University town area',
      symptoms: 'sore throat',
      symptomNotes: 'Mild sore throat since this morning, no fever, able to eat',
      medications: 'none',
      allergies: 'none'
    }
  },
  'urgent-red-flag': {
    en: {
      title: 'Urgent Escalation Case',
      patientName: 'Mr. Lin',
      region: 'Rural health station',
      symptoms: 'cough, chest tightness',
      symptomNotes: 'Breathing is getting harder and the chest feels tighter today',
      chronicConditions: 'asthma',
      medications: 'none',
      allergies: 'none'
    }
  }
}

function localizeSymptomLabel(symptom: string, locale: Locale) {
  return symptomLabels[symptom]?.[locale] || symptom
}

function localizeDepartment(text: string, locale: Locale) {
  return departmentLabels[text]?.[locale] || text
}

function localizeComboReason(reason: string, locale: Locale) {
  if (reason.startsWith('症状组合 ')) {
    const parts = reason.replace('症状组合 ', '').split('+')
    const localizedParts = parts.map((part) => {
      const entry = Object.entries(symptomLabels).find(([, labels]) => labels.zh === part)
      return entry ? entry[1][locale] : part
    })
    return locale === 'zh'
      ? `症状组合 ${localizedParts.join('+')}`
      : `Symptom combination ${localizedParts.join(' + ')}`
  }

  if (reason.endsWith('合并高龄')) {
    const prefix = reason.replace('合并高龄', '')
    const entry = Object.entries(symptomLabels).find(([, labels]) => labels.zh === prefix)
    const localized = entry ? entry[1][locale] : prefix
    return locale === 'zh' ? `${localized}合并高龄` : `${localized} plus older age`
  }

  if (reason.endsWith('合并其他症状')) {
    const prefix = reason.replace('合并其他症状', '')
    const entry = Object.entries(symptomLabels).find(([, labels]) => labels.zh === prefix)
    const localized = entry ? entry[1][locale] : prefix
    return locale === 'zh' ? `${localized}合并其他症状` : `${localized} with additional symptoms`
  }

  return reason
}

export function localizeScoreDetail(detail: ScoreDetail, locale: Locale): ScoreDetail {
  if (detail.type === 'base' && detail.symptom) {
    return {
      ...detail,
      symptom: localizeSymptomLabel(detail.symptom, locale)
    }
  }

  if (detail.reason) {
    return {
      ...detail,
      reason: modifierLabels[detail.reason]?.[locale] || localizeComboReason(detail.reason, locale)
    }
  }

  return detail
}

function buildLocalizedReasoning(raw: RiskAssessment, locale: Locale): string[] {
  const assessment = raw as AssessmentRuntimeFields
  const reasons: string[] = []
  const localizedDetails = raw.scoreBreakdown.details.map((detail) => localizeScoreDetail(detail, locale))
  const baseDetails = localizedDetails.filter((detail) => detail.type === 'base')
  const modifierDetails = localizedDetails.filter((detail) => detail.type === 'modifier')
  const comboDetails = localizedDetails.filter((detail) => detail.type === 'combination')

  if (raw.redFlags.length > 0) {
    reasons.push(locale === 'zh'
      ? '检测到需要优先线下评估的危险信号。'
      : 'Red flags suggest the patient needs urgent in-person assessment.')
  }

  if (baseDetails.length > 0) {
    const items = baseDetails.map((detail) => `${detail.symptom}(+${detail.value})`)
    reasons.push(locale === 'zh'
      ? `症状基础分：${items.join('、')}。`
      : `Base symptom score: ${items.join(', ')}.`)
  }

  if (modifierDetails.length > 0) {
    const items = modifierDetails.map((detail) => `${detail.reason}(+${detail.value})`)
    reasons.push(locale === 'zh'
      ? `风险修正：${items.join('、')}。`
      : `Risk modifiers: ${items.join(', ')}.`)
  }

  if (comboDetails.length > 0) {
    const items = comboDetails.map((detail) => `${detail.reason}(+${detail.value})`)
    reasons.push(locale === 'zh'
      ? `组合加成：${items.join('、')}。`
      : `Combination bonus: ${items.join(', ')}.`)
  }

  if (raw.riskLevel === 'Level 2') {
    reasons.push(locale === 'zh'
      ? '综合评分建议24小时内线下就医。'
      : 'The overall score suggests an in-person visit within 24 hours.')

    if (assessment.symptomsWorsening) {
      reasons.push(locale === 'zh'
        ? '症状呈加重趋势，不适合继续单纯观察。'
        : 'Symptoms are worsening, so watchful waiting is not enough.')
    }
  }

  if (raw.riskLevel === 'Level 3') {
    reasons.push(locale === 'zh'
      ? '当前未见明显红旗症状，但仍建议门诊进一步评估。'
      : 'No major red flags are visible right now, but outpatient evaluation is still recommended.')
  }

  if (raw.riskLevel === 'Level 4') {
    reasons.push(locale === 'zh'
      ? '当前信息显示症状较轻，可先短期观察并记录变化。'
      : 'The current information suggests mild symptoms that can be observed for a short period with tracking.')
  }

  return reasons
}

function buildLocalizedImmediateSteps(riskLevel: RiskAssessment['riskLevel'], locale: Locale): string[] {
  if (riskLevel === 'Level 1') {
    return locale === 'zh'
      ? ['尽快前往最近急诊或呼叫急救支持。', '避免独自前往，尽量由家属陪同。', '携带当前用药和既往病史信息。']
      : ['Go to the nearest emergency department or call emergency support immediately.', 'Avoid going alone if possible and ask a family member to accompany the patient.', 'Bring current medications and medical history information.']
  }

  if (riskLevel === 'Level 2') {
    return locale === 'zh'
      ? ['建议在 24 小时内完成线下就医。', '持续记录体温、呼吸和症状变化。', '如胸痛、呼吸困难加重，请立即升级为急诊处理。']
      : ['Arrange an in-person visit within 24 hours.', 'Continue tracking temperature, breathing, and symptom changes.', 'If chest pain or breathing difficulty worsens, escalate to emergency care immediately.']
  }

  if (riskLevel === 'Level 3') {
    return locale === 'zh'
      ? ['尽快预约普通门诊或全科门诊。', '准备好症状变化和既往病史，便于医生快速判断。']
      : ['Schedule a standard outpatient or general practice visit soon.', 'Prepare symptom changes and medical history so the clinician can assess more quickly.']
  }

  return locale === 'zh'
    ? ['先居家观察 24-48 小时。', '补充休息和水分，持续记录体温和症状变化。', '若出现加重或新危险信号，请立即线下就医。']
    : ['Observe at home for 24 to 48 hours first.', 'Focus on rest, hydration, and tracking temperature and symptom changes.', 'Seek in-person care immediately if symptoms worsen or new red flags appear.']
}

export function localizeRiskAssessment(raw: RiskAssessment, locale: Locale): RiskAssessment {
  return {
    ...raw,
    actionLabel: pick(actionLabels[raw.riskLevel], locale),
    suggestedDepartment: localizeDepartment(raw.suggestedDepartment, locale),
    redFlags: raw.redFlags.map((flag) => redFlagLabels[flag]?.[locale] || flag),
    reasoning: buildLocalizedReasoning(raw, locale),
    immediateSteps: buildLocalizedImmediateSteps(raw.riskLevel, locale),
    doctorQuestions: raw.doctorQuestions.map((question) => doctorQuestionLabels[question]?.[locale] || question),
    warning: locale === 'zh'
      ? '本结果仅用于就医前辅助判断，不能替代医生面诊、检查或正式诊断。'
      : 'This result is for pre-visit guidance only and does not replace an in-person clinical assessment, testing, or formal diagnosis.',
    scoreBreakdown: {
      ...raw.scoreBreakdown,
      details: raw.scoreBreakdown.details.map((detail) => localizeScoreDetail(detail, locale))
    }
  }
}

export function localizeVisitSummary(rawSession: Session, localizedAssessment: RiskAssessment, locale: Locale): VisitSummary {
  const assessment = rawSession.assessment as AssessmentRuntimeFields
  const symptomList = assessment.symptoms || []
  const symptomText = symptomList.length
    ? symptomList.map((symptom: string) => localizeSymptomLabel(symptom, locale)).join(locale === 'zh' ? '、' : ', ')
    : locale === 'zh'
      ? '未填写'
      : 'Not provided'
  const patientName = rawSession.intake.patientName || (locale === 'zh' ? '未署名' : 'Unnamed patient')
  const age = rawSession.intake.age ?? (locale === 'zh' ? '未知' : 'Unknown')
  const history = rawSession.intake.chronicConditions?.length
    ? rawSession.intake.chronicConditions.join(locale === 'zh' ? '、' : ', ')
    : locale === 'zh'
      ? '无明确慢病史'
      : 'No clear chronic condition history'
  const associatedSymptoms = rawSession.intake.symptomNotes || (locale === 'zh' ? '未填写详细症状说明' : 'No detailed symptom notes provided')
  const currentMedication = rawSession.intake.medications || (locale === 'zh' ? '未填写' : 'Not provided')
  const allergies = rawSession.intake.allergies || (locale === 'zh' ? '未填写' : 'Not provided')
  const riskNotes = localizedAssessment.redFlags.length
    ? localizedAssessment.redFlags.join(locale === 'zh' ? '；' : '; ')
    : locale === 'zh'
      ? '当前未识别明确红旗症状'
      : 'No clear red flags were identified from the current information'
  const onset = locale === 'zh'
    ? `${rawSession.intake.symptomDays || '未知'} 天前开始出现症状`
    : `Symptoms began about ${rawSession.intake.symptomDays || 'an unknown number of'} day(s) ago`
  const chiefComplaint = locale === 'zh'
    ? `患者因${symptomText || '不适'}就诊`
    : `Visit for ${symptomText || 'general discomfort'}`
  const summaryText = locale === 'zh'
    ? `患者 ${patientName}，${age} 岁，主诉为${symptomText || '多项不适'}，病程约 ${rawSession.intake.symptomDays || '未知'} 天。风险评分：${localizedAssessment.scoreBreakdown?.total ?? '未计算'}分；当前分诊建议为：${localizedAssessment.actionLabel}；建议科室：${localizedAssessment.suggestedDepartment}。既往病史：${history}。`
    : `Patient ${patientName}, age ${age}, presents with ${symptomText || 'multiple concerns'} and a symptom duration of about ${rawSession.intake.symptomDays || 'an unknown number of'} day(s). Risk score: ${localizedAssessment.scoreBreakdown?.total ?? 'not calculated'}. Recommended action: ${localizedAssessment.actionLabel}. Suggested department: ${localizedAssessment.suggestedDepartment}. Medical history: ${history}.`

  return {
    chiefComplaint,
    onset,
    mainSymptoms: symptomText,
    associatedSymptoms,
    medicalHistory: history,
    currentMedication,
    allergies,
    riskNotes,
    suggestedDepartment: localizedAssessment.suggestedDepartment,
    doctorQuestions: localizedAssessment.doctorQuestions,
    summaryText
  }
}

export function localizeSession(rawSession: Session, locale: Locale): Session {
  const assessment = localizeRiskAssessment(rawSession.assessment, locale)

  return {
    ...rawSession,
    assessment,
    summary: localizeVisitSummary(rawSession, assessment, locale)
  }
}

export function localizeSessionSummary(summary: SessionSummary, locale: Locale): SessionSummary {
  return {
    ...summary,
    patientName: summary.patientName === 'Unnamed patient' || summary.patientName === '未署名'
      ? (locale === 'zh' ? '未署名' : 'Unnamed patient')
      : summary.patientName,
    region: summary.region === 'Unknown region' || summary.region === '未知地区'
      ? (locale === 'zh' ? '未知地区' : 'Unknown region')
      : summary.region,
    actionLabel: actionLabels[summary.riskLevel]?.[locale] || summary.actionLabel,
    suggestedDepartment: localizeDepartment(summary.suggestedDepartment, locale),
    symptoms: summary.symptoms.map((symptom) => localizeSymptomLabel(symptom, locale))
  }
}

export function localizeAdminSessionSummary(summary: AdminSessionSummary, locale: Locale): AdminSessionSummary {
  const localized = localizeSessionSummary(summary, locale)

  return {
    ...summary,
    ...localized,
    redFlags: summary.redFlags.map((flag) => redFlagLabels[flag]?.[locale] || flag)
  }
}

const doctorStatusLabels: Record<string, LocalizedText> = {
  'new': { zh: '新病例', en: 'New' },
  'under_review': { zh: '审阅中', en: 'Under Review' },
  'awaiting_patient_reply': { zh: '等待患者', en: 'Awaiting Patient' },
  'follow_up_recommended': { zh: '建议随访', en: 'Follow-up Recommended' },
  'ready_for_visit': { zh: '可就诊', en: 'Ready for Visit' },
  'resolved': { zh: '已处理', en: 'Resolved' },
  'escalated': { zh: '已转诊', en: 'Escalated' }
}

const conversationStateLabels: Record<string, LocalizedText> = {
  'none': { zh: '无对话', en: 'No Conversation' },
  'waiting_doctor': { zh: '等待医生', en: 'Waiting Doctor' },
  'waiting_patient': { zh: '等待患者', en: 'Waiting Patient' },
  'active': { zh: '进行中', en: 'Active' },
  'closed': { zh: '已结束', en: 'Closed' }
}

const priorityLabels: Record<string, LocalizedText> = {
  'low': { zh: '低', en: 'Low' },
  'normal': { zh: '普通', en: 'Normal' },
  'high': { zh: '高', en: 'High' },
  'urgent': { zh: '紧急', en: 'Urgent' }
}

export function localizeDoctorStatus(status: string, locale: Locale): string {
  return doctorStatusLabels[status]?.[locale] || status
}

export function localizeConversationState(state: string, locale: Locale): string {
  return conversationStateLabels[state]?.[locale] || state
}

export function localizePriority(priority: string, locale: Locale): string {
  return priorityLabels[priority]?.[locale] || priority
}

export function localizeDoctorSessionSummary(summary: DoctorSessionSummary, locale: Locale): DoctorSessionSummary {
  const localized = localizeSessionSummary(summary, locale)

  return {
    ...summary,
    ...localized,
    redFlags: summary.redFlags.map((flag) => redFlagLabels[flag]?.[locale] || flag)
  }
}

function localizeOption(questionId: string, option: QuestionOption, locale: Locale): QuestionOption {
  const question = questionCatalog[questionId]
  return {
    ...option,
    label: question?.options?.[option.value]?.[locale] || option.label
  }
}

export function localizeFollowUpQuestions(questions: FollowUpQuestion[], locale: Locale): FollowUpQuestion[] {
  return questions.map((question) => ({
    ...question,
    label: questionCatalog[question.id]?.label[locale] || question.label,
    placeholder: questionCatalog[question.id]?.placeholder?.[locale] || question.placeholder,
    options: question.options?.map((option) => localizeOption(question.id, option, locale))
  }))
}

export function localizeValidationMessage(message: string, locale: Locale): string {
  return validationMessages[message]?.[locale] || message
}

export function localizePreset(preset: DemoPreset, locale: Locale): DemoPreset {
  const override = presetOverrides[preset.id]?.[locale]
  if (!override) return preset

  return {
    ...preset,
    ...override
  }
}
