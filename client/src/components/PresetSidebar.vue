<template>
  <div class="sidebar-card">
    <h3 class="sidebar-title">快速体验</h3>
    <div class="preset-list">
      <article
        v-for="preset in presets"
        :key="preset.id"
        class="preset-card"
        @click="handleSelect(preset)"
      >
        <div>
          <strong>{{ preset.title }}</strong>
          <p>{{ preset.patientName }} · {{ preset.region }}</p>
        </div>
        <span class="preset-cta">加载 →</span>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DemoPreset } from '@/types'

defineProps<{
  presets: DemoPreset[]
}>()

const emit = defineEmits<{
  select: [preset: DemoPreset]
}>()

function handleSelect(preset: DemoPreset) {
  emit('select', preset)
}
</script>

<style scoped>
.sidebar-card {
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.sidebar-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: var(--space-4);
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.preset-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preset-card:hover {
  background: var(--c-primary-50);
  transform: translateX(4px);
}

.preset-card strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: var(--space-1);
}

.preset-card p {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
}

.preset-cta {
  font-size: var(--text-xs);
  color: var(--c-primary);
  font-weight: 500;
  white-space: nowrap;
}
</style>
