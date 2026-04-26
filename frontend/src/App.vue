<template>
  <div id="app" class="app-wrapper">
    <!-- Floating theme toggle on auth pages (no navbar) -->
    <button 
      v-if="!showChrome"
      @click="toggleTheme" 
      class="theme-toggle fixed top-4 right-4 z-40 p-2 rounded-full transition-all"
      :class="isDarkMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400'"
      title="Toggle dark/light theme"
    >
      {{ isDarkMode ? '☀️' : '🌙' }}
    </button>

    <!-- Navigation Bar -->
    <nav v-if="showChrome" class="navbar sticky top-0 z-50 transition-colors duration-300" :class="navbarClass">
      <div class="nav-container max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <!-- Brand -->
        <div class="nav-brand flex items-center gap-1.5 shrink-0">
          <div class="text-2xl">☀️</div>
          <h1 class="text-lg font-bold hidden lg:block" :class="isDarkMode ? 'text-slate-100' : 'text-white'">Apolaki</h1>
        </div>

        <!-- Mobile Hamburger Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="hamburger-btn md:hidden p-2 rounded-lg transition" :class="isDarkMode ? 'text-white hover:bg-white/10' : 'text-white hover:bg-black/10'" aria-label="Toggle menu">
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Main Menu -->
        <ul class="nav-menu hidden md:flex items-center gap-0.5">
          <li><router-link to="/dashboard" class="nav-link transition">Dashboard</router-link></li>
          <li><router-link to="/installations" class="nav-link transition">Installations</router-link></li>
          <li><router-link to="/monitoring" class="nav-link transition">Monitoring</router-link></li>
          <li><router-link to="/marketplace" class="nav-link transition">Marketplace</router-link></li>
          <li><router-link to="/assessment" class="nav-link transition">Assessment</router-link></li>
          <li><router-link to="/contracts" class="nav-link transition">Contracts</router-link></li>

          <!-- "More" dropdown for role-specific links -->
          <li v-if="hasAdminLinks" class="nav-more-wrapper">
            <button @click="moreMenuOpen = !moreMenuOpen" class="nav-link nav-more-btn transition">
              More ▾
            </button>
            <transition name="dropdown">
              <ul v-if="moreMenuOpen" class="nav-dropdown" @mouseleave="moreMenuOpen = false">
                <li v-if="userStore.hasRole('dealer', 'installer', 'admin', 'superadmin')">
                  <router-link to="/dealer" class="dropdown-link" @click="moreMenuOpen = false">🔧 Dealer</router-link>
                </li>
                <li v-if="userStore.hasRole('operations', 'admin', 'superadmin')">
                  <router-link to="/operations" class="dropdown-link" @click="moreMenuOpen = false">🛠️ Operations</router-link>
                </li>
                <li v-if="userStore.hasRole('admin', 'superadmin')">
                  <router-link to="/admin" class="dropdown-link" @click="moreMenuOpen = false">👤 Admin</router-link>
                </li>
                <li v-if="userStore.hasRole('superadmin')">
                  <router-link to="/superadmin" class="dropdown-link dropdown-link--emergency" @click="moreMenuOpen = false">🚨 Break-Glass</router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>

        <!-- Right-side actions: theme toggle, user -->
        <div class="nav-user flex items-center gap-2 shrink-0">
          <!-- Theme toggle inside navbar -->
          <button 
            @click="toggleTheme" 
            class="theme-toggle-inline"
            :class="isDarkMode ? 'theme-toggle-dark' : 'theme-toggle-light'"
            title="Toggle dark/light theme"
          >
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>

          <div v-if="userStore.user" class="hidden sm:flex items-center gap-2">
            <router-link to="/profile" class="nav-avatar" :title="userStore.user.email">
              {{ userInitials }}
            </router-link>
            <button @click="logout" class="btn-nav-logout" :class="isDarkMode ? 'btn-nav-logout--dark' : ''">Logout</button>
          </div>
          <router-link v-else to="/login" class="btn-nav-login" :class="isDarkMode ? 'btn-nav-login--dark' : ''">Login</router-link>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <transition name="slide-down">
        <div v-if="mobileMenuOpen" class="mobile-menu md:hidden" :class="isDarkMode ? 'bg-slate-800' : 'bg-amber-700'">
          <ul class="flex flex-col py-3 px-4 gap-1">
            <li><router-link to="/dashboard" class="mobile-link" @click="mobileMenuOpen = false">📊 Dashboard</router-link></li>
            <li><router-link to="/installations" class="mobile-link" @click="mobileMenuOpen = false">🏠 Installations</router-link></li>
            <li><router-link to="/monitoring" class="mobile-link" @click="mobileMenuOpen = false">📡 Monitoring</router-link></li>
            <li><router-link to="/marketplace" class="mobile-link" @click="mobileMenuOpen = false">🛒 Marketplace</router-link></li>
            <li><router-link to="/assessment" class="mobile-link" @click="mobileMenuOpen = false">☀️ Assessment</router-link></li>
            <li><router-link to="/contracts" class="mobile-link" @click="mobileMenuOpen = false">📄 Contracts</router-link></li>
            <li v-if="userStore.hasRole('dealer', 'installer', 'admin', 'superadmin')">
              <router-link to="/dealer" class="mobile-link" @click="mobileMenuOpen = false">🔧 Dealer</router-link>
            </li>
            <li v-if="userStore.hasRole('operations', 'admin', 'superadmin')">
              <router-link to="/operations" class="mobile-link" @click="mobileMenuOpen = false">🛠️ Operations</router-link>
            </li>
            <li v-if="userStore.hasRole('admin', 'superadmin')">
              <router-link to="/admin" class="mobile-link" @click="mobileMenuOpen = false">👤 Admin</router-link>
            </li>
            <li v-if="userStore.user" class="mt-2 pt-2 border-t border-white/20">
              <button @click="logout; mobileMenuOpen = false" class="mobile-link w-full text-left">🚪 Logout</button>
            </li>
          </ul>
        </div>
      </transition>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <footer v-if="showChrome" class="site-footer transition-colors duration-300" :class="isDarkMode ? 'site-footer--dark' : 'site-footer--light'">
      <div class="footer-inner">
        <!-- Left: brand + copyright -->
        <div class="footer-left">
          <span class="footer-brand">☀️ Apolaki Solar</span>
          <span class="footer-copy">&copy; {{ new Date().getFullYear() }} All rights reserved.</span>
        </div>

        <!-- Center: nav links -->
        <nav class="footer-nav">
          <router-link to="/about" class="footer-nav-link">About</router-link>
          <a href="#" class="footer-nav-link">Features</a>
          <a href="#" class="footer-nav-link">Pricing</a>
          <a href="#" class="footer-nav-link">Privacy</a>
          <a href="#" class="footer-nav-link">Terms</a>
          <a href="#" class="footer-nav-link">Docs</a>
        </nav>

        <!-- Right: social icons (text-based for now) -->
        <div class="footer-social">
          <a href="#" class="footer-social-link" title="Twitter">𝕏</a>
          <a href="#" class="footer-social-link" title="GitHub">⌘</a>
          <a href="#" class="footer-social-link" title="LinkedIn">in</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from './stores/themeStore'
import { useUserStore } from './stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const mobileMenuOpen = ref(false)
const moreMenuOpen = ref(false)

// Computed so templates can use it reactively
const isDarkMode = computed(() => themeStore.isDarkMode)

// User initials for the avatar circle
const userInitials = computed(() => {
  const u = userStore.user
  if (!u) return '?'
  const first = (u.first_name || u.firstName || u.email || '?')[0]
  const last = (u.last_name || u.lastName || '')[0] || ''
  return (first + last).toUpperCase()
})

// Whether to show the "More" dropdown
const hasAdminLinks = computed(() => {
  return userStore.hasRole('dealer', 'installer', 'operations', 'admin', 'superadmin')
})

onMounted(() => {
  themeStore.init()
})

const toggleTheme = () => {
  themeStore.toggle()
}

const showChrome = computed(() => {
  return !route.path.startsWith('/login') &&
    !route.path.startsWith('/signup') &&
    !route.path.startsWith('/forgot-password') &&
    !route.path.startsWith('/reset-password')
})

const navbarClass = computed(() => {
  if (isDarkMode.value) {
    return 'bg-gradient-to-r from-slate-800 via-amber-700 to-amber-800 shadow-lg'
  }
  return 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 shadow-lg'
})

const mainBgClass = computed(() => {
  if (isDarkMode.value) {
    return 'min-h-screen bg-gradient-to-b from-slate-900 to-slate-800'
  }
  return 'min-h-screen bg-gradient-to-b from-gray-50 to-gray-100'
})

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ── Navbar ─────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: bold;
  color: white;
}

.nav-menu {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: block;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8125rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.nav-link.router-link-active {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.12);
  font-weight: 600;
}

/* "More" dropdown ─────────────────────────────────── */
.nav-more-wrapper {
  position: relative;
}

.nav-more-btn {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

.nav-dropdown {
  position: absolute;
  top: calc(100% + 0.375rem);
  right: 0;
  min-width: 180px;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  list-style: none;
  margin: 0;
  padding: 0.375rem;
  z-index: 100;
}

.dropdown-link {
  display: block;
  padding: 0.5rem 0.75rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background 0.15s;
}

.dropdown-link:hover {
  background: #f3f4f6;
}

.dropdown-link.router-link-active {
  background: #fffbeb;
  color: #b45309;
}

.dropdown-link--emergency {
  color: #dc2626;
}

/* Dropdown transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Nav-link-emergency (kept for mobile fallback) */
.nav-link-emergency {
  color: white;
  text-decoration: none;
  font-weight: 600;
}

/* ── Right-side: theme toggle + user ────────────────── */
.nav-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle-inline {
  width: 32px;
  height: 32px;
  font-size: 1rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.theme-toggle-light {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.theme-toggle-light:hover {
  background: rgba(255, 255, 255, 0.25);
}

.theme-toggle-dark {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.theme-toggle-dark:hover {
  background: rgba(251, 191, 36, 0.35);
}

/* Avatar circle */
.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.2s;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.nav-avatar:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-nav-login,
.btn-nav-logout {
  padding: 0.3125rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.9);
  color: #b45309;
}

.btn-nav-login:hover,
.btn-nav-logout:hover {
  background: white;
}

.btn-nav-login--dark,
.btn-nav-logout--dark {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.btn-nav-login--dark:hover,
.btn-nav-logout--dark:hover {
  background: rgba(251, 191, 36, 0.35);
}

/* ── Floating theme toggle (auth pages only) ────────── */
.theme-toggle {
  width: 44px;
  height: 44px;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

/* ── Main & Footer ──────────────────────────────────── */
.main-content {
  flex: 1;
  padding: 0;
}

/* Compact sticky-bottom footer — NEVER overlaps content or dropdowns */
.site-footer {
  margin-top: auto;
  border-top: 1px solid;
  padding: 0.625rem 0;
  font-size: 0.75rem;
  position: relative;
  z-index: 1; /* low z-index so dropdowns/selects always float above */
}

.site-footer--light {
  background: #111827;
  border-color: #1f2937;
  color: #9ca3af;
}

.site-footer--dark {
  background: #0F172A;
  border-color: #1E293B;
  color: #64748B;
}

.footer-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.footer-brand {
  font-weight: 700;
  font-size: 0.8125rem;
  color: #d1d5db;
}

.site-footer--dark .footer-brand {
  color: #CBD5E1;
}

.footer-copy {
  opacity: 0.7;
}

/* Footer nav links */
.footer-nav {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.footer-nav-link {
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.15s, background 0.15s;
}

.footer-nav-link:hover {
  color: #f9fafb;
  background: rgba(255, 255, 255, 0.06);
}

.site-footer--dark .footer-nav-link:hover {
  color: #F1F5F9;
  background: rgba(255, 255, 255, 0.06);
}

/* Social links */
.footer-social {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.footer-social-link {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 700;
  transition: color 0.15s, background 0.15s;
}

.footer-social-link:hover {
  color: #f9fafb;
  background: rgba(255, 255, 255, 0.1);
}

.site-footer--dark .footer-social-link {
  color: #64748B;
}

.site-footer--dark .footer-social-link:hover {
  color: #E2E8F0;
  background: rgba(255, 255, 255, 0.08);
}

/* On small screens, stack footer sections */
@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 0.25rem 1rem;
  }

  .footer-nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-left {
    flex-direction: column;
    gap: 0.125rem;
  }
}

/* ── Transitions ────────────────────────────────────── */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ── Mobile ─────────────────────────────────────────── */
.hamburger-btn {
  border: none;
  cursor: pointer;
  background: none;
}

.w-6 {
  width: 1.5rem;
  height: 1.5rem;
}

.mobile-menu {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.mobile-menu ul {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0.75rem;
}

.mobile-link {
  display: block;
  padding: 0.625rem 0.75rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.mobile-link:hover,
.mobile-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-user {
    gap: 0.375rem;
  }
}

/* Large screens: open up link gaps a touch */
@media (min-width: 1280px) {
  .nav-menu {
    gap: 4px;
  }

  .nav-link {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }
}

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
