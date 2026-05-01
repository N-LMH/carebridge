<template>
  <div class="followup-tab">
    <form @submit.prevent="handleSave" class="followup-form" novalidate>
      <label class="field">
        <span class="field-label">{{ t('followupLog.temperature') }}</span>
        <input
          v-model.number="form.temperatureC"
          class="field-input"
          type="number"
          step="0.1"
          min="30"
          max="45"
          :placeholder="t('followupLog.temperaturePlaceholder')"
        />
      </label>
      <label class="field">
        <span class="field-label">{{ t('followupLog.symptomChange') }}</span>
        <input
          v-model="form.symptomChange"
          class="field-input"
          type="text"
          :placeholder="t('followupLog.symptomChangePlaceholder')"
        />
      </label>
      <label class="field">
        <span class="field-label">{{ t('followupLog.medicationTaken') }}</span>
        <input
          v-model="form.medicationTaken"
          class="field-input"
          type="text"
          :placeholder="t('followupLog.medicationTakenPlaceholder')"
        />
      </label>
      <label class="field">
        <span class="field-label">{{ t('followupLog.note') }}</span>
        <input
          v-model="form.note"
          class="field-input"
          type="text"
          :placeholder="t('followupLog.notePlaceholder')"
        />
      </label>
      <div class="form-actions">
        <button type="submit" class="btn btn-secondary" :disabled="saving">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
          </svg>
          {{ t('followupLog.save') }}
        </button>
        <button type="button" class="btn btn-ghost" @click="handleReload">{{ t('followupLog.reload') }}</button>
      </div>
      <p v-if="statusMessage" class="status-line" :class="statusClass">{{ statusMessage }}</p>
    </form>

    <div v-if="followUps.length" class="timeline-section">
      <div class="timeline-header">
        <h4 class="timeline-title">{{ t('followupLog.timelineTitle') }}</h4>
        <div class="timeline-meta">
          <span class="timeline-count">{{ t('followupLog.entryCount', { count: followUps.length }) }}</span>
          <span class="trend-badge" :class="trendClass">{{ trendLabel }}</span>
        </div>
      </div>

      <ol class="timeline">
        <li v-for="(record, idx) in followUps" :key="record.id" class="timeline-entry" :class="{ latest: idx === 0 }">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-top">
              <strong class="timeline-time">{{ formatDate(record.createdAt) }}</strong>
              <span v-if="idx === 0" class="latest-badge">{{ t('followupLog.latestEntry') }}</span>
            </div>
            <div class="timeline-body">
              <span v-if="record.temperatureC != null" class="timeline-item">
                <span class="timeline-item-label">{{ t('followupLog.tempPrefix') }}</span>
                <span class="timeline-item-value" :class="tempClass(record.temperatureC)">{{ record.temperatureC }}°C</span>
              </span>
              <span v-if="record.symptomChange" class="timeline-item">
                <span class="timeline-item-label">{{ t('followupLog.changePrefix') }}</span>
                <span class="timeline-item-value">{{ record.symptomChange }}</span>
              </span>
              <span v-if="record.medicationTaken" class="timeline-item">
                <span class="timeline-item-label">{{ t('followupLog.medicationPrefix') }}</span>
                <span class="timeline-item-value">{{ record.medicationTaken }}</span>
              </span>
              <span v-if="record.note" class="timeline-item">
                <span class="timeline-item-label">{{ t('followupLog.notePrefix') }}</span>
                <span class="timeline-item-value">{{ record.note }}</span>
              </span>
            </div>
          </div>
        </li>
      </ol>
    </div>
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
      </svg>
      <p>{{ t('followupLog.empty') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useTriageStore } from '@/stores/triage'
import type { FollowUpRecord } from '@/types'

const triageStore = useTriageStore()
const { locale, t } = useI18n()

const saving = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const form = reactive({
  temperatureC: null as number | null,
  symptomChange: '',
  medicationTaken: '',
  note: ''
})

const followUps = computed<FollowUpRecord[]>(() => triageStore.activeSession?.followUps || [])

const statusClass = computed(() => ({
  'status--success': statusType.value === 'success',
  'status--error': statusType.value === 'error'
}))

const trendClass = computed(() => {
  if (followUps.value.length < 2) return 'trend-unknown'
  const trend = detectTrend()
  return `trend-${trend}`
})

const trendLabel = computed(() => {
  if (followUps.value.length < 2) return t('followupLog.trendUnknown')
  const trend = detectTrend()
  return t(`followupLog.trend${trend.charAt(0).toUpperCase() + trend.slice(1)}`)
})

function detectTrend(): string {
  const entries = followUps.value
  if (entries.length < 2) return 'unknown'

  const recent = entries[0]
  const previous = entries[1]

  if (recent.temperatureC != null && previous.temperatureC != null) {
    if (recent.temperatureC < previous.temperatureC - 0.3) return 'improving'
    if (recent.temperatureC > previous.temperatureC + 0.3) return 'worsening'
  }

  const recentChange = (recent.symptomChange || '').toLowerCase()
  const improvingWords = ['减轻', '好转', '缓解', 'better', 'improving', 'less', '减轻']
  const worseningWords = ['加重', '恶化', '严重', 'worse', 'worsening', 'more']

  if (improvingWords.some(w => recentChange.includes(w))) return 'improving'
  if (worseningWords.some(w => recentChange.includes(w))) return 'worsening'

  return 'stable'
}

function tempClass(temp: number): string {
  if (temp >= 39) return 'temp-high'
  if (temp >= 37.5) return 'temp-elevated'
  return 'temp-normal'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
}

async function handleSave() {
  if (!triageStore.activeSession) return

  saving.value = true
  statusMessage.value = ''

  try {
    await triageStore.addFollowUp(triageStore.activeSession.id, {
      temperatureC: form.temperatureC,
      symptomChange: form.symptomChange,
      medicationTaken: form.medicationTaken,
      note: form.note
    })

    statusMessage.value = t('followupLog.saved')
    statusType.value = 'success'

    form.temperatureC = null
    form.symptomChange = ''
    form.medicationTaken = ''
    form.note = ''
  } catch {
    statusMessage.value = t('followupLog.saveFailed')
    statusType.value = 'error'
  } finally {
    saving.value = false
  }
}

async function handleReload() {
  if (!triageStore.activeSession) return

  try {
    const session = await triageStore.loadSession(triageStore.activeSession.id)
    triageStore.setActiveSession(session)
    statusMessage.value = t('followupLog.reloaded')
    statusType.value = 'success'
  } catch {
    statusMessage.value = t('followupLog.reloadFailed')
    statusType.value = 'error'
  }
}
</script>

<style scoped>
.followup-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.followup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

.status-line {
  font-size: var(--text-sm);
  text-align: center;
}

.status-line.status--success { color: var(--c-success); }
.status-line.status--error { color: var(--c-error); }

.timeline-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.timeline-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--c-text);
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.timeline-count {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
}

.trend-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
}

.trend-improving {
  background: rgba(16, 185, 129, 0.1);
  color: var(--c-success);
}

.trend-stable {
  background: var(--c-bg);
  color: var(--c-text-muted);
}

.trend-worsening {
  background: rgba(239, 68, 68, 0.1);
  color: var(--c-error);
}

.trend-unknown {
  background: var(--c-bg);
  color: var(--c-text-muted);
}

.timeline {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: relative;
  padding-left: var(--space-6);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--c-border-light);
}

.timeline-entry {
  position: relative;
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--c-border-light);
  transition: all var(--transition-fast);
}

.timeline-entry.latest {
  border-left-color: var(--c-primary);
  background: var(--c-primary-50);
}

.timeline-dot {
  position: absolute;
  left: calc(-1 * var(--space-6) - 1px);
  top: var(--space-5);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-border);
  border: 2px solid var(--c-surface);
}

.timeline-entry.latest .timeline-dot {
  background: var(--c-primary);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.timeline-top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.timeline-time {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-text-muted);
}

.latest-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--c-primary);
  padding: 1px var(--space-2);
  background: var(--c-primary-50);
  border-radius: var(--radius-full);
}

.timeline-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.timeline-item-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-text-muted);
}

.timeline-item-value {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
}

.temp-high { color: var(--c-error); font-weight: 600; }
.temp-elevated { color: var(--c-warning); font-weight: 600; }
.temp-normal { color: var(--c-success); }

.empty-state {
  text-align: center;
  padding: var(--space-10) var(--space-4);
  color: var(--c-text-muted);
  font-size: var(--text-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--c-border);
}
</style>
