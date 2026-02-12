import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeGoogleSheetsFromEnv } from '@/lib/googleSheetsEnv'

// Initialize Google Sheets configuration from environment variables
// This runs before the app mounts to ensure config is ready
initializeGoogleSheetsFromEnv()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
