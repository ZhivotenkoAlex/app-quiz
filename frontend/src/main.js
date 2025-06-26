import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './style.css'

createApp(App).use(router).use(i18n).mount('#app')

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                // console.log('SW registered');
            })
            .catch((registrationError) => {
                // console.log('SW registration failed: ', registrationError);
            });
    });
} 