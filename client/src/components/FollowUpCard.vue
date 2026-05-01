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
        <h2 class="card-title">补充追问</h2>
        <p class="card-desc">完善风险评估所需的关键信息</p>
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
            <option value="">请选择</option>
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
          {{ triageStore.loading ? '评估中...' : '生成评估' }}
        </button>
        <button type="button" class="btn btn-outline" @click="handleBack">返回录入</button>
      </div>
      <p class="status">这些信息将完善风险评估中缺失的关键内容。</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useTriageStore } from '@/stores/triage'

const triageStore = useTriageStore()

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
  triageStore.followUpQuestions.splice(0)
}
</script>
