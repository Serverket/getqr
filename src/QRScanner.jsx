import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import translations from './translations.json';

const QRScanner = ({ language = 'en' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const facingRef = useRef('environment');

  const [status, setStatus] = useState('idle'); // idle | requesting | scanning | found | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const t = (key) => translations[language]?.[key] ?? translations['en'][key] ?? key;

  const stopStream = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  const startCamera = async (facing) => {
    const mode = facing ?? facingRef.current;
    facingRef.current = mode;
    stopStream();
    setResult(null);
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setStatus('scanning');

      const tick = () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        const ctx = c.getContext('2d', { willReadFrequently: true });
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        ctx.drawImage(v, 0, 0);
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code) {
          setResult(code.data);
          setStatus('found');
          stopStream();
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setErrorMsg(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? t('scanPermission')
          : t('scanError')
      );
      setStatus('error');
    }
  };

  const handleFlip = () => {
    const next = facingRef.current === 'environment' ? 'user' : 'environment';
    startCamera(next);
  };

  const handleScanAgain = () => startCamera();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isUrl = result && /^https?:\/\//i.test(result.trim());

  return (
    <div className="space-y-4">
      {/* Camera viewport */}
      <div className="relative mx-auto overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 aspect-square w-full max-w-xs">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Idle */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gray-100 dark:bg-gray-900">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <button
              onClick={() => startCamera()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {t('scanStart')}
            </button>
          </div>
        )}

        {/* Requesting */}
        {status === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Scanning overlay */}
        {status === 'scanning' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />
            {/* Scan zone */}
            <div className="absolute inset-10">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-violet-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-violet-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-violet-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-violet-400 rounded-br" />
              {/* Scan sweep line */}
              <div className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-400 to-transparent animate-scan-sweep" />
            </div>
          </div>
        )}

        {/* Found */}
        {status === 'found' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900 p-6 text-center">
            <svg className="w-10 h-10 text-red-500 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">{errorMsg}</p>
            <button
              onClick={() => startCamera()}
              className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
            >
              {t('scanRetry')}
            </button>
          </div>
        )}
      </div>

      {/* Flip camera button */}
      {status === 'scanning' && (
        <div className="flex justify-center">
          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('scanFlip')}
          </button>
        </div>
      )}

      {/* Result card */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('scanResult')}
            </p>
            <p className="text-sm text-gray-900 dark:text-white break-all font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
              {result}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 px-3 py-2.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? t('copied') : t('copyQR')}
              </button>
              {isUrl && (
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-center bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                  {t('scanOpen')}
                </a>
              )}
              <button
                onClick={handleScanAgain}
                className="flex-1 px-3 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                {t('scanAgain')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRScanner;
