import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './index.tsx' // Asosiy App komponentini chaqiramiz
import { ToastProvider } from './components/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)