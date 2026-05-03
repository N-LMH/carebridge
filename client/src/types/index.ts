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

export interface FollowUpPlan {
  recommendedAt: string | null
  status: 'none' | 'scheduled' | 'completed' | 'overdue'
  recommendedWindowHours: number | null
}

export interface Reassessment {
  id: string
  sessionId: string
  source: string
  previousRiskLevel: RiskLevel
  newRiskLevel: RiskLevel
  deltaSummary: string
  snapshotData: {
    followUpRecordId?: string
    triggerTemperatureC?: number | null
    triggerSymptomChange?: string
    triggerNote?: string
  }
  createdAt: string
}

export interface TimelineEvent {
  id: string
  type: string
  timestamp: string
  title: string
  description: string
  actor: 'system' | 'patient' | 'doctor' | 'admin'
  metadata?: Record<string, string | number | boolean | null>
}

// Admin status types
export type AdminStatus = 'new' | 'reviewed' | 'urgent' | 'resolved' | 'archived'

// Doctor workflow status types
export type DoctorStatus = 'new' | 'under_review' | 'awaiting_patient_reply' | 'follow_up_recommended' | 'ready_for_visit' | 'resolved' | 'escalated'

// Conversation state types
export type ConversationState = 'none' | 'waiting_doctor' | 'waiting_patient' | 'active' | 'closed'

// Priority level types
export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent'

// 会话
export interface Session {
  id: string
  createdAt: string
  intake: TriageRequest
  assessment: RiskAssessment
  summary: VisitSummary
  followUps: FollowUpRecord[]
  followUpPlan?: FollowUpPlan
  adminNote?: string
  adminStatus?: AdminStatus
  tags?: string[]
  doctorStatus?: DoctorStatus
  doctorNote?: string
  conversationState?: ConversationState
  lastPatientMessageAt?: string | null
  lastDoctorMessageAt?: string | null
  reviewedAt?: string | null
  resolvedAt?: string | null
  priorityLevel?: PriorityLevel
  latestReassessment?: Reassessment | null
  timeline?: TimelineEvent[]
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

// Admin session summary (extended)
export interface AdminSessionSummary extends SessionSummary {
  age: number | null
  gender: Gender
  redFlags: string[]
  adminNote: string
  adminStatus: AdminStatus
  tags: string[]
  latestReassessment?: Reassessment | null
}

// Admin stats
export interface AdminStats {
  total: number
  riskDistribution: Record<string, number>
  statusDistribution: Record<string, number>
  highRiskRecent: number
}

export interface AdminSlaStats {
  highRiskReviewedOnTime: number
  highRiskReviewedLate: number
  waitingDoctorReplyOverdue: number
  recentRiskUpgrades: number
  avgHighRiskReviewMinutes: number | null
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

// Auth
export interface User {
  id: string
  username: string
  role: 'doctor' | 'admin'
  displayName: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Messages / Conversation
export type SenderType = 'doctor' | 'patient' | 'system'

export interface Message {
  id: string
  sessionId: string
  senderType: SenderType
  senderId: string | null
  content: string
  createdAt: string
  messageKind?: string
  isReadByDoctor?: boolean
  isReadByPatient?: boolean
}

// Doctor session summary
export interface DoctorSessionSummary extends SessionSummary {
  age: number | null
  gender: Gender
  redFlags: string[]
  doctorStatus: DoctorStatus
  conversationState: ConversationState
  priorityLevel: PriorityLevel
  lastMessage: { content: string; createdAt: string; senderType: SenderType } | null
  messageCount: number
  unreadCount: number
  latestReassessment?: Reassessment | null
}

export interface DoctorSession extends Session {
  messages: Message[]
}

// Doctor dashboard
export interface DoctorDashboardStats {
  totalActive: number
  highRisk: number
  waitingDoctorReply: number
  waitingPatientReply: number
  resolved: number
}

export interface DoctorDashboardQueues {
  urgent: DoctorSessionSummary[]
  needsReply: DoctorSessionSummary[]
  recent: DoctorSessionSummary[]
}

export interface DoctorDashboardResponse {
  stats: DoctorDashboardStats
  queues: DoctorDashboardQueues
}
