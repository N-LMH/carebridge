<template>
  <div v-if="assessment" class="risk-tab">
    <div class="risk-hero" :class="riskClass">
      <div class="risk-hero-top">
        <span class="risk-pill" :class="riskClass">{{ assessment.riskLevel }}</span>
        <span class="urgency-badge" :class="urgencyClass">{{ urgencyLabel }}</span>
      </div>
      <div class="risk-hero-main">
        <span class="risk-action">{{ assessment.actionLabel }}</span>
        <span class="risk-dept">{{ assessment.suggestedDepartment }}</span>
      </div>
      <div class="care-timing">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span>{{ timingLabel }}</span>
      </div>
    </div>

    <div class="support-row">
      <div class="support-card">
        <h4 class="support-title">{{ t('result.followUpPlanTitle') }}</h4>
        <p class="support-text">{{ followUpPlanMessage }}</p>
        <p v-if="followUpDueLabel" class="support-meta">{{ followUpDueLabel }}</p>
      </div>

      <div v-if="latestReassessment" class="support-card support-card--highlight">
        <h4 class="support-title">{{ t('result.reassessmentTitle') }}</h4>
        <p class="support-text">{{ reassessmentMessage }}</p>
      </div>
    </div>

    <div class="risk-split">
      <div class="risk-knowledge">
        <h4 class="risk-split-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          {{ t('result.whatWeKnow') }}
        </h4>
        <div v-if="scoreBreakdown.details?.length" class="score-section">
          <div class="score-header">
            <span class="score-title">{{ t('result.scoreTitle') }}</span>
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
          <div class="red-flag-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <strong>{{ t('summary.riskNotes') }}</strong>
          </div>
          <span v-for="(flag, i) in assessment.redFlags" :key="i" class="red-flag">
            {{ flag }}
          </span>
        </div>

        <div class="result-section">
          <h4 class="result-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            {{ t('result.reasoningTitle') }}
          </h4>
          <ol class="result-list">
            <li v-for="(r, i) in assessment.reasoning" :key="i">{{ r }}</li>
          </ol>
        </div>
      </div>

      <div class="risk-actions">
        <h4 class="risk-split-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4 12 14.01l-3-3"/>
          </svg>
          {{ t('result.whatToDoNext') }}
        </h4>
        <ol class="result-list">
          <li v-for="(s, i) in assessment.immediateSteps" :key="i">{{ s }}</li>
        </ol>

        <div class="warning-signs">
          <h4 class="warning-signs-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ t('result.warningSignsTitle') }}
          </h4>
          <ul class="warning-signs-list">
            <li>{{ t('result.warningBreathing') }}</li>
            <li>{{ t('result.warningChestPain') }}</li>
            <li>{{ t('result.warningConsciousness') }}</li>
            <li>{{ t('result.warningHighFever') }}</li>
            <li>{{ t('result.warningBleeding') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useTriageStore } from '@/stores/triage'
import type { RiskLevel, ScoreBreakdown, ScoreDetail } from '@/types'

const triageStore = useTriageStore()
const { locale, t } = useI18n()

const assessment = computed(() => triageStore.activeSession?.assessment)
const followUpPlan = computed(() => triageStore.activeSession?.followUpPlan)
const latestReassessment = computed(() => triageStore.activeSession?.latestReassessment)

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

const urgencyClass = computed(() => {
  if (!assessment.value) return ''
  const map: Record<RiskLevel, string> = {
    'Level 1': 'urgency-emergency',
    'Level 2': 'urgency-urgent',
    'Level 3': 'urgency-soon',
    'Level 4': 'urgency-observe'
  }
  return map[assessment.value.riskLevel] || ''
})

const urgencyLabel = computed(() => {
  if (!assessment.value) return ''
  const map: Record<RiskLevel, string> = {
    'Level 1': 'result.urgencyEmergency',
    'Level 2': 'result.urgencyUrgent',
    'Level 3': 'result.urgencySoon',
    'Level 4': 'result.urgencyObserve'
  }
  return t(map[assessment.value.riskLevel])
})

const timingLabel = computed(() => {
  if (!assessment.value) return ''
  const map: Record<RiskLevel, string> = {
    'Level 1': 'result.timingImmediate',
    'Level 2': 'result.timing24h',
    'Level 3': 'result.timingSchedule',
    'Level 4': 'result.timingObserve'
  }
  return t(map[assessment.value.riskLevel])
})

const fillPct = computed(() => Math.min(100, (totalScore.value / maxScore) * 100))

const fillClass = computed(() => {
  const s = totalScore.value
  if (s >= 12) return 'fill-1'
  if (s >= 7) return 'fill-2'
  if (s >= 4) return 'fill-3'
  return 'fill-4'
})

const effectivePlanStatus = computed(() => {
  const plan = followUpPlan.value
  if (!plan) return 'none'
  if (
    plan.status === 'scheduled' &&
    plan.recommendedAt &&
    new Date(plan.recommendedAt).getTime() < Date.now()
  ) {
    return 'overdue'
  }
  return plan.status
})

const followUpPlanMessage = computed(() => {
  const plan = followUpPlan.value
  if (!plan || assessment.value?.riskLevel === 'Level 1') {
    return t('result.followUpPlanEmergency')
  }

  if (effectivePlanStatus.value === 'completed') {
    return t('result.followUpPlanCompleted')
  }

  if (effectivePlanStatus.value === 'overdue') {
    return t('result.followUpPlanOverdue')
  }

  return t('result.followUpPlanScheduled', {
    hours: plan.recommendedWindowHours ?? 24
  })
})

const followUpDueLabel = computed(() => {
  const plan = followUpPlan.value
  if (!plan?.recommendedAt || assessment.value?.riskLevel === 'Level 1') return ''
  return t('result.followUpDueAt', {
    time: new Date(plan.recommendedAt).toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
  })
})

const reassessmentMessage = computed(() => {
  const latest = latestReassessment.value
  if (!latest) return ''

  if (latest.previousRiskLevel !== latest.newRiskLevel) {
    return t('result.reassessmentChanged', {
      from: latest.previousRiskLevel,
      to: latest.newRiskLevel
    })
  }

  return t('result.reassessmentUnchanged', {
    level: latest.newRiskLevel
  })
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
  flex-direction: column;
  gap: var(--space-4);
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

.risk-hero-top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.risk-pill {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
}

.risk-pill.level-1 { background: var(--c-level-1); color: white; }
.risk-pill.level-2 { background: var(--c-level-2); color: white; }
.risk-pill.level-3 { background: var(--c-level-3); color: var(--c-text); }
.risk-pill.level-4 { background: var(--c-level-4); color: white; }

.urgency-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.urgency-emergency { background: var(--c-level-1); color: white; }
.urgency-urgent { background: var(--c-level-2); color: white; }
.urgency-soon { background: var(--c-level-3); color: var(--c-text); }
.urgency-observe { background: var(--c-level-4); color: white; }

.risk-hero-main {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.risk-action {
  font-size: var(--text-xl);
  font-weight: 700;
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

.care-timing {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text-secondary);
}

.care-timing svg {
  width: 18px;
  height: 18px;
}

.risk-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

.support-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .support-row {
    grid-template-columns: 1fr 1fr;
  }
}

.support-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
}

.support-card--highlight {
  background: var(--c-primary-50);
  border-color: rgba(59, 130, 246, 0.2);
}

.support-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: var(--space-2);
}

.support-text {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  line-height: var(--leading-relaxed);
}

.support-meta {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--c-text-muted);
}

@media (min-width: 768px) {
  .risk-split {
    grid-template-columns: 1fr 1fr;
  }
}

.risk-split-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: var(--space-4);
}

.risk-split-title svg {
  width: 20px;
  height: 20px;
  color: var(--c-primary);
}

.score-section {
  background: var(--c-bg);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
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

.score-fill.fill-1 { background: linear-gradient(90deg, var(--c-level-2), var(--c-level-1)); }
.score-fill.fill-2 { background: linear-gradient(90deg, var(--c-level-3), var(--c-level-2)); }
.score-fill.fill-3 { background: linear-gradient(90deg, var(--c-level-4), var(--c-level-3)); }
.score-fill.fill-4 { background: var(--c-level-4); }

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
  margin-bottom: var(--space-4);
}

.red-flags {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.red-flag-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-level-1);
  margin-bottom: var(--space-1);
}

.red-flag-header svg {
  width: 18px;
  height: 18px;
}

.red-flag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  background: var(--c-level-1-bg);
  border: 1px solid var(--c-level-1);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--c-level-1);
  align-self: flex-start;
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

.warning-signs {
  margin-top: var(--space-6);
  padding: var(--space-5);
  background: rgba(239, 68, 68, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.warning-signs-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--c-level-1);
  margin-bottom: var(--space-3);
}

.warning-signs-title svg {
  width: 18px;
  height: 18px;
}

.warning-signs-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.warning-signs-list li {
  font-size: var(--text-sm);
  color: var(--c-text-secondary);
  padding-left: var(--space-5);
  position: relative;
}

.warning-signs-list li::before {
  content: '!';
  position: absolute;
  left: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--c-level-1-bg);
  color: var(--c-level-1);
  font-size: var(--text-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .risk-hero-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
