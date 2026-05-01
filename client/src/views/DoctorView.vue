<template>
  <div class="doctor-view">
    <header class="doctor-header">
      <div class="doctor-header-text">
        <h1 class="doctor-title">{{ t('doctor.title') }}</h1>
        <p class="doctor-desc">{{ t('doctor.desc') }}</p>
      </div>
      <div class="doctor-search">
        <svg class="doctor-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          class="field-input doctor-search-input"
          :placeholder="t('doctor.searchPlaceholder')"
          @input="debouncedSearch"
        />
      </div>
    </header>

    <div class="doctor-stats">
      <div class="stat-card stat-card--total">
        <span class="stat-value">{{ totalCases }}</span>
        <span class="stat-label">{{ t('doctor.totalCases') }}</span>
      </div>
      <div class="stat-card stat-card--high-risk">
        <span class="stat-value">{{ highRiskCount }}</span>
        <span class="stat-label">{{ t('doctor.highRiskCount') }}</span>
      </div>
      <div class="stat-card stat-card--pending">
        <span class="stat-value">{{ pendingReplyCount }}</span>
        <span class="stat-label">{{ t('doctor.pendingReply') }}</span>
      </div>
    </div>

    <div class="doctor-filters">
      <div class="filter-group">
        <select v-model="filters.riskLevel" class="field-select filter-select" @change="applyFilters">
          <option value="">{{ t('doctor.allRisks') }}</option>
          <option value="Level 1">Level 1</option>
          <option value="Level 2">Level 2</option>
          <option value="Level 3">Level 3</option>
          <option value="Level 4">Level 4</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filters.sort" class="field-select filter-select" @change="applyFilters">
          <option value="">{{ t('doctor.sortDate') }}</option>
          <option value="risk">{{ t('doctor.sortRisk') }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="empty-state">{{ t('common.loading') }}</div>

    <div v-else-if="sessions.length === 0" class="empty-state">
      {{ searchQuery ? t('doctor.noResults') : t('doctor.noSessions') }}
    </div>

    <div v-else class="doctor-cases">
      <div v-for="session in sessions" :key="session.id" class="case-card" @click="openSession(session.id)">
        <div class="case-header">
          <div class="case-patient">
            <strong>{{ session.patientName }}</strong>
            <span class="case-meta">
              {{ session.age ? `${session.age} ${t('admin.yearsOld')}` : '' }}
              {{ session.gender ? `· ${genderLabel(session.gender)}` : '' }}
              {{ session.region ? `· ${session.region}` : '' }}
            </span>
          </div>
          <div class="case-badges">
            <span class="risk-badge" :class="riskClass(session.riskLevel)">{{ session.riskLevel }}</span>
            <span v-if="session.redFlags?.length" class="redflag-badge">
              {{ session.redFlags.length }} {{ locale === 'zh' ? '红旗' : 'flags' }}
            </span>
          </div>
        </div>
        <div class="case-symptoms">
          <span v-for="s in session.symptoms?.slice(0, 4)" :key="s" class="chip">{{ s }}</span>
          <span v-if="session.symptoms?.length > 4" class="chip">+{{ session.symptoms.length - 4 }}</span>
        </div>
        <div class="case-footer">
          <span class="case-dept">{{ session.suggestedDepartment }}</span>
          <span class="case-messages" v-if="session.messageCount > 0">
            {{ t('doctor.messageCount', { count: session.messageCount }) }}
          </span>
          <span class="case-time">{{ formatDate(session.createdAt) }}</span>
        </div>
        <div v-if="session.lastMessage" class="case-last-msg">
          <span class="last-msg-sender">{{ session.lastMessage.senderType === 'doctor' ? t('doctor.doctorSays') : t('doctor.patientSays') }}:</span>
          <span class="last-msg-text">{{ session.lastMessage.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { localizeDoctorSessionSummary } from '@/i18n/medical'
import { api } from '@/services/api'
import type { DoctorSessionSummary, Gender, RiskLevel } from '@/types'

const { locale, t } = useI18n()
const router = useRouter()

const rawSessions = ref<DoctorSessionSummary[]>([])
const loading = ref(true)
const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filters = reactive({
  riskLevel: '',
  sort: ''
})

const totalCases = computed(() => rawSessions.value.length)
const highRiskCount = computed(() =>
  rawSessions.value.filter(s => s.riskLevel === 'Level 1' || s.riskLevel === 'Level 2').length
)
const pendingReplyCount = computed(() =>
  rawSessions.value.filter(s => s.lastMessage && s.lastMessage.senderType === 'patient').length
)

const sessions = computed(() =>
  rawSessions.value.map((session) => localizeDoctorSessionSummary(session, locale.value))
)

async function loadSessions(query?: string) {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (filters.riskLevel) params.riskLevel = filters.riskLevel
    if (filters.sort) params.sort = filters.sort
    const data = await api.getDoctorSessions(params)
    rawSessions.value = data.sessions
  } catch {
    rawSessions.value = []
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadSessions(searchQuery.value || undefined)
  }, 300)
}

function applyFilters() {
  loadSessions(searchQuery.value || undefined)
}

function openSession(id: string) {
  router.push(`/doctor/session/${id}`)
}

function riskClass(level: RiskLevel) {
  if (level === 'Level 1') return 'risk-badge--1'
  if (level === 'Level 2') return 'risk-badge--2'
  if (level === 'Level 3') return 'risk-badge--3'
  return 'risk-badge--4'
}

function genderLabel(g: Gender) {
  if (g === 'male') return locale.value === 'zh' ? '男' : 'Male'
  if (g === 'female') return locale.value === 'zh' ? '女' : 'Female'
  return ''
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US') + ' ' + d.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => loadSessions())
</script>

<style scoped>
.doctor-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

.doctor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.doctor-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text);
}

.doctor-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.doctor-search {
  position: relative;
  min-width: 280px;
}

.doctor-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  pointer-events: none;
}

.doctor-search-input {
  padding-left: 38px;
}

.doctor-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: var(--space-4);
  text-align: center;
}

.stat-card--total {
  border-color: var(--primary);
  background: var(--blue-50);
}

.stat-card--high-risk {
  border-color: var(--c-level-1);
  background: var(--c-level-1-bg);
}

.stat-card--pending {
  border-color: var(--c-warning);
  background: var(--warning-bg);
}

.stat-value {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text);
}

.stat-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.doctor-filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.filter-select {
  font-size: var(--text-sm);
  min-width: 140px;
}

.doctor-cases {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.case-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: var(--space-5);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.case-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.case-patient strong {
  display: block;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text);
}

.case-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.case-badges {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.risk-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
}

.risk-badge--1 { background: var(--level-1-bg); color: var(--level-1); border: 1px solid var(--level-1-border); }
.risk-badge--2 { background: var(--level-2-bg); color: var(--level-2); border: 1px solid var(--level-2-border); }
.risk-badge--3 { background: var(--level-3-bg); color: var(--level-3); border: 1px solid var(--level-3-border); }
.risk-badge--4 { background: var(--level-4-bg); color: var(--level-4); border: 1px solid var(--level-4-border); }

.redflag-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.case-symptoms {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.case-footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.case-dept {
  font-weight: 600;
  color: var(--text-secondary);
}

.case-messages {
  color: var(--primary);
  font-weight: 600;
}

.case-last-msg {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-light);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-2);
}

.last-msg-sender {
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
}

.last-msg-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .doctor-header {
    flex-direction: column;
  }

  .doctor-search {
    min-width: 100%;
  }

  .doctor-stats {
    grid-template-columns: 1fr;
  }
}
</style>
