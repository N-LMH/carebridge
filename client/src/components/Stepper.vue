<template>
  <div class="stepper">
    <div
      v-for="s in steps"
      :key="s.num"
      class="step"
      :class="{ active: step >= s.num }"
    >
      <span class="step-num">{{ s.num }}</span>
      <span class="step-label">{{ s.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  step: number
}>()

const steps = [
  { num: 1, label: '录入' },
  { num: 2, label: '追问' },
  { num: 3, label: '结果' }
]
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-md);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  transition: all var(--transition-fast);
}

.step.active {
  background: var(--c-primary);
  color: var(--c-text-inverse);
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--c-border-light);
}

.step.active .step-num {
  background: rgba(255, 255, 255, 0.2);
}
</style>
