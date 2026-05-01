<template>
  <nav class="nav">
    <div class="nav-inner">
      <router-link to="/" class="nav-brand">
        <img src="/logo.svg" alt="" class="nav-logo" />
        <div class="nav-titles">
          <span class="nav-name">CareBridge</span>
          <span class="nav-slash">/</span>
          <span class="nav-zh">{{ isEnglish ? 'MedBridge' : '医路桥' }}</span>
        </div>
      </router-link>

      <div class="nav-right">
        <div class="nav-links" v-if="showNavLinks">
          <router-link to="/app" class="nav-link" :class="{ active: isAppRoute }">
            {{ t('nav.userSide') }}
          </router-link>
          <router-link to="/admin" class="nav-link" :class="{ active: isAdminRoute }">
            {{ t('nav.adminSide') }}
          </router-link>
        </div>

        <div class="nav-meta">
          <span class="nav-badge">{{ t('nav.badgeWarn') }}</span>
          <span class="nav-divider"></span>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: locale === 'zh' }"
            @click="setLocale('zh')"
          >
            中文
          </button>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: locale === 'en' }"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const { isEnglish, locale, setLocale, t } = useI18n()
const route = useRoute()

const showNavLinks = computed(() => route.path !== '/')

const isAppRoute = computed(() =>
  route.path.startsWith('/app') || route.path.startsWith('/session')
)

const isAdminRoute = computed(() =>
  route.path.startsWith('/admin')
)
</script>

<style scoped>
.nav {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: var(--space-4);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.nav-logo {
  width: 32px;
  height: 32px;
}

.nav-titles {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.nav-name {
  font-size: var(--text-lg);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-slash {
  color: var(--gray-300);
  font-weight: 300;
}

.nav-zh {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-links {
  display: flex;
  gap: var(--space-1);
}

.nav-link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--text);
  background: var(--gray-50);
}

.nav-link.active {
  color: var(--primary);
  background: var(--blue-50);
  font-weight: 600;
}

.nav-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav-badge {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--warning);
  padding: 2px var(--space-2);
  background: var(--warning-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--orange-200);
  white-space: nowrap;
}

.nav-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
}

.lang-btn {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  letter-spacing: 0.02em;
}

.lang-btn:hover {
  color: var(--text);
  background: var(--gray-50);
}

.lang-btn.active {
  color: var(--primary);
  background: var(--blue-50);
}

@media (max-width: 768px) {
  .nav {
    padding: 0 var(--space-4);
  }

  .nav-inner {
    flex-wrap: wrap;
    height: auto;
    padding: var(--space-3) 0;
    gap: var(--space-2);
  }

  .nav-right {
    width: 100%;
    justify-content: space-between;
  }

  .nav-links {
    gap: 0;
  }

  .nav-badge {
    display: none;
  }

  .nav-divider {
    display: none;
  }
}
</style>
