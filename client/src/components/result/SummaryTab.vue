<template>
  <div v-if="summary" class="summary-tab">
    <div class="summary-export-bar">
      <div>
        <p class="section-kicker">{{ t('summary.kicker') }}</p>
        <h3 class="section-heading">{{ t('summary.heading') }}</h3>
      </div>
      <div class="summary-export-actions">
        <button type="button" class="btn btn-ghost btn-sm" @click="handleCopy">{{ t('common.copy') }}</button>
        <button type="button" class="btn btn-ghost btn-sm" @click="handleDownload">{{ t('common.download') }}</button>
        <button type="button" class="btn btn-ghost btn-sm" @click="handlePrint">{{ t('common.print') }}</button>
      </div>
    </div>

    <div class="patient-snapshot" v-if="session">
      <div class="snapshot-item">
        <span class="snapshot-label">{{ t('summary.exportPatient') }}</span>
        <span class="snapshot-value">{{ session.intake.patientName || t('common.unnamedPatient') }}</span>
      </div>
      <div class="snapshot-item">
        <span class="snapshot-label">{{ t('summary.exportAge') }}</span>
        <span class="snapshot-value">{{ session.intake.age ?? '—' }}</span>
      </div>
      <div class="snapshot-item">
        <span class="snapshot-label">{{ t('summary.exportRegion') }}</span>
        <span class="snapshot-value">{{ session.intake.region || t('common.unknownRegion') }}</span>
      </div>
      <div class="snapshot-item">
        <span class="snapshot-label">{{ t('summary.exportRiskLevel') }}</span>
        <span class="snapshot-value">{{ session.assessment.riskLevel }}</span>
      </div>
      <div class="snapshot-item">
        <span class="snapshot-label">{{ t('summary.exportAction') }}</span>
        <span class="snapshot-value">{{ session.assessment.actionLabel }}</span>
      </div>
      <div class="snapshot-item">
        <span class="snapshot-label">{{ t('summary.exportDepartment') }}</span>
        <span class="snapshot-value">{{ session.assessment.suggestedDepartment }}</span>
      </div>
    </div>

    <div class="summary-text-box">
      <h4 class="summary-text-title">{{ t('summary.handoffBrief') }}</h4>
      <p>{{ summary.summaryText }}</p>
    </div>

    <div class="summary-grid">
      <div class="summary-fields-section">
        <h4 class="summary-section-title">{{ t('summary.patientSnapshot') }}</h4>
        <ul class="summary-field-list">
          <li>
            <strong>{{ t('summary.chiefComplaint') }}</strong>
            <span>{{ summary.chiefComplaint }}</span>
          </li>
          <li>
            <strong>{{ t('summary.onset') }}</strong>
            <span>{{ summary.onset }}</span>
          </li>
          <li>
            <strong>{{ t('summary.mainSymptoms') }}</strong>
            <span>{{ summary.mainSymptoms }}</span>
          </li>
          <li>
            <strong>{{ t('summary.associatedSymptoms') }}</strong>
            <span>{{ summary.associatedSymptoms }}</span>
          </li>
          <li>
            <strong>{{ t('summary.medicalHistory') }}</strong>
            <span>{{ summary.medicalHistory }}</span>
          </li>
          <li>
            <strong>{{ t('summary.currentMedication') }}</strong>
            <span>{{ summary.currentMedication }}</span>
          </li>
          <li>
            <strong>{{ t('summary.allergies') }}</strong>
            <span>{{ summary.allergies }}</span>
          </li>
          <li>
            <strong>{{ t('summary.riskNotes') }}</strong>
            <span>{{ summary.riskNotes }}</span>
          </li>
          <li>
            <strong>{{ t('summary.suggestedDepartment') }}</strong>
            <span>{{ summary.suggestedDepartment }}</span>
          </li>
        </ul>
      </div>

      <div class="summary-side-sections">
        <div class="doctor-prompts">
          <h4 class="summary-section-title">{{ t('summary.promptsHeading') }}</h4>
          <ol class="ordered-list">
            <li v-for="(q, i) in summary.doctorQuestions" :key="i">{{ q }}</li>
          </ol>
        </div>

        <div class="what-to-tell">
          <h4 class="summary-section-title">{{ t('summary.whatToTellDoctor') }}</h4>
          <ul class="tell-list">
            <li>{{ t('summary.tellSymptomStart') }}</li>
            <li>{{ t('summary.tellSymptomChange') }}</li>
            <li>{{ t('summary.tellWhatTried') }}</li>
            <li>{{ t('summary.tellWorsening') }}</li>
            <li>{{ t('summary.tellAllergies') }}</li>
          </ul>
        </div>

        <div class="bring-section">
          <h4 class="summary-section-title">{{ t('result.bringTitle') }}</h4>
          <ul class="bring-list">
            <li>{{ t('result.bringId') }}</li>
            <li>{{ t('result.bringMedHistory') }}</li>
            <li>{{ t('result.bringMedList') }}</li>
            <li>{{ t('result.bringSymptomNotes') }}</li>
            <li>{{ t('result.bringTempLog') }}</li>
          </ul>
        </div>
      </div>
    </div>

    <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useTriageStore } from '@/stores/triage'

const triageStore = useTriageStore()
const { locale, t } = useI18n()
const copyStatus = ref('')

const session = computed(() => triageStore.activeSession)
const summary = computed(() => triageStore.activeSession?.summary)

function buildExportText(): string {
  const sess = triageStore.activeSession
  if (!sess) return ''

  const { assessment, summary: sum } = sess
  return [
    t('summary.exportTitle'),
    `${t('summary.exportPatient')}：${sess.intake.patientName || t('common.unnamedPatient')}`,
    `${t('summary.exportAge')}：${sess.intake.age || (locale.value === 'zh' ? '未知' : 'Unknown')}`,
    `${t('summary.exportRegion')}：${sess.intake.region || t('common.unknownRegion')}`,
    `${t('summary.exportRiskLevel')}：${assessment.riskLevel}`,
    `${t('summary.exportAction')}：${assessment.actionLabel}`,
    `${t('summary.exportDepartment')}：${assessment.suggestedDepartment}`,
    '',
    `${t('summary.chiefComplaint')}：${sum.chiefComplaint}`,
    `${t('summary.onset')}：${sum.onset}`,
    `${t('summary.mainSymptoms')}：${sum.mainSymptoms}`,
    `${t('summary.associatedSymptoms')}：${sum.associatedSymptoms}`,
    `${t('summary.medicalHistory')}：${sum.medicalHistory}`,
    `${t('summary.currentMedication')}：${sum.currentMedication}`,
    `${t('summary.allergies')}：${sum.allergies}`,
    `${t('summary.riskNotes')}：${sum.riskNotes}`,
    '',
    t('summary.exportImmediateSteps'),
    ...assessment.immediateSteps.map((s, i) => `${i + 1}. ${s}`),
    '',
    t('summary.exportDoctorPrompts'),
    ...sum.doctorQuestions.map((q, i) => `${i + 1}. ${q}`),
    '',
    t('summary.exportDisclaimer'),
    assessment.warning
  ].join('\n')
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(buildExportText())
    copyStatus.value = t('summary.copied')
    setTimeout(() => { copyStatus.value = '' }, 2000)
  } catch {
    copyStatus.value = t('summary.copyFailed')
  }
}

function handleDownload() {
  const blob = new Blob([buildExportText()], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${locale.value === 'zh' ? 'carebridge-zh-summary' : 'carebridge-en-summary'}-${triageStore.activeSession?.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function handlePrint() {
  window.print()
}
</script>

<style scoped>
.summary-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.summary-export-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.section-kicker {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-heading {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--c-text);
  margin-top: var(--space-1);
}

.summary-export-actions {
  display: flex;
  gap: var(--space-2);
}

.patient-snapshot {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-lg);
}

.snapshot-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.snapshot-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.snapshot-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
}

.summary-text-box {
  background: var(--c-primary-50);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}

.summary-text-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: var(--space-3);
}

.summary-text-box p {
  font-size: var(--text-sm);
  color: var(--c-text);
  line-height: var(--leading-relaxed);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.summary-section-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--c-border-light);
}

.summary-field-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.summary-field-list li {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--c-border-light);
}

.summary-field-list strong {
  min-width: 80px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
  flex-shrink: 0;
}

.summary-field-list span {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
}

.summary-side-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.doctor-prompts {
  background: var(--c-info-bg);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}

.ordered-list {
  padding-left: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ordered-list li {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  line-height: var(--leading-relaxed);
}

.what-to-tell {
  background: var(--c-bg);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}

.tell-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tell-list li {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  padding-left: var(--space-5);
  position: relative;
}

.tell-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--c-primary);
  font-weight: 600;
}

.bring-section {
  background: rgba(16, 185, 129, 0.05);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.bring-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bring-list li {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  padding-left: var(--space-5);
  position: relative;
}

.bring-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--c-success);
  font-weight: 700;
}

.copy-status {
  font-size: var(--text-sm);
  color: var(--c-success);
  text-align: center;
}
</style>
