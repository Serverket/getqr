import React from 'react';
import { motion } from 'framer-motion';
import translations from './translations.json';

const Preloader = ({ isDark, language = 'en' }) => {
  return (
    <motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Logo pulse animation */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.img
          src="/getqr-logo.svg"
          alt="GetQR"
          className="w-28 h-28"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* App name */}
      <motion.h1
        className={`mt-5 text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        GetQR
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        {translations[language]?.tagline ?? translations['en'].tagline}
      </motion.p>

      {/* Loading dots */}
      <motion.div
        className="flex gap-1.5 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-violet-500"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
