import type { Locale } from '@/types'

type MessageValue = string | Record<Locale, string>

export const messages = {
  app: {
    footer: {
      zh: 'CareBridge / 医路桥 — 医疗支持应始于患者到达医生之前',
      en: 'CareBridge / MedBridge — Support should begin before the patient reaches the doctor'
    }
  },
  nav: {
    badgeInfo: {
      zh: '就医前辅助工具',
      en: 'Pre-Visit Care Assistant'
    },
    badgeWarn: {
      zh: '非诊断工具',
      en: 'Non-Diagnostic Tool'
    },
    languageToggle: {
      zh: '语言切换',
      en: 'Language switch'
    },
    userSide: {
      zh: '患者端',
      en: 'Patient'
    },
    adminSide: {
      zh: '管理端',
      en: 'Admin'
    }
  },
  common: {
    loading: {
      zh: '加载中...',
      en: 'Loading...'
    },
    back: {
      zh: '返回',
      en: 'Back'
    },
    refresh: {
      zh: '刷新',
      en: 'Refresh'
    },
    reset: {
      zh: '重置',
      en: 'Reset'
    },
    copy: {
      zh: '复制',
      en: 'Copy'
    },
    download: {
      zh: '下载',
      en: 'Download'
    },
    print: {
      zh: '打印',
      en: 'Print'
    },
    generateAssessment: {
      zh: '生成评估',
      en: 'Generate Assessment'
    },
    startAssessment: {
      zh: '开始评估',
      en: 'Start Assessment'
    },
    assessing: {
      zh: '评估中...',
      en: 'Assessing...'
    },
    choose: {
      zh: '请选择',
      en: 'Please select'
    },
    unnamedPatient: {
      zh: '未署名',
      en: 'Unnamed patient'
    },
    unknownRegion: {
      zh: '未知地区',
      en: 'Unknown region'
    },
    noneProvided: {
      zh: '未填写',
      en: 'Not provided'
    },
    noSpecificHistory: {
      zh: '无明确慢病史',
      en: 'No clear chronic condition history'
    }
  },
  locale: {
    zh: '中文',
    en: 'English'
  },
  stepper: {
    intake: {
      zh: '录入',
      en: 'Intake'
    },
    followUp: {
      zh: '追问',
      en: 'Follow-up'
    },
    result: {
      zh: '结果',
      en: 'Result'
    }
  },
  intake: {
    title: {
      zh: '患者信息录入',
      en: 'Patient Intake'
    },
    desc: {
      zh: '填写基本信息与症状描述，获取分诊建议',
      en: 'Capture patient context and symptoms to receive triage guidance'
    },
    sectionBasic: {
      zh: '基本信息',
      en: 'Basic Information'
    },
    sectionSymptoms: {
      zh: '症状描述',
      en: 'Symptoms'
    },
    sectionMedication: {
      zh: '用药与过敏',
      en: 'Medication and Allergies'
    },
    patientName: {
      zh: '患者姓名',
      en: 'Patient Name'
    },
    patientNamePlaceholder: {
      zh: '如：张阿姨',
      en: 'e.g. Auntie Chen'
    },
    age: {
      zh: '年龄',
      en: 'Age'
    },
    agePlaceholder: {
      zh: '如：63',
      en: 'e.g. 63'
    },
    gender: {
      zh: '性别',
      en: 'Gender'
    },
    region: {
      zh: '所在地区',
      en: 'Region'
    },
    regionPlaceholder: {
      zh: '如：县城诊所周边',
      en: 'e.g. County clinic area'
    },
    chronicConditions: {
      zh: '慢性病史',
      en: 'Chronic Conditions'
    },
    chronicConditionsPlaceholder: {
      zh: '如：高血压、糖尿病',
      en: 'e.g. hypertension, diabetes'
    },
    symptoms: {
      zh: '主要症状',
      en: 'Primary Symptoms'
    },
    symptomsPlaceholder: {
      zh: '多个症状用逗号分隔，如：发热、咳嗽、胸闷',
      en: 'Separate multiple symptoms with commas, e.g. fever, cough, chest tightness'
    },
    symptomHint: {
      zh: '支持中英文症状描述',
      en: 'Chinese and English symptom descriptions are supported'
    },
    symptomNotes: {
      zh: '症状详细描述',
      en: 'Symptom Details'
    },
    symptomNotesPlaceholder: {
      zh: '描述症状的具体表现，如：发热三天，夜间咳嗽加重，今日出现轻微胸闷',
      en: 'Describe the symptom pattern, e.g. fever for three days, cough worse at night, mild chest tightness today'
    },
    symptomDays: {
      zh: '症状持续天数',
      en: 'Days With Symptoms'
    },
    symptomDaysPlaceholder: {
      zh: '如：3',
      en: 'e.g. 3'
    },
    severity: {
      zh: '自评严重程度',
      en: 'Self-Rated Severity'
    },
    medications: {
      zh: '当前用药',
      en: 'Current Medication'
    },
    medicationsPlaceholder: {
      zh: '如：降压药',
      en: 'e.g. blood pressure medication'
    },
    allergies: {
      zh: '过敏史',
      en: 'Allergies'
    },
    allergiesPlaceholder: {
      zh: '如：青霉素',
      en: 'e.g. penicillin'
    },
    statusAssessing: {
      zh: '正在评估初始信息...',
      en: 'Assessing the initial information...'
    },
    statusNeedMore: {
      zh: '需要补充更多信息。',
      en: 'More information is required.'
    },
    statusDone: {
      zh: '评估完成。',
      en: 'Assessment complete.'
    },
    statusNetworkError: {
      zh: '网络请求失败，请检查连接后重试。',
      en: 'Request failed. Please check the connection and try again.'
    },
    statusReset: {
      zh: '流程已重置，可以录入新患者。',
      en: 'The flow has been reset and is ready for a new patient.'
    },
    statusPresetLoaded: {
      zh: '已加载预设：{title}',
      en: 'Preset loaded: {title}'
    }
  },
  gender: {
    empty: {
      zh: '请选择',
      en: 'Select'
    },
    male: {
      zh: '男',
      en: 'Male'
    },
    female: {
      zh: '女',
      en: 'Female'
    },
    other: {
      zh: '其他',
      en: 'Other'
    }
  },
  severity: {
    mild: {
      zh: '轻度',
      en: 'Mild'
    },
    moderate: {
      zh: '中度',
      en: 'Moderate'
    },
    severe: {
      zh: '重度',
      en: 'Severe'
    }
  },
  followUp: {
    title: {
      zh: '补充追问',
      en: 'Follow-up Questions'
    },
    desc: {
      zh: '完善风险评估所需的关键信息',
      en: 'Capture the missing context needed to complete the risk assessment'
    },
    back: {
      zh: '返回录入',
      en: 'Back to Intake'
    },
    status: {
      zh: '这些信息将完善风险评估中缺失的关键内容。',
      en: 'These answers fill the critical gaps that affect the risk assessment.'
    }
  },
  result: {
    title: {
      zh: '分诊结果',
      en: 'Triage Result'
    },
    desc: {
      zh: '查看风险评估与就诊建议',
      en: 'Review risk assessment and next-step guidance'
    },
    riskTab: {
      zh: '风险分级',
      en: 'Risk Level'
    },
    summaryTab: {
      zh: '就诊摘要',
      en: 'Visit Summary'
    },
    followupTab: {
      zh: '随访记录',
      en: 'Follow-up'
    },
    scoreTitle: {
      zh: '风险评分',
      en: 'Risk Score'
    },
    reasoningTitle: {
      zh: '分级依据',
      en: 'Why this level'
    },
    stepsTitle: {
      zh: '即时建议',
      en: 'Immediate Steps'
    }
  },
  summary: {
    kicker: {
      zh: '就诊摘要',
      en: 'Visit Summary'
    },
    heading: {
      zh: '可打印的医生交接摘要',
      en: 'Printable doctor handoff summary'
    },
    promptsHeading: {
      zh: '医生提示 — 就诊时请告知医生',
      en: 'Doctor prompts — information to share during the visit'
    },
    chiefComplaint: {
      zh: '主诉',
      en: 'Chief Complaint'
    },
    onset: {
      zh: '起病时间',
      en: 'Onset'
    },
    mainSymptoms: {
      zh: '主要症状',
      en: 'Main Symptoms'
    },
    associatedSymptoms: {
      zh: '伴随症状',
      en: 'Associated Symptoms'
    },
    medicalHistory: {
      zh: '既往病史',
      en: 'Medical History'
    },
    currentMedication: {
      zh: '当前用药',
      en: 'Current Medication'
    },
    allergies: {
      zh: '过敏史',
      en: 'Allergies'
    },
    riskNotes: {
      zh: '风险提示',
      en: 'Risk Notes'
    },
    suggestedDepartment: {
      zh: '建议科室',
      en: 'Suggested Department'
    },
    copied: {
      zh: '摘要已复制',
      en: 'Summary copied'
    },
    copyFailed: {
      zh: '复制失败',
      en: 'Copy failed'
    },
    exportTitle: {
      zh: 'CareBridge / 医路桥 就诊摘要',
      en: 'CareBridge Visit Summary'
    },
    exportPatient: {
      zh: '患者',
      en: 'Patient'
    },
    exportAge: {
      zh: '年龄',
      en: 'Age'
    },
    exportRegion: {
      zh: '地区',
      en: 'Region'
    },
    exportRiskLevel: {
      zh: '风险等级',
      en: 'Risk Level'
    },
    exportAction: {
      zh: '行动建议',
      en: 'Action'
    },
    exportDepartment: {
      zh: '建议科室',
      en: 'Suggested Department'
    },
    exportImmediateSteps: {
      zh: '即时建议：',
      en: 'Immediate Steps:'
    },
    exportDoctorPrompts: {
      zh: '医生提示：',
      en: 'Doctor Prompts:'
    },
    exportDisclaimer: {
      zh: '免责声明：',
      en: 'Disclaimer:'
    }
  },
  followupLog: {
    temperature: {
      zh: '当前体温 (°C)',
      en: 'Current Temperature (°C)'
    },
    temperaturePlaceholder: {
      zh: '例如：38.1',
      en: 'e.g. 38.1'
    },
    symptomChange: {
      zh: '症状变化',
      en: 'Symptom Change'
    },
    symptomChangePlaceholder: {
      zh: '例如：咳嗽减轻',
      en: 'e.g. less coughing'
    },
    medicationTaken: {
      zh: '已服药物',
      en: 'Medication Taken'
    },
    medicationTakenPlaceholder: {
      zh: '例如：对乙酰氨基酚',
      en: 'e.g. acetaminophen'
    },
    note: {
      zh: '随访备注',
      en: 'Follow-up Note'
    },
    notePlaceholder: {
      zh: '例如：今晚可以休息',
      en: 'e.g. able to rest tonight'
    },
    save: {
      zh: '保存随访',
      en: 'Save Follow-up'
    },
    reload: {
      zh: '刷新病例',
      en: 'Refresh Case'
    },
    saved: {
      zh: '随访已保存',
      en: 'Follow-up saved'
    },
    saveFailed: {
      zh: '保存失败，请重试',
      en: 'Save failed. Please try again.'
    },
    reloaded: {
      zh: '已刷新',
      en: 'Case refreshed'
    },
    reloadFailed: {
      zh: '刷新失败',
      en: 'Refresh failed'
    },
    empty: {
      zh: '暂无随访记录，观察患者后可在此保存',
      en: 'No follow-up records yet. Save observations here after monitoring the patient.'
    },
    tempPrefix: {
      zh: '体温',
      en: 'Temp'
    },
    changePrefix: {
      zh: '变化',
      en: 'Change'
    },
    medicationPrefix: {
      zh: '用药',
      en: 'Medication'
    },
    notePrefix: {
      zh: '备注',
      en: 'Note'
    }
  },
  sidebar: {
    presetsTitle: {
      zh: '快速体验',
      en: 'Quick Demo'
    },
    presetsLoad: {
      zh: '加载 →',
      en: 'Load →'
    },
    sessionsTitle: {
      zh: '最近记录',
      en: 'Recent Cases'
    },
    noSessions: {
      zh: '暂无记录，完成评估后将显示在此处',
      en: 'No records yet. Completed assessments will appear here.'
    },
    followupCount: {
      zh: '{count} 条随访',
      en: '{count} follow-ups'
    }
  },
  disclaimer: {
    title: {
      zh: '医疗免责声明',
      en: 'Medical Disclaimer'
    },
    body: {
      zh: '本工具仅用于就医前辅助判断，不能替代医生面诊。如有疑问请立即就医。',
      en: 'This tool supports pre-visit decision-making only and does not replace a clinician. Seek in-person care when in doubt.'
    }
  },
  sessionView: {
    titleSuffix: {
      zh: ' 的病例',
      en: '\'s case'
    },
    notFound: {
      zh: '未找到该病例',
      en: 'Case not found'
    },
    backHome: {
      zh: '返回工作台',
      en: 'Back to Workspace'
    }
  },
  landing: {
    badge: {
      zh: '就医前辅助工具 · 非诊断系统',
      en: 'Pre-Visit Assistant · Not a Diagnostic Tool'
    },
    subtitle: {
      zh: '让更多人更早、更有准备地进入医疗系统',
      en: 'Helping patients enter healthcare earlier and more prepared'
    },
    description: {
      zh: 'CareBridge 帮助患者在正式就医前整理症状、识别风险、选择科室，并生成结构化病情摘要，让医生更快理解你的情况。',
      en: 'CareBridge helps patients organize symptoms, assess urgency, choose the right department, and generate a structured summary before seeing a doctor.'
    },
    ctaUser: {
      zh: '开始症状评估',
      en: 'Start Symptom Assessment'
    },
    ctaAdmin: {
      zh: '进入管理后台',
      en: 'Open Admin Panel'
    },
    featureTriageTitle: {
      zh: '结构化分诊',
      en: 'Structured Triage'
    },
    featureTriageDesc: {
      zh: '通过引导式问询收集症状信息，避免遗漏关键细节',
      en: 'Guided questions capture symptom details without missing key context'
    },
    featureRiskTitle: {
      zh: '风险分级',
      en: 'Risk Stratification'
    },
    featureRiskDesc: {
      zh: '四级风险评估，优先识别危险信号，保守建议',
      en: 'Four-level risk assessment with red-flag detection and conservative guidance'
    },
    featureSummaryTitle: {
      zh: '病情摘要',
      en: 'Visit Summary'
    },
    featureSummaryDesc: {
      zh: '自动生成可打印的医生交接摘要，提升就诊效率',
      en: 'Auto-generated printable handoff summary for faster clinical intake'
    },
    featureFollowupTitle: {
      zh: '随访追踪',
      en: 'Follow-up Tracking'
    },
    featureFollowupDesc: {
      zh: '记录症状变化与用药情况，持续观察病情走向',
      en: 'Track symptom changes and medication over time'
    },
    safetyTitle: {
      zh: '安全边界',
      en: 'Safety Boundary'
    },
    safetyText: {
      zh: 'CareBridge 不提供医学诊断，不替代医生面诊。当系统检测到危险信号时，会优先建议立即就医。本工具仅用于就医前的信息整理与辅助判断。',
      en: 'CareBridge does not provide medical diagnoses and does not replace a clinician. When red flags are detected, the system prioritizes immediate care recommendations. This tool is for pre-visit preparation only.'
    }
  },
  admin: {
    title: {
      zh: '管理后台',
      en: 'Admin Panel'
    },
    desc: {
      zh: '查看和管理已存储的患者分诊记录',
      en: 'Review and manage stored patient triage records'
    },
    searchPlaceholder: {
      zh: '搜索患者姓名、地区或症状...',
      en: 'Search patient name, region, or symptoms...'
    },
    noResults: {
      zh: '未找到匹配的记录',
      en: 'No matching records found'
    },
    noSessions: {
      zh: '暂无分诊记录',
      en: 'No triage records yet'
    },
    colPatient: {
      zh: '患者',
      en: 'Patient'
    },
    colAge: {
      zh: '年龄',
      en: 'Age'
    },
    colSymptoms: {
      zh: '症状',
      en: 'Symptoms'
    },
    colRisk: {
      zh: '风险',
      en: 'Risk'
    },
    colDepartment: {
      zh: '建议科室',
      en: 'Department'
    },
    colDate: {
      zh: '时间',
      en: 'Date'
    },
    colFollowUps: {
      zh: '随访',
      en: 'Follow-ups'
    },
    viewDetail: {
      zh: '查看详情',
      en: 'View Detail'
    },
    backToList: {
      zh: '返回列表',
      en: 'Back to List'
    },
    yearsOld: {
      zh: '岁',
      en: 'years old'
    },
    intakeData: {
      zh: '患者录入信息',
      en: 'Patient Intake Data'
    },
    assessment: {
      zh: '评估结果',
      en: 'Assessment Result'
    },
    actionLabel: {
      zh: '行动建议',
      en: 'Action Recommendation'
    },
    visitSummary: {
      zh: '就诊摘要',
      en: 'Visit Summary'
    },
    followUpHistory: {
      zh: '随访记录',
      en: 'Follow-up History'
    }
  }
} as const

function getMessageValue(path: string): MessageValue | undefined {
  let current: unknown = messages

  for (const key of path.split('.')) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current as MessageValue | undefined
}

export function translateMessage(path: string, locale: Locale, params?: Record<string, string | number>): string {
  const value = getMessageValue(path)
  let message = ''

  if (typeof value === 'string') {
    message = value
  } else if (value && typeof value === 'object' && locale in value) {
    message = value[locale]
  } else {
    message = path
  }

  if (!params) return message

  return Object.entries(params).reduce((output, [key, param]) => {
    return output.replace(new RegExp(`\\{${key}\\}`, 'g'), String(param))
  }, message)
}
