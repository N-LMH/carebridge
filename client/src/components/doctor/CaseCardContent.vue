<template>
  <div class="case-content">
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
        <span class="status-badge" :class="statusClass">{{ doctorStatusLabel }}</span>
        <span v-if="session.priorityLevel === 'urgent' || session.priorityLevel === 'high'" class="priority-badge" :class="priorityClass">
          {{ priorityLabel }}
        </span>
      </div>
    </div>
    <div class="case-symptoms">
      <span v-for="s in session.symptoms?.slice(0, 4)" :key="s" class="chip">{{ s }}</span>
      <span v-if="session.symptoms?.length > 4" class="chip">+{{ session.symptoms.length - 4 }}</span>
    </div>
    <div class="case-footer">
      <span class="case-dept">{{ session.suggestedDepartment }}</span>
      <span class="case-conv" :class="convClass">{{ convLabel }}</span>
      <span class="case-messages" v-if="session.messageCount > 0">
        {{ t('doctor.messageCount', { count: session.messageCount }) }}
      </span>
      <span v-if="session.unreadCount > 0" class="case-unread">
        {{ t('doctor.unreadCount', { count: session.unreadCount }) }}
      </span>
      <span class="case-time">{{ formatDate(session.createdAt) }}</span>
    </div>
    <div v-if="session.lastMessage" class="case-last-msg">
      <span class="last-msg-sender">{{ session.lastMessage.senderType === 'doctor' ? t('doctor.doctorSays') : t('doctor.patientSays') }}:</span>
      <span class="last-msg-text">{{ session.lastMessage.content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { localizeDoctorStatus, localizeConversationState, localizePriority } from '@/i18n/medical'
import type { DoctorSessionSummary, Gender, RiskLevel } from '@/types'

const { locale, t } = useI18n()

const props = defineProps<{
  session: DoctorSessionSummary
}>()

const doctorStatusLabel = computed(() => localizeDoctorStatus(props.session.doctorStatus, locale.value))
const convLabel = computed(() => localizeConversationState(props.session.conversationState, locale.value))
const priorityLabel = computed(() => localizePriority(props.session.priorityLevel, locale.value))

const statusClass = computed(() => {
  const map: Record<string, string> = {
    'new': 'status--new',
    'under_review': 'status--review',
    'awaiting_patient_reply': 'status--waiting',
    'follow_up_recommended': 'status--followup',
    'ready_for_visit': 'status--ready',
    'resolved': 'status--resolved',
    'escalated': 'status--escalated'
  }
  return map[props.session.doctorStatus] || 'status--new'
})

const convClass = computed(() => {
  const map: Record<string, string> = {
    'waiting_doctor': 'conv--waiting-doctor',
    'waiting_patient': 'conv--waiting-patient',
    'active': 'conv--active',
    'closed': 'conv--closed'
  }
  return map[props.session.conversationState] || ''
})

const priorityClass = computed(() => {
  if (props.session.priorityLevel === 'urgent') return 'priority--urgent'
  return 'priority--high'
})

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
</script>

<style scoped>
.case-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
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
  flex-wrap: wrap;
  justify-content: flex-end;
}

.risk-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
}

.risk-badge--1 { background: var(--level-1-bg); color: var(--level-1); border: 1px solid var(--level-1-border); }
.risk-badge--2 { background: var(--level-2-bg); color: var(--level-2); border: 1px solid var(--level-2-border); }
.risk-badge--3 { background: var(--level-3-bg); color: var(--level-3); border: 1px solid var(--level-3-border); }
.risk-badge--4 { background: var(--level-4-bg); color: var(--level-4); border: 1px solid var(--level-4-border); }

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
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

.priority-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
}

.priority--urgent { background: rgba(239, 68, 68, 0.15); color: var(--c-error); }
.priority--high { background: rgba(245, 158, 11, 0.15); color: var(--c-warning); }

.case-symptoms {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.case-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-muted);
  flex-wrap: wrap;
}

.case-dept {
  font-weight: 600;
  color: var(--text-secondary);
}

.case-conv {
  font-weight: 600;
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
}

.conv--waiting-doctor { background: var(--warning-bg); color: var(--c-warning); }
.conv--waiting-patient { background: rgba(6, 182, 212, 0.1); color: #0891b2; }
.conv--active { background: rgba(16, 185, 129, 0.1); color: var(--c-success); }
.conv--closed { background: var(--gray-100); color: var(--text-muted); }

.case-messages {
  color: var(--primary);
  font-weight: 600;
}

.case-unread {
  color: var(--c-error);
  font-weight: 700;
}

.case-last-msg {
  padding-top: var(--space-2);
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
</style>
