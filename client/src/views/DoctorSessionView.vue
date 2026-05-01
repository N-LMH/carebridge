<template>
  <div class="doctor-detail">
    <div class="doctor-detail-nav">
      <router-link to="/doctor" class="btn btn-ghost btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        {{ t('doctor.backToList') }}
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
        </div>
        <span class="risk-badge" :class="riskClass">{{ session.assessment.riskLevel }}</span>
      </header>

      <div class="detail-layout">
        <div class="detail-main">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              {{ t('doctor.triageResult') }}
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
                    <span v-for="flag in session.assessment.redFlags" :key="flag" class="red-flag">{{ flag }}</span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div class="detail-card">
            <h2 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              {{ t('doctor.visitSummary') }}
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
            </dl>
          </div>

          <div class="detail-card" v-if="session.followUps?.length">
            <h2 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/></svg>
              {{ t('doctor.followUpHistory') }}
              <span class="detail-card-count">{{ session.followUps.length }}</span>
            </h2>
            <div class="detail-followups">
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

        <div class="detail-sidebar">
          <div class="conversation-card">
            <h2 class="conversation-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ t('doctor.conversationTitle') }}
            </h2>

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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { localizeSession } from '@/i18n/medical'
import { api } from '@/services/api'
import type { Session, Message, Gender, RiskLevel } from '@/types'

const { locale, t } = useI18n()
const route = useRoute()

const rawSession = ref<Session | null>(null)
const messages = ref<Message[]>([])
const loading = ref(true)
const newMessage = ref('')
const sending = ref(false)
const messagesListRef = ref<HTMLElement | null>(null)

const session = computed(() => {
  return rawSession.value
    ? localizeSession(rawSession.value, locale.value)
    : null
})

const riskClass = computed(() => {
  const level = session.value?.assessment?.riskLevel as RiskLevel
  if (level === 'Level 1') return 'risk-badge--1'
  if (level === 'Level 2') return 'risk-badge--2'
  if (level === 'Level 3') return 'risk-badge--3'
  return 'risk-badge--4'
})

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

function scrollToBottom() {
  nextTick(() => {
    if (messagesListRef.value) {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
    }
  })
}

async function handleSendMessage() {
  if (!newMessage.value.trim() || sending.value) return

  sending.value = true
  try {
    const data = await api.sendDoctorMessage(route.params.id as string, newMessage.value.trim())
    messages.value.push(data.message)
    newMessage.value = ''
    scrollToBottom()
  } catch {
    // silent
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  const id = route.params.id as string
  try {
    const data = await api.getDoctorSession(id)
    rawSession.value = data.session
    messages.value = data.session.messages || []
  } catch {
    rawSession.value = null
  } finally {
    loading.value = false
    scrollToBottom()
  }
})
</script>

<style scoped>
.doctor-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

.doctor-detail-nav {
  margin-bottom: var(--space-6);
}

.doctor-detail-nav svg {
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

.risk-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.risk-badge--1 { background: var(--level-1-bg); color: var(--level-1); border: 1px solid var(--level-1-border); }
.risk-badge--2 { background: var(--level-2-bg); color: var(--level-2); border: 1px solid var(--level-2-border); }
.risk-badge--3 { background: var(--level-3-bg); color: var(--level-3); border: 1px solid var(--level-3-border); }
.risk-badge--4 { background: var(--level-4-bg); color: var(--level-4); border: 1px solid var(--level-4-border); }

.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr 380px;
  }
}

.detail-main {
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
  min-width: 100px;
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

/* Conversation */
.detail-sidebar {
  position: sticky;
  top: 72px;
  align-self: start;
}

.conversation-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 600px;
}

.conversation-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.conversation-title svg {
  width: 20px;
  height: 20px;
  color: var(--primary);
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.messages-empty {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.message {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
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
  margin-bottom: var(--space-1);
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
  margin-top: var(--space-1);
}

.message-form {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  font-size: var(--text-sm);
}

@media (max-width: 899px) {
  .detail-sidebar {
    position: static;
  }

  .conversation-card {
    height: 400px;
  }
}

@media (max-width: 640px) {
  .detail-field {
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-field dt {
    min-width: auto;
  }
}
</style>
