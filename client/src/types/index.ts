// 患者信息
export interface Patient {
  id?: string
  patientName: string
  age: number | null
  gender: Gender
  region: string
  chronicConditions: string[]
  medications: string
  allergies: string
}

export type Gender = 'male' | 'female' | 'other' | ''
export type Locale = 'zh' | 'en'

// 症状输入
export interface SymptomInput {
  symptoms: string[]
  symptomNotes: string
  symptomDays: number | null
  severity: Severity
}

export type Severity = 'mild' | 'moderate' | 'severe'

// 分诊请求
export interface TriageRequest extends Patient, SymptomInput {
  breathingDifficulty?: BreathingLevel | null
  symptomsWorsening?: boolean | null
  maxTemperatureC?: number | null
  chestPain?: boolean | null
  coughType?: CoughType | null
  nightSymptoms?: YesNo | null
  chillsOrSweats?: ChillsType | null
  stoolFrequency?: number | null
  foodIntake?: FoodIntake | null
  dehydrationSigns?: YesNo | null
  painRadiation?: PainRadiation | null
  activityRelation?: ActivityRelation | null
  consciousnessChanges?: YesNo | null
  visionChanges?: YesNo | null
  numbness?: YesNo | null
}

export type BreathingLevel = 'none' | 'mild' | 'moderate' | 'severe'
export type CoughType = 'none' | 'dry' | 'productive'
export type YesNo = 'yes' | 'no'
export type ChillsType = 'chills' | 'sweats' | 'both' | 'none'
export type FoodIntake = 'normal' | 'reduced' | 'minimal'
export type PainRadiation = 'none' | 'left_arm' | 'back' | 'other'
export type ActivityRelation = 'rest' | 'exertion' | 'both'

// 追问问题
export interface FollowUpQuestion {
  id: string
  label: string
  type: 'select' | 'number'
  options?: QuestionOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

export interface QuestionOption {
  value: string
  label: string
}

// 风险等级
export type RiskLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4'

export interface RiskAssessment {
  riskLevel: RiskLevel
  actionLabel: string
  redFlags: string[]
  suggestedDepartment: string
  reasoning: string[]
  immediateSteps: string[]
  doctorQuestions: string[]
  scoreBreakdown: ScoreBreakdown
  warning: string
}

export interface ScoreBreakdown {
  base: number
  modifiers: number
  combinations: number
  total: number
  details: ScoreDetail[]
}

export interface ScoreDetail {
  type: 'base' | 'modifier' | 'combination'
  symptom?: string
  reason?: string
  value: number
}

// 就诊摘要
export interface VisitSummary {
  chiefComplaint: string
  onset: string
  mainSymptoms: string
  associatedSymptoms: string
  medicalHistory: string
  currentMedication: string
  allergies: string
  riskNotes: string
  suggestedDepartment: string
  doctorQuestions: string[]
  summaryText: string
}

// 随访记录
export interface FollowUpRecord {
  id: string
  createdAt: string
  temperatureC: number | null
  symptomChange: string
  medicationTaken: string
  note: string
}

// 会话
export interface Session {
  id: string
  createdAt: string
  intake: TriageRequest
  assessment: RiskAssessment
  summary: VisitSummary
  followUps: FollowUpRecord[]
}

// API 响应
export interface TriageResponse {
  status: 'complete' | 'needs_follow_up' | 'validation_error'
  session?: Session
  questions?: FollowUpQuestion[]
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface SessionListResponse {
  sessions: SessionSummary[]
}

export interface SessionSummary {
  id: string
  createdAt: string
  patientName: string
  region: string
  symptoms: string[]
  actionLabel: string
  riskLevel: RiskLevel
  suggestedDepartment: string
  followUpCount: number
}

// 预设
export interface DemoPreset {
  id: string
  title: string
  patientName: string
  age: number
  gender: Gender
  region: string
  symptoms: string
  symptomNotes: string
  symptomDays: number
  severity: Severity
  chronicConditions: string
  medications: string
  allergies: string
}
