<template>
  <div class="followup-tab">
    <form @submit.prevent="handleSave" class="followup-form" novalidate>
      <label class="field">
        <span class="field-label">当前体温 (°C)</span>
        <input
          v-model.number="form.temperatureC"
          class="field-input"
          type="number"
          step="0.1"
          min="30"
          max="45"
          placeholder="例如：38.1"
        />
      </label>
      <label class="field">
        <span class="field-label">症状变化</span>
        <input
          v-model="form.symptomChange"
          class="field-input"
          type="text"
          placeholder="例如：咳嗽减轻"
        />
      </label>
      <label class="field">
        <span class="field-label">已服药物</span>
        <input
          v-model="form.medicationTaken"
          class="field-input"
          type="text"
          placeholder="例如：对乙酰氨基酚"
        />
      </label>
      <label class="field">
        <span class="field-label">随访备注</span>
        <input
          v-model="form.note"
          class="field-input"
          type="text"
          placeholder="例如：今晚可以休息"
        />
      </label>
      <div class="form-actions">
        <button type="submit" class="btn btn-secondary" :disabled="saving">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
          </svg>
          保存随访
        </button>
        <button type="button" class="btn btn-ghost" @click="handleReload">刷新病例</button>
      </div>
      <p v-if="statusMessage" class="status-line" :class="statusClass">{{ statusMessage }}</p>
    </form>

    <div v-if="followUps.length" class="timeline">
      <ol>
        <li v-for="record in followUps" :key="record.id">
          <strong>{{ formatDate(record.createdAt) }}</strong>
          <p>
            <template v-if="record.temperatureC != null">体温 {{ record.temperatureC }}°C · </template>
            <template v-if="record.symptomChange">变化：{{ record.symptomChange }} · </template>
            <template v-if="record.medicationTaken">用药：{{ record.medicationTaken }} · </template>
            <template v-if="record.note">备注：{{ record.note }}</template>
          </p>
        </li>
      </ol>
    </div>
    <div v-else class="empty-state">
      暂无随访记录，观察患者后可在此保存
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useTriageStore } from '@/stores/triage'
import type { FollowUpRecord } from '@/types'

const triageStore = useTriageStore()

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
  return new Date(dateStr).toLocaleString('zh-CN')
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

    statusMessage.value = '随访已保存'
    statusType.value = 'success'

    // 重置表单
    form.temperatureC = null
    form.symptomChange = ''
    form.medicationTaken = ''
    form.note = ''
  } catch {
    statusMessage.value = '保存失败，请重试'
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
    statusMessage.value = '已刷新'
    statusType.value = 'success'
  } catch {
    statusMessage.value = '刷新失败'
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
