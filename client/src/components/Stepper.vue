<template>
  <div class="stepper">
    <div
      v-for="s in steps"
      :key="s.num"
      class="step"
      :class="{ active: step >= s.num, current: step === s.num }"
    >
      <span class="step-num">
        <svg v-if="step > s.num" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span v-else>{{ s.num }}</span>
      </span>
      <div class="step-text">
        <span class="step-label">{{ t(s.label) }}</span>
        <span class="step-desc">{{ t(s.desc) }}</span>
      </div>
    </div>
    <div class="stepper-line">
      <div class="stepper-line-fill" :style="{ width: fillPct + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  step: number
}>()

const { t } = useI18n()

const steps = [
  { num: 1, label: 'stepper.intake', desc: 'stepper.intakeDesc' },
  { num: 2, label: 'stepper.followUp', desc: 'stepper.followUpDesc' },
  { num: 3, label: 'stepper.result', desc: 'stepper.resultDesc' }
]

const fillPct = computed(() => Math.max(0, ((props.step - 1) / 2) * 100))
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-5);
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  position: relative;
}

.step {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  transition: all var(--transition-fast);
  position: relative;
  z-index: 1;
  flex: 1;
}

.step.active {
  color: var(--c-text);
}

.step.current {
  background: var(--c-primary);
  color: var(--c-text-inverse);
}

.step.current .step-desc {
  color: rgba(255, 255, 255, 0.8);
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
  background: var(--c-border-light);
  flex-shrink: 0;
}

.step.active .step-num {
  background: var(--c-primary);
  color: white;
}

.step.current .step-num {
  background: rgba(255, 255, 255, 0.25);
}

.step-num svg {
  width: 14px;
  height: 14px;
}

.step-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.step-label {
  font-weight: 600;
  font-size: var(--text-sm);
  line-height: 1.2;
}

.step-desc {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stepper-line {
  position: absolute;
  bottom: 8px;
  left: var(--space-5);
  right: var(--space-5);
  height: 3px;
  background: var(--c-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.stepper-line-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

@media (max-width: 640px) {
  .step-desc {
    display: none;
  }

  .step {
    flex: unset;
  }
}
</style>
