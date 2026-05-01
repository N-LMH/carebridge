<template>
  <div class="login-view">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.svg" alt="" class="login-logo" />
        <h1 class="login-title">{{ t('login.title') }}</h1>
        <p class="login-subtitle">{{ t('login.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <label class="field">
          <span class="field-label">{{ t('login.username') }}</span>
          <input
            v-model="username"
            class="field-input"
            type="text"
            :placeholder="t('login.usernamePlaceholder')"
            autocomplete="username"
            required
          />
        </label>
        <label class="field">
          <span class="field-label">{{ t('login.password') }}</span>
          <input
            v-model="password"
            class="field-input"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="error" class="login-error">{{ t('login.error') }}</p>

        <button type="submit" class="btn btn-primary login-submit" :disabled="authStore.loading">
          {{ authStore.loading ? t('login.loggingIn') : t('login.submit') }}
        </button>
      </form>

      <p class="login-hint">{{ t('login.demoHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref(false)

async function handleLogin() {
  error.value = false
  try {
    const user = await authStore.login(username.value, password.value)
    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    } else if (user.role === 'doctor') {
      router.push('/doctor')
    } else if (user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch {
    error.value = true
  }
}
</script>

<style scoped>
.login-view {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: linear-gradient(180deg, #FFFFFF 0%, var(--blue-50) 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  padding: var(--space-8);
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.login-logo {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
}

.login-title {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--text);
  margin-bottom: var(--space-2);
}

.login-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-error {
  font-size: var(--text-sm);
  color: var(--c-error);
  text-align: center;
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.05);
  border-radius: var(--radius-md);
}

.login-submit {
  width: 100%;
  margin-top: var(--space-2);
}

.login-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-align: center;
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}
</style>
