import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './shell/App'
import './styles.css'
import { seedIfNeeded } from './db/seed'

// Ask the browser not to evict our IndexedDB data under storage pressure.
navigator.storage?.persist?.().catch(() => {})
seedIfNeeded().catch((e) => console.error('Seeding failed', e))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
