import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from './translations.json';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('selectedLanguage') || 'en';
  const t = translations[lang] ?? translations.en;

  useEffect(() => {
    document.title = 'Privacy Policy · GetQR';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-transparent bg-clip-text from-blue-400 via-blue-300 to-cyan-500 bg-linear-to-b hover:opacity-80 mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.privacyBackToGetQR}
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t.privacyModalTitle}
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">getqr.online</p>

        <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed">

          <p>{t.privacyIntro}</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t.privacyWeDoNot}</h2>
            <ul className="list-disc pl-5 space-y-1 font-medium text-gray-800 dark:text-gray-200">
              <li>{t.privacyNoLogs}</li>
              <li>{t.privacyNoCookies}</li>
              <li>{t.privacyNoTracking}</li>
              <li>{t.privacyNoSell}</li>
              <li>{t.privacyNoSave}</li>
            </ul>
          </section>

          <p>{t.privacyClientSide}</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyConsentTitle}</h2>
            <p>{t.privacyConsentText}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyInfoTitle}</h2>
            <p>{t.privacyInfoText}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyHostingTitle}</h2>
            <p>{t.privacyHostingText}{' '}
              <span className="not-prose"><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="inline-block font-bold text-transparent bg-clip-text from-blue-400 via-blue-300 to-cyan-500 bg-linear-to-b underline">vercel.com/legal/privacy-policy</a></span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyCCPATitle}</h2>
            <p>{t.privacyCCPAText}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyGDPRTitle}</h2>
            <p>{t.privacyGDPRText}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyChildrenTitle}</h2>
            <p>{t.privacyChildrenText}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.privacyInquiriesTitle}</h2>
            <p>{t.privacyInquiriesText}{' '}
              <span className="not-prose"><a href="https://serverket.dev" target="_blank" rel="noopener noreferrer" className="inline-block font-bold text-transparent bg-clip-text from-blue-400 via-blue-300 to-cyan-500 bg-linear-to-b underline">serverket.dev</a></span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
