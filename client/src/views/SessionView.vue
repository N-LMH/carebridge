<template>
  <div class="session-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <template v-else-if="session">
      <div class="session-header">
        <button class="btn btn-ghost" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ t('common.back') }}
        </button>
        <h1>{{ session.intake.patientName || t('common.unnamedPatient') }}{{ t('sessionView.titleSuffix') }}</h1>
      </div>

      <ResultCard />
    </template>

    <div v-else class="error-state">
      <p>{{ t('sessionView.notFound') }}</p>
      <button class="btn btn-primary" @click="goBack">{{ t('sessionView.backHome') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useRouter, useRoute } from 'vue-router'
import { useTriageStore } from '@/stores/triage'
import ResultCard from '@/components/ResultCard.vue'
import type { Session } from '@/types'

const router = useRouter()
const route = useRoute()
const triageStore = useTriageStore()
const { t } = useI18n()

const loading = ref(true)
const session = ref<Session | null>(null)

onMounted(async () => {
  const sessionId = route.params.id as string
  if (!sessionId) {
    loading.value = false
    return
  }

  try {
    const data = await triageStore.loadSession(sessionId)
    session.value = data
    triageStore.setActiveSession(data)
    triageStore.setCurrentStep(3)
  } catch {
    session.value = null
  } finally {
    loading.value = false
  }
})

function goBack() {
  triageStore.reset()
  router.push('/app')
}
</script>

<style scoped>
.session-view {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6);
}

.session-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.session-header h1 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--c-text);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: var(--space-4);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
