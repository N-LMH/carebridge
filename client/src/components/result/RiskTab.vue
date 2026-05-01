<template>
  <div v-if="assessment" class="risk-tab">
    <div class="risk-hero" :class="riskClass">
      <div class="risk-info">
        <span class="risk-pill" :class="riskClass">{{ assessment.riskLevel }}</span>
        <span class="risk-action">{{ assessment.actionLabel }}</span>
      </div>
      <span class="risk-dept">{{ assessment.suggestedDepartment }}</span>
    </div>

    <div v-if="scoreBreakdown.details?.length" class="score-section">
      <div class="score-header">
        <span class="score-title">风险评分</span>
        <span class="score-value">{{ totalScore }} / {{ maxScore }}</span>
      </div>
      <div class="score-track">
        <div class="score-fill" :class="fillClass" :style="{ width: fillPct + '%' }"></div>
      </div>
      <div class="score-tags">
        <span v-for="(d, i) in scoreBreakdown.details" :key="i" class="score-tag">
          {{ formatDetail(d) }}
        </span>
      </div>
    </div>

    <div class="warning-box">{{ assessment.warning }}</div>

    <div v-if="assessment.redFlags?.length" class="red-flags">
      <span v-for="(flag, i) in assessment.redFlags" :key="i" class="red-flag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        {{ flag }}
      </span>
    </div>

    <div class="result-section">
      <h4 class="result-section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        分级依据
      </h4>
      <ol class="result-list">
        <li v-for="(r, i) in assessment.reasoning" :key="i">{{ r }}</li>
      </ol>
    </div>

    <div class="result-section">
      <h4 class="result-section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="M22 4 12 14.01l-3-3"/>
        </svg>
        即时建议
      </h4>
      <ol class="result-list">
        <li v-for="(s, i) in assessment.immediateSteps" :key="i">{{ s }}</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTriageStore } from '@/stores/triage'
import type { RiskLevel, ScoreBreakdown, ScoreDetail } from '@/types'

const triageStore = useTriageStore()

const assessment = computed(() => triageStore.activeSession?.assessment)

const riskClassMap: Record<RiskLevel, string> = {
  'Level 1': 'level-1',
  'Level 2': 'level-2',
  'Level 3': 'level-3',
  'Level 4': 'level-4'
}

const scoreBreakdown = computed<ScoreBreakdown>(() => assessment.value?.scoreBreakdown || {
  base: 0, modifiers: 0, combinations: 0, total: 0, details: []
})

const totalScore = computed(() => scoreBreakdown.value.total ?? 0)
const maxScore = 20

const riskClass = computed(() => {
  if (!assessment.value) return 'level-4'
  return riskClassMap[assessment.value.riskLevel] || 'level-4'
})

const fillPct = computed(() => Math.min(100, (totalScore.value / maxScore) * 100))

const fillClass = computed(() => {
  const s = totalScore.value
  if (s >= 12) return 'fill-1'
  if (s >= 7) return 'fill-2'
  if (s >= 4) return 'fill-3'
  return 'fill-4'
})

function formatDetail(d: ScoreDetail): string {
  if (d.type === 'base') return `${d.symptom}(+${d.value})`
  if (d.type === 'modifier') return `${d.reason}(+${d.value})`
  if (d.type === 'combination') return `${d.reason}(+${d.value})`
  return JSON.stringify(d)
}
</script>

<style scoped>
.risk-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.risk-hero {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.risk-hero.level-1 {
  background: linear-gradient(135deg, var(--c-level-1-bg), #FADBD8);
  border: 2px solid var(--c-level-1);
}

.risk-hero.level-2 {
  background: linear-gradient(135deg, var(--c-level-2-bg), #FAE5D3);
  border: 2px solid var(--c-level-2);
}

.risk-hero.level-3 {
  background: linear-gradient(135deg, var(--c-level-3-bg), #FEF9E7);
  border: 2px solid var(--c-level-3);
}

.risk-hero.level-4 {
  background: linear-gradient(135deg, var(--c-level-4-bg), #D5F5E3);
  border: 2px solid var(--c-level-4);
}

.risk-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.risk-pill {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
}

.risk-pill.level-1 {
  background: var(--c-level-1);
  color: white;
}

.risk-pill.level-2 {
  background: var(--c-level-2);
  color: white;
}

.risk-pill.level-3 {
  background: var(--c-level-3);
  color: var(--c-text);
}

.risk-pill.level-4 {
  background: var(--c-level-4);
  color: white;
}

.risk-action {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--c-text);
}

.risk-dept {
  padding: var(--space-2) var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  box-shadow: var(--shadow-sm);
}

.score-section {
  background: var(--c-bg);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.score-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
}

.score-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--c-primary);
}

.score-track {
  height: 12px;
  background: var(--c-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-4);
}

.score-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.score-fill.fill-1 {
  background: linear-gradient(90deg, var(--c-level-2), var(--c-level-1));
}

.score-fill.fill-2 {
  background: linear-gradient(90deg, var(--c-level-3), var(--c-level-2));
}

.score-fill.fill-3 {
  background: linear-gradient(90deg, var(--c-level-4), var(--c-level-3));
}

.score-fill.fill-4 {
  background: var(--c-level-4);
}

.score-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.score-tag {
  padding: var(--space-1) var(--space-3);
  background: var(--c-surface);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--c-text-secondary);
}

.warning-box {
  background: var(--c-warning-bg);
  border-left: 4px solid var(--c-warning);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
}

.red-flags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.red-flag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--c-level-1-bg);
  border: 1px solid var(--c-level-1);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--c-level-1);
}

.red-flag svg {
  width: 16px;
  height: 16px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.result-section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--c-text);
}

.result-section-title svg {
  width: 20px;
  height: 20px;
  color: var(--c-primary);
}

.result-list {
  padding-left: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.result-list li {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  line-height: var(--leading-relaxed);
}

.result-list li::marker {
  color: var(--c-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .risk-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
