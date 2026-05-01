import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { useLocaleStore } from '@/stores/locale'
import {
  localizeFollowUpQuestions,
  localizePreset,
  localizeSession,
  localizeSessionSummary
} from '@/i18n/medical'
import type {
  TriageRequest,
  TriageResponse,
  Session,
  FollowUpQuestion,
  FollowUpRecord,
  SessionSummary,
  DemoPreset
} from '@/types'

export const useTriageStore = defineStore('triage', () => {
  const localeStore = useLocaleStore()

  // State
  const currentStep = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const rawActiveSession = ref<Session | null>(null)
  const rawFollowUpQuestions = ref<FollowUpQuestion[]>([])
  const rawRecentSessions = ref<SessionSummary[]>([])
  const draftPayload = ref<Partial<TriageRequest>>({})

  // Getters
  const activeSession = computed(() => {
    return rawActiveSession.value
      ? localizeSession(rawActiveSession.value, localeStore.locale)
      : null
  })
  const followUpQuestions = computed(() => {
    return localizeFollowUpQuestions(rawFollowUpQuestions.value, localeStore.locale)
  })
  const recentSessions = computed(() => {
    return rawRecentSessions.value.map((session) => localizeSessionSummary(session, localeStore.locale))
  })
  const hasActiveSession = computed(() => rawActiveSession.value !== null)
  const needsFollowUp = computed(() => rawFollowUpQuestions.value.length > 0)

  // Actions
  async function submitTriage(payload: TriageRequest): Promise<TriageResponse> {
    loading.value = true
    error.value = null

    try {
      const response = await api.submitTriage(payload)

      if (response.status === 'complete' && response.session) {
        rawActiveSession.value = response.session
        rawFollowUpQuestions.value = []
        currentStep.value = 3
      } else if (response.status === 'needs_follow_up' && response.questions) {
        rawFollowUpQuestions.value = response.questions
        draftPayload.value = payload
        currentStep.value = 2
      }

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : '提交失败'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitFollowUp(answers: Record<string, unknown>): Promise<TriageResponse> {
    const payload = { ...draftPayload.value, ...answers } as TriageRequest
    return submitTriage(payload)
  }

  async function loadRecentSessions(limit = 8) {
    try {
      const response = await api.getSessions(limit)
      rawRecentSessions.value = response.sessions
    } catch {
      rawRecentSessions.value = []
    }
  }

  async function loadSession(sessionId: string): Promise<Session> {
    const response = await api.getSession(sessionId)
    return response.session
  }

  async function addFollowUp(sessionId: string, record: Partial<FollowUpRecord>) {
    try {
      const response = await api.addFollowUp(sessionId, record)
      if (response.session) {
        rawActiveSession.value = response.session
      }
      return response.session
    } catch (err) {
      const message = err instanceof Error ? err.message : '随访保存失败'
      error.value = message
      throw err
    }
  }

  function setCurrentStep(step: number) {
    currentStep.value = step
  }

  function clearFollowUpQuestions() {
    rawFollowUpQuestions.value = []
  }

  function setActiveSession(session: Session | null) {
    rawActiveSession.value = session
  }

  function loadPreset(preset: DemoPreset) {
    const localizedPreset = localizePreset(preset, localeStore.locale)
    draftPayload.value = {
      patientName: localizedPreset.patientName,
      age: localizedPreset.age,
      gender: localizedPreset.gender,
      region: localizedPreset.region,
      symptoms: localizedPreset.symptoms.split(/[、,]/).map((item) => item.trim()).filter(Boolean),
      symptomNotes: localizedPreset.symptomNotes,
      symptomDays: localizedPreset.symptomDays,
      severity: localizedPreset.severity,
      chronicConditions: localizedPreset.chronicConditions
        ? localizedPreset.chronicConditions.split(/[、,]/).map((item) => item.trim()).filter(Boolean)
        : [],
      medications: localizedPreset.medications,
      allergies: localizedPreset.allergies
    }
    error.value = null
  }

  function reset() {
    currentStep.value = 1
    loading.value = false
    error.value = null
    rawActiveSession.value = null
    rawFollowUpQuestions.value = []
    draftPayload.value = {}
  }

  return {
    // State
    currentStep,
    loading,
    error,
    activeSession,
    followUpQuestions,
    recentSessions,
    draftPayload,
    // Getters
    hasActiveSession,
    needsFollowUp,
    // Actions
    submitTriage,
    submitFollowUp,
    loadRecentSessions,
    loadSession,
    addFollowUp,
    setCurrentStep,
    clearFollowUpQuestions,
    setActiveSession,
    loadPreset,
    reset
  }
})

// 预设数据
export const demoPresets: DemoPreset[] = [
  {
    id: 'respiratory-watch',
    title: '呼吸观察案例',
    patientName: '陈阿姨',
    age: 63,
    gender: 'female',
    region: '县城诊所周边',
    symptoms: '发热、咳嗽、胸闷',
    symptomNotes: '发热三天，夜间咳嗽加重，今日出现轻微胸闷',
    symptomDays: 3,
    severity: 'moderate',
    chronicConditions: '高血压',
    medications: '对乙酰氨基酚',
    allergies: '无'
  },
  {
    id: 'mild-observation',
    title: '轻度居家观察案例',
    patientName: '小明',
    age: 22,
    gender: 'male',
    region: '大学城片区',
    symptoms: '咽痛',
    symptomNotes: '今早开始轻微咽痛，无发热，可以进食',
    symptomDays: 1,
    severity: 'mild',
    chronicConditions: '',
    medications: '无',
    allergies: '无'
  },
  {
    id: 'urgent-red-flag',
    title: '紧急升级案例',
    patientName: '林先生',
    age: 58,
    gender: 'male',
    region: '乡村卫生站',
    symptoms: '咳嗽、胸闷',
    symptomNotes: '呼吸越来越困难，今天胸口感觉很紧',
    symptomDays: 1,
    severity: 'severe',
    chronicConditions: '哮喘',
    medications: '无',
    allergies: '无'
  }
]
