import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  /**
   * Initialise theme from localStorage or OS preference.
   * Call once from App.vue onMounted.
   */
  function init() {
    const saved = localStorage.getItem('theme-preference')
    if (saved) {
      isDarkMode.value = saved === 'dark'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply()
  }

  /** Toggle between light / dark */
  function toggle() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')
    apply()
  }

  /** Apply the class to <html> so every CSS variable override works */
  function apply() {
    const root = document.documentElement
    if (isDarkMode.value) {
      root.classList.add('dark-theme')
      root.classList.add('dark')        // also enable Tailwind dark: variant
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark-theme')
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }

  // Keep <html> class in sync if anything else mutates isDarkMode
  watch(isDarkMode, apply)

  return { isDarkMode, init, toggle }
})
