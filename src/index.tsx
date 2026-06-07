import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SpeechProvider } from './context/SpeechProvider';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SpeechProvider>
      <App />
    </SpeechProvider>
  </React.StrictMode>
);
