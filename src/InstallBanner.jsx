import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import translations from './translations.json';

const DISMISS_KEY = 'getqr-install-dismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

// Shared iOS share icon (box with arrow)
const ShareIcon = () => (
  <svg className="inline-block w-4 h-4 mx-0.5 -mt-0.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3-3m0 0l3 3m-3-3v12M12 2.25v9" />
  </svg>
);

// Reusable wrapper: layout, dismiss, animation
const BannerWrapper = ({ onDismiss, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm"
  >
    <div className="relative bg-gray-900 dark:bg-gray-800 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 mx-0 sm:mx-0 border border-gray-700/50">
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {children}
    </div>
  </motion.div>
);

const InstallBanner = ({ language = 'en' }) => {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState(null); // 'chromium' | 'ios'
  const deferredPrompt = useRef(null);
  const t = translations[language] ?? translations.en;

  useEffect(() => {
    // Already installed or previously dismissed
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return;

    // Chromium: listen for beforeinstallprompt
    const handlePrompt = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setVariant('chromium');
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // iOS Safari: detect and show instructions
    if (isIOS()) {
      setVariant('ios');
      setVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    if (outcome === 'accepted') dismiss();
  };

  // Render the iOS instruction text with the share icon inlined
  const renderIOSStep = () => {
    const text = t.installIOSStep ?? 'Tap {icon} then "Add to Home Screen"';
    const parts = text.split('{icon}');
    return (
      <span>
        {parts[0]}<ShareIcon />{parts[1]}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {visible && variant && (
        <BannerWrapper onDismiss={dismiss}>
          <div className="flex items-start gap-3 pr-6">
            <img src="/getqr-logo.svg" alt="GetQR" className="w-10 h-10 shrink-0 rounded-lg" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">{t.installTitle ?? 'Install GetQR'}</h3>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{t.installDescription ?? 'Add to your home screen for quick access and offline use'}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {variant === 'chromium' && (
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {t.installButton ?? 'Install'}
              </button>
            )}
            {variant === 'ios' && (
              <p className="flex-1 text-xs text-gray-300 leading-snug">
                {renderIOSStep()}
              </p>
            )}
            <button
              onClick={dismiss}
              className="px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {t.installDismiss ?? 'Not now'}
            </button>
          </div>
        </BannerWrapper>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;
