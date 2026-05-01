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

    <div v-if="followUps.length" class="timeline">
      <ol>
        <li v-for="record in followUps" :key="record.id">
          <strong>{{ formatDate(record.createdAt) }}</strong>
          <p>
            <template v-if="record.temperatureC != null">{{ t('followupLog.tempPrefix') }} {{ record.temperatureC }}°C · </template>
            <template v-if="record.symptomChange">{{ t('followupLog.changePrefix') }}：{{ record.symptomChange }} · </template>
            <template v-if="record.medicationTaken">{{ t('followupLog.medicationPrefix') }}：{{ record.medicationTaken }} · </template>
            <template v-if="record.note">{{ t('followupLog.notePrefix') }}：{{ record.note }}</template>
          </p>
        </li>
      </ol>
    </div>
    <div v-else class="empty-state">
      {{ t('followupLog.empty') }}
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

    // 重置表单
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

.status-line.status--success {
  color: var(--c-success);
}

.status-line.status--error {
  color: var(--c-error);
}

.timeline ol {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.timeline li {
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--c-primary);
}

.timeline strong {
  display: block;
  font-size: var(--text-xs);
  color: var(--c-text-muted);
  margin-bottom: var(--space-2);
}

.timeline p {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--c-text-muted);
  font-size: var(--text-sm);
}
</style>
