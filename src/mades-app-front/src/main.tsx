import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => {
        console.error('Error registrando service worker:', error)
      })
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      registerServiceWorker()
    } else {
      window.addEventListener('DOMContentLoaded', registerServiceWorker, { once: true })
    }
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister()
      })
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
