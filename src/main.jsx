import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import App from './App.jsx';
import Preloader from './Preloader.jsx';
import PrivacyPage from './PrivacyPage.jsx';

// Read dark mode from localStorage before first render to avoid flash
const storedIsDark = (() => {
  try {
    const val = localStorage.getItem('isDark');
    return val ? JSON.parse(val) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
})();

const storedLanguage = (() => {
  const stored = localStorage.getItem('selectedLanguage');
  if (stored) return stored;
  const base = (navigator.language || 'en').split('-')[0].toLowerCase();
  return ['en', 'es', 'pt', 'it', 'zh'].includes(base) ? base : 'en';
})();

// Sync <html> dark class immediately so no flash occurs on any route
document.documentElement.classList.toggle('dark', storedIsDark);
document.documentElement.style.backgroundColor = storedIsDark ? '#111827' : '#f3f4f6';

const Shell = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const minHold = new Promise((resolve) => setTimeout(resolve, 1000));
    const firstPaint = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    Promise.all([minHold, firstPaint]).then(() => setIsLoaded(true));
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isLoaded && <Preloader key="preloader" isDark={storedIsDark} language={storedLanguage} />}
      </AnimatePresence>
      {isLoaded && (
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </React.StrictMode>,
);
