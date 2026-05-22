import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MedicationProvider } from './contexts/MedicationContext.tsx';

// Prevent benign Sandbox/Vite HMR WebSocket errors from triggering unhandled rejection overlays in browser
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const errorStr = event.reason ? String(event.reason.message || event.reason) : '';
    if (errorStr.includes('WebSocket') || errorStr.includes('vite') || errorStr.includes('websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (errorMsg.includes('WebSocket') || errorMsg.includes('vite') || errorMsg.includes('websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MedicationProvider>
      <App />
    </MedicationProvider>
  </StrictMode>,
);
