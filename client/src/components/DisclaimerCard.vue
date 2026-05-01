<template>
  <div class="disclaimer">
    <div class="disclaimer-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <div class="disclaimer-body">
      <strong>{{ t('disclaimer.title') }}</strong>
      <p>{{ t('disclaimer.body') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<style scoped>
.disclaimer {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--c-warning-bg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.disclaimer-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-warning);
}

.disclaimer-icon svg {
  width: 20px;
  height: 20px;
}

.disclaimer-body strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: var(--space-1);
}

.disclaimer-body p {
  font-size: var(--text-xs);
  color: var(--c-text-secondary);
  line-height: var(--leading-relaxed);
}
</style>
