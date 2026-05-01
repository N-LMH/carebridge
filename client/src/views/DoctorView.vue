<template>
  <div class="doctor-view">
    <header class="doctor-header">
      <div class="doctor-header-text">
        <h1 class="doctor-title">{{ t('doctor.title') }}</h1>
        <p class="doctor-desc">{{ t('doctor.desc') }}</p>
      </div>
    </header>

    <div v-if="dashboardLoading" class="empty-state">{{ t('common.loading') }}</div>

    <template v-else>
      <div class="doctor-stats" v-if="stats">
        <div class="stat-card stat-card--active">
          <span class="stat-value">{{ stats.totalActive }}</span>
          <span class="stat-label">{{ t('doctor.totalActive') }}</span>
        </div>
        <div class="stat-card stat-card--high-risk">
          <span class="stat-value">{{ stats.highRisk }}</span>
          <span class="stat-label">{{ t('doctor.highRisk') }}</span>
        </div>
        <div class="stat-card stat-card--waiting-doctor">
          <span class="stat-value">{{ stats.waitingDoctorReply }}</span>
          <span class="stat-label">{{ t('doctor.waitingDoctorReply') }}</span>
        </div>
        <div class="stat-card stat-card--waiting-patient">
          <span class="stat-value">{{ stats.waitingPatientReply }}</span>
          <span class="stat-label">{{ t('doctor.waitingPatientReply') }}</span>
        </div>
        <div class="stat-card stat-card--resolved">
          <span class="stat-value">{{ stats.resolved }}</span>
          <span class="stat-label">{{ t('doctor.resolved') }}</span>
        </div>
      </div>

      <div class="doctor-queues" v-if="queues">
        <div class="queue-section" v-if="queues.urgent.length">
          <h2 class="queue-title queue-title--urgent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            {{ t('doctor.queueUrgent') }}
            <span class="queue-count">{{ queues.urgent.length }}</span>
          </h2>
          <div class="queue-cards">
            <div v-for="session in queues.urgent" :key="session.id" class="case-card case-card--urgent" @click="openSession(session.id)">
              <CaseCardContent :session="session" />
            </div>
          </div>
        </div>

        <div class="queue-section" v-if="queues.needsReply.length">
          <h2 class="queue-title queue-title--reply">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ t('doctor.queueNeedsReply') }}
            <span class="queue-count">{{ queues.needsReply.length }}</span>
          </h2>
          <div class="queue-cards">
            <div v-for="session in queues.needsReply" :key="session.id" class="case-card case-card--reply" @click="openSession(session.id)">
              <CaseCardContent :session="session" />
            </div>
          </div>
        </div>

        <div class="queue-section" v-if="queues.recent.length">
          <h2 class="queue-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {{ t('doctor.queueRecent') }}
          </h2>
          <div class="queue-cards">
            <div v-for="session in queues.recent" :key="session.id" class="case-card" @click="openSession(session.id)">
              <CaseCardContent :session="session" />
            </div>
          </div>
        </div>
      </div>

      <div class="doctor-filters">
        <div class="filter-search">
          <svg class="filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            v-model="filters.q"
            type="text"
            class="field-input filter-search-input"
            :placeholder="t('doctor.searchPlaceholder')"
            @input="debouncedLoad"
          />
        </div>
        <select v-model="filters.riskLevel" class="field-select filter-select" @change="loadSessions">
          <option value="">{{ t('doctor.allRisks') }}</option>
          <option value="Level 1">Level 1</option>
          <option value="Level 2">Level 2</option>
          <option value="Level 3">Level 3</option>
          <option value="Level 4">Level 4</option>
        </select>
        <select v-model="filters.doctorStatus" class="field-select filter-select" @change="loadSessions">
          <option value="">{{ t('doctor.allStatuses') }}</option>
          <option value="new">{{ t('doctor.statusNew') }}</option>
          <option value="under_review">{{ t('doctor.statusUnderReview') }}</option>
          <option value="awaiting_patient_reply">{{ t('doctor.statusAwaitingPatient') }}</option>
          <option value="follow_up_recommended">{{ t('doctor.statusFollowUp') }}</option>
          <option value="ready_for_visit">{{ t('doctor.statusReadyForVisit') }}</option>
          <option value="resolved">{{ t('doctor.statusResolved') }}</option>
          <option value="escalated">{{ t('doctor.statusEscalated') }}</option>
        </select>
        <select v-model="filters.conversationState" class="field-select filter-select" @change="loadSessions">
          <option value="">{{ t('doctor.allConversations') }}</option>
          <option value="waiting_doctor">{{ t('doctor.convWaitingDoctor') }}</option>
          <option value="waiting_patient">{{ t('doctor.convWaitingPatient') }}</option>
          <option value="active">{{ t('doctor.convActive') }}</option>
          <option value="closed">{{ t('doctor.convClosed') }}</option>
        </select>
        <select v-model="filters.priorityLevel" class="field-select filter-select" @change="loadSessions">
          <option value="">{{ t('doctor.allPriorities') }}</option>
          <option value="urgent">{{ t('doctor.priorityUrgent') }}</option>
          <option value="high">{{ t('doctor.priorityHigh') }}</option>
          <option value="normal">{{ t('doctor.priorityNormal') }}</option>
          <option value="low">{{ t('doctor.priorityLow') }}</option>
        </select>
        <select v-model="filters.sort" class="field-select filter-select" @change="loadSessions">
          <option value="">{{ t('doctor.sortDate') }}</option>
          <option value="risk">{{ t('doctor.sortRisk') }}</option>
          <option value="priority">{{ t('doctor.sortPriority') }}</option>
        </select>
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="clearFiltersAndReload">
          {{ t('doctor.clearFilters') }}
        </button>
      </div>

      <div v-if="sessionsLoading" class="empty-state">{{ t('common.loading') }}</div>
      <div v-else-if="sessions.length === 0" class="empty-state">
        {{ filters.q ? t('doctor.noResults') : t('doctor.noSessions') }}
      </div>
      <div v-else class="session-list">
        <div v-for="session in sessions" :key="session.id" class="case-card" @click="openSession(session.id)">
          <CaseCardContent :session="session" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useDoctorStore } from '@/stores/doctor'
import CaseCardContent from '@/components/doctor/CaseCardContent.vue'

const { t } = useI18n()
const router = useRouter()
const doctorStore = useDoctorStore()

const stats = computed(() => doctorStore.stats)
const queues = computed(() => doctorStore.queues)
const sessions = computed(() => doctorStore.sessions)
const dashboardLoading = computed(() => doctorStore.dashboardLoading)
const sessionsLoading = computed(() => doctorStore.sessionsLoading)
const filters = doctorStore.filters

const hasActiveFilters = computed(() =>
  !!(filters.q || filters.riskLevel || filters.doctorStatus || filters.conversationState || filters.priorityLevel || filters.sort)
)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function debouncedLoad() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => doctorStore.loadSessions(), 300)
}

function loadSessions() {
  doctorStore.loadSessions()
}

function clearFiltersAndReload() {
  doctorStore.clearFilters()
  doctorStore.loadSessions()
}

function openSession(id: string) {
  router.push(`/doctor/session/${id}`)
}

onMounted(() => {
  doctorStore.loadDashboard()
  doctorStore.loadSessions()
})
</script>

<style scoped>
.doctor-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.doctor-header {
  margin-bottom: var(--space-6);
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

.doctor-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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

.stat-card--active { border-color: var(--primary); background: var(--blue-50); }
.stat-card--high-risk { border-color: var(--c-level-1); background: var(--c-level-1-bg); }
.stat-card--waiting-doctor { border-color: var(--c-warning); background: var(--warning-bg); }
.stat-card--waiting-patient { border-color: var(--c-level-3); background: var(--c-level-3-bg); }
.stat-card--resolved { border-color: var(--c-success); background: rgba(16, 185, 129, 0.05); }

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

.doctor-queues {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.queue-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.queue-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text);
}

.queue-title svg {
  width: 20px;
  height: 20px;
  color: var(--primary);
}

.queue-title--urgent svg { color: var(--c-level-1); }
.queue-title--reply svg { color: var(--c-warning); }

.queue-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  background: var(--primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 700;
}

.queue-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-3);
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
  flex-wrap: wrap;
}

.filter-search {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.filter-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  pointer-events: none;
}

.filter-search-input {
  padding-left: 34px;
  font-size: var(--text-sm);
}

.filter-select {
  font-size: var(--text-sm);
  min-width: 120px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.case-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.case-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.case-card--urgent {
  border-left: 4px solid var(--c-level-1);
}

.case-card--reply {
  border-left: 4px solid var(--c-warning);
}

@media (max-width: 768px) {
  .doctor-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .queue-cards {
    grid-template-columns: 1fr;
  }

  .doctor-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: 100%;
  }
}
</style>
