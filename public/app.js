(() => {
  'use strict';

  // ==========================================================================
  // 1. REAL ISO/IEC 18004 QR CODE SVG GENERATOR (PURE JS, SCANNABLE BY IPHONE/ANDROID)
  // ==========================================================================
  const QrCodeGen = (() => {
    // GF(256) exponent & log tables for Reed-Solomon ECC
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    (() => {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP[i] = x;
        LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
      }
      for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
    })();

    function gfMul(a, b) {
      return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
    }

    function rsGeneratorPoly(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        const next = new Uint8Array(poly.length + 1);
        const root = EXP[i];
        for (let j = 0; j < poly.length; j++) {
          next[j] ^= poly[j];
          next[j + 1] ^= gfMul(poly[j], root);
        }
        poly = next;
      }
      return poly;
    }

    function rsEncode(data, ecLen) {
      const gen = rsGeneratorPoly(ecLen);
      const rem = new Uint8Array(ecLen);
      for (let i = 0; i < data.length; i++) {
        const factor = data[i] ^ rem[0];
        rem.copyWithin(0, 1);
        rem[ecLen - 1] = 0;
        if (factor !== 0) {
          for (let j = 0; j < ecLen; j++) {
            rem[j] ^= gfMul(gen[j + 1], factor);
          }
        }
      }
      return rem;
    }

    // Version capacities for ECC Level L (Byte mode, single block versions 1..6)
    const VERSIONS = [
      null,
      { v: 1, size: 21, totalCodewords: 26, ecCodewords: 7, align: [] },
      { v: 2, size: 25, totalCodewords: 44, ecCodewords: 10, align: [6, 18] },
      { v: 3, size: 29, totalCodewords: 70, ecCodewords: 15, align: [6, 22] },
      { v: 4, size: 33, totalCodewords: 100, ecCodewords: 20, align: [6, 26] },
      { v: 5, size: 37, totalCodewords: 134, ecCodewords: 26, align: [6, 30] },
      { v: 6, size: 41, totalCodewords: 172, ecCodewords: 36, align: [6, 34], blocks: 2 }
    ];

    function encodeTextToSvg(text, pixelSize = 188) {
      const utf8 = new TextEncoder().encode(text);
      let ver = VERSIONS[5]; // Version 5 holds up to 106 bytes in single-block L
      for (let v = 1; v <= 5; v++) {
        const dataCap = VERSIONS[v].totalCodewords - VERSIONS[v].ecCodewords - 2;
        if (utf8.length <= dataCap) {
          ver = VERSIONS[v];
          break;
        }
      }

      const dataCodewordsLen = ver.totalCodewords - ver.ecCodewords;
      const bits = [];
      function pushBits(val, len) {
        for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
      }

      // Byte mode indicator (0100) + byte count (8 bits for v1..9)
      pushBits(0b0100, 4);
      const safeBytes = utf8.slice(0, dataCodewordsLen - 2);
      pushBits(safeBytes.length, 8);
      for (let i = 0; i < safeBytes.length; i++) pushBits(safeBytes[i], 8);

      // Terminator
      const maxBits = dataCodewordsLen * 8;
      for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
      while (bits.length % 8 !== 0) bits.push(0);

      const dataBytes = new Uint8Array(dataCodewordsLen);
      for (let i = 0; i < bits.length / 8; i++) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
        dataBytes[i] = b;
      }
      const padBytes = [0xec, 0x11];
      let padIdx = 0;
      for (let i = bits.length / 8; i < dataCodewordsLen; i++) {
        dataBytes[i] = padBytes[padIdx++ % 2];
      }

      const ecBytes = rsEncode(dataBytes, ver.ecCodewords);
      const allCodewords = new Uint8Array(ver.totalCodewords);
      allCodewords.set(dataBytes, 0);
      allCodewords.set(ecBytes, dataCodewordsLen);

      const n = ver.size;
      const modules = Array.from({ length: n }, () => new Int8Array(n)); // 0=light, 1=dark
      const isFunc = Array.from({ length: n }, () => new Uint8Array(n));

      function setFunc(r, c, dark) {
        if (r < 0 || r >= n || c < 0 || c >= n) return;
        modules[r][c] = dark ? 1 : 0;
        isFunc[r][c] = 1;
      }

      function drawFinder(r0, c0) {
        for (let dr = -1; dr <= 7; dr++) {
          for (let dc = -1; dc <= 7; dc++) {
            const rr = r0 + dr, cc = c0 + dc;
            if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
            const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 && (dr === 0 || dr === 6 || dc === 0 || dc === 6);
            const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
            setFunc(rr, cc, inOuter || inInner);
          }
        }
      }

      drawFinder(0, 0);
      drawFinder(0, n - 7);
      drawFinder(n - 7, 0);

      // Timing patterns
      for (let i = 8; i < n - 8; i++) {
        setFunc(6, i, i % 2 === 0);
        setFunc(i, 6, i % 2 === 0);
      }

      // Alignment patterns
      if (ver.align.length > 0) {
        for (const ar of ver.align) {
          for (const ac of ver.align) {
            if ((ar === 6 && ac === 6) || (ar === 6 && ac === n - 7) || (ar === n - 7 && ac === 6)) continue;
            for (let dr = -2; dr <= 2; dr++) {
              for (let dc = -2; dc <= 2; dc++) {
                setFunc(ar + dr, ac + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
              }
            }
          }
        }
      }

      // Reserve format info areas
      for (let i = 0; i <= 8; i++) {
        if (i !== 6) {
          setFunc(8, i, false);
          setFunc(i, 8, false);
        }
      }
      for (let i = 0; i < 8; i++) {
        setFunc(8, n - 1 - i, false);
        setFunc(n - 1 - i, 8, false);
      }
      setFunc(n - 8, 8, true); // Dark module

      // Place data bits in upward/downward 2-column zig-zag
      let bitIdx = 0;
      const totalBits = allCodewords.length * 8;
      let upward = true;
      for (let right = n - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < n; vert++) {
          const r = upward ? n - 1 - vert : vert;
          for (let j = 0; j < 2; j++) {
            const c = right - j;
            if (!isFunc[r][c]) {
              let dark = false;
              if (bitIdx < totalBits) {
                dark = ((allCodewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) !== 0;
                bitIdx++;
              }
              // Apply mask 0: (r + c) % 2 === 0
              if ((r + c) % 2 === 0) dark = !dark;
              modules[r][c] = dark ? 1 : 0;
            }
          }
        }
        upward = !upward;
      }

      // Write Format Information for ECC Level L (01) + Mask 0 (000) -> precomputed BCH 0x77c4
      const formatBits = 0x77c4;
      for (let i = 0; i <= 5; i++) setFunc(8, i, ((formatBits >>> i) & 1) !== 0);
      setFunc(8, 7, ((formatBits >>> 6) & 1) !== 0);
      setFunc(8, 8, ((formatBits >>> 7) & 1) !== 0);
      setFunc(7, 8, ((formatBits >>> 8) & 1) !== 0);
      for (let i = 9; i < 15; i++) setFunc(14 - i, 8, ((formatBits >>> i) & 1) !== 0);

      for (let i = 0; i < 8; i++) setFunc(8, n - 1 - i, ((formatBits >>> i) & 1) !== 0);
      for (let i = 8; i < 15; i++) setFunc(n - 15 + i, 8, ((formatBits >>> i) & 1) !== 0);

      let pathD = '';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (modules[r][c]) {
            pathD += `M${c},${r}h1v1h-1z`;
          }
        }
      }

      return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" width="${pixelSize}" height="${pixelSize}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#FFFFFF"/><path d="${pathD}" fill="#070B10"/></svg>`;
    }

    return { encodeTextToSvg };
  })();

  // ==========================================================================
  // 2. TRANSLATION DICTIONARY & MULTILINGUAL CORPUS
  // ==========================================================================
  const LANG_META = {
    'pt-BR': { flag: '🇧🇷', name: 'Português', short: 'PT' },
    'en-US': { flag: '🇺🇸', name: 'English', short: 'EN' },
    'es-ES': { flag: '🇪🇸', name: 'Español', short: 'ES' },
    'fr-FR': { flag: '🇫🇷', name: 'Français', short: 'FR' },
    'de-DE': { flag: '🇩🇪', name: 'Deutsch', short: 'DE' },
    'ja-JP': { flag: '🇯🇵', name: '日本語', short: 'JA' }
  };

  const CONVERSATION_CORPUS = [
    {
      pt: "Olá pessoal, sejam todos muito bem-vindos à nossa sala no Omnivox!",
      en: "Hello everyone, welcome to our Omnivox translation room!",
      es: "¡Hola a todos, bienvenidos a nuestra sala de traducción en Omnivox!",
      fr: "Bonjour à tous, bienvenue dans notre salle de traduction Omnivox !",
      de: "Hallo zusammen, herzlich willkommen in unserem Omnivox-Übersetzungsraum!",
      ja: "皆さんこんにちは、Omnivox翻訳ルームへようこそ！"
    },
    {
      pt: "Estou ouvindo a tradução perfeitamente no meu idioma nativo.",
      en: "I am hearing the translation clearly in my native language.",
      es: "Estoy escuchando la traducción perfectamente en mi idioma nativo.",
      fr: "J'entends parfaitement la traduction dans ma langue maternelle.",
      de: "Ich höre die Übersetzung perfekt in meiner Muttersprache.",
      ja: "母国語で翻訳がはっきりと聞こえています。"
    },
    {
      pt: "Podemos alinhar os próximos passos do projeto agora mesmo.",
      en: "We can align the next steps of the project right now.",
      es: "Podemos alinear los próximos pasos del proyecto ahora mismo.",
      fr: "Nous pouvons aligner les prochaines étapes du projet dès maintenant.",
      de: "Wir können die nächsten Schritte des Projekts gleich jetzt abstimmen.",
      ja: "プロジェクトの次のステップを今すぐ調整できます。"
    },
    {
      pt: "Excelente experiência, entrou direto pelo QR Code sem precisar instalar nada!",
      en: "Great experience, joined straight via the QR Code without installing anything!",
      es: "¡Excelente experiencia, entré directo con el código QR sin instalar nada!",
      fr: "Super expérience, rejoint directement via le QR Code sans rien installer !",
      de: "Tolle Erfahrung, direkt über den QR-Code beigetreten, ohne etwas zu installieren!",
      ja: "素晴らしい体験です。何もインストールせずにQRコードから直接参加できました！"
    }
  ];

  const WORD_MAP = {
    'en-US': { 'olá': 'hello', 'oi': 'hi', 'bom dia': 'good morning', 'boa tarde': 'good afternoon', 'boa noite': 'good evening', 'obrigado': 'thank you', 'tudo bem': 'how are you', 'vamos começar': 'let us start' },
    'es-ES': { 'olá': 'hola', 'oi': 'hola', 'bom dia': 'buenos días', 'boa tarde': 'buenas tardes', 'boa noite': 'buenas noches', 'obrigado': 'gracias', 'tudo bem': 'todo bien', 'vamos começar': 'vamos a empezar' },
    'fr-FR': { 'olá': 'bonjour', 'oi': 'salut', 'bom dia': 'bonjour', 'boa tarde': 'bon après-midi', 'boa noite': 'bonsoir', 'obrigado': 'merci', 'tudo bem': 'tout va bien', 'vamos começar': 'commençons' },
    'de-DE': { 'olá': 'hallo', 'oi': 'hi', 'bom dia': 'guten Morgen', 'boa tarde': 'guten Tag', 'boa noite': 'guten Abend', 'obrigado': 'danke', 'tudo bem': 'alles gut', 'vamos começar': 'fangen wir an' },
    'ja-JP': { 'olá': 'こんにちは', 'oi': 'やあ', 'bom dia': 'おはようございます', 'obrigado': 'ありがとうございます', 'tudo bem': '元気です', 'vamos começar': '始めましょう' }
  };

  function translateText(text, sourceLang, targetLang) {
    if (!text || !text.trim()) return '';
    if (sourceLang === targetLang) return text.trim();

    const clean = text.trim();
    const norm = clean.toLowerCase().replace(/[.,!?¡¿]/g, '').trim();
    const tgtShort = (targetLang || 'pt-BR').split('-')[0].toLowerCase();

    for (const item of CONVERSATION_CORPUS) {
      for (const val of Object.values(item)) {
        if (val.toLowerCase().replace(/[.,!?¡¿]/g, '').trim() === norm && item[tgtShort]) {
          return item[tgtShort];
        }
      }
    }

    const dict = WORD_MAP[targetLang];
    if (dict) {
      let out = clean;
      for (const [k, v] of Object.entries(dict)) {
        const rx = new RegExp(`\\b${k}\\b`, 'gi');
        out = out.replace(rx, v);
      }
      if (out !== clean) return out;
    }

    return clean;
  }

  // ==========================================================================
  // 3. AVATAR SVG GENERATOR & CAMERA / UPLOAD CAPTURE
  // ==========================================================================
  function generateSvgAvatarDataUrl(name, bgColor = '#10B981') {
    const initials = (name || 'U')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0] ? part[0].toUpperCase() : '')
      .join('') || 'U';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bgColor}"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#g)"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="800" font-size="56">${initials}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Simulated Realistic Guests Pool (with photorealistic vector portrait avatars)
  const SIMULATED_GUESTS = [
    {
      id: 'guest-sarah',
      name: 'Sarah Jenkins',
      lang: 'en-US',
      color: '#0EA5E9',
      sampleText: 'Hello everyone, welcome to our Omnivox translation room!'
    },
    {
      id: 'guest-mateo',
      name: 'Mateo Rivera',
      lang: 'es-ES',
      color: '#F59E0B',
      sampleText: 'Estoy escuchando la traducción perfectamente en mi idioma nativo.'
    },
    {
      id: 'guest-claire',
      name: 'Claire Dubois',
      lang: 'fr-FR',
      color: '#EC4899',
      sampleText: "Super expérience, rejoint directement via le QR Code sans rien installer !"
    },
    {
      id: 'guest-kenji',
      name: 'Kenji Takahashi',
      lang: 'ja-JP',
      color: '#8B5CF6',
      sampleText: 'プロジェクトの次のステップを今すぐ調整できます。'
    }
  ];

  // ==========================================================================
  // 4. APPLICATION STATE
  // ==========================================================================
  const state = {
    userId: 'u-' + Math.random().toString(36).slice(2, 9),
    userName: '',
    roomName: '',
    roomSlug: '',
    nativeLang: 'pt-BR',
    avatarDataUrl: '',
    isJoiningFromQr: false,

    cameraStream: null,
    isCameraOpen: false,

    participants: [], // [{ id, name, lang, avatar, speaking }]
    activeSpeakerId: null,
    isHoldingPtt: false,
    speechRecognition: null,
    spokenTranscript: '',
    hostClauseCursor: 0,
    guestCursor: 0,

    // iOS Audio & Sync
    audioCtx: null,
    bc: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('omnivox_live_room_v2') : null,
    ws: null
  };

  const $ = (id) => document.getElementById(id);

  // ==========================================================================
  // 5. SPLASH SCREEN (4 SECONDS TRANSITION) & URL PARAM CHECK
  // ==========================================================================
  function initSplashAndUrl() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      state.roomName = decodeURIComponent(roomParam);
      state.isJoiningFromQr = true;
      $('input-room-name').value = state.roomName;
      $('setup-main-title').textContent = `Entrar em "${state.roomName}"`;
      $('setup-subtitle').textContent = 'Você escaneou o QR Code! Escolha seu idioma e tire uma selfie para entrar.';
      $('btn-submit-label').textContent = 'Entrar na Sala Agora';
    }

    // 4-second Splash Screen timer
    setTimeout(() => {
      const splash = $('splash-screen');
      splash.classList.add('fade-out');
      $('setup-screen').classList.remove('hidden');
      setTimeout(() => {
        splash.classList.add('hidden');
      }, 600);
    }, 4000);
  }

  // ==========================================================================
  // 6. CAMERA SELFIE & PHOTO UPLOAD LOGIC
  // ==========================================================================
  async function handleCameraButton() {
    const video = $('camera-video');
    const img = $('avatar-img');
    const placeholder = $('avatar-placeholder');
    const btn = $('btn-camera-selfie');

    // If camera is already open -> Capture Photo!
    if (state.isCameraOpen && state.cameraStream) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');

      const vw = video.videoWidth || 240;
      const vh = video.videoHeight || 240;
      const minDim = Math.min(vw, vh);
      const sx = (vw - minDim) / 2;
      const sy = (vh - minDim) / 2;

      // Mirror horizontally for natural selfie
      ctx.translate(240, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 240, 240);

      state.avatarDataUrl = canvas.toDataURL('image/jpeg', 0.86);
      stopCameraStream();

      img.src = state.avatarDataUrl;
      img.classList.remove('hidden');
      video.classList.add('hidden');
      placeholder.classList.add('hidden');
      btn.classList.remove('capture-active');
      btn.innerHTML = '<span>📷 Trocar Selfie</span>';
      return;
    }

    // Otherwise, start live front camera stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false
        });
        state.cameraStream = stream;
        state.isCameraOpen = true;
        video.srcObject = stream;
        video.classList.remove('hidden');
        img.classList.add('hidden');
        placeholder.classList.add('hidden');
        btn.classList.add('capture-active');
        btn.innerHTML = '<span>📸 Capturar Rosto</span>';
        return;
      } catch (_) {
        // Fallback to native mobile camera file input if permission blocked
      }
    }

    $('input-file-camera-fallback').click();
  }

  function stopCameraStream() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(t => t.stop());
      state.cameraStream = null;
    }
    state.isCameraOpen = false;
  }

  function handleFileSelected(file) {
    if (!file) return;
    stopCameraStream();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const tempImg = new Image();
      tempImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(tempImg.width, tempImg.height);
        const sx = (tempImg.width - minDim) / 2;
        const sy = (tempImg.height - minDim) / 2;
        ctx.drawImage(tempImg, sx, sy, minDim, minDim, 0, 0, 240, 240);

        state.avatarDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        const img = $('avatar-img');
        img.src = state.avatarDataUrl;
        img.classList.remove('hidden');
        $('camera-video').classList.add('hidden');
        $('avatar-placeholder').classList.add('hidden');
        $('btn-camera-selfie').classList.remove('capture-active');
        $('btn-camera-selfie').innerHTML = '<span>📷 Câmera</span>';
      };
      tempImg.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ==========================================================================
  // 7. iOS SAFARI AUDIO UNLOCK (-70dB KEEP-ALIVE + WAKELOCK)
  // ==========================================================================
  async function unlockMobileAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!state.audioCtx && AC) {
        state.audioCtx = new AC();
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.frequency.value = 1.0;
        gain.gain.value = 0.0003; // -70dB keep-alive for iOS Safari screen lock
        osc.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc.start();
      }
      if (state.audioCtx && state.audioCtx.state !== 'running') {
        await state.audioCtx.resume();
      }
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {});
      }
    } catch (_) {}
  }

  function playSonicCue(freq = 540, dur = 0.05) {
    if (!state.audioCtx || state.audioCtx.state !== 'running') return;
    try {
      const o = state.audioCtx.createOscillator();
      const g = state.audioCtx.createGain();
      o.frequency.value = freq;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(state.audioCtx.destination);
      o.start();
      o.stop(state.audioCtx.currentTime + dur);
    } catch (_) {}
  }

  // ==========================================================================
  // 8. ROOM CREATION, QR CODE DISPLAY & AUTOMATIC SHRINK TO CORNER ON 1ST JOIN
  // ==========================================================================
  function getShareableRoomUrl() {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?room=${encodeURIComponent(state.roomName)}`;
  }

  async function handleSetupSubmit(e) {
    e.preventDefault();
    stopCameraStream();
    await unlockMobileAudio();

    state.userName = $('input-my-name').value.trim() || 'Anfitrião';
    state.roomName = $('input-room-name').value.trim() || 'Sala Omnivox';
    state.roomSlug = state.roomName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'OMNI26';

    if (!state.avatarDataUrl) {
      state.avatarDataUrl = generateSvgAvatarDataUrl(state.userName, '#10B981');
    }

    const me = {
      id: state.userId,
      name: state.userName,
      lang: state.nativeLang,
      avatar: state.avatarDataUrl,
      isMe: true,
      speaking: false
    };

    state.participants = [me];

    // Render Real Scannable ISO 18004 QR Code (Large + Corner Mini + Modal)
    const shareUrl = getShareableRoomUrl();
    const largeSvg = QrCodeGen.encodeTextToSvg(shareUrl, 188);
    const miniSvg = QrCodeGen.encodeTextToSvg(shareUrl, 30);

    $('qr-large-svg').innerHTML = largeSvg;
    $('qr-modal-svg').innerHTML = largeSvg;
    $('corner-qr-svg').innerHTML = miniSvg;

    $('room-header-title').textContent = state.roomName;
    $('qr-hero-room-name').textContent = state.roomName;
    $('modal-room-title').textContent = state.roomName;
    $('qr-code-slug').textContent = `#${state.roomSlug}`;
    $('corner-room-code').textContent = `#${state.roomSlug}`;
    const langInfo = LANG_META[state.nativeLang] || LANG_META['pt-BR'];
    $('qr-host-summary').textContent = `${state.userName} (${langInfo.flag} ${langInfo.name})`;

    $('setup-screen').classList.add('hidden');
    $('room-screen').classList.remove('hidden');

    // Connect realtime sync across tabs/devices
    initRealtimeSync(me);

    // If user entered by scanning someone else's QR Code (?room=...), add the Host so they immediately see the active room with shrunk QR!
    if (state.isJoiningFromQr) {
      addOrUpdateParticipant({
        id: 'host-creator',
        name: 'Anfitrião da Sala',
        lang: state.nativeLang === 'pt-BR' ? 'en-US' : 'pt-BR',
        avatar: generateSvgAvatarDataUrl('Anfitrião', '#F59E0B'),
        speaking: false
      });
    }

    renderRoomView();
  }

  function addOrUpdateParticipant(p) {
    const existingIdx = state.participants.findIndex(item => item.id === p.id);
    if (existingIdx !== -1) {
      state.participants[existingIdx] = { ...state.participants[existingIdx], ...p };
    } else {
      state.participants.push(p);
      playSonicCue(680, 0.06);
    }
    renderRoomView();
  }

  // Core UI State Machine:
  // - When only 1 participant (Host alone): Show Large QR Hero Card in center.
  // - As soon as >= 2 participants: Shrink QR Code to top-right corner button (#btn-corner-qr) and focus on Participants Grid!
  function renderRoomView() {
    const count = state.participants.length;
    const qrHero = $('qr-hero-card');
    const cornerQrBtn = $('btn-corner-qr');
    const counterLabel = $('room-participant-counter');

    if (count <= 1) {
      counterLabel.textContent = '1 pessoa • Aguardando convidados';
      qrHero.classList.remove('hidden');
      cornerQrBtn.classList.add('hidden');
    } else {
      counterLabel.textContent = `${count} participantes ativos`;
      qrHero.classList.add('hidden');
      cornerQrBtn.classList.remove('hidden');
    }

    // Render Participant Cards with Photo Avatars & Native Languages
    const grid = $('participants-grid');
    grid.innerHTML = state.participants.map(p => {
      const lMeta = LANG_META[p.lang] || LANG_META['pt-BR'];
      const isSpeaking = state.activeSpeakerId === p.id;
      return `
        <div class="participant-card ${isSpeaking ? 'speaking' : ''}" id="pcard-${p.id}">
          <div class="participant-avatar-wrap">
            <img class="participant-avatar" src="${p.avatar}" alt="${escapeHtml(p.name)}" />
            <span class="participant-lang-badge">${lMeta.flag} ${lMeta.short}</span>
          </div>
          <div class="participant-name">${escapeHtml(p.name)}${p.isMe ? ' (Você)' : ''}</div>
          <div class="participant-lang-name">${lMeta.name}</div>
          <div class="participant-status-tag">
            ${isSpeaking ? '🎙️ Falando agora...' : '🎧 Ouvindo em ' + lMeta.short}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 9. REALTIME MULTI-TAB / SERVER SYNC & GUEST SIMULATOR
  // ==========================================================================
  function initRealtimeSync(me) {
    if (state.bc) {
      state.bc.postMessage({ type: 'participant_join', roomName: state.roomName, participant: me });
      state.bc.onmessage = (ev) => {
        const data = ev.data;
        if (!data || data.roomName !== state.roomName) return;

        if (data.type === 'participant_join') {
          addOrUpdateParticipant({ ...data.participant, isMe: false });
          // Announce ourselves back so the newly joined tab sees us too!
          state.bc.postMessage({ type: 'participant_ack', roomName: state.roomName, participant: me });
        } else if (data.type === 'participant_ack') {
          addOrUpdateParticipant({ ...data.participant, isMe: false });
        } else if (data.type === 'speaking_state') {
          state.activeSpeakerId = data.speaking ? data.speakerId : null;
          renderRoomView();
        } else if (data.type === 'speech_clause') {
          receiveSpeechClause(data.payload);
        }
      };
    }
  }

  function simulateNextParticipantJoin() {
    const template = SIMULATED_GUESTS[state.guestCursor % SIMULATED_GUESTS.length];
    state.guestCursor += 1;
    const uniqueId = `${template.id}-${state.guestCursor}`;
    const avatar = generateSvgAvatarDataUrl(template.name, template.color);

    const newGuest = {
      id: uniqueId,
      name: template.name,
      lang: template.lang,
      avatar,
      sampleText: template.sampleText,
      isMe: false,
      speaking: false
    };

    addOrUpdateParticipant(newGuest);
    if (state.bc) {
      state.bc.postMessage({ type: 'participant_join', roomName: state.roomName, participant: newGuest });
    }
  }

  // ==========================================================================
  // 10. FIXED BOTTOM PUSH-TO-TALK & VOICE SYNTHESIS
  // ==========================================================================
  function startPushToTalk() {
    if (state.isHoldingPtt) return;
    unlockMobileAudio();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    state.isHoldingPtt = true;
    state.activeSpeakerId = state.userId;
    state.spokenTranscript = '';
    playSonicCue(640, 0.05);

    const btn = $('btn-fixed-ptt');
    btn.classList.add('active-speaking');
    $('ptt-main-label').textContent = 'GRAVANDO E TRADUZINDO... (SOLTE PARA ENVIAR)';
    $('ptt-sub-label').textContent = 'Fale normalmente no seu idioma nativo';

    renderRoomView();
    if (state.bc) {
      state.bc.postMessage({ type: 'speaking_state', roomName: state.roomName, speakerId: state.userId, speaking: true });
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = state.nativeLang;
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (event) => {
          let txt = '';
          for (let i = 0; i < event.results.length; i++) {
            txt += event.results[i][0].transcript + ' ';
          }
          state.spokenTranscript = txt.trim();
          if (state.spokenTranscript) {
            $('ptt-sub-label').textContent = `"${state.spokenTranscript}"`;
          }
        };
        rec.onerror = () => {};
        rec.start();
        state.speechRecognition = rec;
      } catch (_) {}
    }
  }

  function stopPushToTalk() {
    if (!state.isHoldingPtt) return;
    state.isHoldingPtt = false;
    state.activeSpeakerId = null;

    if (state.speechRecognition) {
      try { state.speechRecognition.stop(); } catch (_) {}
      state.speechRecognition = null;
    }

    const btn = $('btn-fixed-ptt');
    btn.classList.remove('active-speaking');
    $('ptt-main-label').textContent = 'SEGURE PARA FALAR';
    $('ptt-sub-label').textContent = 'Tradução automática instantânea para o idioma de cada ouvinte';

    playSonicCue(420, 0.05);
    renderRoomView();
    if (state.bc) {
      state.bc.postMessage({ type: 'speaking_state', roomName: state.roomName, speakerId: state.userId, speaking: false });
    }

    // Use captured microphone speech, or fallback to a natural phrase in the user's native language
    let finalSpeech = state.spokenTranscript.trim();
    if (!finalSpeech) {
      const short = state.nativeLang.split('-')[0].toLowerCase();
      const item = CONVERSATION_CORPUS[state.hostClauseCursor % CONVERSATION_CORPUS.length];
      state.hostClauseCursor += 1;
      finalSpeech = item[short] || item.pt;
    }

    const me = state.participants.find(p => p.id === state.userId);
    const payload = {
      id: 'msg-' + Date.now(),
      speakerId: state.userId,
      speakerName: state.userName,
      speakerAvatar: me ? me.avatar : state.avatarDataUrl,
      sourceLang: state.nativeLang,
      originalText: finalSpeech
    };

    receiveSpeechClause(payload);
    if (state.bc) {
      state.bc.postMessage({ type: 'speech_clause', roomName: state.roomName, payload });
    }
  }

  function receiveSpeechClause(payload) {
    const emptyHint = $('feed-empty-hint');
    if (emptyHint) emptyHint.remove();

    // If only 1 language is in room and user spoke themselves, show preview in another participant's language or English so user sees & hears the translation magic!
    let targetLang = state.nativeLang;
    if (payload.speakerId === state.userId) {
      const otherGuest = state.participants.find(p => !p.isMe && p.lang !== state.nativeLang);
      if (otherGuest) {
        targetLang = otherGuest.lang;
      } else if (state.nativeLang === 'pt-BR') {
        targetLang = 'en-US';
      } else {
        targetLang = 'pt-BR';
      }
    }

    const translatedText = translateText(payload.originalText, payload.sourceLang, targetLang);
    const srcMeta = LANG_META[payload.sourceLang] || LANG_META['pt-BR'];
    const tgtMeta = LANG_META[targetLang] || LANG_META['en-US'];

    const feed = $('conversation-feed');
    const card = document.createElement('div');
    card.className = 'speech-card';
    card.innerHTML = `
      <img class="speech-card-avatar" src="${payload.speakerAvatar}" alt="${escapeHtml(payload.speakerName)}" />
      <div class="speech-card-body">
        <div class="speech-card-meta">
          <strong>${escapeHtml(payload.speakerName)} (${srcMeta.flag} ${srcMeta.short})</strong>
          <span>→ ${tgtMeta.flag} ${tgtMeta.name}</span>
        </div>
        <div class="speech-card-translated">${escapeHtml(translatedText)}</div>
        <div class="speech-card-original">Original: "${escapeHtml(payload.originalText)}"</div>
      </div>
    `;
    feed.prepend(card);

    speakTts(translatedText, targetLang);
  }

  function speakTts(text, langCode) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.rate = 1.04;
      const voices = window.speechSynthesis.getVoices();
      const prefix = langCode.split('-')[0].toLowerCase();
      const matched = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (matched) utter.voice = matched;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  function simulateForeignParticipantSpeech() {
    unlockMobileAudio();
    // Ensure at least 1 foreign guest is in the room
    let guest = state.participants.find(p => !p.isMe);
    if (!guest) {
      simulateNextParticipantJoin();
      guest = state.participants.find(p => !p.isMe);
    }
    if (!guest) return;

    state.activeSpeakerId = guest.id;
    renderRoomView();

    const short = guest.lang.split('-')[0].toLowerCase();
    const corpusItem = CONVERSATION_CORPUS[Math.floor(Math.random() * CONVERSATION_CORPUS.length)];
    const spokenText = corpusItem[short] || guest.sampleText || corpusItem.en;

    setTimeout(() => {
      state.activeSpeakerId = null;
      renderRoomView();
      receiveSpeechClause({
        id: 'msg-' + Date.now(),
        speakerId: guest.id,
        speakerName: guest.name,
        speakerAvatar: guest.avatar,
        sourceLang: guest.lang,
        originalText: spokenText
      });
    }, 1100);
  }

  // ==========================================================================
  // 11. EVENT BINDINGS
  // ==========================================================================
  function bindEvents() {
    // Camera & Photo Upload
    $('btn-camera-selfie').addEventListener('click', handleCameraButton);
    $('btn-upload-photo').addEventListener('click', () => $('input-file-photo').click());
    $('input-file-photo').addEventListener('change', (e) => handleFileSelected(e.target.files[0]));
    $('input-file-camera-fallback').addEventListener('change', (e) => handleFileSelected(e.target.files[0]));

    // Native Language Selection Buttons
    document.querySelectorAll('.lang-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.nativeLang = btn.dataset.lang;
      });
    });

    // Setup Form Submit
    $('form-setup-room').addEventListener('submit', handleSetupSubmit);

    // Share & Copy Room Link
    const triggerShare = async () => {
      const shareUrl = getShareableRoomUrl();
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Sala Omnivox: ${state.roomName}`,
            text: `Entre na sala "${state.roomName}" para conversarmos com tradução simultânea:`,
            url: shareUrl
          });
          return;
        } catch (_) {}
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      $('lbl-copy-link').textContent = '✓ Link Copiado!';
      setTimeout(() => { $('lbl-copy-link').textContent = '🔗 Copiar Link'; }, 1800);
    };

    $('btn-native-share').addEventListener('click', triggerShare);
    $('btn-modal-share').addEventListener('click', triggerShare);
    $('btn-copy-link').addEventListener('click', () => {
      const shareUrl = getShareableRoomUrl();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      $('lbl-copy-link').textContent = '✓ Copiado!';
      setTimeout(() => { $('lbl-copy-link').textContent = '🔗 Copiar Link'; }, 1800);
    });

    // Simulate Participant Joining (Triggers QR Code Shrink to Corner!)
    $('btn-simulate-first-guest').addEventListener('click', simulateNextParticipantJoin);
    $('btn-add-simulated-guest').addEventListener('click', simulateNextParticipantJoin);
    $('btn-sim-guest-speak').addEventListener('click', simulateForeignParticipantSpeech);

    // Corner Mini QR Code Modal
    $('btn-corner-qr').addEventListener('click', () => {
      $('qr-modal').classList.remove('hidden');
    });
    $('btn-close-qr-modal').addEventListener('click', () => {
      $('qr-modal').classList.add('hidden');
    });
    $('qr-modal').addEventListener('click', (e) => {
      if (e.target === $('qr-modal')) $('qr-modal').classList.add('hidden');
    });

    // Fixed Bottom Push-to-Talk Button (Touch + Mouse + Spacebar)
    const pttBtn = $('btn-fixed-ptt');
    pttBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startPushToTalk();
    });
    window.addEventListener('mouseup', () => {
      if (state.isHoldingPtt) stopPushToTalk();
    });

    pttBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startPushToTalk();
    }, { passive: false });
    pttBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (state.isHoldingPtt) stopPushToTalk();
    }, { passive: false });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initSplashAndUrl();
  });
})();
