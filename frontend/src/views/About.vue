<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-12">
        <div class="text-5xl mb-4">☀️</div>
        <h1 class="text-4xl font-bold text-gray-900">About Apolaki Solar</h1>
        <p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Empowering individuals and small businesses to make informed solar energy decisions
          through a unified platform.
        </p>
      </div>

      <!-- Mission Section -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🎯 Our Mission</h2>
        <p class="text-gray-700 leading-relaxed text-lg">
          Apolaki Solar Platform is a comprehensive web-based solar energy management system
          designed for residential and small commercial users. We combine real-time monitoring,
          marketplace discovery, financial analysis, and contract management into one intuitive platform —
          making solar energy accessible and understandable for everyone.
        </p>
      </section>

      <!-- What We Offer -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="text-3xl mb-3">📊</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Real-Time Monitoring</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Track your solar installation performance with live dashboards showing power output,
            energy production, efficiency metrics, and automated alerts.
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="text-3xl mb-3">🛒</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Solar Marketplace</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Browse and compare solar panels, inverters, batteries, and providers.
            Read user reviews and add products to your wishlist.
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="text-3xl mb-3">💰</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Financial Assessment</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Calculate ROI, payback periods, and 20-year savings projections.
            Explore financing options including cash, loan, and lease.
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="text-3xl mb-3">📄</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Contract Management</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Create, review, and electronically sign solar contracts.
            Track status and maintain a complete audit trail.
          </p>
        </div>
      </section>

      <!-- Tech Stack -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">🛠️ Technology Stack</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 class="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Frontend</h4>
            <ul class="space-y-2">
              <li v-for="item in techStack.frontend" :key="item" class="flex items-center gap-2 text-sm text-gray-600">
                <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                {{ item }}
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Backend / Middleware</h4>
            <ul class="space-y-2">
              <li v-for="item in techStack.backend" :key="item" class="flex items-center gap-2 text-sm text-gray-600">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {{ item }}
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Infrastructure</h4>
            <ul class="space-y-2">
              <li v-for="item in techStack.infra" :key="item" class="flex items-center gap-2 text-sm text-gray-600">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Credits -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">🏆 Credits</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="w-12 h-12 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              A
            </div>
            <div>
              <h4 class="font-bold text-gray-900">Apolaki Development Team</h4>
              <p class="text-sm text-gray-600">Platform design, architecture, and development</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-semibold text-gray-800 mb-3">Open Source Libraries</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <span v-for="lib in openSourceLibs" :key="lib" class="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {{ lib }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-semibold text-gray-800 mb-2">Standards & References</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• IEC 61724 — Solar Industry Performance Standards</li>
              <li>• OWASP — Security Guidelines</li>
              <li>• RESTful API Best Practices</li>
              <li>• Cloud-Native Architecture Patterns</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Documentation Links -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">📚 Documentation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a v-for="doc in docs" :key="doc.title" :href="doc.url" target="_blank"
             class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition group">
            <span class="text-2xl">{{ doc.icon }}</span>
            <div>
              <h4 class="font-semibold text-gray-900 group-hover:text-orange-600 transition">{{ doc.title }}</h4>
              <p class="text-xs text-gray-500">{{ doc.description }}</p>
            </div>
          </a>
        </div>
      </section>

      <!-- Version & Contact -->
      <section class="bg-linear-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white text-center">
        <h2 class="text-2xl font-bold mb-2">Apolaki Solar Platform</h2>
        <p class="text-gray-400 mb-4">Version {{ version }} • MVP Release</p>
        <div class="flex justify-center gap-6 text-sm text-gray-400">
          <span>© 2026 Apolaki Solar</span>
          <span>•</span>
          <span>All rights reserved</span>
        </div>
        <div class="mt-6 flex justify-center gap-4">
          <router-link to="/dashboard" class="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition text-sm">
            Go to Dashboard
          </router-link>
          <a href="https://github.com" target="_blank" class="border border-gray-600 text-gray-300 px-6 py-2 rounded-lg font-medium hover:border-gray-400 hover:text-white transition text-sm">
            GitHub
          </a>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
const version = '2.0.0'

const techStack = {
  frontend: ['Vue.js 3', 'Vite', 'Tailwind CSS 4', 'Pinia (State)', 'Vue Router', 'Axios'],
  backend: ['Node.js / Express', 'PostgreSQL (Neon)', 'JWT Authentication', 'Passport.js (OAuth)', 'Bcrypt.js', 'Zod (Validation)'],
  infra: ['Netlify (Hosting)', 'Docker / Kubernetes', 'Helm Charts', 'GitHub Actions CI/CD', 'Redis (Cache)', 'Monitoring Stack']
}

const openSourceLibs = [
  'Vue.js', 'Vite', 'Tailwind CSS', 'Pinia', 'Axios',
  'Express', 'PostgreSQL', 'Passport.js', 'JSON Web Tokens',
  'Bcrypt.js', 'Zod', 'uuid', 'dotenv', 'cors'
]

const docs = [
  { icon: '📖', title: 'API Reference', description: 'Complete REST API documentation', url: '/docs/API_REFERENCE.md' },
  { icon: '🏗️', title: 'Architecture', description: 'System architecture and design decisions', url: '/docs/ARCHITECTURE.md' },
  { icon: '🚀', title: 'Deployment Guide', description: 'Production deployment instructions', url: '/docs/DEPLOYMENT_GUIDE.md' },
  { icon: '⚙️', title: 'Setup Guide', description: 'Development environment setup', url: '/docs/SETUP_GUIDE.md' },
  { icon: '🔐', title: 'OAuth Setup', description: 'OAuth provider configuration', url: '/docs/OAUTH_SETUP_GUIDE.md' },
  { icon: '📋', title: 'MVP PRD', description: 'Product requirements document', url: '/docs/MVP.PRD.md' },
  { icon: '📊', title: 'CI/CD Pipeline', description: 'Continuous integration and deployment', url: '/docs/CI_CD_PIPELINE.md' },
  { icon: '🩺', title: 'Production Runbook', description: 'Monitoring, logging, and incident response', url: '/docs/PRODUCTION_RUNBOOK.md' }
]
</script>

<style scoped>
/* ── Dark Theme Overrides ── */
:global(.dark-theme) .bg-gray-50 {
  background-color: #1E293B !important;
}

:global(.dark-theme) .bg-gray-100 {
  background-color: #334155 !important;
}

:global(.dark-theme) .text-gray-700 {
  color: #CBD5E1 !important;
}

:global(.dark-theme) .text-gray-800 {
  color: #E2E8F0 !important;
}
</style>
