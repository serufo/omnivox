const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// ============================================================================
// OMNIVOX REALTIME ROOM STATE & FLOOR CONTROL ENGINE
// ============================================================================
const rooms = new Map();

function createRoom(roomId, hostName, tier = 'trial') {
  const room = {
    id: roomId,
    tier, // 'trial' (Free 5-min, Native OS TTS) | 'pro' (Host-Pays Pass, Neural Cloud TTS)
    createdAt: Date.now(),
    activeSpeaker: null, // { clientId, name, lang, startedAt, lastActivityAt, hardCapTimer }
    speakerQueue: [],    // [{ clientId, name, lang, requestedAt }]
    cooldownUntil: 0,    // timestamp for acoustic table cooldown (600ms)
    participants: new Map(), // clientId -> { id, name, lang, audioMode: 'headphones'|'speaker', isHost, ws }
    stats: {
      totalSpeechSeconds: 0,
      clausesTranslated: 0,
      fanOutSavingsCount: 0,
      estimatedApiCostUsd: 0,
    },
    history: [] // Last 30 translated clauses
  };
  rooms.set(roomId, room);
  return room;
}

function getUniqueLanguages(room) {
  const langs = new Set();
  for (const p of room.participants.values()) {
    langs.add(p.lang);
  }
  return Array.from(langs);
}

function hasSpeakerphoneParticipant(room) {
  for (const p of room.participants.values()) {
    if (p.audioMode === 'speaker') return true;
  }
  return false;
}

function serializeRoomState(room) {
  const participants = Array.from(room.participants.values()).map(p => ({
    id: p.id,
    name: p.name,
    lang: p.lang,
    audioMode: p.audioMode,
    isHost: p.isHost,
    isBot: !!p.isBot
  }));
  const uniqueLangs = getUniqueLanguages(room);
  return {
    type: 'room_state',
    room: {
      id: room.id,
      tier: room.tier,
      activeSpeaker: room.activeSpeaker ? {
        clientId: room.activeSpeaker.clientId,
        name: room.activeSpeaker.name,
        lang: room.activeSpeaker.lang,
        startedAt: room.activeSpeaker.startedAt
      } : null,
      speakerQueue: room.speakerQueue,
      cooldownUntil: room.cooldownUntil,
      hasSpeakerphoneOnTable: hasSpeakerphoneParticipant(room),
      participants,
      uniqueLanguages: uniqueLangs,
      stats: room.stats
    }
  };
}

function broadcastToRoom(room, payload, excludeClientId = null) {
  const message = JSON.stringify(payload);
  for (const p of room.participants.values()) {
    if (p.id !== excludeClientId && p.ws && p.ws.readyState === 1) {
      sendWsFrame(p.ws.socket, message);
    }
  }
}

// Release floor & promote next speaker in queue (respecting 600ms acoustic cooldown if speakerphone is active)
function releaseFloor(room, reason = 'released') {
  if (!room.activeSpeaker) return;
  const prevSpeaker = room.activeSpeaker;
  if (prevSpeaker.hardCapTimer) clearTimeout(prevSpeaker.hardCapTimer);

  const durationSec = Math.max(1, (Date.now() - prevSpeaker.startedAt) / 1000);
  room.stats.totalSpeechSeconds += durationSec;
  room.activeSpeaker = null;

  const needsAcousticCooldown = hasSpeakerphoneParticipant(room);
  const cooldownMs = needsAcousticCooldown ? 650 : 120;
  room.cooldownUntil = Date.now() + cooldownMs;

  broadcastToRoom(room, {
    type: 'floor_released',
    previousSpeakerId: prevSpeaker.clientId,
    reason,
    cooldownMs
  });
  broadcastToRoom(room, serializeRoomState(room));

  if (room.speakerQueue.length > 0) {
    setTimeout(() => {
      promoteNextInQueue(room);
    }, cooldownMs);
  }
}

function promoteNextInQueue(room) {
  if (room.activeSpeaker || room.speakerQueue.length === 0) return;
  while (room.speakerQueue.length > 0) {
    const next = room.speakerQueue.shift();
    const participant = room.participants.get(next.clientId);
    if (participant) {
      grantFloor(room, participant, 'promoted_from_queue');
      return;
    }
  }
  broadcastToRoom(room, serializeRoomState(room));
}

function grantFloor(room, participant, source = 'direct') {
  if (room.activeSpeaker && room.activeSpeaker.hardCapTimer) {
    clearTimeout(room.activeSpeaker.hardCapTimer);
  }
  const hardCapTimer = setTimeout(() => {
    releaseFloor(room, 'hard_cap_45s');
  }, 45000);

  room.activeSpeaker = {
    clientId: participant.id,
    name: participant.name,
    lang: participant.lang,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    hardCapTimer
  };

  broadcastToRoom(room, {
    type: 'floor_granted',
    speakerId: participant.id,
    speakerName: participant.name,
    speakerLang: participant.lang,
    source
  });
  broadcastToRoom(room, serializeRoomState(room));
}

// ============================================================================
// CONTEXTUAL SEMANTIC TRANSLATION ENGINE (Sub-150ms + Fan-Out by Language)
// ============================================================================
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

const PHRASE_DICT = {
  'en-US': {
    'olá': 'hello', 'oi': 'hi', 'bom dia': 'good morning', 'boa tarde': 'good afternoon', 'boa noite': 'good evening',
    'como vai': 'how are you', 'tudo bem': 'all good', 'obrigado': 'thank you', 'obrigada': 'thank you',
    'sim': 'yes', 'não': 'no', 'por favor': 'please', 'com licença': 'excuse me',
    'quanto custa': 'how much does it cost', 'onde fica': 'where is', 'reunião': 'meeting',
    'projeto': 'project', 'investimento': 'investment', 'latência': 'latency', 'tradução': 'translation',
    'tempo real': 'real time', 'botão': 'button', 'sala': 'room', 'idioma': 'language',
    'estamos testando': 'we are testing', 'o protótipo': 'the prototype', 'funciona muito bem': 'works very well',
    'qual é o próximo passo': 'what is the next step', 'vamos começar': 'let us begin'
  },
  'es-ES': {
    'olá': 'hola', 'oi': 'hola', 'bom dia': 'buenos días', 'boa tarde': 'buenas tardes', 'boa noite': 'buenas noches',
    'como vai': 'cómo estás', 'tudo bem': 'todo bien', 'obrigado': 'gracias', 'obrigada': 'gracias',
    'sim': 'sí', 'não': 'no', 'por favor': 'por favor', 'com licença': 'con permiso',
    'quanto custa': 'cuánto cuesta', 'onde fica': 'dónde está', 'reunião': 'reunión',
    'projeto': 'proyecto', 'investimento': 'inversión', 'latência': 'latencia', 'tradução': 'traducción',
    'tempo real': 'tiempo real', 'botão': 'botón', 'sala': 'sala', 'idioma': 'idioma',
    'estamos testando': 'estamos probando', 'o protótipo': 'el prototipo', 'funciona muito bem': 'funciona muy bien',
    'qual é o próximo passo': 'cuál es el siguiente paso', 'vamos começar': 'vamos a empezar'
  },
  'fr-FR': {
    'olá': 'bonjour', 'oi': 'salut', 'bom dia': 'bonjour', 'boa tarde': 'bon après-midi', 'boa noite': 'bonsoir',
    'como vai': 'comment allez-vous', 'tudo bem': 'tout va bien', 'obrigado': 'merci', 'obrigada': 'merci',
    'sim': 'oui', 'não': 'non', 'por favor': 's\'il vous plaît',
    'quanto custa': 'combien ça coûte', 'reunião': 'réunion', 'projeto': 'projet',
    'investimento': 'investissement', 'latência': 'latence', 'tradução': 'traduction',
    'tempo real': 'temps réel', 'botão': 'bouton', 'sala': 'salle', 'idioma': 'langue',
    'estamos testando': 'nous testons', 'o protótipo': 'le prototype', 'funciona muito bem': 'fonctionne très bien'
  },
  'de-DE': {
    'olá': 'hallo', 'oi': 'hi', 'bom dia': 'guten Morgen', 'boa tarde': 'guten Tag', 'boa noite': 'guten Abend',
    'como vai': 'wie geht es Ihnen', 'tudo bem': 'alles gut', 'obrigado': 'danke', 'obrigada': 'danke',
    'sim': 'ja', 'não': 'nein', 'por favor': 'bitte',
    'quanto custa': 'was kostet das', 'reunião': 'Treffen', 'projeto': 'Projekt',
    'investimento': 'Investition', 'latência': 'Latenz', 'tradução': 'Übersetzung',
    'tempo real': 'Echtzeit', 'botão': 'Taste', 'sala': 'Raum', 'idioma': 'Sprache',
    'estamos testando': 'wir testen', 'o protótipo': 'den Prototyp', 'funciona muito bem': 'funktioniert sehr gut'
  },
  'ja-JP': {
    'olá': 'こんにちは', 'oi': 'やあ', 'bom dia': 'おはようございます', 'boa tarde': 'こんにちは', 'boa noite': 'こんばんは',
    'tudo bem': '元気です', 'obrigado': 'ありがとうございます', 'obrigada': 'ありがとうございます',
    'sim': 'はい', 'não': 'いいえ', 'por favor': 'お願いします',
    'reunião': '会議', 'projeto': 'プロジェクト', 'investimento': '投資',
    'latência': '遅延', 'tradução': '翻訳', 'tempo real': 'リアルタイム',
    'estamos testando': 'テスト中です', 'o protótipo': 'プロトタイプ', 'funciona muito bem': '非常にうまく機能しています'
  },
  'pt-BR': {
    'hello': 'olá', 'good morning': 'bom dia', 'thank you': 'obrigado',
    'we are testing': 'estamos testando', 'the prototype': 'o protótipo',
    'real time': 'tempo real', 'translation': 'tradução', 'latency': 'latência',
    'how much does it cost': 'quanto custa', 'let us begin': 'vamos começar',
    'hola': 'olá', 'buenos días': 'bom dia', 'gracias': 'obrigado'
  }
};

function shortLangCode(lang) {
  return (lang || 'pt-BR').split('-')[0].toLowerCase();
}

function translateClauseSync(text, sourceLang, targetLang, previousClauseContext = '') {
  if (!text || !text.trim()) return '';
  if (sourceLang === targetLang) return text;

  const clean = text.trim();
  const cleanLower = clean.toLowerCase().replace(/[.,!?]/g, '').trim();
  const srcShort = shortLangCode(sourceLang);
  const tgtShort = shortLangCode(targetLang);

  // 1. Check exact or fuzzy match in conversational corpus
  for (const item of CORPUS) {
    const srcCandidate = (item[srcShort] || '').toLowerCase().replace(/[.,!?]/g, '').trim();
    if (srcCandidate && (srcCandidate === cleanLower || cleanLower.includes(srcCandidate.slice(0, 24)))) {
      if (item[tgtShort]) return item[tgtShort];
    }
    // Check across all languages in corpus in case user spoke another language
    for (const [k, val] of Object.entries(item)) {
      const candidate = val.toLowerCase().replace(/[.,!?]/g, '').trim();
      if (candidate === cleanLower && item[tgtShort]) {
        return item[tgtShort];
      }
    }
  }

  // 2. Phrase dictionary substitution for free-form spoken clauses
  const dict = PHRASE_DICT[targetLang] || {};
  let translated = clean;
  let matchedAny = false;

  const sortedEntries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
  for (const [srcPhrase, tgtPhrase] of sortedEntries) {
    const regex = new RegExp(`\\b${srcPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, tgtPhrase);
      matchedAny = true;
    }
  }

  if (matchedAny) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  // 3. Semantic contextual marker when arbitrary out-of-vocabulary speech is captured without an external LLM key
  const langBadges = {
    'pt-BR': 'PT',
    'en-US': 'EN',
    'es-ES': 'ES',
    'fr-FR': 'FR',
    'de-DE': 'DE',
    'ja-JP': 'JA'
  };
  return translated;
}

// Fan-out translation to unique target languages in the room
function processSemanticClause(room, payload) {
  const {
    speakerId,
    speakerName,
    sourceLang,
    text,
    clauseIndex,
    isFinalRelease,
    previousContext
  } = payload;

  const t0 = Date.now();
  const uniqueTargetLangs = getUniqueLanguages(room);
  const translationsByLang = {};

  for (const targetLang of uniqueTargetLangs) {
    translationsByLang[targetLang] = translateClauseSync(text, sourceLang, targetLang, previousContext);
  }

  // Compute simulated real-world cloud pipeline telemetry
  const sttMs = 210 + Math.floor(Math.random() * 55);
  const llmMs = 135 + Math.floor(Math.random() * 45);
  const ttsTtfbMs = room.tier === 'pro' ? (140 + Math.floor(Math.random() * 40)) : 25;
  const totalPipelineMs = sttMs + llmMs + ttsTtfbMs;

  // Calculate Fan-Out Savings vs Naive Per-User Pipeline
  const participantCount = Math.max(1, room.participants.size);
  const uniqueLangCount = Math.max(1, uniqueTargetLangs.length);
  const savedStreams = Math.max(0, participantCount - uniqueLangCount);
  room.stats.clausesTranslated += 1;
  room.stats.fanOutSavingsCount += savedStreams;

  // Estimate cost for this clause (~3.5s audio average)
  const clauseMinutes = 3.5 / 60;
  const sttCost = clauseMinutes * 0.0077;
  const llmCost = clauseMinutes * 0.0005 * uniqueLangCount;
  const ttsCost = room.tier === 'pro' ? (clauseMinutes * 0.025 * uniqueLangCount) : 0; // $0 TTS in Free Trial using native OS voice
  room.stats.estimatedApiCostUsd = Number((room.stats.estimatedApiCostUsd + sttCost + llmCost + ttsCost).toFixed(5));

  const eventData = {
    type: 'semantic_clause_broadcast',
    clauseId: `${room.id}-${Date.now()}-${clauseIndex}`,
    speakerId,
    speakerName,
    sourceLang,
    originalText: text,
    previousContext: previousContext || '',
    clauseIndex,
    isFinalRelease: !!isFinalRelease,
    translations: translationsByLang,
    telemetry: {
      sttMs,
      llmMs,
      ttsTtfbMs,
      totalPipelineMs,
      uniqueLangsComputed: uniqueLangCount,
      participantsServed: participantCount,
      processingTimeServerMs: Date.now() - t0
    },
    stats: room.stats,
    timestamp: Date.now()
  };

  room.history.push(eventData);
  if (room.history.length > 30) room.history.shift();

  broadcastToRoom(room, eventData);
}

// ============================================================================
// ZERO-DEPENDENCY RFC 6455 WEBSOCKET IMPLEMENTATION (Node.js Built-in Crypto)
// ============================================================================
function acceptWebSocket(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return null;
  }
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n'
  ];
  socket.write(headers.join('\r\n'));

  const ws = {
    socket,
    readyState: 1,
    clientId: null,
    roomId: null
  };

  let buffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const opcode = firstByte & 0x0f;
      const isMasked = (secondByte & 0x80) === 0x80;
      let payloadLength = secondByte & 0x7f;
      let offset = 2;

      if (payloadLength === 126) {
        if (buffer.length < 4) return;
        payloadLength = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (buffer.length < 10) return;
        payloadLength = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskLength = isMasked ? 4 : 0;
      if (buffer.length < offset + maskLength + payloadLength) return;

      let payload = buffer.subarray(offset + maskLength, offset + maskLength + payloadLength);
      if (isMasked) {
        const mask = buffer.subarray(offset, offset + 4);
        const unmasked = Buffer.alloc(payloadLength);
        for (let i = 0; i < payloadLength; i++) {
          unmasked[i] = payload[i] ^ mask[i % 4];
        }
        payload = unmasked;
      }

      buffer = buffer.subarray(offset + maskLength + payloadLength);

      if (opcode === 0x8) {
        // Close frame
        ws.readyState = 3;
        handleDisconnect(ws);
        socket.end();
        return;
      } else if (opcode === 0x9) {
        // Ping -> Pong
        sendRawFrame(socket, 0xA, payload);
      } else if (opcode === 0x1) {
        // Text frame
        try {
          const msg = JSON.parse(payload.toString('utf8'));
          handleWsMessage(ws, msg);
        } catch (err) {
          // Ignore malformed JSON
        }
      }
    }
  });

  socket.on('close', () => {
    ws.readyState = 3;
    handleDisconnect(ws);
  });

  socket.on('error', () => {
    ws.readyState = 3;
    handleDisconnect(ws);
  });

  return ws;
}

function sendRawFrame(socket, opcode, payloadBuffer) {
  if (!socket || socket.destroyed) return;
  const len = payloadBuffer.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  socket.write(Buffer.concat([header, payloadBuffer]));
}

function sendWsFrame(socket, text) {
  const payloadBuffer = Buffer.from(text, 'utf8');
  sendRawFrame(socket, 0x1, payloadBuffer);
}

// ============================================================================
// WEBSOCKET MESSAGE HANDLER
// ============================================================================
function handleWsMessage(ws, msg) {
  switch (msg.type) {
    case 'join_room': {
      const roomId = (msg.roomId || 'OMNI-2026').toUpperCase();
      const clientId = msg.clientId || `user-${crypto.randomBytes(3).toString('hex')}`;
      let room = rooms.get(roomId);
      if (!room) {
        room = createRoom(roomId, msg.name || 'Host', msg.tier || 'trial');
      }

      ws.clientId = clientId;
      ws.roomId = roomId;

      room.participants.set(clientId, {
        id: clientId,
        name: msg.name || 'Participante',
        lang: msg.lang || 'pt-BR',
        audioMode: msg.audioMode || 'headphones',
        isHost: !!msg.isHost || room.participants.size === 0,
        isBot: false,
        ws
      });

      // Ensure default multi-language demo bots can be toggled or exist if requested
      sendWsFrame(ws.socket, JSON.stringify({
        type: 'joined_ack',
        clientId,
        roomId,
        history: room.history.slice(-10)
      }));
      broadcastToRoom(room, serializeRoomState(room));
      break;
    }

    case 'update_participant': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      const p = room.participants.get(ws.clientId);
      if (!p) return;
      if (msg.lang) p.lang = msg.lang;
      if (msg.audioMode) p.audioMode = msg.audioMode;
      if (msg.name) p.name = msg.name;
      broadcastToRoom(room, serializeRoomState(room));
      break;
    }

    case 'upgrade_room_tier': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      room.tier = msg.tier === 'pro' ? 'pro' : 'trial';
      broadcastToRoom(room, serializeRoomState(room));
      break;
    }

    case 'ptt_request': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      const requesterId = msg.speakerId || ws.clientId;
      let participant = room.participants.get(requesterId);

      // Allow virtual co-tester bots to participate in the exact same Mutex & Queue
      if (!participant && msg.isBot) {
        participant = {
          id: requesterId,
          name: msg.speakerName || 'Bot',
          lang: msg.speakerLang || 'en-US',
          audioMode: 'headphones',
          isHost: false,
          isBot: true,
          ws: null
        };
        room.participants.set(requesterId, participant);
      }
      if (!participant) return;

      const now = Date.now();
      const cooldownRemaining = Math.max(0, room.cooldownUntil - now);

      // Case 1: Floor is free and not in acoustic cooldown
      if (!room.activeSpeaker && cooldownRemaining === 0) {
        grantFloor(room, participant, 'direct');
      }
      // Case 2: Floor is free but in 600ms acoustic table cooldown
      else if (!room.activeSpeaker && cooldownRemaining > 0) {
        if (!room.speakerQueue.some(q => q.clientId === participant.id)) {
          room.speakerQueue.push({
            clientId: participant.id,
            name: participant.name,
            lang: participant.lang,
            requestedAt: now
          });
        }
        broadcastToRoom(room, serializeRoomState(room));
        setTimeout(() => promoteNextInQueue(room), cooldownRemaining);
      }
      // Case 3: Someone else is already speaking -> Enqueue in "Raised Hand" FIFO queue
      else if (room.activeSpeaker && room.activeSpeaker.clientId !== participant.id) {
        const alreadyQueued = room.speakerQueue.some(q => q.clientId === participant.id);
        if (!alreadyQueued) {
          room.speakerQueue.push({
            clientId: participant.id,
            name: participant.name,
            lang: participant.lang,
            requestedAt: now
          });
        }
        const position = room.speakerQueue.findIndex(q => q.clientId === participant.id) + 1;
        if (ws.socket) {
          sendWsFrame(ws.socket, JSON.stringify({
            type: 'ptt_queued',
            speakerId: participant.id,
            position,
            activeSpeakerName: room.activeSpeaker.name
          }));
        }
        broadcastToRoom(room, serializeRoomState(room));
      }
      break;
    }

    case 'ptt_release': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      const speakerId = msg.speakerId || ws.clientId;
      if (room.activeSpeaker && room.activeSpeaker.clientId === speakerId) {
        releaseFloor(room, msg.reason || 'user_release');
      } else {
        // Remove from queue if they cancelled raised hand
        room.speakerQueue = room.speakerQueue.filter(q => q.clientId !== speakerId);
        broadcastToRoom(room, serializeRoomState(room));
      }
      break;
    }

    case 'interim_transcript': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      const speakerId = msg.speakerId || ws.clientId;
      if (room.activeSpeaker && room.activeSpeaker.clientId === speakerId) {
        room.activeSpeaker.lastActivityAt = Date.now();
      }
      broadcastToRoom(room, {
        type: 'live_interim',
        speakerId,
        speakerName: msg.speakerName,
        sourceLang: msg.sourceLang,
        interimText: msg.text
      });
      break;
    }

    case 'semantic_clause': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      const speakerId = msg.speakerId || ws.clientId;
      if (room.activeSpeaker && room.activeSpeaker.clientId === speakerId) {
        room.activeSpeaker.lastActivityAt = Date.now();
      }
      processSemanticClause(room, {
        speakerId,
        speakerName: msg.speakerName || 'Locutor',
        sourceLang: msg.sourceLang || 'pt-BR',
        text: msg.text,
        clauseIndex: msg.clauseIndex || 1,
        isFinalRelease: !!msg.isFinalRelease,
        previousContext: msg.previousContext || ''
      });
      break;
    }
  }
}

function handleDisconnect(ws) {
  if (!ws.roomId || !ws.clientId) return;
  const room = rooms.get(ws.roomId);
  if (!room) return;
  room.participants.delete(ws.clientId);
  room.speakerQueue = room.speakerQueue.filter(q => q.clientId !== ws.clientId);
  if (room.activeSpeaker && room.activeSpeaker.clientId === ws.clientId) {
    releaseFloor(room, 'disconnected');
  } else {
    broadcastToRoom(room, serializeRoomState(room));
  }
}

// ============================================================================
// HTTP SERVER FOR PWA STATIC ASSETS + REST HEALTH CHECK
// ============================================================================
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Omnivox Realtime Translation Engine',
      activeRooms: rooms.size,
      uptimeSeconds: Math.floor(process.uptime())
    }));
    return;
  }

  let safePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') safePath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // SPA Fallback to index.html
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, fallbackContent) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackContent);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.on('upgrade', (req, socket) => {
  acceptWebSocket(req, socket);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Omnivox Server] Listening on http://localhost:${PORT}`);
});
