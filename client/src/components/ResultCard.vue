<template>
  <section v-if="triageStore.hasActiveSession" class="card">
    <div class="card-head">
      <div class="card-icon card-icon--green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="M22 4 12 14.01l-3-3"/>
        </svg>
      </div>
      <div>
        <h2 class="card-title">分诊结果</h2>
        <p class="card-desc">查看风险评估与就诊建议</p>
      </div>
    </div>

    <div class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" />
        {{ tab.label }}
      </button>
    </div>

    <div class="result-body">
      <RiskTab v-if="activeTab === 'risk'" />
      <SummaryTab v-if="activeTab === 'summary'" />
      <FollowUpTab v-if="activeTab === 'followup'" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { useTriageStore } from '@/stores/triage'
import RiskTab from './result/RiskTab.vue'
import SummaryTab from './result/SummaryTab.vue'
import FollowUpTab from './result/FollowUpTab.vue'

const triageStore = useTriageStore()
const activeTab = ref('risk')
const activeSessionId = ref<string | null>(null)

const WarningIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
      h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
      h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ])
  }
}

const DocumentIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('path', { d: 'M14 2v6h6' }),
      h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
      h('line', { x1: '16', y1: '17', x2: '8', y2: '17' })
    ])
  }
}

const ChatIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ])
  }
}

const tabs = [
  { id: 'risk', label: '风险分级', icon: WarningIcon },
  { id: 'summary', label: '就诊摘要', icon: DocumentIcon },
  { id: 'followup', label: '随访记录', icon: ChatIcon }
]

watch(() => triageStore.activeSession?.id ?? null, (sessionId) => {
  if (sessionId !== activeSessionId.value) {
    activeTab.value = 'risk'
    activeSessionId.value = sessionId
  }
})
</script>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding: var(--space-2);
  background: var(--c-bg);
  border-radius: var(--radius-md);
}

.tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--c-text-secondary);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.tab:hover {
  background: var(--c-surface);
  color: var(--c-text);
}

.tab.active {
  background: var(--c-surface);
  color: var(--c-primary);
  box-shadow: var(--shadow-sm);
}

.tab :deep(svg) {
  width: 18px;
  height: 18px;
}
</style>
