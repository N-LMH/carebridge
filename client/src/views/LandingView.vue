<template>
  <div class="landing">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">{{ t('landing.badge') }}</div>
        <h1 class="hero-title">
          <span class="hero-title-main">CareBridge</span>
          <span class="hero-title-sep">/</span>
          <span class="hero-title-alt">{{ isEnglish ? 'MedBridge' : '医路桥' }}</span>
        </h1>
        <p class="hero-subtitle">{{ t('landing.subtitle') }}</p>
        <p class="hero-desc">{{ t('landing.description') }}</p>
        <div class="hero-actions">
          <router-link to="/app" class="btn btn-primary btn-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3"/></svg>
            {{ t('landing.ctaUser') }}
          </router-link>
          <router-link :to="{ name: 'login', query: { redirect: '/doctor' } }" class="btn btn-outline btn-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            {{ t('landing.ctaDoctor') }}
          </router-link>
          <router-link :to="{ name: 'login', query: { redirect: '/admin' } }" class="btn btn-outline btn-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            {{ t('landing.ctaAdmin') }}
          </router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="features-inner">
        <div class="feature" v-for="feature in featureList" :key="feature.key">
          <div class="feature-icon" :class="feature.iconClass">
            <svg v-if="feature.key === 'triage'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <svg v-else-if="feature.key === 'summary'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            <svg v-else-if="feature.key === 'risk'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <h3 class="feature-title">{{ t(`landing.feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}Title`) }}</h3>
          <p class="feature-desc">{{ t(`landing.feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}Desc`) }}</p>
        </div>
      </div>
    </section>

    <section class="safety">
      <div class="safety-inner">
        <div class="safety-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="safety-content">
          <h3 class="safety-title">{{ t('landing.safetyTitle') }}</h3>
          <p class="safety-text">{{ t('landing.safetyText') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t, isEnglish } = useI18n()

const featureList = [
  { key: 'triage', iconClass: 'feature-icon--blue' },
  { key: 'risk', iconClass: 'feature-icon--orange' },
  { key: 'summary', iconClass: 'feature-icon--green' },
  { key: 'followup', iconClass: 'feature-icon--teal' }
]
</script>

<style scoped>
.landing {
  min-height: 100vh;
}

.hero {
  padding: var(--space-16) var(--space-6);
  text-align: center;
  background: linear-gradient(180deg, #FFFFFF 0%, var(--blue-50) 100%);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -200px;
  right: -100px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--blue-100) 0%, transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -150px;
  left: -100px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--green-100) 0%, transparent 70%);
  opacity: 0.4;
  pointer-events: none;
}

.hero-inner {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-4);
  background: var(--blue-50);
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--blue-600);
  letter-spacing: 0.05em;
  margin-bottom: var(--space-6);
}

.hero-title {
  font-size: var(--text-4xl);
  font-weight: 800;
  line-height: var(--leading-tight);
  margin-bottom: var(--space-4);
}

.hero-title-main {
  background: linear-gradient(135deg, var(--blue-600), var(--blue-800));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title-sep {
  color: var(--gray-300);
  font-weight: 300;
  margin: 0 var(--space-2);
}

.hero-title-alt {
  color: var(--gray-700);
}

.hero-subtitle {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-3);
}

.hero-desc {
  font-size: var(--text-base);
  color: var(--gray-500);
  line-height: var(--leading-relaxed);
  max-width: 560px;
  margin: 0 auto var(--space-8);
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
  min-height: 56px;
  border-radius: var(--radius-lg);
}

.btn-lg svg {
  width: 20px;
  height: 20px;
}

.features {
  padding: var(--space-16) var(--space-6);
  background: var(--surface);
}

.features-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 640px) {
  .features-inner {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 900px) {
  .features-inner {
    grid-template-columns: repeat(4, 1fr);
  }
}

.feature {
  text-align: center;
  padding: var(--space-6);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  box-shadow: var(--shadow-neu-sm);
}

.feature-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.feature-icon--blue {
  background: linear-gradient(135deg, var(--blue-500), var(--blue-600));
}

.feature-icon--orange {
  background: linear-gradient(135deg, var(--orange-400), var(--orange-500));
}

.feature-icon--green {
  background: linear-gradient(135deg, var(--green-500), var(--green-600));
}

.feature-icon--teal {
  background: linear-gradient(135deg, var(--blue-400), var(--blue-500));
}

.feature-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: var(--space-2);
}

.feature-desc {
  font-size: var(--text-sm);
  color: var(--gray-500);
  line-height: var(--leading-relaxed);
}

.safety {
  padding: var(--space-12) var(--space-6);
  background: linear-gradient(135deg, var(--orange-50), #FFFBEB);
  border-top: 1px solid var(--orange-200);
}

.safety-inner {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  gap: var(--space-5);
  align-items: flex-start;
}

.safety-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--orange-400), var(--orange-500));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.safety-icon svg {
  width: 22px;
  height: 22px;
}

.safety-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: var(--space-2);
}

.safety-text {
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
}

@media (max-width: 640px) {
  .hero {
    padding: var(--space-10) var(--space-4);
  }

  .hero-title {
    font-size: var(--text-3xl);
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .safety-inner {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}
</style>
