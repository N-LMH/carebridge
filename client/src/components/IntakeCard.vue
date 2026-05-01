<template>
  <section class="card">
    <div class="card-head">
      <div class="card-icon card-icon--teal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
      <div>
        <h2 class="card-title">{{ t('intake.title') }}</h2>
        <p class="card-desc">{{ t('intake.desc') }}</p>
      </div>
    </div>

    <Stepper :step="triageStore.currentStep" />

    <form @submit.prevent="handleSubmit" novalidate class="form">
      <div class="form-block">
        <div class="form-block-header">
          <h3 class="form-block-title">{{ t('intake.sectionBasic') }}</h3>
          <span class="form-block-status" :class="{ complete: isBasicComplete }">
            {{ isBasicComplete ? t('intake.sectionComplete') : t('intake.sectionIncomplete') }}
          </span>
        </div>
        <div class="grid grid-3">
          <label class="field">
            <span class="field-label">{{ t('intake.patientName') }}</span>
            <input
              v-model="form.patientName"
              class="field-input"
              type="text"
              :placeholder="t('intake.patientNamePlaceholder')"
            />
          </label>
          <label class="field">
            <span class="field-label">{{ t('intake.age') }}</span>
            <input
              v-model.number="form.age"
              class="field-input"
              type="number"
              min="0"
              max="150"
              :placeholder="t('intake.agePlaceholder')"
            />
          </label>
          <label class="field">
            <span class="field-label">{{ t('intake.gender') }}</span>
            <select v-model="form.gender" class="field-select">
              <option value="">{{ t('gender.empty') }}</option>
              <option value="male">{{ t('gender.male') }}</option>
              <option value="female">{{ t('gender.female') }}</option>
              <option value="other">{{ t('gender.other') }}</option>
            </select>
          </label>
        </div>
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">{{ t('intake.region') }}</span>
            <input
              v-model="form.region"
              class="field-input"
              type="text"
              :placeholder="t('intake.regionPlaceholder')"
            />
          </label>
          <label class="field">
            <span class="field-label">{{ t('intake.chronicConditions') }}</span>
            <input
              v-model="form.chronicConditions"
              class="field-input"
              type="text"
              :placeholder="t('intake.chronicConditionsPlaceholder')"
            />
          </label>
        </div>
      </div>

      <hr class="divider" />

      <div class="form-block">
        <div class="form-block-header">
          <h3 class="form-block-title">{{ t('intake.sectionSymptoms') }}</h3>
          <span class="form-block-status" :class="{ complete: isSymptomsComplete }">
            {{ isSymptomsComplete ? t('intake.sectionComplete') : t('intake.sectionIncomplete') }}
          </span>
        </div>

        <div class="symptom-categories">
          <span class="symptom-cat-label">{{ t('intake.symptomCategories') }}</span>
          <div class="symptom-cat-list">
            <button
              v-for="cat in symptomCategories"
              :key="cat.key"
              type="button"
              class="symptom-cat"
              @click="addSymptomsFromCategory(cat.examples)"
            >
              <strong>{{ t(`intake.cat${cat.key}`) }}</strong>
              <span>{{ t(`intake.cat${cat.key}Examples`) }}</span>
            </button>
          </div>
        </div>

        <div class="grid">
          <label class="field">
            <span class="field-label field-label--req">{{ t('intake.symptoms') }}</span>
            <input
              v-model="form.symptoms"
              class="field-input"
              type="text"
              :placeholder="t('intake.symptomsPlaceholder')"
              required
            />
            <span class="field-hint">{{ t('intake.symptomHint') }}</span>
          </label>
        </div>
        <div class="grid">
          <label class="field">
            <span class="field-label">{{ t('intake.symptomNotes') }}</span>
            <textarea
              v-model="form.symptomNotes"
              class="field-textarea"
              rows="3"
              :placeholder="t('intake.symptomNotesPlaceholder')"
            ></textarea>
          </label>
        </div>
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">{{ t('intake.symptomDays') }}</span>
            <input
              v-model.number="form.symptomDays"
              class="field-input"
              type="number"
              min="0"
              max="365"
              :placeholder="t('intake.symptomDaysPlaceholder')"
            />
          </label>
          <label class="field">
            <span class="field-label">{{ t('intake.severity') }}</span>
            <select v-model="form.severity" class="field-select">
              <option value="mild">{{ t('severity.mild') }}</option>
              <option value="moderate">{{ t('severity.moderate') }}</option>
              <option value="severe">{{ t('severity.severe') }}</option>
            </select>
          </label>
        </div>
      </div>

      <hr class="divider" />

      <div class="form-block">
        <div class="form-block-header">
          <h3 class="form-block-title">{{ t('intake.sectionMedication') }}</h3>
          <span class="form-block-status" :class="{ complete: isMedicationComplete }">
            {{ isMedicationComplete ? t('intake.sectionComplete') : t('intake.sectionIncomplete') }}
          </span>
        </div>
        <div class="grid grid-2">
          <label class="field">
            <span class="field-label">{{ t('intake.medications') }}</span>
            <input
              v-model="form.medications"
              class="field-input"
              type="text"
              :placeholder="t('intake.medicationsPlaceholder')"
            />
          </label>
          <label class="field">
            <span class="field-label">{{ t('intake.allergies') }}</span>
            <input
              v-model="form.allergies"
              class="field-input"
              type="text"
              :placeholder="t('intake.allergiesPlaceholder')"
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
          {{ triageStore.loading ? t('common.assessing') : t('common.startAssessment') }}
        </button>
        <button type="button" class="btn btn-outline" @click="handleReset">{{ t('common.reset') }}</button>
      </div>

      <p v-if="statusMessage" class="status" :class="statusClass">{{ statusMessage }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { localizeValidationMessage } from '@/i18n/medical'
import { useTriageStore } from '@/stores/triage'
import Stepper from './Stepper.vue'
import type { DemoPreset, Gender, Severity, TriageRequest } from '@/types'

const triageStore = useTriageStore()
const { locale, t } = useI18n()

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

const isBasicComplete = computed(() =>
  !!(form.patientName && form.age && form.gender)
)

const isSymptomsComplete = computed(() => {
  const symptoms = typeof form.symptoms === 'string'
    ? (form.symptoms as string).trim()
    : (form.symptoms as string[]).length > 0
  return !!symptoms
})

const isMedicationComplete = computed(() =>
  !!(form.medications || form.allergies)
)

const symptomCategories = [
  { key: 'Respiratory', examples: 'fever, cough, sore throat, shortness of breath' },
  { key: 'Digestive', examples: 'abdominal pain, diarrhea, vomiting' },
  { key: 'Pain', examples: 'headache, chest pain, chest tightness' },
  { key: 'General', examples: 'dizziness, rash, bleeding' }
]

function addSymptomsFromCategory(examples: string) {
  const current = typeof form.symptoms === 'string'
    ? (form.symptoms as unknown as string).trim()
    : (form.symptoms as string[]).join(', ')

  if (current) {
    ;(form.symptoms as unknown as string) = current + ', ' + examples
  } else {
    ;(form.symptoms as unknown as string) = examples
  }
}

watch(() => triageStore.draftPayload, (payload) => {
  if (payload && Object.keys(payload).length > 0) {
    Object.assign(form, payload)
  }
}, { deep: true })

async function handleSubmit() {
  statusMessage.value = t('intake.statusAssessing')
  statusType.value = 'neutral'

  try {
    const response = await triageStore.submitTriage({
      ...form,
      symptoms: typeof form.symptoms === 'string'
        ? (form.symptoms as string).split(',').map((item: string) => item.trim()).filter(Boolean)
        : form.symptoms,
      chronicConditions: typeof form.chronicConditions === 'string'
        ? (form.chronicConditions as string).split(',').map((item: string) => item.trim()).filter(Boolean)
        : form.chronicConditions
    })

    if (response.status === 'needs_follow_up') {
      statusMessage.value = t('intake.statusNeedMore')
    } else {
      statusMessage.value = t('intake.statusDone')
      statusType.value = 'success'
    }
  } catch (err) {
    if (err instanceof Error && 'errors' in err) {
      const validationErrors = (err as { errors: { message: string }[] }).errors
      statusMessage.value = validationErrors
        .map((error) => localizeValidationMessage(error.message, locale.value))
        .join(locale.value === 'zh' ? '；' : '; ')
    } else {
      statusMessage.value = t('intake.statusNetworkError')
    }
    statusType.value = 'error'
  }
}

function handleReset() {
  triageStore.reset()
  Object.keys(form).forEach((key) => {
    if (key === 'severity') (form as Record<string, unknown>)[key] = 'mild'
    else if (key === 'age' || key === 'symptomDays') (form as Record<string, unknown>)[key] = null
    else if (key === 'symptoms' || key === 'chronicConditions') (form as Record<string, unknown>)[key] = []
    else (form as Record<string, unknown>)[key] = ''
  })
  statusMessage.value = t('intake.statusReset')
  statusType.value = 'neutral'
}

function fillPreset(preset: DemoPreset) {
  form.patientName = preset.patientName
  form.age = preset.age
  form.gender = preset.gender
  form.region = preset.region
  form.symptoms = preset.symptoms.split(',').map((item) => item.trim())
  form.symptomNotes = preset.symptomNotes
  form.symptomDays = preset.symptomDays
  form.severity = preset.severity
  form.chronicConditions = preset.chronicConditions ? preset.chronicConditions.split(',').map((item) => item.trim()) : []
  form.medications = preset.medications
  form.allergies = preset.allergies
  statusMessage.value = t('intake.statusPresetLoaded', { title: preset.title })
  statusType.value = 'success'
}

defineExpose({ fillPreset })
</script>

<style scoped>
.form-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.form-block-status {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-text-muted);
  padding: var(--space-1) var(--space-3);
  background: var(--c-bg);
  border-radius: var(--radius-full);
}

.form-block-status.complete {
  color: var(--c-success);
  background: rgba(16, 185, 129, 0.1);
}

.symptom-categories {
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-md);
}

.symptom-cat-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-text-muted);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.symptom-cat-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
}

.symptom-cat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--c-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  border: 1px solid transparent;
}

.symptom-cat:hover {
  border-color: var(--c-primary);
  background: var(--c-primary-50);
  transform: translateY(-1px);
}

.symptom-cat strong {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
}

.symptom-cat span {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
}

.form-block-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--c-text);
}
</style>
