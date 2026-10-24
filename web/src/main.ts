import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { useBranding } from './stores/branding'
useBranding().loadBranding()
createApp(App).mount('#app')
