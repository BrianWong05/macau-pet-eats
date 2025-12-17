import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/lib/i18n' // Initialize i18n before app loads
import '@/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
