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
    },
    doctorSide: {
      zh: '医生端',
      en: 'Doctor'
    },
    login: {
      zh: '登录',
      en: 'Login'
    },
    logout: {
      zh: '退出',
      en: 'Logout'
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
    },
    intakeDesc: {
      zh: '填写患者基本信息与症状',
      en: 'Fill in patient info and symptoms'
    },
    followUpDesc: {
      zh: '补充评估所需的额外信息',
      en: 'Provide additional details for assessment'
    },
    resultDesc: {
      zh: '查看风险评估与就诊建议',
      en: 'Review risk level and care guidance'
    },
    currentStage: {
      zh: '当前阶段',
      en: 'Current Stage'
    },
    completed: {
      zh: '已完成',
      en: 'Completed'
    },
    pending: {
      zh: '待完成',
      en: 'Pending'
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
    },
    symptomCategories: {
      zh: '常见症状类别',
      en: 'Common Symptom Categories'
    },
    catRespiratory: {
      zh: '呼吸道',
      en: 'Respiratory'
    },
    catRespiratoryExamples: {
      zh: '发热、咳嗽、咽痛、呼吸困难',
      en: 'fever, cough, sore throat, shortness of breath'
    },
    catDigestive: {
      zh: '消化系统',
      en: 'Digestive'
    },
    catDigestiveExamples: {
      zh: '腹痛、腹泻、呕吐',
      en: 'abdominal pain, diarrhea, vomiting'
    },
    catPain: {
      zh: '疼痛',
      en: 'Pain'
    },
    catPainExamples: {
      zh: '头痛、胸痛、胸闷',
      en: 'headache, chest pain, chest tightness'
    },
    catGeneral: {
      zh: '全身',
      en: 'General'
    },
    catGeneralExamples: {
      zh: '头晕、皮疹、出血',
      en: 'dizziness, rash, bleeding'
    },
    sectionComplete: {
      zh: '已填写',
      en: 'Complete'
    },
    sectionIncomplete: {
      zh: '待填写',
      en: 'Incomplete'
    },
    careJourneyTitle: {
      zh: '就诊准备',
      en: 'Care Preparation'
    },
    careJourneyDesc: {
      zh: '了解当前阶段和下一步',
      en: 'Understand your stage and next steps'
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
    },
    urgencyEmergency: {
      zh: '紧急',
      en: 'Emergency'
    },
    urgencyUrgent: {
      zh: '较紧急',
      en: 'Urgent'
    },
    urgencySoon: {
      zh: '建议就诊',
      en: 'Recommended'
    },
    urgencyObserve: {
      zh: '居家观察',
      en: 'Observe'
    },
    careTiming: {
      zh: '建议就诊时间',
      en: 'Recommended Timing'
    },
    timingImmediate: {
      zh: '立即前往急诊',
      en: 'Go to ER immediately'
    },
    timing24h: {
      zh: '24 小时内就诊',
      en: 'Visit within 24 hours'
    },
    timingSchedule: {
      zh: '预约门诊即可',
      en: 'Schedule an outpatient visit'
    },
    timingObserve: {
      zh: '居家观察 24-48 小时',
      en: 'Observe at home for 24-48 hours'
    },
    whatWeKnow: {
      zh: '已知信息',
      en: 'What We Know'
    },
    whatToDoNext: {
      zh: '下一步行动',
      en: 'What To Do Next'
    },
    preparationChecklist: {
      zh: '就诊准备清单',
      en: 'Visit Preparation Checklist'
    },
    checklistItems: {
      zh: '准备清单项目',
      en: 'Checklist items'
    },
    bringTitle: {
      zh: '就诊携带物品',
      en: 'What to Bring'
    },
    bringId: {
      zh: '身份证 / 医保卡',
      en: 'ID card / insurance card'
    },
    bringMedHistory: {
      zh: '既往病历和检查报告',
      en: 'Previous medical records and test results'
    },
    bringMedList: {
      zh: '当前用药清单',
      en: 'List of current medications'
    },
    bringSymptomNotes: {
      zh: '症状记录（时间、变化）',
      en: 'Symptom notes (timing, changes)'
    },
    bringTempLog: {
      zh: '体温记录',
      en: 'Temperature log'
    },
    warningSignsTitle: {
      zh: '需要立即就医的危险信号',
      en: 'Warning Signs — Seek Immediate Care'
    },
    warningBreathing: {
      zh: '呼吸困难明显加重',
      en: 'Breathing difficulty significantly worsens'
    },
    warningChestPain: {
      zh: '持续或加重的胸痛',
      en: 'Persistent or worsening chest pain'
    },
    warningConsciousness: {
      zh: '意识模糊或嗜睡',
      en: 'Confusion or drowsiness'
    },
    warningHighFever: {
      zh: '持续高热不退（≥39°C）',
      en: 'Persistent high fever (≥39°C)'
    },
    warningBleeding: {
      zh: '不明原因出血',
      en: 'Unexplained bleeding'
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
    },
    whatToTellDoctor: {
      zh: '就诊时请告知医生',
      en: 'Tell Your Doctor During the Visit'
    },
    tellSymptomStart: {
      zh: '症状最早出现的时间',
      en: 'When symptoms first appeared'
    },
    tellSymptomChange: {
      zh: '症状是如何变化的',
      en: 'How symptoms have changed'
    },
    tellWhatTried: {
      zh: '已尝试的处理方式和效果',
      en: 'What remedies were tried and their effect'
    },
    tellWorsening: {
      zh: '什么情况下症状会加重',
      en: 'What makes symptoms worse'
    },
    tellAllergies: {
      zh: '所有已知过敏史',
      en: 'All known allergies'
    },
    handoffBrief: {
      zh: '交接摘要',
      en: 'Handoff Brief'
    },
    patientSnapshot: {
      zh: '患者概况',
      en: 'Patient Snapshot'
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
    },
    timelineTitle: {
      zh: '随访时间线',
      en: 'Follow-up Timeline'
    },
    trendImproving: {
      zh: '好转中',
      en: 'Improving'
    },
    trendStable: {
      zh: '稳定',
      en: 'Stable'
    },
    trendWorsening: {
      zh: '加重中',
      en: 'Worsening'
    },
    trendUnknown: {
      zh: '待观察',
      en: 'Monitoring'
    },
    entryCount: {
      zh: '共 {count} 条记录',
      en: '{count} records total'
    },
    latestEntry: {
      zh: '最近一次',
      en: 'Latest'
    },
    conversationTitle: {
      zh: '与医生沟通',
      en: 'Doctor Conversation'
    },
    conversationHint: {
      zh: '可在这里补充症状变化或向医生说明新的担忧，医生回复后会同步显示。',
      en: 'Use this thread to share symptom changes or new concerns. Doctor replies will appear here.'
    },
    reloadMessages: {
      zh: '刷新消息',
      en: 'Refresh Messages'
    },
    messageSent: {
      zh: '消息已发送',
      en: 'Message sent'
    },
    messageSendFailed: {
      zh: '消息发送失败，请稍后重试',
      en: 'Message failed to send. Please try again.'
    },
    messageReloadFailed: {
      zh: '消息刷新失败',
      en: 'Unable to refresh messages'
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
    ctaDoctor: {
      zh: '医生工作台',
      en: 'Doctor Dashboard'
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
    },
    dashboardTitle: {
      zh: '运营概览',
      en: 'Operations Overview'
    },
    totalSessions: {
      zh: '总病例数',
      en: 'Total Cases'
    },
    highRiskRecent: {
      zh: '近24h高风险',
      en: 'High Risk (24h)'
    },
    riskDistribution: {
      zh: '风险分布',
      en: 'Risk Distribution'
    },
    statusDistribution: {
      zh: '状态分布',
      en: 'Status Distribution'
    },
    urgentCases: {
      zh: '需关注病例',
      en: 'Cases Needing Attention'
    },
    filterByRisk: {
      zh: '按风险筛选',
      en: 'Filter by Risk'
    },
    filterByStatus: {
      zh: '按状态筛选',
      en: 'Filter by Status'
    },
    filterByTime: {
      zh: '按时间筛选',
      en: 'Filter by Time'
    },
    sortBy: {
      zh: '排序方式',
      en: 'Sort by'
    },
    sortDate: {
      zh: '最新优先',
      en: 'Newest First'
    },
    sortRisk: {
      zh: '风险优先',
      en: 'Highest Risk First'
    },
    sortFollowUps: {
      zh: '随访最多',
      en: 'Most Follow-ups'
    },
    allRisks: {
      zh: '全部风险',
      en: 'All Risks'
    },
    allStatuses: {
      zh: '全部状态',
      en: 'All Statuses'
    },
    allTime: {
      zh: '全部时间',
      en: 'All Time'
    },
    last24h: {
      zh: '近24小时',
      en: 'Last 24 hours'
    },
    last7d: {
      zh: '近7天',
      en: 'Last 7 days'
    },
    last30d: {
      zh: '近30天',
      en: 'Last 30 days'
    },
    statusNew: {
      zh: '新病例',
      en: 'New'
    },
    statusReviewed: {
      zh: '已审阅',
      en: 'Reviewed'
    },
    statusUrgent: {
      zh: '需紧急处理',
      en: 'Urgent'
    },
    statusResolved: {
      zh: '已处理',
      en: 'Resolved'
    },
    statusArchived: {
      zh: '已归档',
      en: 'Archived'
    },
    adminNote: {
      zh: '管理员备注',
      en: 'Admin Note'
    },
    adminNotePlaceholder: {
      zh: '添加内部备注...',
      en: 'Add internal note...'
    },
    adminStatus: {
      zh: '病例状态',
      en: 'Case Status'
    },
    sessionTags: {
      zh: '标签',
      en: 'Tags'
    },
    addTag: {
      zh: '添加标签',
      en: 'Add Tag'
    },
    saveNote: {
      zh: '保存备注',
      en: 'Save Note'
    },
    noteSaved: {
      zh: '备注已保存',
      en: 'Note saved'
    },
    noteSaveFailed: {
      zh: '备注保存失败，请重试',
      en: 'Unable to save note. Please try again.'
    },
    statusUpdated: {
      zh: '状态已更新',
      en: 'Status updated'
    },
    filtersActive: {
      zh: '{count} 个筛选条件已启用',
      en: '{count} filters active'
    },
    clearFilters: {
      zh: '清除筛选',
      en: 'Clear Filters'
    },
    noHighRisk: {
      zh: '近24小时无高风险病例',
      en: 'No high-risk cases in the last 24 hours'
    },
    sessionTimeline: {
      zh: '病例时间线',
      en: 'Case Timeline'
    },
    intakeTime: {
      zh: '录入时间',
      en: 'Intake Time'
    },
    lastFollowUp: {
      zh: '最近随访',
      en: 'Last Follow-up'
    },
    caseAge: {
      zh: '病例年龄',
      en: 'Case Age'
    },
    hoursAgo: {
      zh: '{hours} 小时前',
      en: '{hours}h ago'
    },
    daysAgo: {
      zh: '{days} 天前',
      en: '{days}d ago'
    }
  },
  doctor: {
    title: {
      zh: '医生工作台',
      en: 'Doctor Dashboard'
    },
    desc: {
      zh: '查看患者病例、分诊结果和沟通记录',
      en: 'Review patient cases, triage results, and conversation history'
    },
    // Dashboard stats
    totalActive: {
      zh: '活跃病例',
      en: 'Active Cases'
    },
    highRisk: {
      zh: '高风险',
      en: 'High Risk'
    },
    waitingDoctorReply: {
      zh: '待医生回复',
      en: 'Awaiting Doctor Reply'
    },
    waitingPatientReply: {
      zh: '待患者回复',
      en: 'Awaiting Patient Reply'
    },
    resolved: {
      zh: '已处理',
      en: 'Resolved'
    },
    // Queues
    queueUrgent: {
      zh: '紧急处理',
      en: 'Urgent'
    },
    queueNeedsReply: {
      zh: '待回复',
      en: 'Needs Reply'
    },
    queueRecent: {
      zh: '最近活动',
      en: 'Recent Activity'
    },
    // Doctor status labels
    statusNew: {
      zh: '新病例',
      en: 'New'
    },
    statusUnderReview: {
      zh: '审阅中',
      en: 'Under Review'
    },
    statusAwaitingPatient: {
      zh: '等待患者',
      en: 'Awaiting Patient'
    },
    statusFollowUp: {
      zh: '建议随访',
      en: 'Follow-up Recommended'
    },
    statusReadyForVisit: {
      zh: '可就诊',
      en: 'Ready for Visit'
    },
    statusResolved: {
      zh: '已处理',
      en: 'Resolved'
    },
    statusEscalated: {
      zh: '已转诊',
      en: 'Escalated'
    },
    // Conversation state labels
    convNone: {
      zh: '无对话',
      en: 'No Conversation'
    },
    convWaitingDoctor: {
      zh: '等待医生',
      en: 'Waiting Doctor'
    },
    convWaitingPatient: {
      zh: '等待患者',
      en: 'Waiting Patient'
    },
    convActive: {
      zh: '进行中',
      en: 'Active'
    },
    convClosed: {
      zh: '已结束',
      en: 'Closed'
    },
    // Priority labels
    priorityLow: {
      zh: '低',
      en: 'Low'
    },
    priorityNormal: {
      zh: '普通',
      en: 'Normal'
    },
    priorityHigh: {
      zh: '高',
      en: 'High'
    },
    priorityUrgent: {
      zh: '紧急',
      en: 'Urgent'
    },
    // Filters
    searchPlaceholder: {
      zh: '搜索患者姓名、地区或症状...',
      en: 'Search patient name, region, or symptoms...'
    },
    noResults: {
      zh: '未找到匹配的病例',
      en: 'No matching cases found'
    },
    noSessions: {
      zh: '暂无患者病例',
      en: 'No patient cases yet'
    },
    filterByRisk: {
      zh: '风险等级',
      en: 'Risk Level'
    },
    filterByStatus: {
      zh: '处理状态',
      en: 'Status'
    },
    filterByConversation: {
      zh: '对话状态',
      en: 'Conversation'
    },
    filterByPriority: {
      zh: '优先级',
      en: 'Priority'
    },
    allRisks: {
      zh: '全部风险',
      en: 'All Risks'
    },
    allStatuses: {
      zh: '全部状态',
      en: 'All Statuses'
    },
    allConversations: {
      zh: '全部对话',
      en: 'All Conversations'
    },
    allPriorities: {
      zh: '全部优先级',
      en: 'All Priorities'
    },
    sortBy: {
      zh: '排序',
      en: 'Sort'
    },
    sortDate: {
      zh: '最新优先',
      en: 'Newest First'
    },
    sortRisk: {
      zh: '风险优先',
      en: 'Highest Risk First'
    },
    sortPriority: {
      zh: '优先级优先',
      en: 'Priority First'
    },
    clearFilters: {
      zh: '清除筛选',
      en: 'Clear Filters'
    },
    // Case cards
    highRiskCase: {
      zh: '高风险病例',
      en: 'High Risk Cases'
    },
    waitingReply: {
      zh: '等待回复',
      en: 'Awaiting Reply'
    },
    recentCases: {
      zh: '最近病例',
      en: 'Recent Cases'
    },
    messageCount: {
      zh: '{count} 条消息',
      en: '{count} messages'
    },
    unreadCount: {
      zh: '{count} 条未读',
      en: '{count} unread'
    },
    lastMessage: {
      zh: '最近消息',
      en: 'Latest Message'
    },
    noMessages: {
      zh: '暂无消息',
      en: 'No messages yet'
    },
    // Conversation
    sendMessage: {
      zh: '发送',
      en: 'Send'
    },
    messagePlaceholder: {
      zh: '输入消息...',
      en: 'Type a message...'
    },
    conversationTitle: {
      zh: '医患沟通',
      en: 'Doctor-Patient Conversation'
    },
    doctorSays: {
      zh: '医生',
      en: 'Doctor'
    },
    patientSays: {
      zh: '患者',
      en: 'Patient'
    },
    // Quick prompts
    quickPrompts: {
      zh: '快捷提问',
      en: 'Quick Prompts'
    },
    promptDuration: {
      zh: '请问症状持续多长时间了？',
      en: 'How long have you had these symptoms?'
    },
    promptWorsened: {
      zh: '近24小时内症状是否明显加重？',
      en: 'Have your symptoms worsened in the last 24 hours?'
    },
    promptMedication: {
      zh: '目前服用的药物效果如何？',
      en: 'How well is your current medication working?'
    },
    promptWarningSigns: {
      zh: '请注意：如出现呼吸困难、胸痛加重等情况，请立即就医。',
      en: 'Important: Seek immediate care if you experience worsening breathing difficulty or chest pain.'
    },
    promptVisitTiming: {
      zh: '建议您尽快预约线下就诊。',
      en: 'We recommend scheduling an in-person visit soon.'
    },
    waitingDoctorIndicator: {
      zh: '等待医生回复',
      en: 'Waiting for doctor to reply'
    },
    waitingPatientIndicator: {
      zh: '等待患者回复',
      en: 'Waiting for patient to reply'
    },
    // Detail page
    caseDetail: {
      zh: '病例详情',
      en: 'Case Detail'
    },
    backToList: {
      zh: '返回列表',
      en: 'Back to List'
    },
    patientSnapshot: {
      zh: '患者概况',
      en: 'Patient Snapshot'
    },
    patientInfo: {
      zh: '患者信息',
      en: 'Patient Info'
    },
    triageResult: {
      zh: '分诊结果',
      en: 'Triage Result'
    },
    triageInterpretation: {
      zh: '分诊解读',
      en: 'Triage Interpretation'
    },
    visitSummary: {
      zh: '就诊摘要',
      en: 'Visit Summary'
    },
    followUpHistory: {
      zh: '随访记录',
      en: 'Follow-up History'
    },
    totalCases: {
      zh: '总病例',
      en: 'Total Cases'
    },
    highRiskCount: {
      zh: '高风险',
      en: 'High Risk'
    },
    pendingReply: {
      zh: '待回复',
      en: 'Pending Reply'
    },
    // Doctor actions
    actionsTitle: {
      zh: '病例操作',
      en: 'Case Actions'
    },
    changeStatus: {
      zh: '更改状态',
      en: 'Change Status'
    },
    setPriority: {
      zh: '设置优先级',
      en: 'Set Priority'
    },
    doctorNote: {
      zh: '医生备注',
      en: 'Doctor Note'
    },
    doctorNotePlaceholder: {
      zh: '添加内部备注（患者不可见）...',
      en: 'Add internal note (not visible to patient)...'
    },
    saveNote: {
      zh: '保存备注',
      en: 'Save Note'
    },
    noteSaved: {
      zh: '备注已保存',
      en: 'Note saved'
    },
    statusUpdated: {
      zh: '状态已更新',
      en: 'Status updated'
    },
    priorityUpdated: {
      zh: '优先级已更新',
      en: 'Priority updated'
    },
    // Detail metadata
    chiefComplaint: {
      zh: '主诉',
      en: 'Chief Complaint'
    },
    department: {
      zh: '建议科室',
      en: 'Suggested Department'
    },
    createdAt: {
      zh: '创建时间',
      en: 'Created'
    },
    updatedAt: {
      zh: '更新时间',
      en: 'Updated'
    },
    riskLevel: {
      zh: '风险等级',
      en: 'Risk Level'
    },
    whyThisLevel: {
      zh: '为何判定此风险等级',
      en: 'Why this risk level was assigned'
    },
    mainRedFlags: {
      zh: '主要危险信号',
      en: 'Main Red Flags'
    },
    nextStep: {
      zh: '建议下一步',
      en: 'Recommended Next Step'
    },
    uncertainty: {
      zh: '仍不确定的方面',
      en: 'What Remains Uncertain'
    },
    uncertaintyText: {
      zh: '基于当前信息，以下方面需要进一步确认：症状的具体诱因、用药反应、以及是否存在未报告的既往病史。',
      en: 'Based on current information, the following need further confirmation: specific symptom triggers, medication response, and any unreported medical history.'
    },
    noRedFlags: {
      zh: '当前未识别明确危险信号',
      en: 'No clear red flags identified from current information'
    }
  },
  login: {
    title: {
      zh: '登录 CareBridge',
      en: 'Sign in to CareBridge'
    },
    subtitle: {
      zh: '请输入账号和密码',
      en: 'Enter your credentials'
    },
    username: {
      zh: '用户名',
      en: 'Username'
    },
    usernamePlaceholder: {
      zh: '请输入用户名',
      en: 'Enter username'
    },
    password: {
      zh: '密码',
      en: 'Password'
    },
    passwordPlaceholder: {
      zh: '请输入密码',
      en: 'Enter password'
    },
    submit: {
      zh: '登录',
      en: 'Sign In'
    },
    loggingIn: {
      zh: '登录中...',
      en: 'Signing in...'
    },
    error: {
      zh: '用户名或密码错误',
      en: 'Invalid username or password'
    },
    demoHint: {
      zh: '演示账号：doctor / doctor123 或 admin / admin123',
      en: 'Demo accounts: doctor / doctor123 or admin / admin123'
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
