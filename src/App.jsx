import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { motion } from 'framer-motion';
import './App.css';
import translations from './translations.json';
import useFormPersistence from './useFormPersistence';
import QRScanner from './QRScanner.jsx';

const QR_STYLES = [
  { id: 'square',         labelKey: 'styleSquare' },
  { id: 'dots',           labelKey: 'styleDots' },
  { id: 'rounded',        labelKey: 'styleRounded' },
  { id: 'extra-rounded',  labelKey: 'styleExtraRounded' },
  { id: 'classy',         labelKey: 'styleClassy' },
  { id: 'classy-rounded', labelKey: 'styleClassyRounded' },
];

const TAGLINE_KEYS = ['tagline1', 'tagline2', 'tagline3', 'tagline5', 'tagline4'];

const GRADIENT_PRESETS = [
  { id: 'violet', labelKey: 'gradientViolet', css: 'linear-gradient(135deg, #06B6D4, #7C3AED, #EC4899)', stops: ['#06B6D4', '#7C3AED', '#EC4899'] },
  { id: 'amber',  labelKey: 'gradientAmber',  css: 'linear-gradient(135deg, #F59E0B, #EF4444, #EC4899)', stops: ['#F59E0B', '#EF4444', '#EC4899'] },
  { id: 'ocean',  labelKey: 'gradientOcean',  css: 'linear-gradient(135deg, #10B981, #06B6D4, #3B82F6)', stops: ['#10B981', '#06B6D4', '#3B82F6'] },
  { id: 'sunset', labelKey: 'gradientSunset', css: 'linear-gradient(135deg, #F97316, #EC4899, #7C3AED)', stops: ['#F97316', '#EC4899', '#7C3AED'] },
];

// Tiny 2×2 grid icon whose shape reflects the current QR dot style
const StyleDotIcon = ({ style }) => {
  const pos = [[2,2],[11,2],[2,11],[11,11]];
  const s = 7;
  if (style === 'dots') return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
      {pos.map(([x,y],i) => <circle key={i} cx={x+s/2} cy={y+s/2} r={s/2} />)}
    </svg>
  );
  const rx = style === 'extra-rounded' || style === 'classy-rounded' ? 3
    : style === 'rounded' ? 2 : 0;
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
      {pos.map(([x,y],i) => <rect key={i} x={x} y={y} width={s} height={s} rx={rx} />)}
    </svg>
  );
};

const QRImage = ({ src, rawData, qrRounded, qrGradient, isNegative, logoData, qrStyle }) => {
  const containerRef = useRef(null);
  const isSquare = !qrStyle || qrStyle === 'square';
  const clipStyle = qrRounded ? { clipPath: 'inset(0 round 1rem)', overflow: 'hidden' } : undefined;

  useEffect(() => {
    if (isSquare || !containerRef.current || !rawData) return;
    containerRef.current.innerHTML = '';
    const qrCode = new QRCodeStyling({
      width: 192, height: 192, type: 'canvas',
      data: rawData,
      dotsOptions: { type: qrStyle, color: isNegative ? '#ffffff' : '#000000' },
      backgroundOptions: { color: isNegative ? '#000000' : '#ffffff' },
      qrOptions: { errorCorrectionLevel: 'H' },
    });
    qrCode.append(containerRef.current);
  }, [rawData, qrStyle, isNegative, isSquare]);

  return (
    <div className={`relative mx-auto w-48 h-48${qrRounded ? ' bg-gray-100 dark:bg-gray-800' : ''}`}>
      {isSquare
        ? <img src={src} alt="QR Code" className="w-full h-full" style={clipStyle} />
        : <div ref={containerRef} className="w-full h-full" style={clipStyle} />
      }
      {qrGradient && (
        <div
          className="absolute inset-0"
          style={{
            background: GRADIENT_PRESETS.find(p => p.id === qrGradient)?.css,
            mixBlendMode: isNegative ? 'darken' : 'lighten',
            pointerEvents: 'none',
            ...(qrRounded ? { clipPath: 'inset(0 round 1rem)' } : {}),
          }}
        />
      )}
      {logoData && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 10 }}>
          <img src={logoData} alt="Logo" className="object-contain w-12 h-12" />
        </div>
      )}
    </div>
  );
};

const TAB_ICONS = {
  vcard: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  text: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  url: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  scan: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
};

const App = () => {
  // State management
  const [activeTab, setActiveTab] = useState('vcard');
  const [isDark, setIsDark] = useState(() => {
    const storedIsDark = localStorage.getItem('isDark');
    return storedIsDark ? JSON.parse(storedIsDark) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });
  const [logoData, setLogoData] = useState(null);
  const [isNegative, setIsNegative] = useState(false);
  const [qrGradient, setQrGradient] = useState(null);
  const [qrRounded, setQrRounded] = useState(false);
  const [qrStyle, setQrStyle] = useState('square');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);
  const navigate = useNavigate();
  const [privacyAccepted, setPrivacyAccepted] = useState(() => localStorage.getItem('getqr-privacy-accepted') === '1');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setTaglineVisible(false);
      setTimeout(() => {
        setTaglineIdx(i => (i + 1) % TAGLINE_KEYS.length);
        setTaglineVisible(true);
      }, 350);
    }, 7000);
    return () => clearInterval(iv);
  }, []);

  // vCard data structure
  const [vCardData, setVCardData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    company: '',
    phone: '',
    email: '',
    note: '',
  });
  const [textData, setTextData] = useState('');
  const [urlData, setUrlData] = useState('');
  const [qrResolution, setQrResolution] = useState('200');
  const [currentYear] = useState(new Date().getFullYear());

  // Session ID — one UUID per browser session, isolates data between users on the same device
  const [sessionId] = useState(() => {
    const key = 'getqr-session-id';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  });

  // Per-tab form persistence
  const [pendingRestore, setPendingRestore] = useState(null);
  const vCardSaveTimer = useRef(null);
  const textSaveTimer = useRef(null);
  const urlSaveTimer = useRef(null);
  const justRestoredRef = useRef(new Set());
  const discardedTabsRef = useRef(new Set());
  const persistence = useFormPersistence(sessionId);

  // Remember Continue/Discard decisions for the lifetime of this session
  const isDecided = (tab) =>
    sessionStorage.getItem(`getqr:decided:${sessionId}:${tab}`) === '1';
  const markDecided = (tab) =>
    sessionStorage.setItem(`getqr:decided:${sessionId}:${tab}`, '1');
  const clearDecided = (tab) =>
    sessionStorage.removeItem(`getqr:decided:${sessionId}:${tab}`);

  // Dark mode and language preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('isDark', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.backgroundColor = isDark ? '#111827' : '#f3f4f6';
  }, [isDark]);

  // Check for saved vCard data on initial mount (skip if already decided this session)
  useEffect(() => {
    if (isDecided('vcard')) return;
    persistence.load('vcard').then((saved) => {
      if (saved) setPendingRestore({ tab: 'vcard', data: saved });
    });
  }, []);

  // Auto-save vCard data to IndexedDB (debounced 500ms, independent timer)
  useEffect(() => {
    const hasData = Object.values(vCardData).some(v => v.trim() !== '');
    if (!hasData) return;
    if (justRestoredRef.current.has('vcard')) {
      justRestoredRef.current.delete('vcard');
      return;
    }
    if (discardedTabsRef.current.has('vcard')) {
      discardedTabsRef.current.delete('vcard');
      clearDecided('vcard');
    }
    clearTimeout(vCardSaveTimer.current);
    vCardSaveTimer.current = setTimeout(() => {
      persistence.save('vcard', { form: vCardData, logo: logoData });
    }, 500);
    return () => clearTimeout(vCardSaveTimer.current);
  }, [vCardData, logoData]);

  // Auto-save text data to IndexedDB (debounced 500ms, independent timer)
  useEffect(() => {
    if (!textData.trim()) return;
    if (justRestoredRef.current.has('text')) {
      justRestoredRef.current.delete('text');
      return;
    }
    if (discardedTabsRef.current.has('text')) {
      discardedTabsRef.current.delete('text');
      clearDecided('text');
    }
    clearTimeout(textSaveTimer.current);
    textSaveTimer.current = setTimeout(() => {
      persistence.save('text', { form: textData, logo: logoData });
    }, 500);
    return () => clearTimeout(textSaveTimer.current);
  }, [textData, logoData]);

  // Auto-save URL data to IndexedDB (debounced 500ms, independent timer)
  useEffect(() => {
    if (!urlData.trim()) return;
    if (justRestoredRef.current.has('url')) {
      justRestoredRef.current.delete('url');
      return;
    }
    if (discardedTabsRef.current.has('url')) {
      discardedTabsRef.current.delete('url');
      clearDecided('url');
    }
    clearTimeout(urlSaveTimer.current);
    urlSaveTimer.current = setTimeout(() => {
      persistence.save('url', { form: urlData, logo: logoData });
    }, 500);
    return () => clearTimeout(urlSaveTimer.current);
  }, [urlData, logoData]);

  // Tab switching with IndexedDB restore check (skip if already decided this session)
  const handleTabChange = async (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPendingRestore(null);
    if (tab !== 'scan' && !isDecided(tab)) {
      const saved = await persistence.load(tab);
      if (saved) setPendingRestore({ tab, data: saved });
    }
  };

  // Continue restoring saved form data
  const handleContinue = () => {
    if (!pendingRestore) return;
    const { tab, data } = pendingRestore;
    const form = data?.form ?? data;
    const logo = data?.logo ?? null;
    if (tab === 'vcard') setVCardData(form);
    else if (tab === 'text') setTextData(form);
    else if (tab === 'url') setUrlData(form);
    if (logo !== null) setLogoData(logo);
    justRestoredRef.current.add(tab);
    markDecided(tab);
    setPendingRestore(null);
  };

  // Discard saved form data and sweep fields + logo clean
  const handleDiscard = () => {
    if (!pendingRestore) return;
    const { tab, data } = pendingRestore;
    if (tab === 'vcard') setVCardData({ firstName: '', lastName: '', position: '', company: '', phone: '', email: '', note: '' });
    else if (tab === 'text') setTextData('');
    else if (tab === 'url') setUrlData('');
    if (data?.logo) setLogoData(null);
    persistence.clear(tab);
    discardedTabsRef.current.add(tab);
    markDecided(tab);
    setPendingRestore(null);
  };

  // vCard generation
  const generateVCard = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
N:${vCardData.lastName};${vCardData.firstName};;;
FN:${vCardData.firstName} ${vCardData.lastName}
${vCardData.position ? `TITLE:${vCardData.position}\n` : ''}${vCardData.company ? `ORG:${vCardData.company}\n` : ''}${vCardData.phone ? `TEL;TYPE=CELL:${vCardData.phone}\n` : ''}${vCardData.email ? `EMAIL:${vCardData.email}\n` : ''}${vCardData.note ? `NOTE:${vCardData.note}\n` : ''}END:VCARD`;
    return encodeURIComponent(vCard);
  };

  // QR code generation utilities
  const getQRCodeUrl = (data, type = 'text') => {
    const finalData = type === 'vcard' ? generateVCard() : encodeURIComponent(data);
    const color = isNegative ? 'ffffff' : '000000';
    const bgColor = isNegative ? '000000' : 'ffffff';
    const isSvg = qrResolution === 'svg';
    const size = isSvg ? '500' : qrResolution;
    const format = isSvg ? '&format=svg' : '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${finalData}&color=${color}&bgcolor=${bgColor}${format}`;
  };

  const downloadQR = async (data, type, filename) => {
    if (qrResolution === 'svg') {
      try {
        let svgText;
        if (qrStyle !== 'square') {
          const rawData = type === 'vcard' ? decodeURIComponent(data) : data;
          const qrCode = new QRCodeStyling({
            width: 500, height: 500, type: 'svg',
            data: rawData,
            dotsOptions: { type: qrStyle, color: isNegative ? '#ffffff' : '#000000' },
            backgroundOptions: { color: isNegative ? '#000000' : '#ffffff' },
            qrOptions: { errorCorrectionLevel: 'H' },
          });
          const blob = await qrCode.getRawData('svg');
          svgText = await blob.text();
        } else {
          const svgUrl = getQRCodeUrl(data, type);
          const res = await fetch(svgUrl);
          if (!res.ok) throw new Error('Network error');
          svgText = await res.text();
        }
        const wMatch = svgText.match(/width="(\d+)"/);
        const hMatch = svgText.match(/height="(\d+)"/);
        const svgW = wMatch ? parseInt(wMatch[1]) : 500;
        const svgH = hMatch ? parseInt(hMatch[1]) : 500;
        let inject = '';
        if (qrGradient) {
          const preset = GRADIENT_PRESETS.find(p => p.id === qrGradient);
          if (preset) {
            const blendMode = isNegative ? 'darken' : 'lighten';
            const stops = preset.stops.map((c, i) =>
              `<stop offset="${Math.round(i / (preset.stops.length - 1) * 100)}%" stop-color="${c}"/>`
            ).join('');
            inject += `<defs><linearGradient id="qrgrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">${stops}</linearGradient></defs>`;
            inject += `<rect width="${svgW}" height="${svgH}" fill="url(#qrgrad)" style="mix-blend-mode:${blendMode}"/>`;
          }
        }
        if (logoData) {
          const logoSize = Math.min(svgW, svgH) * 0.2;
          const lx = (svgW - logoSize) / 2;
          const ly = (svgH - logoSize) / 2;
          const bgFill = isNegative ? '#000000' : '#ffffff';
          inject += `<rect x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" fill="${bgFill}"/>`;
          inject += `<image x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" href="${logoData}" preserveAspectRatio="xMidYMid meet"/>`;
        }
        if (qrRounded) {
          const rx = Math.round(Math.min(svgW, svgH) * 0.1);
          svgText = svgText.replace(
            /(<svg\b[^>]*>)([\s\S]*)(<\/svg>)/,
            `$1<defs><clipPath id="qrround"><rect width="${svgW}" height="${svgH}" rx="${rx}" ry="${rx}"/></clipPath></defs><g clip-path="url(#qrround)">$2${inject}</g>$3`
          );
        } else if (inject) {
          svgText = svgText.replace('</svg>', inject + '</svg>');
        }
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = `${filename}.svg`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(objUrl); }, 1000);
      } catch {
        alert(translations[selectedLanguage]['downloadError']);
      }
      return;
    }
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 300;
    let attempt = 0;

    const errorHandler = (error) => {
      console.error(`Attempt ${attempt} failed:`, error);
      alert(translations[selectedLanguage]['downloadError']);
    };

    const tryDownload = async () => {
      try {
        attempt++;
        // Strategy 1: Direct base64 download for Telegram
        if (window.Telegram?.WebApp?.downloadFile) {
          const qrUrl = getQRCodeUrl(data, type);
          const response = await fetch(qrUrl);
          if (!response.ok) throw new Error('Network response error');

          // Convert directly to base64
          const buffer = await response.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);
          window.Telegram.WebApp.downloadFile(base64, `${filename}.png`);
          return;
        }

        // Strategy 2: Canvas-based download with forced user gesture
        const canvas = await generateQRCanvas(data, type);
        if (!canvas) throw new Error('Canvas generation failed');

        // Strategy 3: Mixed blob/base64 approach
        const blob = await new Promise(resolve =>
          canvas.toBlob(resolve, 'image/png', 1)
        );

        // Strategy 4: Multiple download methods
        const finalAttempt = async () => {
          try {
            // Method 4a: Direct file API
            if (window.Telegram?.WebApp?.openLink) {
              const dataUrl = canvas.toDataURL();
              window.Telegram.WebApp.openLink(dataUrl);
              return;
            }

            // Method 4b: Simulated click with blob
            const url = URL.createObjectURL(blob);
            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.download = `${filename}.png`;
            tempLink.style.display = 'none';

            // iOS requires actual user interaction
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });

            document.body.appendChild(tempLink);
            tempLink.dispatchEvent(clickEvent);

            // Cleanup with retry safeguard
            setTimeout(() => {
              document.body.removeChild(tempLink);
              URL.revokeObjectURL(url);
            }, 1000);

          } catch (error) {
            // Final fallback: Open in new tab
            const dataUrl = canvas.toDataURL();
            window.open(dataUrl, '_blank');
          }
        };

        // Execute final attempt sequence
        await finalAttempt();

      } catch (error) {
        if (attempt < MAX_RETRIES) {
          setTimeout(tryDownload, RETRY_DELAY);
        } else {
          errorHandler(error);
        }
      }
    };

    // Initial execution
    try {
      await tryDownload();
    } catch (finalError) {
      errorHandler(finalError);
    }
  };

  // Canvas generation with validation
  const generateQRCanvas = async (data, type) => {
    try {
      // Helper: load a blob URL into an HTMLImageElement
      const blobToImg = (blob) => new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const timer = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error('Image load timeout')); }, 5000);
        const img = new Image();
        img.onload = () => { clearTimeout(timer); URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
      });

      let img;
      if (qrStyle !== 'square') {
        const rawData = type === 'vcard' ? decodeURIComponent(data) : data;
        const size = qrResolution === 'svg' ? 500 : parseInt(qrResolution);
        const qrCode = new QRCodeStyling({
          width: size, height: size, type: 'canvas',
          data: rawData,
          dotsOptions: { type: qrStyle, color: isNegative ? '#ffffff' : '#000000' },
          backgroundOptions: { color: isNegative ? '#000000' : '#ffffff' },
          qrOptions: { errorCorrectionLevel: 'H' },
        });
        const blob = await qrCode.getRawData('png');
        img = await blobToImg(blob);
      } else {
        const qrUrl = getQRCodeUrl(data, type);
        const response = await fetch(qrUrl);
        if (!response.ok) throw new Error('Invalid QR code response');
        img = await blobToImg(await response.blob());
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      if (qrRounded) {
        const r = canvas.width * 0.1;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
        ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
        ctx.arcTo(0, canvas.height, 0, 0, r);
        ctx.arcTo(0, 0, canvas.width, 0, r);
        ctx.closePath();
        ctx.clip();
      }
      ctx.drawImage(img, 0, 0);

      // Apply gradient colorization via pixel processing (before logo so logo renders clean on top)
      if (qrGradient) {
        const preset = GRADIENT_PRESETS.find(p => p.id === qrGradient);
        if (preset) {
          const gradCanvas = document.createElement('canvas');
          gradCanvas.width = canvas.width;
          gradCanvas.height = canvas.height;
          const gCtx = gradCanvas.getContext('2d');
          const grad = gCtx.createLinearGradient(0, 0, gradCanvas.width, gradCanvas.height);
          preset.stops.forEach((c, i) => grad.addColorStop(i / (preset.stops.length - 1), c));
          gCtx.fillStyle = grad;
          gCtx.fillRect(0, 0, gradCanvas.width, gradCanvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const gData = gCtx.getImageData(0, 0, canvas.width, canvas.height).data;
          const px = imgData.data;
          for (let i = 0; i < px.length; i += 4) {
            const brightness = (px[i] + px[i + 1] + px[i + 2]) / 3;
            if (isNegative ? brightness > 127 : brightness < 128) {
              px[i] = gData[i]; px[i + 1] = gData[i + 1]; px[i + 2] = gData[i + 2];
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }

      // Add logo on top (drawn after gradient so it is not recolored)
      if (logoData) {
        const logoImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = logoData;
        });

        const logoSize = Math.min(canvas.width * 0.2, canvas.height * 0.2);
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;

        ctx.fillStyle = isNegative ? '#000000' : '#ffffff';
        ctx.fillRect(x, y, logoSize, logoSize);
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      }

      // Validate canvas content (check center, not corner — corner may be transparent when rounded)
      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      const imageData = ctx.getImageData(cx, cy, 1, 1).data;
      if (imageData.every(channel => channel === 0)) {
        throw new Error('Blank canvas generated');
      }

      return canvas;

    } catch (error) {
      console.error('Canvas generation failed:', error);
      return null;
    }
  };

  const shareQR = async (data, type) => {
    try {
      const canvas = await generateQRCanvas(data, type);
      if (!canvas) return;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1));
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'GetQR', files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: 'GetQR', url: getQRCodeUrl(data, type) });
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    }
  };

  const copyQR = async (data, type) => {
    try {
      const canvas = await generateQRCanvas(data, type);
      if (!canvas) return;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Shared logo drop zone component (used in all tabs)
  const LogoDropZone = () => (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {translations[selectedLanguage]['uploadLogo']}
      </label>
      <div
        className="relative p-6 rounded-lg border-2 border-gray-300 border-dashed transition-colors dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 group"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-blue-500');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-blue-500');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-blue-500');
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoData(reader.result);
            reader.readAsDataURL(file);
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setLogoData(reader.result);
              reader.readAsDataURL(file);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col justify-center items-center space-y-2">
          <svg
            className="w-8 h-8 text-gray-400 transition-colors dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-500 cursor-pointer dark:text-blue-400">
                {translations[selectedLanguage]['clickToUpload']}
              </span>{' '}
              {translations[selectedLanguage]['dragDrop']}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {translations[selectedLanguage]['supportedFormats']}
            </p>
          </div>
        </div>
      </div>
      {logoData && (
        <div className="flex justify-between items-center px-4 py-2 mt-3 bg-gray-50 rounded-lg dark:bg-gray-800">
          <span className="text-sm text-gray-700 truncate dark:text-gray-300">
            {translations[selectedLanguage]['uploadedLogo']}
          </span>
          <button
            onClick={() => setLogoData(null)}
            className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg
              className="mr-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {translations[selectedLanguage]['removeLogo']}
          </button>
        </div>
      )}
    </div>
  );

  const QRActions = ({ data, type, filename }) => (
    <div className="flex gap-3">
      <button
        onClick={() => copyQR(data, type)}
        className="flex flex-1 justify-center items-center px-4 py-3 font-medium text-gray-700 bg-white rounded-lg border border-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        {copied ? translations[selectedLanguage]['copied'] : translations[selectedLanguage]['copyQR']}
      </button>
      {navigator.share && (
        <button
          onClick={() => shareQR(data, type)}
          className="flex flex-1 justify-center items-center px-4 py-3 font-medium text-violet-700 bg-violet-50 rounded-lg border border-violet-200 transition-colors dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-800/40"
        >
          {translations[selectedLanguage]['shareQR']}
        </button>
      )}
      <button
        onClick={() => downloadQR(data, type, filename)}
        className="flex-1 px-4 py-3 font-medium text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {translations[selectedLanguage]['saveToPhotos']}
      </button>
    </div>
  );

  // Cycle through QR dot styles: square → dots → rounded → extra-rounded → classy → classy-rounded → square
  const cycleStyle = () => {
    const ids = QR_STYLES.map(s => s.id);
    const next = ids[(ids.indexOf(qrStyle) + 1) % ids.length];
    setQrStyle(next);
  };

  // Shared resolution + invert selector
  const ResolutionSelector = () => (
    <div className="mb-4 space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['selectResolution']}</label>
      <div className="flex gap-2 items-center">
        <select
          value={qrResolution}
          onChange={(e) => setQrResolution(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <optgroup label="PNG">
            <option value="200">200px</option>
            <option value="500">500px</option>
            <option value="1000">1000px</option>
          </optgroup>
          <optgroup label="Vector">
            <option value="svg">SVG</option>
          </optgroup>
        </select>
        {((activeTab === 'vcard' && vCardData.firstName && vCardData.lastName) ||
          (activeTab === 'text' && textData) ||
          (activeTab === 'url' && urlData)) && (
          <div className="flex items-center ml-2">
            <div className="relative">
              <img
                src={getQRCodeUrl(
                  activeTab === 'vcard' ? vCardData : activeTab === 'text' ? textData : urlData,
                  activeTab
                )}
                alt="QR preview"
                className="w-10 h-10 rounded"
              />
              <span
                className="flex absolute inset-0 justify-center items-center text-3xl cursor-pointer"
                onClick={() => setIsNegative(prev => !prev)}
                title={translations[selectedLanguage]['invertColor']}
              >
                {isNegative ? '⚫' : '⚪'}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        {/* Color group */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setQrGradient(null)}
            className={`w-7 h-7 rounded border-2 transition-all bg-white dark:bg-gray-800 ${!qrGradient ? 'border-blue-500 shadow-sm scale-110' : 'border-gray-300 dark:border-gray-600'}`}
            title={translations[selectedLanguage]['noGradient']}
          />
          {GRADIENT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => setQrGradient(qrGradient === preset.id ? null : preset.id)}
              className={`w-7 h-7 rounded border-2 transition-all ${qrGradient === preset.id ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-300 dark:border-gray-600'}`}
              style={{ background: preset.css }}
              title={translations[selectedLanguage][preset.labelKey]}
            />
          ))}
        </div>

        {/* Style & border group */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setQrRounded(prev => !prev)}
            className={`w-7 h-7 flex items-center justify-center rounded border-2 transition-all ${qrRounded ? 'bg-blue-50 border-blue-500 shadow-sm scale-110 dark:bg-blue-900/30' : 'bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-800'}`}
            title={translations[selectedLanguage]['roundedCorners']}
          >
            <div className={`w-3 h-3 border-2 transition-all ${qrRounded ? 'rounded border-blue-500' : 'border-gray-400 dark:border-gray-500'}`} />
          </button>
          <button
            onClick={cycleStyle}
            className={`w-7 h-7 flex items-center justify-center rounded border-2 transition-all ${qrStyle !== 'square' ? 'bg-blue-50 border-blue-500 shadow-sm scale-110 dark:bg-blue-900/30' : 'bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-800'}`}
            title={`${translations[selectedLanguage]['qrStyleLabel']}: ${translations[selectedLanguage][QR_STYLES.find(s => s.id === qrStyle)?.labelKey]}`}
          >
            <span className={qrStyle !== 'square' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}>
              <StyleDotIcon style={qrStyle} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  // UI handlers
  const toggleDarkMode = () => setIsDark(prev => !prev);
  const handleLanguageChange = (event) => setSelectedLanguage(event.target.value);

  return (
    <motion.div
      className={`min-h-screen flex flex-col md:justify-center safe-page ${isDark ? 'bg-gray-900 dark' : 'bg-gray-100 transition-colors duration-300'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="safe-container py-8 mx-auto w-full max-w-2xl">
        {/* Header: logo + title + lang + dark mode */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img className="mr-2 w-10 h-10" src="/getqr-logo.svg" alt="GetQR Logo" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold title-gradient leading-tight">GetQR</h1>
              <span
                className="text-xs text-gray-400 dark:text-gray-500 transition-opacity duration-300 leading-tight"
                style={{ opacity: taglineVisible ? 1 : 0 }}
              >
                {(translations[selectedLanguage] ?? translations.en)[TAGLINE_KEYS[taglineIdx]]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="it">Italiano</option>
              <option value="zh">中文</option>
            </select>
            <button
              onClick={toggleDarkMode}
              className="flex justify-center items-center p-2 w-10 h-10 text-white rounded-full transition-colors duration-300 bg-neutral-400 hover:bg-neutral-500 dark:bg-gray-700"
            >
              {isDark ? '🌞' : '🌜'}
            </button>
          </div>
        </div>

        {/* Tab bar — full width, equal-sized tabs */}
        <div className="flex w-full p-1 mb-4 bg-gray-200 rounded-xl dark:bg-gray-800">
          {['vcard', 'text', 'url', 'scan'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex flex-1 items-center justify-center gap-1 px-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors
        ${activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {TAB_ICONS[tab]}
              <span className="truncate">{translations[selectedLanguage][tab]}</span>
            </button>
          ))}
        </div>

        {/* Per-tab Continue / Discard banner */}
        {pendingRestore && pendingRestore.tab === activeTab && (
          <div className="flex justify-between items-center px-4 py-3 mb-4 bg-violet-50 rounded-xl border border-violet-200 dark:bg-violet-900/30 dark:border-violet-700">
            <p className="text-sm text-violet-800 dark:text-violet-200">
              {translations[selectedLanguage]['continuePrompt']}
            </p>
            <div className="flex gap-2 ml-4 shrink-0">
              <button
                onClick={handleContinue}
                className="px-3 py-1 text-xs font-semibold text-white bg-violet-600 rounded-lg transition-colors hover:bg-violet-700"
              >
                {translations[selectedLanguage]['continueBtn']}
              </button>
              <button
                onClick={handleDiscard}
                className="px-3 py-1 text-xs font-semibold text-violet-600 rounded-lg border border-violet-300 transition-colors dark:text-violet-300 dark:border-violet-600 hover:bg-violet-100 dark:hover:bg-violet-800/40"
              >
                {translations[selectedLanguage]['discardBtn']}
              </button>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="p-6 bg-white rounded-2xl shadow-xs dark:bg-gray-800">
          {activeTab === 'vcard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Personal information fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['firstName']}</label>
                  <input
                    type="text"
                    value={vCardData.firstName}
                    onChange={(e) => setVCardData({ ...vCardData, firstName: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderFirstName']}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['lastName']}</label>
                  <input
                    type="text"
                    value={vCardData.lastName}
                    onChange={(e) => setVCardData({ ...vCardData, lastName: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderLastName']}
                  />
                </div>

                {/* Professional information */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['position']}</label>
                  <input
                    type="text"
                    value={vCardData.position}
                    onChange={(e) => setVCardData({ ...vCardData, position: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderPosition']}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['company']}</label>
                  <input
                    type="text"
                    value={vCardData.company}
                    onChange={(e) => setVCardData({ ...vCardData, company: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderCompany']}
                  />
                </div>

                {/* Contact information */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['phone']}</label>
                  <input
                    type="tel"
                    value={vCardData.phone}
                    onChange={(e) => setVCardData({ ...vCardData, phone: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderPhone']}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['email']}</label>
                  <input
                    type="email"
                    value={vCardData.email}
                    onChange={(e) => setVCardData({ ...vCardData, email: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderEmail']}
                  />
                </div>

                {/* Note field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['note']}</label>
                  <input
                    type="text"
                    value={vCardData.note}
                    onChange={(e) => setVCardData({ ...vCardData, note: e.target.value })}
                    className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations[selectedLanguage]['placeholderNote']}
                  />
                </div>

              </div>

              {/* QR Preview and Download */}
              {vCardData.firstName && vCardData.lastName && (
                <div className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700">
                        <QRImage src={getQRCodeUrl(vCardData, 'vcard')} rawData={decodeURIComponent(generateVCard())} qrRounded={qrRounded} qrGradient={qrGradient} isNegative={isNegative} logoData={logoData} qrStyle={qrStyle} />
                      </div>
                      <ResolutionSelector />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <LogoDropZone />
                    </div>
                  </div>

                  <QRActions data={vCardData} type="vcard" filename="contact" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['textContent']}</label>
                <input
                  type="text"
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={translations[selectedLanguage]['placeholderTextContent']}
                />
              </div>

              {textData && (
                <div className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700">
                        <QRImage src={getQRCodeUrl(textData)} rawData={textData} qrRounded={qrRounded} qrGradient={qrGradient} isNegative={isNegative} logoData={logoData} qrStyle={qrStyle} />
                      </div>
                      <ResolutionSelector />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <LogoDropZone />
                    </div>
                  </div>

                  <QRActions data={textData} type="text" filename="text-qr" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'scan' && (
            <QRScanner language={selectedLanguage} />
          )}

          {activeTab === 'url' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations[selectedLanguage]['url']}</label>
                <input
                  type="url"
                  value={urlData}
                  onChange={(e) => setUrlData(e.target.value)}
                  className="px-4 py-3 w-full text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={translations[selectedLanguage]['placeholderUrl']}
                />
              </div>

              {urlData && (
                <div className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-xs dark:border-gray-600 dark:bg-gray-700">
                        <QRImage src={getQRCodeUrl(urlData)} rawData={urlData} qrRounded={qrRounded} qrGradient={qrGradient} isNegative={isNegative} logoData={logoData} qrStyle={qrStyle} />
                      </div>
                      <ResolutionSelector />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <LogoDropZone />
                    </div>
                  </div>

                  <QRActions data={urlData} type="url" filename="url-qr" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer section */}
        <footer className="mt-10 mr-4 text-sm text-center text-gray-600">
          &copy; {currentYear} ·
          <a
            className="font-bold text-transparent bg-clip-text from-blue-400 via-blue-300 to-cyan-500 bg-linear-to-b hover:text-blue-600 hover:underline"
            href="https://github.com/Serverket/getqr"
            target="_blank"
            rel="noopener noreferrer"
          >
            💖 {translations[selectedLanguage]?.contribute ?? 'Contribute'}
          </a>
          ·
          <a
            className="font-bold text-transparent bg-clip-text from-blue-400 via-blue-300 to-cyan-500 bg-linear-to-b hover:text-blue-600 hover:underline"
            href="https://github.com/Serverket/getqr/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translations[selectedLanguage]?.license ?? 'MIT License'}
          </a>
        </footer>
      </div>

      {/* Privacy banner */}
      {!privacyAccepted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-5 py-2.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-t border-gray-200/80 dark:border-white/10">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {translations[selectedLanguage]?.privacyBannerText ?? 'We do not track you.'}{' '}
            <button
              onClick={() => navigate('/privacy')}
              className="underline text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
            >
              {translations[selectedLanguage]?.privacyLearnMore ?? 'Learn more.'}
            </button>
          </p>
          <button
            onClick={() => { localStorage.setItem('getqr-privacy-accepted', '1'); setPrivacyAccepted(true); }}
            className="shrink-0 px-3 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {translations[selectedLanguage]?.privacyAccept ?? 'Accept'}
          </button>
        </div>
      )}

    </motion.div>
  );
};

export default App;
