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
      <div class="nav-badges">
        <span class="badge badge--info">{{ t('nav.badgeInfo') }}</span>
        <span class="badge badge--warn">{{ t('nav.badgeWarn') }}</span>
        <div class="locale-toggle" :aria-label="t('nav.languageToggle')">
          <button
            type="button"
            class="locale-option"
            :class="{ active: locale === 'zh' }"
            @click="setLocale('zh')"
          >
            中
          </button>
          <button
            type="button"
            class="locale-option"
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
import { useI18n } from '@/composables/useI18n'

const { isEnglish, locale, setLocale, t } = useI18n()
</script>

<style scoped>
.nav {
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  padding: var(--space-4) var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: inherit;
}

.nav-logo {
  width: 36px;
  height: 36px;
}

.nav-titles {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.nav-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--c-primary);
}

.nav-slash {
  color: var(--c-text-muted);
  font-weight: 300;
}

.nav-zh {
  font-size: var(--text-base);
  color: var(--c-text-secondary);
}

.nav-badges {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
}

.badge--info {
  background: var(--c-info-bg);
  color: var(--c-info);
}

.badge--warn {
  background: var(--c-warning-bg);
  color: var(--c-warning);
}

.locale-toggle {
  display: inline-flex;
  padding: 4px;
  border-radius: var(--radius-full);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
}

.locale-option {
  min-width: 42px;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--c-text-muted);
  transition: all var(--transition-fast);
}

.locale-option.active {
  background: var(--c-primary);
  color: var(--c-text-inverse);
}

@media (max-width: 768px) {
  .nav-inner {
    flex-direction: column;
    gap: var(--space-2);
  }

  .nav-badges {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
