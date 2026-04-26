import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restore user session from localStorage before first navigation
const userStore = useUserStore()
userStore.restoreSession()

app.mount('#app')
