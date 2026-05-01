<template>
  <div class="admin-detail">
    <div class="admin-detail-nav">
      <router-link to="/admin" class="btn btn-ghost btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        {{ t('admin.backToList') }}
      </router-link>
    </div>

    <div v-if="loading" class="empty-state">{{ t('common.loading') }}</div>
    <div v-else-if="!session" class="empty-state">{{ t('sessionView.notFound') }}</div>

    <template v-else>
      <header class="detail-header">
        <div class="detail-header-info">
          <h1 class="detail-name">{{ session.intake.patientName || t('common.unnamedPatient') }}</h1>
          <p class="detail-meta">
            {{ session.intake.age ? `${session.intake.age} ${t('admin.yearsOld')}` : '' }}
            {{ session.intake.gender ? `· ${genderLabel(session.intake.gender)}` : '' }}
            {{ session.intake.region ? `· ${session.intake.region}` : '' }}
          </p>
          <div class="detail-header-tags">
            <span v-for="tag in sessionTags" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>
        </div>
        <div class="detail-header-right">
          <span class="risk-badge" :class="riskClass">{{ session.assessment.riskLevel }}</span>
          <select
            v-model="adminStatus"
            class="field-select status-select"
            @change="updateStatus"
          >
            <option value="new">{{ t('admin.statusNew') }}</option>
            <option value="reviewed">{{ t('admin.statusReviewed') }}</option>
            <option value="urgent">{{ t('admin.statusUrgent') }}</option>
            <option value="resolved">{{ t('admin.statusResolved') }}</option>
            <option value="archived">{{ t('admin.statusArchived') }}</option>
          </select>
        </div>
      </header>

      <div class="admin-note-section">
        <h3 class="admin-note-title">{{ t('admin.adminNote') }}</h3>
        <div class="admin-note-input-row">
          <textarea
            v-model="adminNote"
            class="field-textarea admin-note-textarea"
            rows="2"
            :placeholder="t('admin.adminNotePlaceholder')"
          ></textarea>
          <button class="btn btn-primary btn-sm" @click="saveNote">{{ t('admin.saveNote') }}</button>
        </div>
        <p v-if="noteStatus" class="note-status">{{ noteStatus }}</p>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <h2 class="detail-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {{ t('admin.intakeData') }}
          </h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>{{ t('intake.symptoms') }}</dt>
              <dd>
                <span v-for="s in session.intake.symptoms" :key="s" class="chip">{{ s }}</span>
              </dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('intake.symptomNotes') }}</dt>
              <dd>{{ session.intake.symptomNotes || '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('intake.symptomDays') }}</dt>
              <dd>{{ session.intake.symptomDays ?? '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('intake.severity') }}</dt>
              <dd>{{ session.intake.severity || '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('intake.chronicConditions') }}</dt>
              <dd>{{ session.intake.chronicConditions?.length ? session.intake.chronicConditions.join(', ') : '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('intake.medications') }}</dt>
              <dd>{{ session.intake.medications || '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('intake.allergies') }}</dt>
              <dd>{{ session.intake.allergies || '—' }}</dd>
            </div>
          </dl>
        </div>

        <div class="detail-card">
          <h2 class="detail-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            {{ t('admin.assessment') }}
          </h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>{{ t('result.scoreTitle') }}</dt>
              <dd class="detail-score">{{ session.assessment.scoreBreakdown?.total ?? '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('admin.actionLabel') }}</dt>
              <dd><strong>{{ session.assessment.actionLabel }}</strong></dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('summary.suggestedDepartment') }}</dt>
              <dd>{{ session.assessment.suggestedDepartment }}</dd>
            </div>
            <div class="detail-field" v-if="session.assessment.redFlags?.length">
              <dt>{{ t('summary.riskNotes') }}</dt>
              <dd>
                <div class="red-flags">
                  <span v-for="flag in session.assessment.redFlags" :key="flag" class="red-flag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                    {{ flag }}
                  </span>
                </div>
              </dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('result.reasoningTitle') }}</dt>
              <dd>
                <ul class="detail-list">
                  <li v-for="(r, i) in session.assessment.reasoning" :key="i">{{ r }}</li>
                </ul>
              </dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('result.stepsTitle') }}</dt>
              <dd>
                <ol class="detail-list ordered">
                  <li v-for="(s, i) in session.assessment.immediateSteps" :key="i">{{ s }}</li>
                </ol>
              </dd>
            </div>
          </dl>
        </div>

        <div class="detail-card">
          <h2 class="detail-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
            {{ t('admin.visitSummary') }}
          </h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>{{ t('summary.chiefComplaint') }}</dt>
              <dd>{{ session.summary.chiefComplaint }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('summary.onset') }}</dt>
              <dd>{{ session.summary.onset }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('summary.mainSymptoms') }}</dt>
              <dd>{{ session.summary.mainSymptoms }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('summary.medicalHistory') }}</dt>
              <dd>{{ session.summary.medicalHistory }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('summary.currentMedication') }}</dt>
              <dd>{{ session.summary.currentMedication }}</dd>
            </div>
            <div class="detail-field">
              <dt>{{ t('summary.allergies') }}</dt>
              <dd>{{ session.summary.allergies }}</dd>
            </div>
          </dl>
        </div>

        <div class="detail-card">
          <h2 class="detail-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/></svg>
            {{ t('admin.followUpHistory') }}
            <span class="detail-card-count" v-if="session.followUps?.length">{{ session.followUps.length }}</span>
          </h2>
          <div v-if="!session.followUps?.length" class="detail-empty">{{ t('followupLog.empty') }}</div>
          <div v-else class="detail-followups">
            <div v-for="fu in session.followUps" :key="fu.id" class="detail-followup">
              <span class="detail-followup-time">{{ formatDate(fu.createdAt) }}</span>
              <div class="detail-followup-body">
                <span v-if="fu.temperatureC" class="detail-followup-item">{{ t('followupLog.tempPrefix') }}: {{ fu.temperatureC }}°C</span>
                <span v-if="fu.symptomChange" class="detail-followup-item">{{ t('followupLog.changePrefix') }}: {{ fu.symptomChange }}</span>
                <span v-if="fu.medicationTaken" class="detail-followup-item">{{ t('followupLog.medicationPrefix') }}: {{ fu.medicationTaken }}</span>
                <span v-if="fu.note" class="detail-followup-item">{{ t('followupLog.notePrefix') }}: {{ fu.note }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { localizeSession } from '@/i18n/medical'
import { api } from '@/services/api'
import type { Session, AdminStatus } from '@/types'

const { locale, t } = useI18n()
const route = useRoute()

const rawSession = ref<Session | null>(null)
const loading = ref(true)
const adminNote = ref('')
const adminStatus = ref<AdminStatus>('new')
const noteStatus = ref('')

const session = computed(() => {
  return rawSession.value
    ? localizeSession(rawSession.value, locale.value)
    : null
})

const sessionTags = computed(() => rawSession.value?.tags || [])

const riskClass = computed(() => {
  const level = session.value?.assessment?.riskLevel
  if (level === 'Level 1') return 'risk-badge--1'
  if (level === 'Level 2') return 'risk-badge--2'
  if (level === 'Level 3') return 'risk-badge--3'
  return 'risk-badge--4'
})

function genderLabel(g: string) {
  if (g === 'male') return t('gender.male')
  if (g === 'female') return t('gender.female')
  if (g === 'other') return t('gender.other')
  return ''
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US') + ' ' + d.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

async function saveNote() {
  const id = route.params.id as string
  try {
    await api.updateAdminSession(id, { adminNote: adminNote.value })
    noteStatus.value = t('admin.noteSaved')
    setTimeout(() => { noteStatus.value = '' }, 2000)
  } catch {
    noteStatus.value = t('admin.noteSaveFailed')
  }
}

async function updateStatus() {
  const id = route.params.id as string
  try {
    await api.updateAdminSession(id, { adminStatus: adminStatus.value })
  } catch {
    // silent
  }
}

onMounted(async () => {
  const id = route.params.id as string
  try {
    const data = await api.getAdminSession(id)
    rawSession.value = data.session
    adminNote.value = data.session.adminNote || ''
    adminStatus.value = (data.session.adminStatus || 'new') as AdminStatus
  } catch {
    rawSession.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.admin-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-6);
}

.admin-detail-nav {
  margin-bottom: var(--space-6);
}

.admin-detail-nav svg {
  width: 16px;
  height: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 2px solid var(--border);
  flex-wrap: wrap;
}

.detail-name {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text);
}

.detail-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.detail-header-tags {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.tag-chip {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.detail-header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.risk-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  white-space: nowrap;
}

.risk-badge--1 { background: var(--level-1-bg); color: var(--level-1); border: 1px solid var(--level-1-border); }
.risk-badge--2 { background: var(--level-2-bg); color: var(--level-2); border: 1px solid var(--level-2-border); }
.risk-badge--3 { background: var(--level-3-bg); color: var(--level-3); border: 1px solid var(--level-3-border); }
.risk-badge--4 { background: var(--level-4-bg); color: var(--level-4); border: 1px solid var(--level-4-border); }

.status-select {
  font-size: var(--text-sm);
  min-width: 120px;
}

.admin-note-section {
  margin-bottom: var(--space-6);
  padding: var(--space-5);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.admin-note-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--space-3);
}

.admin-note-input-row {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
}

.admin-note-textarea {
  flex: 1;
  font-size: var(--text-sm);
}

.note-status {
  font-size: var(--text-xs);
  color: var(--c-success);
  margin-top: var(--space-2);
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.detail-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  padding: var(--space-6);
}

.detail-card-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-light);
}

.detail-card-title svg {
  width: 22px;
  height: 22px;
  color: var(--primary);
}

.detail-card-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  background: var(--primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 700;
}

.detail-fields {
  display: flex;
  flex-direction: column;
}

.detail-field {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-light);
}

.detail-field:last-child {
  border-bottom: none;
}

.detail-field dt {
  min-width: 120px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary);
  flex-shrink: 0;
}

.detail-field dd {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.detail-score {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--primary);
}

.detail-list {
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-list li {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.detail-list.ordered {
  list-style: decimal;
}

.detail-empty {
  font-size: var(--text-sm);
  color: var(--text-muted);
  padding: var(--space-4) 0;
}

.detail-followups {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-followup {
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--primary);
}

.detail-followup-time {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--primary);
  margin-bottom: var(--space-2);
}

.detail-followup-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.detail-followup-item {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.red-flags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.red-flag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--c-error);
}

.red-flag svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .detail-field {
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-field dt {
    min-width: auto;
  }

  .detail-header {
    flex-direction: column;
  }

  .admin-note-input-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
