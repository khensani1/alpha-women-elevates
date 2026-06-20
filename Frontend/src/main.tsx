import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Temporarily removed AuthProvider until our custom backend auth is ready */}
    <App />
  </StrictMode>,
);