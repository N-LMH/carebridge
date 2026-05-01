<template>
  <div class="app">
    <NavBar />
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      <p>CareBridge / 医路桥 — 医疗支持应始于患者到达医生之前</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
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
