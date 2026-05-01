import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { useLocaleStore } from '@/stores/locale'
import { localizeDoctorSessionSummary } from '@/i18n/medical'
import type {
  DoctorSessionSummary,
  DoctorSession,
  DoctorDashboardStats,
  DoctorDashboardQueues,
  DoctorStatus,
  ConversationState,
  PriorityLevel
} from '@/types'

export const useDoctorStore = defineStore('doctor', () => {
  const localeStore = useLocaleStore()

  // Dashboard state
  const stats = ref<DoctorDashboardStats | null>(null)
  const rawQueues = ref<DoctorDashboardQueues | null>(null)
  const dashboardLoading = ref(false)

  // Session list state
  const rawSessions = ref<DoctorSessionSummary[]>([])
  const sessionsLoading = ref(false)

  // Active session state
  const rawActiveSession = ref<DoctorSession | null>(null)
  const sessionLoading = ref(false)

  // Filter state
  const filters = ref({
    q: '',
    riskLevel: '',
    doctorStatus: '' as DoctorStatus | '',
    conversationState: '' as ConversationState | '',
    priorityLevel: '' as PriorityLevel | '',
    sort: ''
  })

  // Getters
  const sessions = computed(() =>
    rawSessions.value.map(s => localizeDoctorSessionSummary(s, localeStore.locale))
  )

  const activeSession = computed(() => rawActiveSession.value)
  const queues = computed(() => {
    if (!rawQueues.value) return null

    return {
      urgent: rawQueues.value.urgent.map((session) => localizeDoctorSessionSummary(session, localeStore.locale)),
      needsReply: rawQueues.value.needsReply.map((session) => localizeDoctorSessionSummary(session, localeStore.locale)),
      recent: rawQueues.value.recent.map((session) => localizeDoctorSessionSummary(session, localeStore.locale))
    }
  })

  // Actions
  async function loadDashboard() {
    dashboardLoading.value = true
    try {
      const data = await api.getDoctorDashboard()
      stats.value = data.stats
      rawQueues.value = data.queues
    } catch {
      stats.value = null
      rawQueues.value = null
    } finally {
      dashboardLoading.value = false
    }
  }

  async function loadSessions() {
    sessionsLoading.value = true
    try {
      const params: Record<string, string> = {}
      if (filters.value.q) params.q = filters.value.q
      if (filters.value.riskLevel) params.riskLevel = filters.value.riskLevel
      if (filters.value.doctorStatus) params.doctorStatus = filters.value.doctorStatus
      if (filters.value.conversationState) params.conversationState = filters.value.conversationState
      if (filters.value.priorityLevel) params.priorityLevel = filters.value.priorityLevel
      if (filters.value.sort) params.sort = filters.value.sort

      const data = await api.getDoctorSessions(params)
      rawSessions.value = data.sessions
    } catch {
      rawSessions.value = []
    } finally {
      sessionsLoading.value = false
    }
  }

  async function loadSession(sessionId: string) {
    sessionLoading.value = true
    try {
      const data = await api.getDoctorSession(sessionId)
      rawActiveSession.value = data.session
    } catch {
      rawActiveSession.value = null
    } finally {
      sessionLoading.value = false
    }
  }

  async function patchSession(sessionId: string, fields: { doctorStatus?: DoctorStatus; doctorNote?: string; priorityLevel?: PriorityLevel }) {
    try {
      const data = await api.patchDoctorSession(sessionId, fields)
      if (rawActiveSession.value?.id === sessionId) {
        rawActiveSession.value = data.session
      }
      return data.session
    } catch (err) {
      throw err
    }
  }

  async function sendMessage(sessionId: string, content: string) {
    try {
      const data = await api.sendDoctorMessage(sessionId, content)
      if (rawActiveSession.value?.id === sessionId) {
        rawActiveSession.value.messages.push(data.message)
      }
      return data.message
    } catch (err) {
      throw err
    }
  }

  function setFilter(key: keyof typeof filters.value, value: string) {
    filters.value[key] = value as never
  }

  function clearFilters() {
    filters.value = {
      q: '',
      riskLevel: '',
      doctorStatus: '',
      conversationState: '',
      priorityLevel: '',
      sort: ''
    }
  }

  return {
    // Dashboard
    stats,
    queues,
    dashboardLoading,
    // Sessions
    sessions,
    rawSessions,
    sessionsLoading,
    // Active session
    activeSession,
    sessionLoading,
    // Filters
    filters,
    // Actions
    loadDashboard,
    loadSessions,
    loadSession,
    patchSession,
    sendMessage,
    setFilter,
    clearFilters
  }
})
