<template>
  <div v-if="summary" class="summary-tab">
    <div class="summary-export-bar">
      <div>
        <p class="section-kicker">就诊摘要</p>
        <h3 class="section-heading">可打印的医生交接摘要</h3>
      </div>
      <div class="summary-export-actions">
        <button type="button" class="btn btn-ghost btn-sm" @click="handleCopy">复制</button>
        <button type="button" class="btn btn-ghost btn-sm" @click="handleDownload">下载</button>
        <button type="button" class="btn btn-ghost btn-sm" @click="handlePrint">打印</button>
      </div>
    </div>

    <div class="summary-text-box">
      <p>{{ summary.summaryText }}</p>
    </div>

    <ul class="summary-field-list">
      <li>
        <strong>主诉</strong>
        <span>{{ summary.chiefComplaint }}</span>
      </li>
      <li>
        <strong>起病时间</strong>
        <span>{{ summary.onset }}</span>
      </li>
      <li>
        <strong>主要症状</strong>
        <span>{{ summary.mainSymptoms }}</span>
      </li>
      <li>
        <strong>伴随症状</strong>
        <span>{{ summary.associatedSymptoms }}</span>
      </li>
      <li>
        <strong>既往病史</strong>
        <span>{{ summary.medicalHistory }}</span>
      </li>
      <li>
        <strong>当前用药</strong>
        <span>{{ summary.currentMedication }}</span>
      </li>
      <li>
        <strong>过敏史</strong>
        <span>{{ summary.allergies }}</span>
      </li>
      <li>
        <strong>风险提示</strong>
        <span>{{ summary.riskNotes }}</span>
      </li>
      <li>
        <strong>建议科室</strong>
        <span>{{ summary.suggestedDepartment }}</span>
      </li>
    </ul>

    <div class="doctor-prompts">
      <h4 class="section-heading">医生提示 — 就诊时请告知医生</h4>
      <ol class="ordered-list">
        <li v-for="(q, i) in summary.doctorQuestions" :key="i">{{ q }}</li>
      </ol>
    </div>

    <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTriageStore } from '@/stores/triage'

const triageStore = useTriageStore()
const copyStatus = ref('')

const summary = computed(() => triageStore.activeSession?.summary)

function buildExportText(): string {
  const session = triageStore.activeSession
  if (!session) return ''

  const { assessment, summary: sum } = session
  return [
    'CareBridge / 医路桥 就诊摘要',
    `患者：${session.intake.patientName || '未署名'}`,
    `年龄：${session.intake.age || '未知'}`,
    `地区：${session.intake.region || '未知'}`,
    `风险等级：${assessment.riskLevel}`,
    `行动建议：${assessment.actionLabel}`,
    `建议科室：${assessment.suggestedDepartment}`,
    '',
    `主诉：${sum.chiefComplaint}`,
    `起病时间：${sum.onset}`,
    `主要症状：${sum.mainSymptoms}`,
    `伴随症状：${sum.associatedSymptoms}`,
    `既往病史：${sum.medicalHistory}`,
    `当前用药：${sum.currentMedication}`,
    `过敏史：${sum.allergies}`,
    `风险提示：${sum.riskNotes}`,
    '',
    '即时建议：',
    ...assessment.immediateSteps.map((s, i) => `${i + 1}. ${s}`),
    '',
    '医生提示：',
    ...sum.doctorQuestions.map((q, i) => `${i + 1}. ${q}`),
    '',
    '免责声明：',
    assessment.warning
  ].join('\n')
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(buildExportText())
    copyStatus.value = '摘要已复制'
    setTimeout(() => { copyStatus.value = '' }, 2000)
  } catch {
    copyStatus.value = '复制失败'
  }
}

function handleDownload() {
  const blob = new Blob([buildExportText()], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carebridge-summary-${triageStore.activeSession?.id}.txt`
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

.summary-text-box {
  background: var(--c-primary-50);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}

.summary-text-box p {
  font-size: var(--text-sm);
  color: var(--c-text);
  line-height: var(--leading-relaxed);
}

.summary-field-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.summary-field-list li {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--c-border-light);
}

.summary-field-list strong {
  min-width: 80px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
}

.summary-field-list span {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
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
  margin-top: var(--space-3);
}

.ordered-list li {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  line-height: var(--leading-relaxed);
}

.copy-status {
  font-size: var(--text-sm);
  color: var(--c-success);
  text-align: center;
}
</style>
