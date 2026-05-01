<template>
  <div class="sidebar-card">
    <div class="sidebar-header-row">
      <h3 class="sidebar-title">最近记录</h3>
      <button class="icon-btn" @click="$emit('refresh')" aria-label="刷新">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>
    <div class="session-list">
      <div v-if="!sessions.length" class="empty-state">
        暂无记录，完成评估后将显示在此处
      </div>
      <article
        v-for="session in sessions"
        :key="session.id"
        class="session-card"
        @click="$emit('select', session.id)"
      >
        <div class="session-card-header">
          <div>
            <strong>{{ session.patientName || '未署名' }}</strong>
            <p>{{ session.region || '未知地区' }}</p>
          </div>
          <span class="chip chip-risk">{{ session.actionLabel }}</span>
        </div>
        <div class="session-chips">
          <span class="chip">{{ session.suggestedDepartment }}</span>
          <span class="followup-count">{{ session.followUpCount || 0 }} 条随访</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionSummary } from '@/types'

defineProps<{
  sessions: SessionSummary[]
}>()

defineEmits<{
  refresh: []
  select: [sessionId: string]
}>()
</script>

<style scoped>
.sidebar-card {
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.sidebar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.sidebar-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-muted);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--c-surface-hover);
  color: var(--c-text);
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.session-card {
  padding: var(--space-4);
  background: var(--c-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.session-card:hover {
  background: var(--c-primary-50);
}

.session-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.session-card-header strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--c-text);
}

.session-card-header p {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
  margin-top: var(--space-1);
}

.session-chips {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chip {
  display: inline-flex;
  padding: var(--space-1) var(--space-3);
  background: var(--c-surface);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--c-text-secondary);
}

.chip-risk {
  background: var(--c-primary-50);
  color: var(--c-primary);
  font-weight: 500;
}

.followup-count {
  font-size: var(--text-xs);
  color: var(--c-text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--c-text-muted);
  font-size: var(--text-sm);
}
</style>
