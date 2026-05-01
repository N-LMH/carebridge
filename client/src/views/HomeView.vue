<template>
  <div class="home-view">
    <div class="layout">
      <div class="layout-primary">
        <IntakeCard />
        <FollowUpCard v-if="triageStore.needsFollowUp" />
        <ResultCard v-if="triageStore.hasActiveSession" />
      </div>

      <aside class="layout-sidebar">
        <PresetSidebar :presets="localizedPresets" @select="handlePresetSelect" />
        <SessionSidebar
          :sessions="triageStore.recentSessions"
          @refresh="triageStore.loadRecentSessions"
          @select="handleSessionSelect"
        />
        <DisclaimerCard />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { localizePreset } from '@/i18n/medical'
import { useTriageStore, demoPresets } from '@/stores/triage'
import IntakeCard from '@/components/IntakeCard.vue'
import FollowUpCard from '@/components/FollowUpCard.vue'
import ResultCard from '@/components/ResultCard.vue'
import PresetSidebar from '@/components/PresetSidebar.vue'
import SessionSidebar from '@/components/SessionSidebar.vue'
import DisclaimerCard from '@/components/DisclaimerCard.vue'
import type { DemoPreset } from '@/types'

const triageStore = useTriageStore()
const { locale } = useI18n()
const localizedPresets = computed(() => demoPresets.map((preset) => localizePreset(preset, locale.value)))

onMounted(() => {
  triageStore.loadRecentSessions()
})

function handlePresetSelect(preset: DemoPreset) {
  triageStore.loadPreset(preset)
}

async function handleSessionSelect(sessionId: string) {
  try {
    const session = await triageStore.loadSession(sessionId)
    triageStore.setActiveSession(session)
    triageStore.setCurrentStep(3)
  } catch {
    // 错误处理
  }
}
</script>

<style scoped>
.home-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 320px;
  }
}

.layout-primary {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.layout-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
</style>
