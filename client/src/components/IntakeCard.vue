<template>
  <section class="card">
    <div class="card-head">
      <div class="card-icon card-icon--teal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
      <div>
        <h2 class="card-title">患者信息录入</h2>
        <p class="card-desc">填写基本信息与症状描述，获取分诊建议</p>
      </div>
    </div>

    <Stepper :step="triageStore.currentStep" />

    <form @submit.prevent="handleSubmit" novalidate class="form">
      <div class="form-block">
        <h3 class="form-block-title">基本信息</h3>
        <div class="grid grid-3">
          <label class="field">
            <span class="field-label">患者姓名</span>
            <input
              v-model="form.patientName"
              class="field-input"
              type="text"
              placeholder="如：张阿姨"
            />
          </label>
          <label class="field">
            <span class="field-label">年龄</span>
            <input
              v-model.number="form.age"
              class="field-input"
              type="number"
              min="0"
              max="150"
              placeholder="如：63"
            />
          </label>
          <label class="field">
            <span class="field-label">性别</span>
            <select v-model="form.gender" class="field-select">
              <option value="">请选择</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </label>
        </div>
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">所在地区</span>
            <input
              v-model="form.region"
              class="field-input"
              type="text"
              placeholder="如：县城诊所周边"
            />
          </label>
          <label class="field">
            <span class="field-label">慢性病史</span>
            <input
              v-model="form.chronicConditions"
              class="field-input"
              type="text"
              placeholder="如：高血压、糖尿病"
            />
          </label>
        </div>
      </div>

      <hr class="divider" />

      <div class="form-block">
        <h3 class="form-block-title">症状描述</h3>
        <div class="grid">
          <label class="field">
            <span class="field-label field-label--req">主要症状</span>
            <input
              v-model="form.symptoms"
              class="field-input"
              type="text"
              placeholder="多个症状用逗号分隔，如：发热、咳嗽、胸闷"
              required
            />
            <span class="field-hint">支持中英文症状描述</span>
          </label>
        </div>
        <div class="grid">
          <label class="field">
            <span class="field-label">症状详细描述</span>
            <textarea
              v-model="form.symptomNotes"
              class="field-textarea"
              rows="3"
              placeholder="描述症状的具体表现，如：发热三天，夜间咳嗽加重，今日出现轻微胸闷"
            ></textarea>
          </label>
        </div>
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">症状持续天数</span>
            <input
              v-model.number="form.symptomDays"
              class="field-input"
              type="number"
              min="0"
              max="365"
              placeholder="如：3"
            />
          </label>
          <label class="field">
            <span class="field-label">自评严重程度</span>
            <select v-model="form.severity" class="field-select">
              <option value="mild">轻度</option>
              <option value="moderate">中度</option>
              <option value="severe">重度</option>
            </select>
          </label>
        </div>
      </div>

      <hr class="divider" />

      <div class="form-block">
        <h3 class="form-block-title">用药与过敏</h3>
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">当前用药</span>
            <input
              v-model="form.medications"
              class="field-input"
              type="text"
              placeholder="如：降压药"
            />
          </label>
          <label class="field">
            <span class="field-label">过敏史</span>
            <input
              v-model="form.allergies"
              class="field-input"
              type="text"
              placeholder="如：青霉素"
            />
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="triageStore.loading">
          <span v-if="triageStore.loading" class="spinner"></span>
          <svg v-else class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          {{ triageStore.loading ? '评估中...' : '开始评估' }}
        </button>
        <button type="button" class="btn btn-outline" @click="handleReset">重置</button>
      </div>

      <p v-if="statusMessage" class="status" :class="statusClass">{{ statusMessage }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useTriageStore } from '@/stores/triage'
import Stepper from './Stepper.vue'
import type { TriageRequest, Severity, Gender, DemoPreset } from '@/types'

const triageStore = useTriageStore()

const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'neutral'>('neutral')

const form = reactive<TriageRequest>({
  patientName: '',
  age: null,
  gender: '' as Gender,
  region: '',
  chronicConditions: [],
  symptoms: [],
  symptomNotes: '',
  symptomDays: null,
  severity: 'mild' as Severity,
  medications: '',
  allergies: '',
  breathingDifficulty: null,
  symptomsWorsening: null,
  maxTemperatureC: null,
  chestPain: null
})

const statusClass = computed(() => ({
  'status--success': statusType.value === 'success',
  'status--error': statusType.value === 'error'
}))

// 监听预设选择
watch(() => triageStore.draftPayload, (payload) => {
  if (payload && Object.keys(payload).length > 0) {
    Object.assign(form, payload)
  }
}, { deep: true })

async function handleSubmit() {
  statusMessage.value = '正在评估初始信息...'
  statusType.value = 'neutral'

  try {
    const response = await triageStore.submitTriage({
      ...form,
      symptoms: typeof form.symptoms === 'string'
        ? (form.symptoms as string).split(',').map((s: string) => s.trim()).filter(Boolean)
        : form.symptoms,
      chronicConditions: typeof form.chronicConditions === 'string'
        ? (form.chronicConditions as string).split(',').map((s: string) => s.trim()).filter(Boolean)
        : form.chronicConditions
    })

    if (response.status === 'needs_follow_up') {
      statusMessage.value = '需要补充更多信息。'
    } else {
      statusMessage.value = '评估完成。'
      statusType.value = 'success'
    }
  } catch (err) {
    if (err instanceof Error && 'errors' in err) {
      const validationErrors = (err as { errors: { message: string }[] }).errors
      statusMessage.value = validationErrors.map(e => e.message).join('；')
    } else {
      statusMessage.value = '网络请求失败，请检查连接后重试。'
    }
    statusType.value = 'error'
  }
}

function handleReset() {
  triageStore.reset()
  Object.keys(form).forEach(key => {
    if (key === 'severity') (form as any)[key] = 'mild'
    else if (key === 'age' || key === 'symptomDays') (form as any)[key] = null
    else if (key === 'symptoms' || key === 'chronicConditions') (form as any)[key] = []
    else (form as any)[key] = ''
  })
  statusMessage.value = '流程已重置，可以录入新患者。'
  statusType.value = 'neutral'
}

function fillPreset(preset: DemoPreset) {
  form.patientName = preset.patientName
  form.age = preset.age
  form.gender = preset.gender
  form.region = preset.region
  form.symptoms = preset.symptoms.split(',').map(s => s.trim())
  form.symptomNotes = preset.symptomNotes
  form.symptomDays = preset.symptomDays
  form.severity = preset.severity
  form.chronicConditions = preset.chronicConditions ? preset.chronicConditions.split(',').map(s => s.trim()) : []
  form.medications = preset.medications
  form.allergies = preset.allergies
  statusMessage.value = `已加载预设：${preset.title}`
  statusType.value = 'success'
}

defineExpose({ fillPreset })
</script>
