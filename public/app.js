(() => {
  'use strict';

  // ==========================================================================
  // BUILT-IN TRANSLATION CORPUS & DICTIONARY (FOR ZERO-LATENCY & STATIC MODE)
  // ==========================================================================
  const CORPUS = [
    {
      pt: "Bom dia a todos, obrigado por entrarem na sala do Omnivox pelo QR Code.",
      en: "Good morning everyone, thank you for joining the Omnivox room via QR Code.",
      es: "Buenos días a todos, gracias por unirse a la sala de Omnivox mediante el código QR.",
      fr: "Bonjour à tous, merci d'avoir rejoint la salle Omnivox via le QR Code.",
      de: "Guten Morgen zusammen, danke, dass Sie dem Omnivox-Raum über den QR-Code beigetreten sind.",
      ja: "皆さんおはようございます。QRコードからOmnivoxルームにご参加いただきありがとうございます。"
    },
    {
      pt: "Nossa arquitetura processa cláusulas semânticas em tempo real enquanto seguro o botão.",
      en: "Our architecture processes semantic clauses in real time while I hold the button.",
      es: "Nuestra arquitectura procesa cláusulas semánticas en tiempo real mientras mantengo presionado el botón.",
      fr: "Notre architecture traite les clauses sémantiques en temps réel pendant que je maintiens le bouton.",
      de: "Unsere Architektur verarbeitet semantische Sätze in Echtzeit, während ich die Taste gedrückt halte.",
      ja: "ボタンを押している間、当社のアーキテクチャはリアルタイムで意味節を処理します。"
    },
    {
      pt: "Isso reduz a latência percebida para menos de um segundo após soltar o Push-to-Talk.",
      en: "This reduces perceived latency to under one second after releasing Push-to-Talk.",
      es: "Esto reduce la latencia percibida a menos de un segundo después de soltar el botón Push-to-Talk.",
      fr: "Cela réduit la latence perçue à moins d'une seconde après avoir relâché le bouton Push-to-Talk.",
      de: "Dadurch sinkt die wahrgenommene Latenz nach dem Loslassen von Push-to-Talk auf unter eine Sekunde.",
      ja: "これにより、プッシュ・トゥ・トークを離してから体感遅延が1秒未満に短縮されます。"
    },
    {
      pt: "Qual é o custo por minuto para uma sala com trinta participantes em três idiomas?",
      en: "What is the cost per minute for a room with thirty participants across three languages?",
      es: "¿Cuál es el costo por minuto para una sala con treinta participantes en tres idiomas?",
      fr: "Quel est le coût par minute pour une salle de trente participants dans trois langues ?",
      de: "Was sind die Kosten pro Minute für einen Raum mit dreißig Teilnehmern in drei Sprachen?",
      ja: "3つの言語で30人の参加者がいるルームの1分あたりのコストはいくらですか？"
    },
    {
      pt: "Como fazemos fan-out por idioma único e não por usuário, o custo permanece fixo em três streams.",
      en: "Because we fan out per unique language rather than per user, the cost stays fixed at three streams.",
      es: "Como distribuimos por idioma único y no por usuario, el costo se mantiene fijo en tres flujos.",
      fr: "Comme nous diffusons par langue unique et non par utilisateur, le coût reste fixe à trois flux.",
      de: "Da wir pro eindeutiger Sprache und nicht pro Nutzer verteilen, bleiben die Kosten bei drei Streams fix.",
      ja: "ユーザーごとではなく言語ごとに配信するため、コストは3ストリーム分に固定されます。"
    },
    {
      pt: "Excelente ponto sobre o bloqueio de tela do Safari no iPhone.",
      en: "Excellent point regarding the Safari screen lock issue on the iPhone.",
      es: "Excelente punto sobre el bloqueo de pantalla de Safari en el iPhone.",
      fr: "Excellent point concernant le verrouillage d'écran de Safari sur l'iPhone.",
      de: "Ausgezeichneter Punkt bezüglich der Safari-Bildschirmsperre auf dem iPhone.",
      ja: "iPhoneのSafariにおける画面ロックの問題について、素晴らしいご指摘です。"
    },
    {
      pt: "Podemos fechar o contrato de piloto ainda esta semana se os testes de latência passarem.",
      en: "We can close the pilot contract later this week if the latency tests pass.",
      es: "Podemos cerrar el contrato piloto esta misma semana si pasan las pruebas de latencia.",
      fr: "Nous pouvons conclure le contrat pilote cette semaine si les tests de latence réussissent.",
      de: "Wir können den Pilotvertrag noch diese Woche abschließen, wenn die Latenztests bestehen.",
      ja: "遅延テストに合格すれば、今週中にパイロット契約を締結できます。"
    },
    {
      pt: "Eu concordo com os termos comerciais, mas precisamos validar a acústica na mesa.",
      en: "I agree with the commercial terms, but we need to validate the table acoustics.",
      es: "Estoy de acuerdo con los términos comerciales, pero necesitamos validar la acústica en la mesa.",
      fr: "Je suis d'accord avec les conditions commerciales, mais nous devons valider l'acoustique de table.",
      de: "Ich stimme den kommerziellen Bedingungen zu, aber wir müssen die Tischakustik validieren.",
      ja: "商業条件には同意しますが、テーブルでの音響を検証する必要があります。"
    }
  ];

  function translateClauseLocal(text, sourceLang, targetLang) {
    if (!text || !text.trim()) return '';
    if (sourceLang === targetLang) return text;
    const clean = text.trim();
    const cleanLower = clean.toLowerCase().replace(/[.,!?]/g, '').trim();
    const tgtShort = (targetLang || 'pt-BR').split('-')[0].toLowerCase();

    for (const item of CORPUS) {
      for (const val of Object.values(item)) {
        const cand = val.toLowerCase().replace(/[.,!?]/g, '').trim();
        if (cand === cleanLower && item[tgtShort]) {
          return item[tgtShort];
        }
      }
    }
    return clean;
  }

  // ==========================================================================
  // APPLICATION STATE
  // ==========================================================================
  const state = {
    clientId: 'usr-' + Math.random().toString(36).slice(2, 8),
    userName: 'Carlos (Anfitrião)',
    roomId: 'OMNI-2026',
    nativeLang: 'pt-BR',
    audioMode: 'headphones',
    roomTier: 'trial',
    inRoom: false,

    ws: null,
    wsConnected: false,
    bc: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('omnivox_sync_v1') : null,

    activeSpeaker: null,
    speakerQueue: [],
    cooldownUntil: 0,
    participants: [],
    uniqueLanguages: ['pt-BR', 'en-US', 'es-ES'],
    stats: {
      totalSpeechSeconds: 0,
      clausesTranslated: 0,
      fanOutSavingsCount: 0,
      estimatedApiCostUsd: 0
    },

    isHoldingPtt: false,
    isQueuedForFloor: false,
    currentClauseIndex: 0,
    previousClauseContext: '',
    accumulatedTranscript: '',
    speechRecognition: null,

    audioCtx: null,
    keepAliveOsc: null,
    keepAliveGain: null,
    wakeLockSentinel: null,
    iosAudioUnlocked: false,

    fifoQueue: [],
    isPlayingFifo: false,
    currentPlaybackRate: 1.0
  };

  const LANG_LABELS = {
    'pt-BR': { flag: '🇧🇷', short: 'PT-BR', name: 'Português' },
    'en-US': { flag: '🇺🇸', short: 'EN-US', name: 'English' },
    'es-ES': { flag: '🇪🇸', short: 'ES-ES', name: 'Español' },
    'fr-FR': { flag: '🇫🇷', short: 'FR-FR', name: 'Français' },
    'de-DE': { flag: '🇩🇪', short: 'DE-DE', name: 'Deutsch' },
    'ja-JP': { flag: '🇯🇵', short: 'JA-JP', name: '日本語' }
  };

  const el = (id) => document.getElementById(id);

  function initFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const langParam = params.get('lang');
    const nameParam = params.get('name');
    const autoJoin = params.get('autojoin');

    if (roomParam) {
      state.roomId = roomParam.toUpperCase();
      el('input-room-code').value = state.roomId;
    }
    if (langParam && LANG_LABELS[langParam]) {
      state.nativeLang = langParam;
      el('select-native-lang').value = langParam;
    }
    if (nameParam) {
      state.userName = nameParam;
      el('input-user-name').value = nameParam;
    }

    if (autoJoin === '1') {
      setTimeout(() => enterRoom(), 150);
    }
  }

  // ==========================================================================
  // PILLAR 1: iOS / SAFARI AUDIO SHIELD (-70dB KEEP-ALIVE + WAKELOCK + MEDIASESSION)
  // ==========================================================================
  async function unlockIosAudioAndWakeLock() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!state.audioCtx && AudioContextClass) {
        state.audioCtx = new AudioContextClass();
      }

      if (state.audioCtx) {
        if (state.audioCtx.state === 'suspended' || state.audioCtx.state === 'interrupted') {
          await state.audioCtx.resume();
        }

        if (!state.keepAliveOsc) {
          const osc = state.audioCtx.createOscillator();
          const gain = state.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1.0, state.audioCtx.currentTime);
          gain.gain.setValueAtTime(0.0003, state.audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(state.audioCtx.destination);
          osc.start();
          state.keepAliveOsc = osc;
          state.keepAliveGain = gain;
        }

        state.audioCtx.onstatechange = () => {
          updateTelemetryPills();
          const st = state.audioCtx.state;
          if (st === 'suspended' || st === 'interrupted') {
            el('ios-interrupted-banner').classList.remove('hidden');
          } else {
            el('ios-interrupted-banner').classList.add('hidden');
          }
        };

        playConfirmationTone(587.33, 0.06);
        state.iosAudioUnlocked = true;
      }

      if ('speechSynthesis' in window) {
        const warmUtterance = new SpeechSynthesisUtterance('');
        warmUtterance.volume = 0;
        window.speechSynthesis.speak(warmUtterance);
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Sala ${state.roomId} (${LANG_LABELS[state.nativeLang].short})`,
          artist: 'Omnivox Tradução Simultânea',
          album: 'Canal Multidirecional Ativo'
        });
        navigator.mediaSession.playbackState = 'playing';
      }

      if ('wakeLock' in navigator) {
        try {
          state.wakeLockSentinel = await navigator.wakeLock.request('screen');
          state.wakeLockSentinel.addEventListener('release', updateTelemetryPills);
        } catch (_) {}
      }
    } catch (_) {}
    updateTelemetryPills();
  }

  function playConfirmationTone(freq = 520, duration = 0.05) {
    if (!state.audioCtx || state.audioCtx.state !== 'running') return;
    try {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      osc.start();
      osc.stop(state.audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function updateTelemetryPills() {
    const wsPill = el('pill-ws-status');
    const wsText = el('pill-ws-text');
    if (state.wsConnected) {
      wsPill.className = 'sys-pill ok';
      wsText.textContent = `WS: Online (${state.roomId})`;
    } else {
      wsPill.className = 'sys-pill ok';
      wsText.textContent = `Engine: Local/P2P (${state.roomId})`;
    }

    const iosPill = el('pill-ios-audio');
    const iosText = el('pill-ios-text');
    if (state.audioCtx && state.audioCtx.state === 'running') {
      iosPill.className = 'sys-pill ok';
      iosText.textContent = 'iOS Audio: -70dB Active';
    } else if (state.audioCtx) {
      iosPill.className = 'sys-pill danger';
      iosText.textContent = `iOS Audio: ${state.audioCtx.state}`;
    } else {
      iosPill.className = 'sys-pill warn';
      iosText.textContent = 'iOS Audio: Locked';
    }

    const wlPill = el('pill-wakelock');
    const wlText = el('pill-wakelock-text');
    if (state.wakeLockSentinel && !state.wakeLockSentinel.released) {
      wlPill.className = 'sys-pill ok';
      wlText.textContent = 'WakeLock: Ativo';
    } else if (state.inRoom) {
      wlPill.className = 'sys-pill ok';
      wlText.textContent = 'MediaSession: Ativa';
    } else {
      wlPill.className = 'sys-pill';
      wlText.textContent = 'WakeLock: Standby';
    }

    const ratePill = el('pill-playback-rate');
    const rateText = el('pill-rate-text');
    rateText.textContent = `FIFO: ${state.currentPlaybackRate.toFixed(2)}x`;
    ratePill.className = state.currentPlaybackRate > 1.01 ? 'sys-pill warn' : 'sys-pill ok';
  }

  // ==========================================================================
  // SVG QR CODE GENERATOR
  // ==========================================================================
  function renderRoomQrCode(roomId) {
    const container = el('qr-code-container');
    if (!container) return;
    const size = 21;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));

    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[r0 + r][c0 + c] = 1;
          }
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    const seedStr = `${window.location.origin}/?room=${roomId}`;
    let hash = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      hash ^= seedStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= size - 8;
        const inBottomLeft = r >= size - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6) continue;
        hash ^= (r * 31 + c * 17) & 0xff;
        hash = Math.imul(hash, 16777619);
        matrix[r][c] = (Math.abs(hash) % 10) < 5 ? 1 : 0;
      }
    }

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0A0E13" rx="0.15"/>`;
        }
      }
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" width="144" height="144" shape-rendering="crispEdges" role="img" aria-label="QR Code para sala ${roomId}">
        <rect width="${size}" height="${size}" fill="#FFFFFF"/>
        ${rects}
      </svg>
    `;
  }

  // ==========================================================================
  // HYBRID TRANSPORT: WEBSOCKET + LOCAL IN-BROWSER ROOM ENGINE FALLBACK
  // ==========================================================================
  function initLocalFallbackState() {
    state.participants = [
      { id: state.clientId, name: state.userName, lang: state.nativeLang, audioMode: state.audioMode, isHost: true },
      { id: 'bot-sarah-en', name: 'Sarah (US Investor)', lang: 'en-US', audioMode: 'headphones', isBot: true },
      { id: 'bot-mateo-es', name: 'Mateo (Director ES)', lang: 'es-ES', audioMode: 'headphones', isBot: true }
    ];
    state.uniqueLanguages = ['pt-BR', 'en-US', 'es-ES'];
    syncRoomUi();
  }

  function connectWebSocket() {
    initLocalFallbackState();
    if (!window.location.host) return;

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      state.ws = ws;

      ws.onopen = () => {
        state.wsConnected = true;
        updateTelemetryPills();
        ws.send(JSON.stringify({
          type: 'join_room',
          roomId: state.roomId,
          clientId: state.clientId,
          name: state.userName,
          lang: state.nativeLang,
          audioMode: state.audioMode,
          tier: state.roomTier,
          isHost: true
        }));
      };

      ws.onmessage = (event) => {
        try {
          handleServerEvent(JSON.parse(event.data));
        } catch (_) {}
      };

      ws.onclose = () => {
        state.wsConnected = false;
        updateTelemetryPills();
      };

      ws.onerror = () => {
        state.wsConnected = false;
        updateTelemetryPills();
      };
    } catch (_) {
      state.wsConnected = false;
      updateTelemetryPills();
    }
  }

  if (state.bc) {
    state.bc.onmessage = (ev) => {
      if (!state.wsConnected && ev.data) {
        handleServerEvent(ev.data);
      }
    };
  }

  // Local Serverless Engine when running on static hosting (GitHub Pages / file://)
  function handleLocalEngineCommand(payload) {
    switch (payload.type) {
      case 'update_participant': {
        const me = state.participants.find(p => p.id === state.clientId);
        if (me) {
          if (payload.lang) me.lang = payload.lang;
          if (payload.audioMode) me.audioMode = payload.audioMode;
        }
        syncRoomUi();
        break;
      }
      case 'upgrade_room_tier': {
        state.roomTier = payload.tier;
        syncRoomUi();
        break;
      }
      case 'ptt_request': {
        const spkId = payload.speakerId || state.clientId;
        const spkName = payload.speakerName || state.userName;
        const spkLang = payload.speakerLang || state.nativeLang;

        if (!state.activeSpeaker) {
          state.activeSpeaker = { clientId: spkId, name: spkName, lang: spkLang, startedAt: Date.now() };
          handleServerEvent({ type: 'floor_granted', speakerId: spkId, speakerName: spkName, speakerLang: spkLang });
        } else if (state.activeSpeaker.clientId !== spkId) {
          if (!state.speakerQueue.some(q => q.clientId === spkId)) {
            state.speakerQueue.push({ clientId: spkId, name: spkName, lang: spkLang });
          }
          handleServerEvent({ type: 'ptt_queued', speakerId: spkId, position: state.speakerQueue.length });
          syncRoomUi();
        }
        break;
      }
      case 'ptt_release': {
        const spkId = payload.speakerId || state.clientId;
        if (state.activeSpeaker && state.activeSpeaker.clientId === spkId) {
          state.activeSpeaker = null;
          handleServerEvent({ type: 'floor_released', previousSpeakerId: spkId });
          const gateMs = state.participants.some(p => p.audioMode === 'speaker') ? 650 : 120;
          if (state.speakerQueue.length > 0) {
            setTimeout(() => {
              if (!state.activeSpeaker && state.speakerQueue.length > 0) {
                const next = state.speakerQueue.shift();
                state.activeSpeaker = { clientId: next.clientId, name: next.name, lang: next.lang, startedAt: Date.now() };
                handleServerEvent({ type: 'floor_granted', speakerId: next.clientId, speakerName: next.name, speakerLang: next.lang });
              }
            }, gateMs);
          }
        } else {
          state.speakerQueue = state.speakerQueue.filter(q => q.clientId !== spkId);
          syncRoomUi();
        }
        break;
      }
      case 'interim_transcript': {
        const ev = {
          type: 'live_interim',
          speakerId: payload.speakerId,
          speakerName: payload.speakerName,
          sourceLang: payload.sourceLang,
          interimText: payload.text
        };
        handleServerEvent(ev);
        if (state.bc) state.bc.postMessage(ev);
        break;
      }
      case 'semantic_clause': {
        const langs = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];
        const translations = {};
        langs.forEach(l => {
          translations[l] = translateClauseLocal(payload.text, payload.sourceLang, l);
        });
        const totalPipelineMs = 390 + Math.floor(Math.random() * 90);
        state.stats.clausesTranslated += 1;
        state.stats.fanOutSavingsCount += 2;
        const clauseCost = state.roomTier === 'pro' ? 0.0044 : 0.0004;
        state.stats.estimatedApiCostUsd = Number((state.stats.estimatedApiCostUsd + clauseCost).toFixed(5));

        const ev = {
          type: 'semantic_clause_broadcast',
          clauseId: `${state.roomId}-${Date.now()}-${payload.clauseIndex}`,
          speakerId: payload.speakerId,
          speakerName: payload.speakerName,
          sourceLang: payload.sourceLang,
          originalText: payload.text,
          clauseIndex: payload.clauseIndex || 1,
          translations,
          telemetry: {
            totalPipelineMs,
            uniqueLangsComputed: state.uniqueLanguages.length
          },
          stats: state.stats
        };
        handleServerEvent(ev);
        if (state.bc) state.bc.postMessage(ev);
        break;
      }
    }
  }

  function sendMessage(payload) {
    if (state.wsConnected && state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify(payload));
    } else {
      handleLocalEngineCommand(payload);
    }
  }

  function handleServerEvent(msg) {
    switch (msg.type) {
      case 'joined_ack': {
        if (Array.isArray(msg.history)) {
          msg.history.forEach((clauseEvent) => renderClauseBubble(clauseEvent, false));
        }
        break;
      }
      case 'room_state': {
        const r = msg.room;
        state.roomTier = r.tier;
        state.activeSpeaker = r.activeSpeaker;
        state.speakerQueue = r.speakerQueue || [];
        state.cooldownUntil = r.cooldownUntil || 0;
        state.participants = r.participants || [];
        state.uniqueLanguages = r.uniqueLanguages || [state.nativeLang];
        state.stats = r.stats || state.stats;
        syncRoomUi();
        break;
      }
      case 'floor_granted': {
        if (msg.speakerId === state.clientId) {
          state.isQueuedForFloor = false;
          state.isHoldingPtt = true;
          playConfirmationTone(660, 0.07);
          startSpeechCaptureSession();
        }
        syncRoomUi();
        break;
      }
      case 'ptt_queued': {
        if (msg.speakerId === state.clientId) {
          state.isQueuedForFloor = true;
          playConfirmationTone(440, 0.08);
          syncPttButtonUi();
        }
        break;
      }
      case 'floor_released': {
        if (msg.previousSpeakerId === state.clientId) {
          state.isHoldingPtt = false;
          stopSpeechCaptureSession();
        }
        el('interim-caption-box').classList.add('hidden');
        syncRoomUi();
        break;
      }
      case 'live_interim': {
        const box = el('interim-caption-box');
        el('interim-speaker-label').textContent = `${msg.speakerName} (${msg.sourceLang}):`;
        el('interim-text-content').textContent = msg.interimText;
        box.classList.remove('hidden');
        break;
      }
      case 'semantic_clause_broadcast': {
        el('interim-caption-box').classList.add('hidden');
        if (msg.stats) state.stats = msg.stats;
        if (msg.telemetry && msg.telemetry.totalPipelineMs) {
          el('metric-last-latency').textContent = `${msg.telemetry.totalPipelineMs} ms`;
        }
        renderClauseBubble(msg, true);
        updateUnitEconomicsUi();
        break;
      }
    }
  }

  // ==========================================================================
  // PUSH-TO-TALK + SEMANTIC CLAUSE STREAMING
  // ==========================================================================
  function requestPushToTalk() {
    if (!state.inRoom || state.isHoldingPtt) return;
    if (state.activeSpeaker && state.activeSpeaker.clientId === state.clientId) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    sendMessage({
      type: 'ptt_request',
      speakerId: state.clientId,
      speakerName: state.userName,
      speakerLang: state.nativeLang
    });
  }

  function releasePushToTalk() {
    if (!state.inRoom) return;
    if (state.isHoldingPtt && state.accumulatedTranscript.trim().length > 0) {
      dispatchSemanticClause(state.accumulatedTranscript.trim(), true);
      state.accumulatedTranscript = '';
    }
    state.isHoldingPtt = false;
    state.isQueuedForFloor = false;
    stopSpeechCaptureSession();
    playConfirmationTone(392, 0.06);

    sendMessage({
      type: 'ptt_release',
      speakerId: state.clientId,
      reason: 'button_released'
    });
    syncPttButtonUi();
  }

  function startSpeechCaptureSession() {
    state.currentClauseIndex = 0;
    state.accumulatedTranscript = '';
    syncPttButtonUi();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      el('mic-recognition-status').textContent = 'Modo Disparo Rápido / Teclado';
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = state.nativeLang;
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            dispatchSemanticClause(transcript.trim(), false);
            state.accumulatedTranscript = '';
          } else {
            interim += transcript;
          }
        }

        if (interim.trim()) {
          state.accumulatedTranscript = interim.trim();
          sendMessage({
            type: 'interim_transcript',
            speakerId: state.clientId,
            speakerName: state.userName,
            sourceLang: state.nativeLang,
            text: state.accumulatedTranscript
          });

          const words = state.accumulatedTranscript.split(/\s+/);
          if (words.length >= 9) {
            const chunkToTranslate = state.accumulatedTranscript;
            state.accumulatedTranscript = '';
            dispatchSemanticClause(chunkToTranslate, false);
          }
        }
      };

      rec.onerror = () => {};
      rec.start();
      state.speechRecognition = rec;
    } catch (_) {}
  }

  function stopSpeechCaptureSession() {
    if (state.speechRecognition) {
      try {
        state.speechRecognition.stop();
      } catch (_) {}
      state.speechRecognition = null;
    }
  }

  function dispatchSemanticClause(text, isFinalRelease = false) {
    if (!text || !text.trim()) return;
    state.currentClauseIndex += 1;

    sendMessage({
      type: 'semantic_clause',
      speakerId: state.clientId,
      speakerName: state.userName,
      sourceLang: state.nativeLang,
      text: text.trim(),
      clauseIndex: state.currentClauseIndex,
      isFinalRelease,
      previousContext: state.previousClauseContext
    });

    state.previousClauseContext = text.trim();
  }

  function transmitSimulatedOrManualPhrase(fullText, customSpeaker = null) {
    if (!fullText || !fullText.trim()) return;

    const speakerId = customSpeaker ? customSpeaker.id : state.clientId;
    const speakerName = customSpeaker ? customSpeaker.name : state.userName;
    const speakerLang = customSpeaker ? customSpeaker.lang : state.nativeLang;
    const isBot = !!customSpeaker;

    sendMessage({
      type: 'ptt_request',
      speakerId,
      speakerName,
      speakerLang,
      isBot
    });

    let checkAttempts = 0;
    const waitInterval = setInterval(() => {
      checkAttempts += 1;
      if (checkAttempts > 60) {
        clearInterval(waitInterval);
        return;
      }

      if (state.activeSpeaker && state.activeSpeaker.clientId === speakerId) {
        clearInterval(waitInterval);
        const clauses = splitIntoSemanticClauses(fullText.trim());
        let idx = 0;
        let prevCtx = '';

        function sendNextClause() {
          if (idx >= clauses.length) {
            setTimeout(() => {
              sendMessage({
                type: 'ptt_release',
                speakerId,
                reason: 'completed_clauses'
              });
            }, 350);
            return;
          }

          const clauseText = clauses[idx];
          sendMessage({
            type: 'interim_transcript',
            speakerId,
            speakerName,
            sourceLang: speakerLang,
            text: clauseText
          });

          setTimeout(() => {
            idx += 1;
            sendMessage({
              type: 'semantic_clause',
              speakerId,
              speakerName,
              sourceLang: speakerLang,
              text: clauseText,
              clauseIndex: idx,
              isFinalRelease: idx === clauses.length,
              previousContext: prevCtx
            });
            prevCtx = clauseText;
            setTimeout(sendNextClause, 950);
          }, 650);
        }

        sendNextClause();
      }
    }, 200);
  }

  function splitIntoSemanticClauses(text) {
    const parts = text.split(/(?<=[,;:.!?])\s+/);
    if (parts.length > 1) return parts;
    const words = text.split(/\s+/);
    if (words.length <= 7) return [text];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  // ==========================================================================
  // FIFO AUDIO PLAYBACK QUEUE (1.12x CATCH-UP)
  // ==========================================================================
  function enqueueFifoAudio(clauseEvent) {
    if (state.isHoldingPtt && clauseEvent.speakerId === state.clientId) return;

    const targetText =
      (clauseEvent.translations && clauseEvent.translations[state.nativeLang]) ||
      clauseEvent.originalText;

    state.fifoQueue.push({
      id: clauseEvent.clauseId,
      speakerName: clauseEvent.speakerName,
      text: targetText,
      lang: state.nativeLang
    });

    updateFifoQueueUi();
    processFifoQueue();
  }

  function processFifoQueue() {
    if (state.isPlayingFifo || state.fifoQueue.length === 0) {
      if (state.fifoQueue.length === 0) {
        state.currentPlaybackRate = 1.0;
        updateFifoQueueUi();
        updateTelemetryPills();
      }
      return;
    }

    state.isPlayingFifo = true;
    state.currentPlaybackRate = state.fifoQueue.length > 1 ? 1.12 : 1.0;
    const item = state.fifoQueue[0];

    updateFifoQueueUi();
    updateTelemetryPills();

    const bubbleEl = document.getElementById(`bubble-${item.id}`);
    if (bubbleEl) bubbleEl.classList.add('playing');

    const finishItem = () => {
      if (bubbleEl) bubbleEl.classList.remove('playing');
      state.fifoQueue.shift();
      state.isPlayingFifo = false;
      updateFifoQueueUi();
      processFifoQueue();
    };

    playConfirmationTone(480, 0.04);

    if ('speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance(item.text);
        utter.lang = item.lang;
        utter.rate = state.currentPlaybackRate;

        const voices = window.speechSynthesis.getVoices();
        const langPrefix = item.lang.split('-')[0].toLowerCase();
        const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
        if (matchedVoice) utter.voice = matchedVoice;

        let settled = false;
        const maxDurationMs = Math.min(5000, Math.max(1400, item.text.length * 55));
        const fallbackTimer = setTimeout(() => {
          if (!settled) {
            settled = true;
            finishItem();
          }
        }, maxDurationMs);

        utter.onend = () => {
          if (!settled) {
            settled = true;
            clearTimeout(fallbackTimer);
            finishItem();
          }
        };
        utter.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(fallbackTimer);
            finishItem();
          }
        };

        window.speechSynthesis.speak(utter);
        return;
      } catch (_) {}
    }

    setTimeout(finishItem, 1600);
  }

  function updateFifoQueueUi() {
    el('metric-fifo-depth').textContent = `${state.fifoQueue.length} chunk${state.fifoQueue.length === 1 ? '' : 's'}`;
    const speedEl = el('metric-playback-speed');
    speedEl.textContent = `${state.currentPlaybackRate.toFixed(2)}x`;
    speedEl.style.color = state.currentPlaybackRate > 1.01 ? 'var(--accent-amber)' : 'var(--accent-emerald)';

    const listEl = el('fifo-queue-visual');
    if (state.fifoQueue.length === 0) {
      listEl.innerHTML = `
        <div class="fifo-item" style="color: var(--text-muted);">
          <span>Fila de reprodução vazia</span>
          <span>Idle</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = state.fifoQueue.map((item, idx) => `
      <div class="fifo-item" style="border-color: ${idx === 0 ? 'var(--accent-emerald)' : 'var(--border-subtle)'};">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 190px;">
          ${idx === 0 ? '▶ ' : `#${idx + 1} `}${escapeHtml(item.text)}
        </span>
        <span style="color: ${idx === 0 ? 'var(--accent-emerald)' : 'var(--text-secondary)'};">
          ${idx === 0 ? `${state.currentPlaybackRate.toFixed(2)}x` : 'Fila'}
        </span>
      </div>
    `).join('');
  }

  function renderClauseBubble(clauseEvent, shouldPlayAudio = true) {
    const feed = el('transcript-feed');
    const placeholder = el('empty-feed-placeholder');
    if (placeholder) placeholder.remove();

    if (document.getElementById(`bubble-${clauseEvent.clauseId}`)) return;

    const myTranslation =
      (clauseEvent.translations && clauseEvent.translations[state.nativeLang]) ||
      clauseEvent.originalText;

    const srcMeta = LANG_LABELS[clauseEvent.sourceLang] || { flag: '🌐', short: clauseEvent.sourceLang };
    const tgtMeta = LANG_LABELS[state.nativeLang] || { flag: '🌐', short: state.nativeLang };
    const latencyMs = clauseEvent.telemetry ? clauseEvent.telemetry.totalPipelineMs : 420;

    const div = document.createElement('div');
    div.className = 'clause-bubble';
    div.id = `bubble-${clauseEvent.clauseId}`;
    div.innerHTML = `
      <div class="clause-header">
        <span class="clause-speaker">
          <span>${srcMeta.flag} ${escapeHtml(clauseEvent.speakerName)}</span>
          <span class="lang-pill">Cláusula #${clauseEvent.clauseIndex || 1}</span>
        </span>
        <span class="clause-latency">⚡ TTFB ${latencyMs}ms • Fan-out ${clauseEvent.telemetry ? clauseEvent.telemetry.uniqueLangsComputed : 3} idioma(s)</span>
      </div>
      <div class="clause-translated">${tgtMeta.flag} ${escapeHtml(myTranslation)}</div>
      <div class="clause-original">Original (${srcMeta.short}): "${escapeHtml(clauseEvent.originalText)}"</div>
    `;

    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;

    if (shouldPlayAudio) {
      enqueueFifoAudio(clauseEvent);
    }
  }

  function syncRoomUi() {
    el('header-room-tier-badge').textContent =
      state.roomTier === 'pro' ? 'PASSE PRO HD' : 'TRIAL GRÁTIS';

    el('participant-count-badge').textContent = `${state.participants.length} online`;
    const pList = el('participants-list');
    pList.innerHTML = state.participants.map(p => {
      const isSpeaking = state.activeSpeaker && state.activeSpeaker.clientId === p.id;
      const langMeta = LANG_LABELS[p.lang] || { flag: '🌐', short: p.lang };
      const modeIcon = p.audioMode === 'speaker' ? '🔊' : '🎧';
      return `
        <div class="participant-row ${isSpeaking ? 'speaking' : ''}">
          <div class="participant-meta">
            <span>${modeIcon}</span>
            <span style="font-weight: ${p.id === state.clientId ? '700' : '500'};">
              ${escapeHtml(p.name)}${p.id === state.clientId ? ' (Você)' : ''}
            </span>
          </div>
          <span class="lang-pill">${langMeta.flag} ${langMeta.short}</span>
        </div>
      `;
    }).join('');

    const floorBar = el('floor-status-bar');
    const floorText = el('floor-status-text');
    const gateBadge = el('acoustic-gate-badge');
    const hasSpeakerOnTable = state.participants.some(p => p.audioMode === 'speaker');
    gateBadge.textContent = hasSpeakerOnTable ? '🔊 Gate Anti-Eco: 650ms' : '🎧 Gate Rápido: 120ms';

    if (state.activeSpeaker) {
      floorBar.className = 'floor-status-bar busy';
      const isMe = state.activeSpeaker.clientId === state.clientId;
      floorText.textContent = isMe
        ? '🎙️ Você está com a palavra — Fale agora (Fatiamento semântico ativo)'
        : `🔴 ${state.activeSpeaker.name} (${state.activeSpeaker.lang}) está falando...`;
    } else {
      floorBar.className = 'floor-status-bar';
      floorText.textContent = '🟢 Canal Livre — Segure o botão PTT para falar';
    }

    const qStrip = el('speaker-queue-strip');
    if (state.speakerQueue && state.speakerQueue.length > 0) {
      qStrip.classList.remove('hidden');
      const names = state.speakerQueue.map((q, i) => `#${i + 1} ${q.name}`).join(', ');
      el('speaker-queue-text').textContent = `✋ Fila de Fala Automática: ${names}`;
      el('speaker-queue-count').textContent = `${state.speakerQueue.length} aguardando`;
    } else {
      qStrip.classList.add('hidden');
    }

    syncPttButtonUi();
    updateUnitEconomicsUi();
  }

  function syncPttButtonUi() {
    const btn = el('btn-ptt');
    const mainTxt = el('ptt-main-text');
    const subTxt = el('ptt-sub-text');

    const isMeSpeaking = state.activeSpeaker && state.activeSpeaker.clientId === state.clientId;
    const myQueueIndex = state.speakerQueue.findIndex(q => q.clientId === state.clientId);

    if (isMeSpeaking || state.isHoldingPtt) {
      btn.className = 'ptt-button transmitting';
      mainTxt.textContent = 'TRANSMITINDO AO VIVO (SOLTE PARA LIBERAR)';
      subTxt.textContent = 'Enviando cláusulas semânticas em tempo real...';
    } else if (myQueueIndex !== -1 || state.isQueuedForFloor) {
      btn.className = 'ptt-button queued';
      mainTxt.textContent = `✋ NA FILA DE ESPERA (POSIÇÃO #${myQueueIndex + 1 || 1})`;
      subTxt.textContent = 'Seu microfone abrirá automaticamente assim que a fala atual terminar';
    } else if (state.activeSpeaker) {
      btn.className = 'ptt-button';
      mainTxt.textContent = `✋ ENTRAR NA FILA (${state.activeSpeaker.name.split(' ')[0]} FALANDO)`;
      subTxt.textContent = 'Canal ocupado por Mutex • Toque para reservar a próxima fala';
    } else {
      btn.className = 'ptt-button';
      mainTxt.textContent = 'SEGURE PARA FALAR (PUSH-TO-TALK)';
      subTxt.textContent = 'Ou mantenha ESPAÇO pressionado • Fatiamento semântico ativo';
    }
  }

  function updateUnitEconomicsUi() {
    el('metric-unique-langs').textContent = `${state.uniqueLanguages.length} idioma(s)`;
    el('metric-fanout-saved').textContent = `${state.stats.fanOutSavingsCount || 0} streams`;
    el('metric-session-cost').textContent = `$${(state.stats.estimatedApiCostUsd || 0).toFixed(4)}`;

    const engineLabel = el('econ-tts-engine-label');
    const marginLabel = el('econ-margin-label');
    if (state.roomTier === 'pro') {
      engineLabel.textContent = 'Neural Cloud HD ($0.025/min/idioma)';
      engineLabel.style.color = 'var(--accent-amber)';
      marginLabel.textContent = '82.4%';
    } else {
      engineLabel.textContent = 'OS Nativo Local ($0.00/min TTS)';
      engineLabel.style.color = 'var(--accent-emerald)';
      marginLabel.textContent = '96.8%';
    }
  }

  setInterval(() => {
    const badge = el('floor-timer-badge');
    if (!badge) return;
    if (state.activeSpeaker && state.activeSpeaker.startedAt) {
      const elapsed = Math.min(45, Math.floor((Date.now() - state.activeSpeaker.startedAt) / 1000));
      const secStr = String(elapsed).padStart(2, '0');
      badge.textContent = `00:${secStr} / 00:45`;
    } else {
      badge.textContent = '00:00 / 00:45';
    }
  }, 500);

  async function enterRoom(e) {
    if (e) e.preventDefault();
    state.userName = el('input-user-name').value.trim() || 'Participante';
    state.roomId = (el('input-room-code').value.trim() || 'OMNI-2026').toUpperCase();
    state.nativeLang = el('select-native-lang').value;
    state.inRoom = true;

    el('select-inroom-lang').value = state.nativeLang;
    el('select-inroom-acoustics').value = state.audioMode;
    el('room-code-label').textContent = state.roomId;

    await unlockIosAudioAndWakeLock();
    renderRoomQrCode(state.roomId);

    el('view-onboarding').classList.add('hidden');
    el('view-room').classList.remove('hidden');

    connectWebSocket();
  }

  function bindEvents() {
    el('form-join-room').addEventListener('submit', enterRoom);

    ['btn-mode-headphones', 'btn-mode-speaker'].forEach((id) => {
      el(id).addEventListener('click', () => {
        el('btn-mode-headphones').classList.remove('active');
        el('btn-mode-speaker').classList.remove('active');
        el(id).classList.add('active');
        state.audioMode = el(id).dataset.mode;
      });
    });

    ['btn-tier-trial', 'btn-tier-pro'].forEach((id) => {
      el(id).addEventListener('click', () => {
        el('btn-tier-trial').classList.remove('active');
        el('btn-tier-pro').classList.remove('active');
        el(id).classList.add('active');
        state.roomTier = el(id).dataset.tier;
      });
    });

    el('btn-restore-ios-audio').addEventListener('click', unlockIosAudioAndWakeLock);

    el('btn-leave-room').addEventListener('click', () => {
      if (state.ws) state.ws.close();
      state.inRoom = false;
      el('view-room').classList.add('hidden');
      el('view-onboarding').classList.remove('hidden');
    });

    el('btn-open-second-tab').addEventListener('click', () => {
      const secondTabUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(state.roomId)}&lang=en-US&name=${encodeURIComponent('Alex (Ouvinte EN)')}&autojoin=1`;
      window.open(secondTabUrl, '_blank');
    });

    el('btn-copy-room-link').addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(state.roomId)}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      el('copy-link-text').textContent = 'Copiado!';
      setTimeout(() => {
        el('copy-link-text').textContent = 'Copiar Link';
      }, 1800);
    });

    el('select-inroom-lang').addEventListener('change', (ev) => {
      state.nativeLang = ev.target.value;
      sendMessage({ type: 'update_participant', lang: state.nativeLang });
    });

    el('select-inroom-acoustics').addEventListener('change', (ev) => {
      state.audioMode = ev.target.value;
      sendMessage({ type: 'update_participant', audioMode: state.audioMode });
    });

    const pttBtn = el('btn-ptt');
    pttBtn.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      requestPushToTalk();
    });
    window.addEventListener('mouseup', () => {
      if (state.isHoldingPtt) releasePushToTalk();
    });

    pttBtn.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      requestPushToTalk();
    }, { passive: false });
    pttBtn.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      if (state.isHoldingPtt) releasePushToTalk();
    }, { passive: false });

    window.addEventListener('keydown', (ev) => {
      if (ev.code === 'Space' && state.inRoom && document.activeElement.tagName !== 'INPUT') {
        ev.preventDefault();
        if (!ev.repeat) requestPushToTalk();
      }
    });
    window.addEventListener('keyup', (ev) => {
      if (ev.code === 'Space' && state.inRoom && document.activeElement.tagName !== 'INPUT') {
        ev.preventDefault();
        if (state.isHoldingPtt) releasePushToTalk();
      }
    });

    document.querySelectorAll('.phrase-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        transmitSimulatedOrManualPhrase(chip.getAttribute('data-phrase'));
      });
    });

    el('btn-send-manual-speech').addEventListener('click', () => {
      const input = el('input-manual-speech');
      if (input.value.trim()) {
        transmitSimulatedOrManualPhrase(input.value.trim());
        input.value = '';
      }
    });
    el('input-manual-speech').addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        el('btn-send-manual-speech').click();
      }
    });

    el('btn-sim-sarah').addEventListener('click', () => {
      transmitSimulatedOrManualPhrase(
        'Excellent point regarding the Safari screen lock issue on the iPhone. Because we fan out per unique language rather than per user, the cost stays fixed at three streams.',
        { id: 'bot-sarah-en', name: 'Sarah (US Investor)', lang: 'en-US' }
      );
    });

    el('btn-sim-mateo').addEventListener('click', () => {
      transmitSimulatedOrManualPhrase(
        'Estoy de acuerdo con los términos comerciales, pero necesitamos validar la acústica en la mesa. Podemos cerrar el contrato piloto esta misma semana si pasan las pruebas de latencia.',
        { id: 'bot-mateo-es', name: 'Mateo (Director ES)', lang: 'es-ES' }
      );
    });

    el('btn-sim-collision').addEventListener('click', () => {
      transmitSimulatedOrManualPhrase(
        'What is the cost per minute for a room with thirty participants across three languages?',
        { id: 'bot-sarah-en', name: 'Sarah (US Investor)', lang: 'en-US' }
      );
      setTimeout(() => {
        transmitSimulatedOrManualPhrase(
          'Como distribuimos por idioma único y no por usuario, el costo se mantiene fijo en tres flujos.',
          { id: 'bot-mateo-es', name: 'Mateo (Director ES)', lang: 'es-ES' }
        );
      }, 350);
      setTimeout(() => {
        transmitSimulatedOrManualPhrase(
          '遅延テストに合格すれば、今週中にパイロット契約を締結できます。',
          { id: 'bot-kenji-ja', name: 'Kenji (VP Tokyo)', lang: 'ja-JP' }
        );
      }, 700);
    });

    el('btn-test-local-tts').addEventListener('click', () => {
      const sampleByLang = {
        'pt-BR': 'Canal de voz do Omnivox ativo e calibrado em Português.',
        'en-US': 'Omnivox voice channel active and calibrated in English.',
        'es-ES': 'Canal de voz de Omnivox activo y calibrado en Español.',
        'fr-FR': 'Canal vocal Omnivox actif et calibré en Français.',
        'de-DE': 'Omnivox-Sprachkanal aktiv und auf Deutsch kalibriert.',
        'ja-JP': 'Omnivox音声チャンネルが日本語で有効化されました。'
      };
      enqueueFifoAudio({
        clauseId: `test-${Date.now()}`,
        speakerId: 'system',
        speakerName: 'Sistema Omnivox',
        originalText: sampleByLang[state.nativeLang] || sampleByLang['pt-BR'],
        translations: sampleByLang
      });
    });

    el('btn-toggle-tier').addEventListener('click', () => {
      const nextTier = state.roomTier === 'pro' ? 'trial' : 'pro';
      sendMessage({ type: 'upgrade_room_tier', tier: nextTier });
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
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
    initFromUrlParams();
    updateTelemetryPills();
  });
})();
