<template>
  <div class="doctor-detail">
    <div class="doctor-detail-nav">
      <router-link to="/doctor" class="btn btn-ghost btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        {{ t('doctor.backToList') }}
      </router-link>
    </div>

    <div v-if="sessionLoading" class="empty-state">{{ t('common.loading') }}</div>
    <div v-else-if="!session" class="empty-state">{{ t('sessionView.notFound') }}</div>

    <template v-else>
      <header class="snapshot-header">
        <div class="snapshot-main">
          <h1 class="snapshot-name">{{ session.intake.patientName || t('common.unnamedPatient') }}</h1>
          <p class="snapshot-meta">
            {{ session.intake.age ? `${session.intake.age} ${t('admin.yearsOld')}` : '' }}
            {{ session.intake.gender ? `· ${genderLabel(session.intake.gender)}` : '' }}
            {{ session.intake.region ? `· ${session.intake.region}` : '' }}
          </p>
          <p class="snapshot-complaint">{{ session.summary?.chiefComplaint || '—' }}</p>
        </div>
        <div class="snapshot-badges">
          <span class="risk-badge" :class="riskClass">{{ session.assessment.riskLevel }}</span>
          <span class="status-badge" :class="statusBadgeClass">{{ doctorStatusLabel }}</span>
          <span class="conv-badge" :class="convBadgeClass">{{ convLabel }}</span>
          <span v-if="session.priorityLevel === 'urgent' || session.priorityLevel === 'high'" class="priority-badge" :class="priorityBadgeClass">
            {{ priorityLabel }}
          </span>
        </div>
        <div class="snapshot-info">
          <span class="snapshot-dept">{{ session.assessment.suggestedDepartment }}</span>
          <span class="snapshot-time">{{ t('doctor.createdAt') }}: {{ formatDate(session.createdAt) }}</span>
        </div>
      </header>

      <div class="detail-layout">
        <div class="detail-main">
          <div class="detail-card">
            <h2 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              {{ t('doctor.triageInterpretation') }}
            </h2>
            <div class="interpretation-grid">
              <div class="interp-block">
                <h3 class="interp-label">{{ t('doctor.whyThisLevel') }}</h3>
                <ol class="interp-list">
                  <li v-for="(r, i) in session.assessment.reasoning" :key="i">{{ r }}</li>
                </ol>
              </div>
              <div class="interp-block" v-if="session.assessment.redFlags?.length">
                <h3 class="interp-label">{{ t('doctor.mainRedFlags') }}</h3>
                <div class="red-flags">
                  <span v-for="flag in session.assessment.redFlags" :key="flag" class="red-flag">{{ flag }}</span>
                </div>
              </div>
              <div class="interp-block" v-else>
                <h3 class="interp-label">{{ t('doctor.mainRedFlags') }}</h3>
                <p class="interp-text">{{ t('doctor.noRedFlags') }}</p>
              </div>
              <div class="interp-block">
                <h3 class="interp-label">{{ t('doctor.nextStep') }}</h3>
                <ol class="interp-list">
                  <li v-for="(s, i) in session.assessment.immediateSteps" :key="i">{{ s }}</li>
                </ol>
              </div>
              <div class="interp-block">
                <h3 class="interp-label">{{ t('doctor.uncertainty') }}</h3>
                <p class="interp-text">{{ t('doctor.uncertaintyText') }}</p>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h2 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {{ t('doctor.patientInfo') }}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              {{ t('doctor.visitSummary') }}
            </h2>
            <div class="summary-text-box">
              <p>{{ session.summary?.summaryText }}</p>
            </div>
            <dl class="detail-fields">
              <div class="detail-field">
                <dt>{{ t('summary.chiefComplaint') }}</dt>
                <dd>{{ session.summary?.chiefComplaint }}</dd>
              </div>
              <div class="detail-field">
                <dt>{{ t('summary.onset') }}</dt>
                <dd>{{ session.summary?.onset }}</dd>
              </div>
              <div class="detail-field">
                <dt>{{ t('summary.mainSymptoms') }}</dt>
                <dd>{{ session.summary?.mainSymptoms }}</dd>
              </div>
              <div class="detail-field">
                <dt>{{ t('summary.medicalHistory') }}</dt>
                <dd>{{ session.summary?.medicalHistory }}</dd>
              </div>
            </dl>
          </div>

          <div class="detail-card" v-if="session.followUps?.length">
            <h2 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/></svg>
              {{ t('doctor.followUpHistory') }}
              <span class="detail-card-count">{{ session.followUps.length }}</span>
            </h2>
            <div class="followup-timeline">
              <div v-for="(fu, idx) in session.followUps" :key="fu.id" class="followup-entry" :class="{ latest: idx === 0 }">
                <div class="followup-dot"></div>
                <div class="followup-content">
                  <span class="followup-time">{{ formatDate(fu.createdAt) }}</span>
                  <div class="followup-body">
                    <span v-if="fu.temperatureC" class="followup-item">
                      <span class="followup-label">{{ t('followupLog.tempPrefix') }}</span>
                      <span :class="tempClass(fu.temperatureC)">{{ fu.temperatureC }}°C</span>
                    </span>
                    <span v-if="fu.symptomChange" class="followup-item">
                      <span class="followup-label">{{ t('followupLog.changePrefix') }}</span>
                      {{ fu.symptomChange }}
                    </span>
                    <span v-if="fu.medicationTaken" class="followup-item">
                      <span class="followup-label">{{ t('followupLog.medicationPrefix') }}</span>
                      {{ fu.medicationTaken }}
                    </span>
                    <span v-if="fu.note" class="followup-item">
                      <span class="followup-label">{{ t('followupLog.notePrefix') }}</span>
                      {{ fu.note }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="action-card">
            <h2 class="action-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              {{ t('doctor.actionsTitle') }}
            </h2>

            <div class="action-field">
              <label class="action-label">{{ t('doctor.changeStatus') }}</label>
              <select v-model="doctorStatusValue" class="field-select" @change="updateStatus">
                <option value="new">{{ t('doctor.statusNew') }}</option>
                <option value="under_review">{{ t('doctor.statusUnderReview') }}</option>
                <option value="awaiting_patient_reply">{{ t('doctor.statusAwaitingPatient') }}</option>
                <option value="follow_up_recommended">{{ t('doctor.statusFollowUp') }}</option>
                <option value="ready_for_visit">{{ t('doctor.statusReadyForVisit') }}</option>
                <option value="resolved">{{ t('doctor.statusResolved') }}</option>
                <option value="escalated">{{ t('doctor.statusEscalated') }}</option>
              </select>
            </div>

            <div class="action-field">
              <label class="action-label">{{ t('doctor.setPriority') }}</label>
              <select v-model="priorityValue" class="field-select" @change="updatePriority">
                <option value="low">{{ t('doctor.priorityLow') }}</option>
                <option value="normal">{{ t('doctor.priorityNormal') }}</option>
                <option value="high">{{ t('doctor.priorityHigh') }}</option>
                <option value="urgent">{{ t('doctor.priorityUrgent') }}</option>
              </select>
            </div>

            <div class="action-field">
              <label class="action-label">{{ t('doctor.doctorNote') }}</label>
              <textarea
                v-model="doctorNoteValue"
                class="field-textarea"
                rows="4"
                :placeholder="t('doctor.doctorNotePlaceholder')"
              ></textarea>
              <button class="btn btn-primary btn-sm" @click="saveNote" :disabled="savingNote">
                {{ t('doctor.saveNote') }}
              </button>
              <p v-if="noteStatus" class="action-status">{{ noteStatus }}</p>
            </div>
          </div>

          <div class="conversation-card">
            <h2 class="conversation-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ t('doctor.conversationTitle') }}
            </h2>

            <div v-if="session.conversationState === 'waiting_doctor'" class="conversation-indicator indicator--doctor">
              {{ t('doctor.waitingDoctorIndicator') }}
            </div>
            <div v-else-if="session.conversationState === 'waiting_patient'" class="conversation-indicator indicator--patient">
              {{ t('doctor.waitingPatientIndicator') }}
            </div>

            <div class="messages-list" ref="messagesListRef">
              <div v-if="messages.length === 0" class="messages-empty">
                {{ t('doctor.noMessages') }}
              </div>
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message"
                :class="{ 'message--doctor': msg.senderType === 'doctor', 'message--patient': msg.senderType === 'patient', 'message--system': msg.senderType === 'system' }"
              >
                <span class="message-sender">
                  {{ msg.senderType === 'doctor' ? t('doctor.doctorSays') : msg.senderType === 'patient' ? t('doctor.patientSays') : 'System' }}
                </span>
                <p class="message-content">{{ msg.content }}</p>
                <span class="message-time">{{ formatDate(msg.createdAt) }}</span>
              </div>
            </div>

            <div class="quick-prompts">
              <span class="quick-prompts-label">{{ t('doctor.quickPrompts') }}</span>
              <div class="quick-prompts-list">
                <button type="button" class="quick-prompt-btn" @click="insertPrompt('promptDuration')">{{ t('doctor.promptDuration') }}</button>
                <button type="button" class="quick-prompt-btn" @click="insertPrompt('promptWorsened')">{{ t('doctor.promptWorsened') }}</button>
                <button type="button" class="quick-prompt-btn" @click="insertPrompt('promptMedication')">{{ t('doctor.promptMedication') }}</button>
                <button type="button" class="quick-prompt-btn" @click="insertPrompt('promptWarningSigns')">{{ t('doctor.promptWarningSigns') }}</button>
                <button type="button" class="quick-prompt-btn" @click="insertPrompt('promptVisitTiming')">{{ t('doctor.promptVisitTiming') }}</button>
              </div>
            </div>

            <form @submit.prevent="handleSendMessage" class="message-form">
              <input
                v-model="newMessage"
                class="field-input message-input"
                type="text"
                :placeholder="t('doctor.messagePlaceholder')"
              />
              <button type="submit" class="btn btn-primary btn-sm" :disabled="!newMessage.trim() || sending">
                {{ t('doctor.sendMessage') }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { localizeSession, localizeDoctorStatus, localizeConversationState, localizePriority } from '@/i18n/medical'
import { useDoctorStore } from '@/stores/doctor'
import type { Gender, RiskLevel, DoctorStatus, PriorityLevel } from '@/types'

const { locale, t } = useI18n()
const route = useRoute()
const doctorStore = useDoctorStore()

const sessionLoading = computed(() => doctorStore.sessionLoading)
const session = computed(() => {
  return doctorStore.activeSession
    ? localizeSession(doctorStore.activeSession, locale.value)
    : null
})
const messages = computed(() => doctorStore.activeSession?.messages || [])

const newMessage = ref('')
const sending = ref(false)
const messagesListRef = ref<HTMLElement | null>(null)

const doctorStatusValue = ref<DoctorStatus>('new')
const priorityValue = ref<PriorityLevel>('normal')
const doctorNoteValue = ref('')
const savingNote = ref(false)
const noteStatus = ref('')

const doctorStatusLabel = computed(() => localizeDoctorStatus(doctorStatusValue.value, locale.value))
const convLabel = computed(() => localizeConversationState(session.value?.conversationState || 'none', locale.value))
const priorityLabel = computed(() => localizePriority(priorityValue.value, locale.value))

const riskClass = computed(() => {
  const level = session.value?.assessment?.riskLevel as RiskLevel
  if (level === 'Level 1') return 'risk-badge--1'
  if (level === 'Level 2') return 'risk-badge--2'
  if (level === 'Level 3') return 'risk-badge--3'
  return 'risk-badge--4'
})

const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    'new': 'status--new',
    'under_review': 'status--review',
    'awaiting_patient_reply': 'status--waiting',
    'follow_up_recommended': 'status--followup',
    'ready_for_visit': 'status--ready',
    'resolved': 'status--resolved',
    'escalated': 'status--escalated'
  }
  return map[doctorStatusValue.value] || 'status--new'
})

const convBadgeClass = computed(() => {
  const map: Record<string, string> = {
    'waiting_doctor': 'conv--waiting-doctor',
    'waiting_patient': 'conv--waiting-patient',
    'active': 'conv--active',
    'closed': 'conv--closed'
  }
  return map[session.value?.conversationState || 'none'] || ''
})

const priorityBadgeClass = computed(() => {
  if (priorityValue.value === 'urgent') return 'priority--urgent'
  return 'priority--high'
})

watch(() => doctorStore.activeSession, (s) => {
  if (s) {
    doctorStatusValue.value = (s.doctorStatus || 'new') as DoctorStatus
    priorityValue.value = (s.priorityLevel || 'normal') as PriorityLevel
    doctorNoteValue.value = s.doctorNote || ''
  }
}, { immediate: true })

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

function tempClass(temp: number): string {
  if (temp >= 39) return 'temp-high'
  if (temp >= 37.5) return 'temp-elevated'
  return 'temp-normal'
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesListRef.value) {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
    }
  })
}

async function updateStatus() {
  const id = route.params.id as string
  try {
    await doctorStore.patchSession(id, { doctorStatus: doctorStatusValue.value })
  } catch { /* silent */ }
}

async function updatePriority() {
  const id = route.params.id as string
  try {
    await doctorStore.patchSession(id, { priorityLevel: priorityValue.value })
  } catch { /* silent */ }
}

async function saveNote() {
  const id = route.params.id as string
  savingNote.value = true
  try {
    await doctorStore.patchSession(id, { doctorNote: doctorNoteValue.value })
    noteStatus.value = t('doctor.noteSaved')
    setTimeout(() => { noteStatus.value = '' }, 2000)
  } catch {
    noteStatus.value = t('doctor.noteSaveFailed')
  } finally {
    savingNote.value = false
  }
}

function insertPrompt(key: string) {
  newMessage.value = t(`doctor.${key}`)
}

async function handleSendMessage() {
  if (!newMessage.value.trim() || sending.value) return

  sending.value = true
  try {
    await doctorStore.sendMessage(route.params.id as string, newMessage.value.trim())
    newMessage.value = ''
    scrollToBottom()
  } catch { /* silent */ } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await doctorStore.loadSession(route.params.id as string)
  scrollToBottom()
})
</script>

<style scoped>
.doctor-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.doctor-detail-nav {
  margin-bottom: var(--space-4);
}

.doctor-detail-nav svg {
  width: 16px;
  height: 16px;
}

/* Snapshot Header */
.snapshot-header {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  padding: var(--space-5) var(--space-6);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.snapshot-main {
  flex: 1;
  min-width: 200px;
}

.snapshot-name {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--text);
}

.snapshot-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.snapshot-complaint {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: var(--space-2);
  font-style: italic;
}

.snapshot-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.snapshot-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  align-items: flex-end;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.snapshot-dept {
  font-weight: 600;
  color: var(--text-secondary);
}

/* Badges */
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

.status-badge, .conv-badge, .priority-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}

.status--new { background: var(--blue-50); color: var(--primary); }
.status--review { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }
.status--waiting { background: var(--warning-bg); color: var(--c-warning); }
.status--followup { background: rgba(6, 182, 212, 0.1); color: #0891b2; }
.status--ready { background: rgba(16, 185, 129, 0.1); color: var(--c-success); }
.status--resolved { background: var(--gray-100); color: var(--text-muted); }
.status--escalated { background: rgba(239, 68, 68, 0.1); color: var(--c-error); }

.conv--waiting-doctor { background: var(--warning-bg); color: var(--c-warning); }
.conv--waiting-patient { background: rgba(6, 182, 212, 0.1); color: #0891b2; }
.conv--active { background: rgba(16, 185, 129, 0.1); color: var(--c-success); }
.conv--closed { background: var(--gray-100); color: var(--text-muted); }

.priority--urgent { background: rgba(239, 68, 68, 0.15); color: var(--c-error); font-weight: 700; }
.priority--high { background: rgba(245, 158, 11, 0.15); color: var(--c-warning); font-weight: 700; }

/* Layout */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .detail-layout {
    grid-template-columns: 1fr 380px;
  }
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  position: sticky;
  top: 72px;
  align-self: start;
}

/* Cards */
.detail-card, .action-card, .conversation-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  padding: var(--space-5);
}

.detail-card-title, .action-card-title, .conversation-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-light);
}

.detail-card-title svg, .action-card-title svg, .conversation-title svg {
  width: 20px;
  height: 20px;
  color: var(--primary);
}

.detail-card-count {
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

/* Interpretation */
.interpretation-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .interpretation-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.interp-block {
  padding: var(--space-3);
  background: var(--gray-50);
  border-radius: var(--radius-md);
}

.interp-label {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.interp-list {
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.interp-list li {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.interp-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.red-flags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.red-flag {
  display: inline-flex;
  padding: var(--space-1) var(--space-3);
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--c-error);
}

/* Fields */
.detail-fields {
  display: flex;
  flex-direction: column;
}

.detail-field {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-light);
}

.detail-field:last-child { border-bottom: none; }

.detail-field dt {
  min-width: 90px;
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

.summary-text-box {
  background: var(--c-primary-50);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.summary-text-box p {
  font-size: var(--text-sm);
  color: var(--text);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Follow-up timeline */
.followup-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: relative;
  padding-left: var(--space-5);
}

.followup-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--border-light);
}

.followup-entry {
  position: relative;
  padding: var(--space-3);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--border-light);
}

.followup-entry.latest {
  border-left-color: var(--primary);
  background: var(--c-primary-50);
}

.followup-dot {
  position: absolute;
  left: calc(-1 * var(--space-5) - 1px);
  top: var(--space-4);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  border: 2px solid var(--surface);
}

.followup-entry.latest .followup-dot {
  background: var(--primary);
}

.followup-time {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--primary);
  margin-bottom: var(--space-1);
}

.followup-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
}

.followup-item {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.followup-label {
  font-weight: 600;
  color: var(--text);
  margin-right: var(--space-1);
}

.temp-high { color: var(--c-error); font-weight: 600; }
.temp-elevated { color: var(--c-warning); font-weight: 600; }
.temp-normal { color: var(--c-success); }

/* Action panel */
.action-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.action-field:last-child { margin-bottom: 0; }

.action-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text);
}

.action-status {
  font-size: var(--text-xs);
  color: var(--c-success);
  margin-top: var(--space-1);
}

/* Conversation */
.conversation-card {
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.conversation-indicator {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  margin-bottom: var(--space-3);
  text-align: center;
}

.indicator--doctor { background: var(--warning-bg); color: var(--c-warning); }
.indicator--patient { background: rgba(6, 182, 212, 0.1); color: #0891b2; }

.messages-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  min-height: 150px;
  max-height: 250px;
}

.messages-empty {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.message {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  max-width: 85%;
}

.message--doctor {
  background: var(--blue-50);
  align-self: flex-end;
  border-bottom-right-radius: var(--radius-sm);
}

.message--patient {
  background: var(--gray-50);
  align-self: flex-start;
  border-bottom-left-radius: var(--radius-sm);
}

.message--system {
  background: var(--warning-bg);
  align-self: center;
  text-align: center;
  font-size: var(--text-xs);
}

.message-sender {
  display: block;
  font-size: var(--text-xs);
  font-weight: 700;
  margin-bottom: 2px;
}

.message--doctor .message-sender { color: var(--primary); }
.message--patient .message-sender { color: var(--text-secondary); }

.message-content {
  font-size: var(--text-sm);
  color: var(--text);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.message-time {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.quick-prompts {
  margin-bottom: var(--space-3);
}

.quick-prompts-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.quick-prompts-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.quick-prompt-btn {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  background: var(--gray-50);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  line-height: 1.3;
}

.quick-prompt-btn:hover {
  background: var(--blue-50);
  border-color: var(--primary);
  color: var(--primary);
}

.message-form {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  font-size: var(--text-sm);
}

@media (max-width: 1023px) {
  .detail-sidebar {
    position: static;
  }

  .snapshot-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .snapshot-info {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .detail-field {
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-field dt { min-width: auto; }

  .interpretation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
