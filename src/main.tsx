import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { AccessGate } from './components/auth/AccessGate'
import { GoogleSessionProvider } from './context/GoogleSessionContext'
import { RentalDataProvider } from './context/RentalDataContext'
import './styles/index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/gestion-departamentos/sw.js', {
      scope: '/gestion-departamentos/',
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleSessionProvider>
      <AccessGate>
        <RentalDataProvider>
          <App />
        </RentalDataProvider>
      </AccessGate>
    </GoogleSessionProvider>
  </StrictMode>,
)
