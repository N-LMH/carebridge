<template>
  <section class="card">
    <div class="card-head">
      <div class="card-icon card-icon--amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>
      <div>
        <h2 class="card-title">{{ t('followUp.title') }}</h2>
        <p class="card-desc">{{ t('followUp.desc') }}</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" novalidate class="form">
      <div class="grid grid-2">
        <label v-for="q in triageStore.followUpQuestions" :key="q.id" class="field">
          <span class="field-label">{{ q.label }}</span>
          <select
            v-if="q.type === 'select'"
            v-model="answers[q.id]"
            class="field-select"
            :aria-label="q.label"
          >
            <option value="">{{ t('common.choose') }}</option>
            <option v-for="opt in q.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <input
            v-else
            v-model.number="answers[q.id]"
            class="field-input"
            type="number"
            :min="q.min"
            :max="q.max"
            :step="q.step"
            :placeholder="q.placeholder"
            :aria-label="q.label"
          />
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="triageStore.loading">
          <svg class="btn-svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
          </svg>
          {{ triageStore.loading ? t('common.assessing') : t('common.generateAssessment') }}
        </button>
        <button type="button" class="btn btn-outline" @click="handleBack">{{ t('followUp.back') }}</button>
      </div>
      <p class="status">{{ t('followUp.status') }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useTriageStore } from '@/stores/triage'

const triageStore = useTriageStore()
const { t } = useI18n()

const answers = reactive<Record<string, unknown>>({})

watch(() => triageStore.followUpQuestions, (questions) => {
  questions.forEach(q => {
    if (answers[q.id] === undefined) {
      answers[q.id] = q.type === 'select' ? '' : null
    }
  })
}, { immediate: true })

async function handleSubmit() {
  try {
    await triageStore.submitFollowUp(answers)
  } catch {
    // 错误已由 store 处理
  }
}

function handleBack() {
  triageStore.setCurrentStep(1)
  triageStore.clearFollowUpQuestions()
}
</script>
