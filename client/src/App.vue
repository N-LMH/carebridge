<template>
  <div class="app">
    <NavBar />
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      <p>{{ t('app.footer') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const { locale, t } = useI18n()
const authStore = useAuthStore()

watchEffect(() => {
  document.documentElement.lang = locale.value
})

onMounted(() => {
  authStore.ensureInitialized()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}

.footer {
  text-align: center;
  padding: var(--space-6);
  color: var(--c-text-muted);
  font-size: var(--text-sm);
  border-top: 1px solid var(--c-border);
}
</style>
