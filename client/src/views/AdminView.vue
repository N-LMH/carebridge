<template>
  <div class="admin-view">
    <header class="admin-header">
      <div class="admin-header-text">
        <h1 class="admin-title">{{ t('admin.title') }}</h1>
        <p class="admin-desc">{{ t('admin.desc') }}</p>
      </div>
      <div class="admin-search">
        <svg class="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          class="field-input admin-search-input"
          :placeholder="t('admin.searchPlaceholder')"
          @input="debouncedSearch"
        />
      </div>
    </header>

    <div v-if="stats" class="dashboard-stats">
      <div class="stat-card stat-card--total">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">{{ t('admin.totalSessions') }}</span>
      </div>
      <div class="stat-card stat-card--high-risk">
        <span class="stat-value">{{ stats.highRiskRecent }}</span>
        <span class="stat-label">{{ t('admin.highRiskRecent') }}</span>
      </div>
      <div class="stat-card" v-for="(count, level) in stats.riskDistribution" :key="level">
        <span class="stat-value">{{ count }}</span>
        <span class="stat-label">{{ level }}</span>
      </div>
    </div>

    <div class="admin-filters">
      <div class="filter-group">
        <label class="filter-label">{{ t('admin.filterByRisk') }}</label>
        <select v-model="filters.riskLevel" class="field-select filter-select" @change="applyFilters">
          <option value="">{{ t('admin.allRisks') }}</option>
          <option value="Level 1">Level 1</option>
          <option value="Level 2">Level 2</option>
          <option value="Level 3">Level 3</option>
          <option value="Level 4">Level 4</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('admin.filterByStatus') }}</label>
        <select v-model="filters.adminStatus" class="field-select filter-select" @change="applyFilters">
          <option value="">{{ t('admin.allStatuses') }}</option>
          <option value="new">{{ t('admin.statusNew') }}</option>
          <option value="reviewed">{{ t('admin.statusReviewed') }}</option>
          <option value="urgent">{{ t('admin.statusUrgent') }}</option>
          <option value="resolved">{{ t('admin.statusResolved') }}</option>
          <option value="archived">{{ t('admin.statusArchived') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('admin.filterByTime') }}</label>
        <select v-model="filters.withinHours" class="field-select filter-select" @change="applyFilters">
          <option value="">{{ t('admin.allTime') }}</option>
          <option value="24">{{ t('admin.last24h') }}</option>
          <option value="168">{{ t('admin.last7d') }}</option>
          <option value="720">{{ t('admin.last30d') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">{{ t('admin.sortBy') }}</label>
        <select v-model="filters.sort" class="field-select filter-select" @change="applyFilters">
          <option value="">{{ t('admin.sortDate') }}</option>
          <option value="risk">{{ t('admin.sortRisk') }}</option>
          <option value="followups">{{ t('admin.sortFollowUps') }}</option>
        </select>
      </div>
      <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="clearFilters">
        {{ t('admin.clearFilters') }}
      </button>
    </div>

    <div v-if="loading" class="empty-state">{{ t('common.loading') }}</div>

    <div v-else-if="sessions.length === 0" class="empty-state">
      {{ searchQuery ? t('admin.noResults') : t('admin.noSessions') }}
    </div>

    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>{{ t('admin.colPatient') }}</th>
            <th>{{ t('admin.colAge') }}</th>
            <th>{{ t('admin.colSymptoms') }}</th>
            <th>{{ t('admin.colRisk') }}</th>
            <th>{{ t('admin.adminStatus') }}</th>
            <th>{{ t('admin.colDepartment') }}</th>
            <th>{{ t('admin.colDate') }}</th>
            <th>{{ t('admin.colFollowUps') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in sessions" :key="session.id" class="admin-row" :class="rowClass(session)" @click="openSession(session.id)">
            <td class="admin-cell-name">
              <strong>{{ session.patientName }}</strong>
              <span class="admin-cell-region">{{ session.region }}</span>
            </td>
            <td>{{ session.age || '—' }}</td>
            <td>
              <div class="admin-symptoms">
                <span v-for="s in session.symptoms?.slice(0, 3)" :key="s" class="chip">{{ s }}</span>
                <span v-if="session.symptoms?.length > 3" class="chip">+{{ session.symptoms.length - 3 }}</span>
              </div>
            </td>
            <td>
              <span class="risk-badge" :class="riskClass(session.riskLevel)">{{ session.riskLevel }}</span>
            </td>
            <td>
              <span class="status-chip" :class="statusClass(session.adminStatus)">
                {{ statusLabel(session.adminStatus) }}
              </span>
            </td>
            <td>{{ session.suggestedDepartment }}</td>
            <td class="admin-cell-date">{{ formatDate(session.createdAt) }}</td>
            <td class="admin-cell-center">{{ session.followUpCount }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click.stop="openSession(session.id)">
                {{ t('admin.viewDetail') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { localizeAdminSessionSummary } from '@/i18n/medical'
import { api } from '@/services/api'
import type { AdminSessionSummary, AdminStats, AdminStatus } from '@/types'

const { locale, t } = useI18n()
const router = useRouter()

const rawSessions = ref<AdminSessionSummary[]>([])
const stats = ref<AdminStats | null>(null)
const loading = ref(true)
const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filters = reactive({
  riskLevel: '',
  adminStatus: '',
  withinHours: '',
  sort: ''
})

const hasActiveFilters = computed(() =>
  !!(filters.riskLevel || filters.adminStatus || filters.withinHours || filters.sort)
)

const sessions = computed(() => {
  return rawSessions.value.map((session) => localizeAdminSessionSummary(session, locale.value))
})

async function loadSessions(query?: string) {
  loading.value = true
  try {
    const params: Record<string, string | number> = {}
    if (query) params.q = query
    if (filters.riskLevel) params.riskLevel = filters.riskLevel
    if (filters.adminStatus) params.adminStatus = filters.adminStatus
    if (filters.withinHours) params.withinHours = Number(filters.withinHours)
    if (filters.sort) params.sort = filters.sort

    const hasParams = Object.keys(params).length > 0
    let data

    if (hasParams && !query) {
      data = await api.filterAdminSessions(params)
    } else {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(params)) qs.set(k, String(v))
      const response = await fetch(`/api/admin/sessions${qs.toString() ? '?' + qs.toString() : ''}`)
      data = await response.json()
    }

    rawSessions.value = data.sessions
  } catch {
    rawSessions.value = []
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await api.getAdminStats()
  } catch {
    stats.value = null
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

function clearFilters() {
  filters.riskLevel = ''
  filters.adminStatus = ''
  filters.withinHours = ''
  filters.sort = ''
  loadSessions(searchQuery.value || undefined)
}

function openSession(id: string) {
  router.push(`/admin/session/${id}`)
}

function riskClass(level: string) {
  if (level === 'Level 1') return 'risk-badge--1'
  if (level === 'Level 2') return 'risk-badge--2'
  if (level === 'Level 3') return 'risk-badge--3'
  return 'risk-badge--4'
}

function statusClass(status: AdminStatus) {
  const map: Record<string, string> = {
    new: 'status--new',
    reviewed: 'status--reviewed',
    urgent: 'status--urgent',
    resolved: 'status--resolved',
    archived: 'status--archived'
  }
  return map[status] || 'status--new'
}

function statusLabel(status: AdminStatus) {
  const map: Record<string, string> = {
    new: 'admin.statusNew',
    reviewed: 'admin.statusReviewed',
    urgent: 'admin.statusUrgent',
    resolved: 'admin.statusResolved',
    archived: 'admin.statusArchived'
  }
  return t(map[status] || 'admin.statusNew')
}

function rowClass(session: AdminSessionSummary) {
  if (session.riskLevel === 'Level 1') return 'admin-row--emergency'
  if (session.riskLevel === 'Level 2') return 'admin-row--urgent'
  if (session.adminStatus === 'urgent') return 'admin-row--flagged'
  return ''
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US') + ' ' + d.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadSessions()
  loadStats()
})
</script>

<style scoped>
.admin-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.admin-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text);
}

.admin-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.admin-search {
  position: relative;
  min-width: 280px;
}

.admin-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  pointer-events: none;
}

.admin-search-input {
  padding-left: 38px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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

.admin-filters {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  padding: var(--space-4);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-select {
  min-width: 140px;
  font-size: var(--text-sm);
}

.admin-table-wrap {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.admin-table th {
  text-align: left;
  padding: var(--space-4);
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border);
  white-space: nowrap;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.admin-row {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.admin-row:hover {
  background: var(--blue-50);
}

.admin-row--emergency {
  background: rgba(239, 68, 68, 0.03);
}

.admin-row--urgent {
  background: rgba(245, 158, 11, 0.03);
}

.admin-row--flagged {
  background: rgba(245, 158, 11, 0.05);
}

.admin-cell-name strong {
  display: block;
  color: var(--text);
  font-weight: 600;
}

.admin-cell-region {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.admin-cell-date {
  white-space: nowrap;
  font-size: var(--text-xs);
}

.admin-cell-center {
  text-align: center;
}

.admin-symptoms {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
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

.status-chip {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}

.status--new { background: var(--blue-50); color: var(--primary); }
.status--reviewed { background: rgba(16, 185, 129, 0.1); color: var(--c-success); }
.status--urgent { background: rgba(239, 68, 68, 0.1); color: var(--c-error); }
.status--resolved { background: rgba(107, 114, 128, 0.1); color: var(--text-secondary); }
.status--archived { background: var(--gray-100); color: var(--text-muted); }

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
  }

  .admin-search {
    min-width: 100%;
  }

  .admin-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: 100%;
  }
}
</style>
