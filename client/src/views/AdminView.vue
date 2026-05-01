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
            <th>{{ t('admin.colDepartment') }}</th>
            <th>{{ t('admin.colDate') }}</th>
            <th>{{ t('admin.colFollowUps') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in sessions" :key="session.id" class="admin-row" @click="openSession(session.id)">
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { localizeAdminSessionSummary } from '@/i18n/medical'
import type { AdminSessionSummary } from '@/types'

const { locale, t } = useI18n()
const router = useRouter()

const rawSessions = ref<AdminSessionSummary[]>([])
const loading = ref(true)
const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const sessions = computed(() => {
  return rawSessions.value.map((session) => localizeAdminSessionSummary(session, locale.value))
})

async function loadSessions(query?: string) {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    const qs = params.toString()
    const response = await fetch(`/api/admin/sessions${qs ? '?' + qs : ''}`)
    const data = await response.json()
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

function openSession(id: string) {
  router.push(`/admin/session/${id}`)
}

function riskClass(level: string) {
  if (level === 'Level 1') return 'risk-badge--1'
  if (level === 'Level 2') return 'risk-badge--2'
  if (level === 'Level 3') return 'risk-badge--3'
  return 'risk-badge--4'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US') + ' ' + d.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => loadSessions())
</script>

<style scoped>
.admin-view {
  max-width: 1200px;
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

.risk-badge--1 {
  background: var(--level-1-bg);
  color: var(--level-1);
  border: 1px solid var(--level-1-border);
}

.risk-badge--2 {
  background: var(--level-2-bg);
  color: var(--level-2);
  border: 1px solid var(--level-2-border);
}

.risk-badge--3 {
  background: var(--level-3-bg);
  color: var(--level-3);
  border: 1px solid var(--level-3-border);
}

.risk-badge--4 {
  background: var(--level-4-bg);
  color: var(--level-4);
  border: 1px solid var(--level-4-border);
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
  }

  .admin-search {
    min-width: 100%;
  }
}
</style>
