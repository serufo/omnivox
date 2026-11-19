(() => {
  'use strict';

  const APP_VERSION = 'v0.10';
  const THEME_STORAGE_KEY = 'app_ui_theme';

  // ==========================================================================
  // 1. COMPLETE 50-LANGUAGE GLOBAL CATALOG (BCP-47 + REGIONS + SAMPLES)
  // ==========================================================================
  const LANGUAGES_CATALOG = [
    // Americas & Europe (28 languages/dialects)
    { code: 'pt-BR', flag: '🇧🇷', nativeName: 'Português (Brasil)', ptName: 'Português do Brasil', short: 'PT-BR', iso: 'pt', region: 'americas_europe' },
    { code: 'pt-PT', flag: '🇵🇹', nativeName: 'Português (Portugal)', ptName: 'Português Europeu', short: 'PT-PT', iso: 'pt', region: 'americas_europe' },
    { code: 'en-US', flag: '🇺🇸', nativeName: 'English (US)', ptName: 'Inglês (EUA)', short: 'EN-US', iso: 'en', region: 'americas_europe' },
    { code: 'en-GB', flag: '🇬🇧', nativeName: 'English (UK)', ptName: 'Inglês (Reino Unido)', short: 'EN-GB', iso: 'en', region: 'americas_europe' },
    { code: 'en-CA', flag: '🇨🇦', nativeName: 'English (Canada)', ptName: 'Inglês (Canadá)', short: 'EN-CA', iso: 'en', region: 'americas_europe' },
    { code: 'es-ES', flag: '🇪🇸', nativeName: 'Español (España)', ptName: 'Espanhol (Espanha)', short: 'ES-ES', iso: 'es', region: 'americas_europe' },
    { code: 'es-MX', flag: '🇲🇽', nativeName: 'Español (México)', ptName: 'Espanhol (México)', short: 'ES-MX', iso: 'es', region: 'americas_europe' },
    { code: 'es-AR', flag: '🇦🇷', nativeName: 'Español (Argentina)', ptName: 'Espanhol (Argentina)', short: 'ES-AR', iso: 'es', region: 'americas_europe' },
    { code: 'fr-FR', flag: '🇫🇷', nativeName: 'Français (France)', ptName: 'Francês (França)', short: 'FR-FR', iso: 'fr', region: 'americas_europe' },
    { code: 'fr-CA', flag: '🇨🇦', nativeName: 'Français (Canada)', ptName: 'Francês (Canadá)', short: 'FR-CA', iso: 'fr', region: 'americas_europe' },
    { code: 'de-DE', flag: '🇩🇪', nativeName: 'Deutsch', ptName: 'Alemão', short: 'DE', iso: 'de', region: 'americas_europe' },
    { code: 'it-IT', flag: '🇮🇹', nativeName: 'Italiano', ptName: 'Italiano', short: 'IT', iso: 'it', region: 'americas_europe' },
    { code: 'nl-NL', flag: '🇳🇱', nativeName: 'Nederlands', ptName: 'Holandês / Neerlandês', short: 'NL', iso: 'nl', region: 'americas_europe' },
    { code: 'pl-PL', flag: '🇵🇱', nativeName: 'Polski', ptName: 'Polonês', short: 'PL', iso: 'pl', region: 'americas_europe' },
    { code: 'ru-RU', flag: '🇷🇺', nativeName: 'Русский', ptName: 'Russo', short: 'RU', iso: 'ru', region: 'americas_europe' },
    { code: 'uk-UA', flag: '🇺🇦', nativeName: 'Українська', ptName: 'Ucraniano', short: 'UK', iso: 'uk', region: 'americas_europe' },
    { code: 'sv-SE', flag: '🇸🇪', nativeName: 'Svenska', ptName: 'Sueco', short: 'SV', iso: 'sv', region: 'americas_europe' },
    { code: 'no-NO', flag: '🇳🇴', nativeName: 'Norsk', ptName: 'Norueguês', short: 'NO', iso: 'no', region: 'americas_europe' },
    { code: 'da-DK', flag: '🇩🇰', nativeName: 'Dansk', ptName: 'Dinamarquês', short: 'DA', iso: 'da', region: 'americas_europe' },
    { code: 'fi-FI', flag: '🇫🇮', nativeName: 'Suomi', ptName: 'Finlandês', short: 'FI', iso: 'fi', region: 'americas_europe' },
    { code: 'el-GR', flag: '🇬🇷', nativeName: 'Ελληνικά', ptName: 'Grego', short: 'EL', iso: 'el', region: 'americas_europe' },
    { code: 'cs-CZ', flag: '🇨🇿', nativeName: 'Čeština', ptName: 'Tcheco', short: 'CS', iso: 'cs', region: 'americas_europe' },
    { code: 'ro-RO', flag: '🇷🇴', nativeName: 'Română', ptName: 'Romeno', short: 'RO', iso: 'ro', region: 'americas_europe' },
    { code: 'hu-HU', flag: '🇭🇺', nativeName: 'Magyar', ptName: 'Húngaro', short: 'HU', iso: 'hu', region: 'americas_europe' },
    { code: 'bg-BG', flag: '🇧🇬', nativeName: 'Български', ptName: 'Búlgaro', short: 'BG', iso: 'bg', region: 'americas_europe' },
    { code: 'hr-HR', flag: '🇭🇷', nativeName: 'Hrvatski', ptName: 'Croata', short: 'HR', iso: 'hr', region: 'americas_europe' },
    { code: 'sk-SK', flag: '🇸🇰', nativeName: 'Slovenčina', ptName: 'Eslovaco', short: 'SK', iso: 'sk', region: 'americas_europe' },
    { code: 'ca-ES', flag: '🇪🇸', nativeName: 'Català', ptName: 'Catalão', short: 'CA', iso: 'ca', region: 'americas_europe' },

    // Asia & Oceania (15 languages)
    { code: 'ja-JP', flag: '🇯🇵', nativeName: '日本語', ptName: 'Japonês', short: 'JA', iso: 'ja', region: 'asia_pacific' },
    { code: 'zh-CN', flag: '🇨🇳', nativeName: '中文 (普通话)', ptName: 'Chinês Mandarim (Simplificado)', short: 'ZH-CN', iso: 'zh-CN', region: 'asia_pacific' },
    { code: 'zh-TW', flag: '🇹🇼', nativeName: '繁體中文 (台灣)', ptName: 'Chinês Tradicional (Taiwan)', short: 'ZH-TW', iso: 'zh-TW', region: 'asia_pacific' },
    { code: 'zh-HK', flag: '🇭🇰', nativeName: '廣東話 (香港)', ptName: 'Cantonês (Hong Kong)', short: 'ZH-HK', iso: 'zh-TW', region: 'asia_pacific' },
    { code: 'ko-KR', flag: '🇰🇷', nativeName: '한국어', ptName: 'Coreano', short: 'KO', iso: 'ko', region: 'asia_pacific' },
    { code: 'hi-IN', flag: '🇮🇳', nativeName: 'हिन्दी', ptName: 'Hindi (Índia)', short: 'HI', iso: 'hi', region: 'asia_pacific' },
    { code: 'bn-IN', flag: '🇮🇳', nativeName: 'বাংলা', ptName: 'Bengali', short: 'BN', iso: 'bn', region: 'asia_pacific' },
    { code: 'ta-IN', flag: '🇮🇳', nativeName: 'தமிழ்', ptName: 'Tâmil', short: 'TA', iso: 'ta', region: 'asia_pacific' },
    { code: 'te-IN', flag: '🇮🇳', nativeName: 'తెలుగు', ptName: 'Telugu', short: 'TE', iso: 'te', region: 'asia_pacific' },
    { code: 'th-TH', flag: '🇹🇭', nativeName: 'ไทย', ptName: 'Tailandês', short: 'TH', iso: 'th', region: 'asia_pacific' },
    { code: 'vi-VN', flag: '🇻🇳', nativeName: 'Tiếng Việt', ptName: 'Vietnamita', short: 'VI', iso: 'vi', region: 'asia_pacific' },
    { code: 'id-ID', flag: '🇮🇩', nativeName: 'Bahasa Indonesia', ptName: 'Indonésio', short: 'ID', iso: 'id', region: 'asia_pacific' },
    { code: 'ms-MY', flag: '🇲🇾', nativeName: 'Bahasa Melayu', ptName: 'Malaio', short: 'MS', iso: 'ms', region: 'asia_pacific' },
    { code: 'fil-PH', flag: '🇵🇭', nativeName: 'Filipino / Tagalog', ptName: 'Filipino / Tagalo', short: 'FIL', iso: 'tl', region: 'asia_pacific' },
    { code: 'en-AU', flag: '🇦🇺', nativeName: 'English (Australia)', ptName: 'Inglês (Austrália)', short: 'EN-AU', iso: 'en', region: 'asia_pacific' },

    // Middle East & Africa (7 languages)
    { code: 'ar-SA', flag: '🇸🇦', nativeName: 'العربية (السعودية)', ptName: 'Árabe (Arábia Saudita)', short: 'AR-SA', iso: 'ar', region: 'mea' },
    { code: 'ar-EG', flag: '🇪🇬', nativeName: 'العربية (مصر)', ptName: 'Árabe (Egito)', short: 'AR-EG', iso: 'ar', region: 'mea' },
    { code: 'he-IL', flag: '🇮🇱', nativeName: 'עברית', ptName: 'Hebraico (Israel)', short: 'HE', iso: 'iw', region: 'mea' },
    { code: 'tr-TR', flag: '🇹🇷', nativeName: 'Türkçe', ptName: 'Turco', short: 'TR', iso: 'tr', region: 'mea' },
    { code: 'fa-IR', flag: '🇮🇷', nativeName: 'فارسی', ptName: 'Persa / Farsi', short: 'FA', iso: 'fa', region: 'mea' },
    { code: 'sw-KE', flag: '🇰🇪', nativeName: 'Kiswahili', ptName: 'Suaíli (África Oriental)', short: 'SW', iso: 'sw', region: 'mea' },
    { code: 'af-ZA', flag: '🇿🇦', nativeName: 'Afrikaans', ptName: 'Africâner (África do Sul)', short: 'AF', iso: 'af', region: 'mea' }
  ];

  const TOP_5_CODES = new Set(['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE']);

  function getLangMeta(code) {
    return (
      LANGUAGES_CATALOG.find(l => l.code === code) ||
      LANGUAGES_CATALOG.find(l => l.iso === (code || '').split('-')[0].toLowerCase()) ||
      LANGUAGES_CATALOG[0]
    );
  }

  // ==========================================================================
  // 2. REAL ISO/IEC 18004 QR CODE SVG GENERATOR (VERSIONS 1..6)
  // ==========================================================================
  const QrCodeGen = (() => {
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

    const VERSIONS = [
      null,
      { v: 1, size: 21, totalCodewords: 26, ecCodewords: 7, align: [] },
      { v: 2, size: 25, totalCodewords: 44, ecCodewords: 10, align: [6, 18] },
      { v: 3, size: 29, totalCodewords: 70, ecCodewords: 15, align: [6, 22] },
      { v: 4, size: 33, totalCodewords: 100, ecCodewords: 20, align: [6, 26] },
      { v: 5, size: 37, totalCodewords: 134, ecCodewords: 26, align: [6, 30] }
    ];

    function encodeTextToSvg(text, pixelSize = 188) {
      const utf8 = new TextEncoder().encode(text);
      let ver = VERSIONS[5];
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

      pushBits(0b0100, 4);
      const safeBytes = utf8.slice(0, dataCodewordsLen - 2);
      pushBits(safeBytes.length, 8);
      for (let i = 0; i < safeBytes.length; i++) pushBits(safeBytes[i], 8);

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
      const modules = Array.from({ length: n }, () => new Int8Array(n));
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

      for (let i = 8; i < n - 8; i++) {
        setFunc(6, i, i % 2 === 0);
        setFunc(i, 6, i % 2 === 0);
      }

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
      setFunc(n - 8, 8, true);

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
              if ((r + c) % 2 === 0) dark = !dark;
              modules[r][c] = dark ? 1 : 0;
            }
          }
        }
        upward = !upward;
      }

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
          if (modules[r][c]) pathD += `M${c},${r}h1v1h-1z`;
        }
      }

      return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" width="${pixelSize}" height="${pixelSize}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#FFFFFF"/><path d="${pathD}" fill="#070B10"/></svg>`;
    }

    return { encodeTextToSvg };
  })();

  // ==========================================================================
  // 3. CROSS-DEVICE REALTIME CLOUD RELAY (NTFY WSS/HTTPS + MQTT OVER WSS + BC)
  //    Enables separate physical smartphones scanning the QR Code to see each
  //    other in real time on static GitHub Pages without a custom backend!
  // ==========================================================================
  const CloudRelay = (() => {
    const seenEventIds = new Set();
    let activeTopic = null;
    let onEventCallback = null;
    let ntfyWs = null;
    let mqttSockets = [];
    let pollTimer = null;
    const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('omnivox_live_room_v5') : null;

    function encodeMqttString(str) {
      const utf8 = new TextEncoder().encode(str);
      const out = new Uint8Array(2 + utf8.length);
      out[0] = (utf8.length >>> 8) & 0xff;
      out[1] = utf8.length & 0xff;
      out.set(utf8, 2);
      return out;
    }

    function encodeMqttRemainingLength(len) {
      const bytes = [];
      do {
        let digit = len % 128;
        len = Math.floor(len / 128);
        if (len > 0) digit |= 128;
        bytes.push(digit);
      } while (len > 0);
      return new Uint8Array(bytes);
    }

    function buildMqttConnectPacket(clientId) {
      const protoName = encodeMqttString('MQTT');
      const clientBytes = encodeMqttString(clientId);
      const varHeader = new Uint8Array([
        ...protoName,
        0x04, // Protocol level 4 (MQTT 3.1.1)
        0x02, // Clean session
        0x00, 0x3c // Keep-alive 60s
      ]);
      const remLen = encodeMqttRemainingLength(varHeader.length + clientBytes.length);
      const pkt = new Uint8Array(1 + remLen.length + varHeader.length + clientBytes.length);
      pkt[0] = 0x10; // CONNECT
      pkt.set(remLen, 1);
      pkt.set(varHeader, 1 + remLen.length);
      pkt.set(clientBytes, 1 + remLen.length + varHeader.length);
      return pkt;
    }

    function buildMqttSubscribePacket(topic) {
      const topicBytes = encodeMqttString(topic);
      const bodyLen = 2 + topicBytes.length + 1;
      const remLen = encodeMqttRemainingLength(bodyLen);
      const pkt = new Uint8Array(1 + remLen.length + bodyLen);
      pkt[0] = 0x82; // SUBSCRIBE
      pkt.set(remLen, 1);
      let off = 1 + remLen.length;
      pkt[off++] = 0x00;
      pkt[off++] = 0x01; // Packet ID 1
      pkt.set(topicBytes, off);
      pkt[off + topicBytes.length] = 0x00; // QoS 0
      return pkt;
    }

    function buildMqttPublishPacket(topic, jsonStr, retain = false) {
      const topicBytes = encodeMqttString(topic);
      const payloadBytes = new TextEncoder().encode(jsonStr);
      const bodyLen = topicBytes.length + payloadBytes.length;
      const remLen = encodeMqttRemainingLength(bodyLen);
      const pkt = new Uint8Array(1 + remLen.length + bodyLen);
      pkt[0] = retain ? 0x31 : 0x30; // PUBLISH QoS 0
      pkt.set(remLen, 1);
      pkt.set(topicBytes, 1 + remLen.length);
      pkt.set(payloadBytes, 1 + remLen.length + topicBytes.length);
      return pkt;
    }

    function parseIncomingMqttFrames(buffer) {
      const bytes = new Uint8Array(buffer);
      let offset = 0;
      while (offset < bytes.length) {
        const header = bytes[offset++];
        const packetType = header >>> 4;
        let multiplier = 1;
        let remLen = 0;
        while (offset < bytes.length) {
          const encodedByte = bytes[offset++];
          remLen += (encodedByte & 127) * multiplier;
          multiplier *= 128;
          if ((encodedByte & 128) === 0) break;
        }
        if (offset + remLen > bytes.length) break;

        if (packetType === 3) {
          // PUBLISH packet
          const topicLen = (bytes[offset] << 8) | bytes[offset + 1];
          const qos = (header >> 1) & 0x03;
          const varHeaderLen = 2 + topicLen + (qos > 0 ? 2 : 0);
          const payloadStart = offset + varHeaderLen;
          const payloadEnd = offset + remLen;
          if (payloadEnd > payloadStart) {
            const text = new TextDecoder().decode(bytes.subarray(payloadStart, payloadEnd));
            dispatchEnvelope(text);
          }
        }
        offset += remLen;
      }
    }

    function dispatchEnvelope(rawStrOrObj) {
      try {
        const env = typeof rawStrOrObj === 'string' ? JSON.parse(rawStrOrObj) : rawStrOrObj;
        if (!env || !env.eventId || !env.type) return;
        // Ignore stale cached events older than 30 minutes
        if (env.ts && Date.now() - env.ts > 30 * 60 * 1000) return;
        if (seenEventIds.has(env.eventId)) return;
        seenEventIds.add(env.eventId);
        if (onEventCallback) onEventCallback(env);
      } catch (_) {}
    }

    function connectMqttBroker(brokerUrl, mqttTopic) {
      try {
        const ws = new WebSocket(brokerUrl, 'mqtt');
        ws.binaryType = 'arraybuffer';
        let pingInterval = null;
        let closed = false;

        ws.onopen = () => {
          const cid = 'omnivox_' + Math.random().toString(36).slice(2, 10);
          ws.send(buildMqttConnectPacket(cid));
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(buildMqttSubscribePacket(mqttTopic));
            }
          }, 120);

          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(new Uint8Array([0xc0, 0x00])); // PINGREQ
            }
          }, 22000);
        };

        ws.onmessage = (ev) => {
          if (ev.data instanceof ArrayBuffer) {
            parseIncomingMqttFrames(ev.data);
          }
        };

        const handleDisconnect = () => {
          if (closed) return;
          closed = true;
          if (pingInterval) clearInterval(pingInterval);
          mqttSockets = mqttSockets.filter(s => s !== ws);
          setTimeout(() => {
            if (activeTopic) connectMqttBroker(brokerUrl, mqttTopic);
          }, 1800);
        };

        ws.onclose = handleDisconnect;
        ws.onerror = handleDisconnect;

        mqttSockets.push(ws);
      } catch (_) {}
    }

    let pollRecentFn = null;

    function connectNtfyChannel(ntfyTopic) {
      const openNtfyWs = () => {
        try {
          if (ntfyWs) {
            try { ntfyWs.onclose = null; ntfyWs.close(); } catch (_) {}
          }
          const ws = new WebSocket(`wss://ntfy.sh/${ntfyTopic}/ws?since=all`);
          ntfyWs = ws;
          ws.onmessage = (ev) => {
            try {
              const outer = JSON.parse(ev.data);
              if (outer && outer.event === 'message' && outer.message) {
                dispatchEnvelope(outer.message);
              }
            } catch (_) {}
          };
          ws.onclose = () => {
            setTimeout(() => {
              if (activeTopic === ntfyTopic) openNtfyWs();
            }, 1600);
          };
        } catch (_) {}
      };

      openNtfyWs();

      const pollRecent = async () => {
        try {
          const res = await fetch(`https://ntfy.sh/${ntfyTopic}/json?poll=1&since=all`, {
            cache: 'no-store'
          });
          if (!res.ok) return;
          const text = await res.text();
          text.split('\n').forEach(line => {
            if (!line.trim()) return;
            try {
              const outer = JSON.parse(line);
              if (outer && outer.event === 'message' && outer.message) {
                dispatchEnvelope(outer.message);
              }
            } catch (_) {}
          });
        } catch (_) {}
      };

      pollRecentFn = pollRecent;
      pollRecent();
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(pollRecent, 3000);
    }

    function connectRoom(roomSlug, callback) {
      const cleanSlug = (roomSlug || 'DEFAULT').toLowerCase().replace(/[^a-z0-9]/g, '');
      activeTopic = `omnivox_v08_${cleanSlug}`;
      onEventCallback = callback;

      if (bc) {
        bc.onmessage = (ev) => dispatchEnvelope(ev.data);
      }

      connectNtfyChannel(activeTopic);

      const mqttTopic = `omnivox/v08/room/${cleanSlug}`;
      connectMqttBroker('wss://broker.emqx.io:8084/mqtt', mqttTopic);
      connectMqttBroker('wss://broker.hivemq.com:8884/mqtt', mqttTopic);
    }

    function publish(type, payload, retainMqtt = false) {
      if (!activeTopic) return;
      const envelope = {
        eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        payload,
        ts: Date.now()
      };
      seenEventIds.add(envelope.eventId);
      const rawJson = JSON.stringify(envelope);

      // 1. Local tab sync
      if (bc) {
        try { bc.postMessage(envelope); } catch (_) {}
      }

      // 2. MQTT over WSS publish (instant low-latency fan-out)
      const cleanSlug = activeTopic.replace('omnivox_v08_', '');
      const mqttTopic = `omnivox/v08/room/${cleanSlug}`;
      const mqttFrame = buildMqttPublishPacket(mqttTopic, rawJson, retainMqtt);
      mqttSockets.forEach(ws => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          try { ws.send(mqttFrame); } catch (_) {}
        }
      });

      // 3. ntfy.sh HTTPS POST (skip heavy high-frequency live_interim on HTTP POST to avoid rate-limit, send all speech_clause & presence!)
      if (type !== 'live_interim') {
        fetch(`https://ntfy.sh/${activeTopic}`, {
          method: 'POST',
          body: rawJson
        }).catch(() => {});
      }
    }

    function pollNow() {
      if (pollRecentFn) pollRecentFn();
    }

    return { connectRoom, publish, pollNow };
  })();

  // ==========================================================================
  // 4. UNIVERSAL 50-LANGUAGE NEURAL TRANSLATION ENGINE (CONTEXTUAL SENTENCE GTX)
  // ==========================================================================
  const translationCache = new Map();

  async function translateUniversalAsync(text, sourceLangCode, targetLangCode) {
    if (!text || !text.trim()) return '';
    const clean = text.trim();
    if (sourceLangCode === targetLangCode) return clean;

    const srcMeta = getLangMeta(sourceLangCode);
    const tgtMeta = getLangMeta(targetLangCode);
    if (srcMeta.iso === tgtMeta.iso && srcMeta.code === tgtMeta.code) return clean;

    const cacheKey = `${srcMeta.iso}|${tgtMeta.iso}|${clean.toLowerCase()}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

    // Primary Neural Model: Google GTX Neural Machine Translation with dj=1 full sentence structure
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(srcMeta.iso)}&tl=${encodeURIComponent(tgtMeta.iso)}&dt=t&dj=1&q=${encodeURIComponent(clean)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.sentences)) {
          const translated = data.sentences.map(s => s.trans || '').join('').trim();
          if (translated) {
            translationCache.set(cacheKey, translated);
            return translated;
          }
        } else if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map(part => part[0]).join('').trim();
          if (translated) {
            translationCache.set(cacheKey, translated);
            return translated;
          }
        }
      }
    } catch (_) {}

    // Secondary Neural Fallback: MyMemory Neural Translation
    try {
      const pair = `${srcMeta.iso}|${tgtMeta.iso}`;
      const res2 = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${encodeURIComponent(pair)}`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.responseData && data2.responseData.translatedText) {
          const out = data2.responseData.translatedText.trim();
          translationCache.set(cacheKey, out);
          return out;
        }
      }
    } catch (_) {}

    return clean;
  }

  // ==========================================================================
  // 5. AVATAR SVG GENERATOR & COMPACT NETWORK THUMBNAIL COMPRESSOR
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

  // ==========================================================================
  // 6. APPLICATION STATE
  // ==========================================================================
  const state = {
    userId: 'u-' + Math.random().toString(36).slice(2, 9),
    userName: '',
    roomName: '',
    roomSlug: '',
    nativeLang: 'pt-BR',
    avatarDataUrl: '',
    avatarThumbUrl: '', // Compact 56x56 JPEG (<1.2KB) for instant cross-phone sync
    isJoiningFromQr: false,
    inRoom: false,

    cameraStream: null,
    isCameraOpen: false,

    activeRegionFilter: 'all',
    searchQuery: '',
    installedVoiceLangs: new Set(),

    participants: [],
    activeSpeakerId: null,

    // Antigravity Live Microphone State
    isMicActive: false,
    isLiveHandsFree: false,
    pressStartTime: 0,
    speechRecognition: null,
    unflushedTranscript: '',
    flushedLength: 0,
    silenceFlushTimer: null,
    lastInterimSentAt: 0,
    remoteInterimHideTimer: null,

    // Direct MediaRecorder fallback (for browsers without SpeechRecognition)
    mediaRecorder: null,
    recordedChunks: [],
    micStream: null,

    audioCtx: null,
    sharedAudioEl: null
  };

  const $ = (id) => document.getElementById(id);

  // ==========================================================================
  // 7. DEVICE NATIVE VOICE DETECTOR, NEURAL VOICE SCORER & 50-LANGUAGE MODAL
  // ==========================================================================
  function refreshInstalledVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    voices.forEach(v => {
      if (v.lang) {
        state.installedVoiceLangs.add(v.lang.toLowerCase());
        state.installedVoiceLangs.add(v.lang.split('-')[0].toLowerCase());
      }
    });
  }

  if ('speechSynthesis' in window) {
    refreshInstalledVoices();
    window.speechSynthesis.onvoiceschanged = refreshInstalledVoices;
  }

  function hasDeviceVoice(langObj) {
    if (state.installedVoiceLangs.size === 0) return true;
    return (
      state.installedVoiceLangs.has(langObj.code.toLowerCase()) ||
      state.installedVoiceLangs.has(langObj.iso.toLowerCase())
    );
  }

  // Scores device TTS voices so Neural / Natural / Online / Premium voices always win over robotic legacy voices
  function pickBestNeuralDeviceVoice(langCode) {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    const targetLower = langCode.toLowerCase();
    const prefix = targetLower.split('-')[0];

    const candidates = voices.filter(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === targetLower || l.startsWith(prefix + '-') || l === prefix;
    });

    if (!candidates.length) return null;

    let bestVoice = candidates[0];
    let bestScore = -999;

    for (const v of candidates) {
      let score = 0;
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();

      if (l === targetLower) score += 50;
      if (name.includes('natural') || name.includes('neural')) score += 120;
      if (name.includes('online')) score += 90;
      if (name.includes('google')) score += 80;
      if (name.includes('premium') || name.includes('enhanced') || name.includes('siri')) score += 75;
      if (name.includes('francisca') || name.includes('antonio') || name.includes('luciana') || name.includes('samantha') || name.includes('daniel')) score += 45;
      if (v.localService === false) score += 35;
      if (name.includes('compact') || name.includes('espeak')) score -= 60;

      if (score > bestScore) {
        bestScore = score;
        bestVoice = v;
      }
    }

    return bestVoice;
  }

  function selectNativeLanguage(langCode) {
    const meta = getLangMeta(langCode);
    state.nativeLang = meta.code;

    $('selected-lang-indicator').textContent = `${meta.flag} ${meta.nativeName}`;

    document.querySelectorAll('.quick-lang-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.lang === meta.code);
    });

    const otherBtn = $('btn-other-languages');
    if (!TOP_5_CODES.has(meta.code)) {
      otherBtn.classList.add('selected');
      $('other-btn-flag').textContent = meta.flag;
      $('other-btn-name').textContent = meta.nativeName;
      $('other-btn-sub').textContent = 'Trocar (50 idiomas)';
    } else {
      otherBtn.classList.remove('selected');
      $('other-btn-flag').textContent = '🌍';
      $('other-btn-name').textContent = 'Outros...';
      $('other-btn-sub').textContent = '+45 idiomas';
    }

    if ($('inroom-my-lang-label')) {
      $('inroom-my-lang-label').textContent = `${meta.flag} ${meta.short}`;
    }

    if (state.inRoom) {
      const me = state.participants.find(p => p.id === state.userId);
      if (me) {
        me.lang = meta.code;
        renderRoomView();
        broadcastMyPresence();
      }
    }
  }

  function renderLanguageCatalogModal() {
    refreshInstalledVoices();
    const listEl = $('lang-catalog-list');
    const q = state.searchQuery.trim().toLowerCase();

    const filtered = LANGUAGES_CATALOG.filter(item => {
      if (state.activeRegionFilter !== 'all' && item.region !== state.activeRegionFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.nativeName.toLowerCase().includes(q) ||
        item.ptName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.short.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">Nenhum idioma encontrado para "${escapeHtml(state.searchQuery)}"</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const isSelected = item.code === state.nativeLang;
      const nativeVoice = hasDeviceVoice(item);
      return `
        <button type="button" class="catalog-lang-item ${isSelected ? 'active' : ''}" data-code="${item.code}">
          <div class="catalog-lang-left">
            <span class="lang-flag">${item.flag}</span>
            <div class="catalog-lang-names">
              <span class="catalog-lang-native">${escapeHtml(item.nativeName)}</span>
              <span class="catalog-lang-pt">${escapeHtml(item.ptName)} • ${item.code}</span>
            </div>
          </div>
          <span class="catalog-voice-badge">
            ${nativeVoice ? '✨ Neural Live HD' : '☁️ Cloud Neural'}
          </span>
        </button>
      `;
    }).join('');

    listEl.querySelectorAll('.catalog-lang-item').forEach(btn => {
      btn.addEventListener('click', () => {
        selectNativeLanguage(btn.dataset.code);
        closeLanguageCatalogModal();
      });
    });
  }

  function openLanguageCatalogModal() {
    state.searchQuery = '';
    $('input-search-lang').value = '';
    renderLanguageCatalogModal();
    $('lang-catalog-modal').classList.remove('hidden');
    setTimeout(() => $('input-search-lang').focus(), 100);
  }

  function closeLanguageCatalogModal() {
    $('lang-catalog-modal').classList.add('hidden');
  }

  // ==========================================================================
  // 8. SPLASH SCREEN (4 SECONDS TRANSITION) & URL PARAM CHECK
  // ==========================================================================
  function computeRoomSlug(rawName) {
    return (rawName || 'Sala Omnivox')
      .trim()
      .slice(0, 18)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12) || 'OMNI26';
  }

  function initSplashAndUrl() {
    if ($('splash-version-badge')) {
      $('splash-version-badge').textContent = APP_VERSION;
    }

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('r') || params.get('room');

    if (roomParam) {
      state.roomName = roomParam.trim();
      state.roomSlug = computeRoomSlug(state.roomName);
      state.isJoiningFromQr = true;
      const roomInput = $('input-room-name');
      roomInput.value = state.roomName;
      roomInput.readOnly = true;
      roomInput.style.opacity = '0.8';
      $('setup-main-title').textContent = `Entrar em "${state.roomName}"`;
      $('setup-subtitle').textContent = 'Você escaneou o QR Code! Escolha seu idioma, adicione sua foto e entre na sala.';
      $('btn-submit-label').textContent = 'Entrar na Sala Agora';
    }

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
  // 9. CAMERA SELFIE & PHOTO UPLOAD LOGIC (WITH 56x56 NETWORK THUMBNAIL)
  // ==========================================================================
  function createThumbFromCanvas(sourceCanvas) {
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 56;
    thumbCanvas.height = 56;
    const tCtx = thumbCanvas.getContext('2d');
    tCtx.drawImage(sourceCanvas, 0, 0, 56, 56);
    return thumbCanvas.toDataURL('image/jpeg', 0.55);
  }

  async function handleCameraButton() {
    const video = $('camera-video');
    const img = $('avatar-img');
    const placeholder = $('avatar-placeholder');
    const btn = $('btn-camera-selfie');

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

      ctx.translate(240, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 240, 240);

      state.avatarDataUrl = canvas.toDataURL('image/jpeg', 0.84);
      state.avatarThumbUrl = createThumbFromCanvas(canvas);
      stopCameraStream();

      img.src = state.avatarDataUrl;
      img.classList.remove('hidden');
      video.classList.add('hidden');
      placeholder.classList.add('hidden');
      btn.classList.remove('capture-active');
      btn.innerHTML = '<span>📷 Trocar Selfie</span>';
      return;
    }

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
      } catch (_) {}
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

        state.avatarDataUrl = canvas.toDataURL('image/jpeg', 0.84);
        state.avatarThumbUrl = createThumbFromCanvas(canvas);
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
  // 10. iOS SAFARI & MOBILE AUDIO UNLOCK (WITHOUT INTERFERING WITH MIC RECORDING)
  // ==========================================================================
  async function unlockMobileAudio(forMicStart = false) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!state.audioCtx && AC) {
        state.audioCtx = new AC();
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.frequency.value = 1.0;
        gain.gain.value = 0.0002;
        osc.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc.start();
      }
      if (state.audioCtx && state.audioCtx.state !== 'running') {
        await state.audioCtx.resume();
      }
      if (!state.sharedAudioEl) {
        const a = new Audio();
        a.referrerPolicy = 'no-referrer';
        a.playsInline = true;
        state.sharedAudioEl = a;
      }
      // Only warm up speechSynthesis when NOT starting the microphone (so iOS doesn't switch audio session away from mic!)
      if (!forMicStart && 'speechSynthesis' in window && !window.speechSynthesis.speaking) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {});
      }
    } catch (_) {}
  }

  function playSonicCue(freq = 540, dur = 0.045) {
    if (!state.audioCtx || state.audioCtx.state !== 'running') return;
    try {
      const o = state.audioCtx.createOscillator();
      const g = state.audioCtx.createGain();
      o.frequency.value = freq;
      g.gain.value = 0.035;
      o.connect(g);
      g.connect(state.audioCtx.destination);
      o.start();
      o.stop(state.audioCtx.currentTime + dur);
    } catch (_) {}
  }

  // ==========================================================================
  // 11. ROOM CREATION, QR CODE DISPLAY & MULTI-PHONE BIDIRECTIONAL SYNC
  // ==========================================================================
  function getShareableRoomUrl() {
    const base = `${window.location.origin}${window.location.pathname}`;
    const r = encodeURIComponent(state.roomName.slice(0, 18));
    return `${base}?r=${r}`;
  }

  function getMyNetworkProfile() {
    return {
      id: state.userId,
      name: state.userName,
      lang: state.nativeLang,
      avatar: state.avatarThumbUrl || generateSvgAvatarDataUrl(state.userName, '#10B981')
    };
  }

  function broadcastMyPresence() {
    if (!state.inRoom) return;
    CloudRelay.publish('participant_join', {
      roomSlug: state.roomSlug,
      participant: getMyNetworkProfile()
    }, true);
  }

  async function handleSetupSubmit(e) {
    e.preventDefault();
    stopCameraStream();
    await unlockMobileAudio(false);

    state.userName = $('input-my-name').value.trim() || 'Participante';
    state.roomName = ($('input-room-name').value.trim() || 'Sala Omnivox').slice(0, 18);
    state.roomSlug = computeRoomSlug(state.roomName);
    state.inRoom = true;

    if (!state.avatarDataUrl) {
      state.avatarDataUrl = generateSvgAvatarDataUrl(state.userName, '#10B981');
      state.avatarThumbUrl = state.avatarDataUrl;
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

    const langInfo = getLangMeta(state.nativeLang);
    $('qr-host-summary').textContent = `${state.userName} (${langInfo.flag} ${langInfo.nativeName})`;
    $('inroom-my-lang-label').textContent = `${langInfo.flag} ${langInfo.short}`;

    $('setup-screen').classList.add('hidden');
    $('room-screen').classList.remove('hidden');

    renderRoomView();

    // Connect Cross-Device Realtime Relay (ntfy WSS/HTTPS ?since=all + dual MQTT over WSS + BroadcastChannel)
    CloudRelay.connectRoom(state.roomSlug, handleCloudEvent);

    // Announce our presence immediately + retry intervals + periodic heartbeat so all phones see each other bidirectionally
    broadcastMyPresence();
    setTimeout(broadcastMyPresence, 700);
    setTimeout(broadcastMyPresence, 2000);
    setTimeout(broadcastMyPresence, 4500);
    setInterval(() => {
      if (state.inRoom) broadcastMyPresence();
    }, 15000);
  }

  function handleCloudEvent(envelope) {
    const { type, payload } = envelope;
    if (!payload || payload.roomSlug !== state.roomSlug) return;

    if (type === 'participant_join') {
      const p = payload.participant;
      if (!p || p.id === state.userId) return;

      const existing = state.participants.find(item => item.id === p.id);
      const isNewOrChanged = !existing || existing.lang !== p.lang || existing.name !== p.name;

      addOrUpdateParticipant({
        id: p.id,
        name: p.name,
        lang: p.lang,
        avatar: p.avatar || generateSvgAvatarDataUrl(p.name, '#0EA5E9'),
        isMe: false,
        speaking: false
      });

      // Reply with our own presence so both Host and Guest always have the full participant list
      if (isNewOrChanged) {
        CloudRelay.publish('participant_ack', {
          roomSlug: state.roomSlug,
          targetId: p.id,
          participant: getMyNetworkProfile()
        }, true);
      }
    } else if (type === 'participant_ack') {
      const p = payload.participant;
      if (!p || p.id === state.userId) return;
      addOrUpdateParticipant({
        id: p.id,
        name: p.name,
        lang: p.lang,
        avatar: p.avatar || generateSvgAvatarDataUrl(p.name, '#F59E0B'),
        isMe: false,
        speaking: false
      });
    } else if (type === 'speaking_state') {
      if (payload.speakerId === state.userId) return;
      state.activeSpeakerId = payload.speaking ? payload.speakerId : null;
      if (!payload.speaking) {
        hideLiveInterimBanner();
      }
      renderRoomView();
    } else if (type === 'live_interim') {
      if (payload.speakerId === state.userId) return;
      state.activeSpeakerId = payload.speakerId;
      showLiveInterimBanner(payload.speakerName, payload.sourceLang, payload.text);
      renderRoomView();
    } else if (type === 'speech_clause') {
      if (payload.clause && payload.clause.speakerId !== state.userId) {
        hideLiveInterimBanner();
        // Ensure the speaker is in our participant list even if their speech arrived before their join packet
        if (!state.participants.some(item => item.id === payload.clause.speakerId)) {
          addOrUpdateParticipant({
            id: payload.clause.speakerId,
            name: payload.clause.speakerName || 'Participante',
            lang: payload.clause.sourceLang || 'pt-BR',
            avatar: generateSvgAvatarDataUrl(payload.clause.speakerName || 'P', '#0EA5E9'),
            isMe: false,
            speaking: false
          });
        }
        receiveSpeechClause(payload.clause);
      }
    }
  }

  function showLiveInterimBanner(speakerName, sourceLang, text) {
    const banner = $('live-interim-banner');
    if (!banner || !text) return;
    const lMeta = getLangMeta(sourceLang);
    $('live-interim-speaker').textContent = `🎙️ ${speakerName} (${lMeta.flag} ${lMeta.short}) falando ao vivo...`;
    $('live-interim-text').textContent = `"${text}"`;
    banner.classList.remove('hidden');

    if (state.remoteInterimHideTimer) clearTimeout(state.remoteInterimHideTimer);
    state.remoteInterimHideTimer = setTimeout(() => {
      hideLiveInterimBanner();
    }, 4500);
  }

  function hideLiveInterimBanner() {
    const banner = $('live-interim-banner');
    if (banner) banner.classList.add('hidden');
  }

  function addOrUpdateParticipant(p) {
    const existingIdx = state.participants.findIndex(item => item.id === p.id);
    if (existingIdx !== -1) {
      state.participants[existingIdx] = {
        ...state.participants[existingIdx],
        ...p,
        avatar: state.participants[existingIdx].isMe
          ? state.avatarDataUrl
          : (p.avatar || state.participants[existingIdx].avatar)
      };
    } else {
      state.participants.push(p);
      playSonicCue(680, 0.05);
    }
    renderRoomView();
  }

  function renderRoomView() {
    const count = state.participants.length;
    const qrHero = $('qr-hero-card');
    const cornerQrBtn = $('btn-corner-qr');
    const counterLabel = $('room-participant-counter');

    // If joining from QR Code or once >= 2 participants are in room, shrink QR code to top-right corner!
    if (count <= 1 && !state.isJoiningFromQr) {
      counterLabel.textContent = `1 pessoa • Sala #${state.roomSlug} pronta`;
      qrHero.classList.remove('hidden');
      cornerQrBtn.classList.add('hidden');
    } else {
      counterLabel.textContent = count > 1
        ? `${count} participantes conectados`
        : `Conectado à sala #${state.roomSlug}`;
      qrHero.classList.add('hidden');
      cornerQrBtn.classList.remove('hidden');
    }

    const grid = $('participants-grid');
    grid.innerHTML = state.participants.map(p => {
      const lMeta = getLangMeta(p.lang);
      const isSpeaking = state.activeSpeakerId === p.id;
      return `
        <div class="participant-card ${isSpeaking ? 'speaking' : ''}" id="pcard-${p.id}">
          <div class="participant-avatar-wrap">
            <img class="participant-avatar" src="${p.avatar}" alt="${escapeHtml(p.name)}" />
            <span class="participant-lang-badge">${lMeta.flag} ${lMeta.short}</span>
          </div>
          <div class="participant-name">${escapeHtml(p.name)}${p.isMe ? ' (Você)' : ''}</div>
          <div class="participant-lang-name">${escapeHtml(lMeta.nativeName)}</div>
          <div class="participant-status-tag">
            ${isSpeaking ? '🎙️ Falando ao vivo...' : '🎧 Ouvindo em ' + lMeta.short}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 12. ANTIGRAVITY LIVE BIDIRECTIONAL VOICE ENGINE & NEURAL CLOUD TTS STREAM
  // ==========================================================================
  function setMicUiActive(active, modeLabel = '') {
    const btn = $('btn-fixed-ptt');
    const micIcon = $('ptt-mic-icon');
    const waveBars = $('ptt-wave-bars');
    const myMeta = getLangMeta(state.nativeLang);

    if (active) {
      btn.classList.add('active-speaking');
      if (micIcon) micIcon.classList.add('hidden');
      if (waveBars) waveBars.classList.remove('hidden');
      $('ptt-main-label').textContent = modeLabel || 'MODO LIVE ATIVO • TOQUE PARA ENVIAR';
      $('ptt-sub-label').textContent = `Ouvindo sua voz em ${myMeta.flag} ${myMeta.nativeName}...`;
    } else {
      btn.classList.remove('active-speaking');
      if (micIcon) micIcon.classList.remove('hidden');
      if (waveBars) waveBars.classList.add('hidden');
      $('ptt-main-label').textContent = 'TOQUE OU SEGURE PARA FALAR';
      $('ptt-sub-label').textContent = 'Modo Live fluido • Traduz e envia sua voz em tempo real';
    }
  }

  async function publishAndRenderClause(spokenText, optionalAudioDataUrl = null) {
    const clean = (spokenText || '').trim();
    if (!clean && !optionalAudioDataUrl) return;

    const clausePayload = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      speakerId: state.userId,
      speakerName: state.userName,
      sourceLang: state.nativeLang,
      originalText: clean || '🎤 Mensagem de voz direta',
      audioDataUrl: optionalAudioDataUrl || undefined
    };

    // Broadcast lightweight packet over CloudRelay (MQTT + ntfy + BroadcastChannel)
    CloudRelay.publish('speech_clause', {
      roomSlug: state.roomSlug,
      clause: clausePayload
    });

    await receiveSpeechClause(clausePayload);
  }

  function startLiveVoiceSession() {
    if (state.isMicActive) return;
    unlockMobileAudio(true);

    state.isMicActive = true;
    state.activeSpeakerId = state.userId;
    state.unflushedTranscript = '';
    state.flushedLength = 0;

    setMicUiActive(true, 'OUVINDO AO VIVO... (TOQUE OU SOLTE PARA ENVIAR)');
    renderRoomView();

    CloudRelay.publish('speaking_state', {
      roomSlug: state.roomSlug,
      speakerId: state.userId,
      speaking: true
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = state.nativeLang;
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
          fullTranscript = fullTranscript.trim();
          const currentNewPart = fullTranscript.slice(state.flushedLength).trim();
          state.unflushedTranscript = currentNewPart;

          if (currentNewPart) {
            $('ptt-sub-label').textContent = `"${currentNewPart}"`;
            showLiveInterimBanner(state.userName + ' (Você)', state.nativeLang, currentNewPart);

            const now = Date.now();
            if (now - state.lastInterimSentAt > 420) {
              state.lastInterimSentAt = now;
              CloudRelay.publish('live_interim', {
                roomSlug: state.roomSlug,
                speakerId: state.userId,
                speakerName: state.userName,
                sourceLang: state.nativeLang,
                text: currentNewPart
              });
            }

            // Antigravity Live Clause Streaming: if user pauses for 1.15s in hands-free Live mode, stream the clause immediately!
            if (state.silenceFlushTimer) clearTimeout(state.silenceFlushTimer);
            state.silenceFlushTimer = setTimeout(() => {
              if (state.isMicActive && state.isLiveHandsFree && state.unflushedTranscript.trim().length >= 3) {
                const toSend = state.unflushedTranscript.trim();
                state.flushedLength = fullTranscript.length;
                state.unflushedTranscript = '';
                hideLiveInterimBanner();
                publishAndRenderClause(toSend);
              }
            }, 1150);
          }
        };

        rec.onerror = (ev) => {
          if (ev && (ev.error === 'not-allowed' || ev.error === 'service-not-allowed')) {
            $('ptt-sub-label').textContent = '⚠️ Permita o acesso ao microfone no navegador ou use o botão Texto';
            cancelLiveVoiceSession();
          }
        };

        rec.onend = () => {
          // If still in hands-free Live mode, seamlessly restart recognition
          if (state.isMicActive && state.isLiveHandsFree && state.speechRecognition === rec) {
            try { rec.start(); } catch (_) {}
          }
        };

        rec.start();
        state.speechRecognition = rec;
        return;
      } catch (_) {}
    }

    // Fallback for browsers without SpeechRecognition: capture direct compressed voice clip via MediaRecorder
    startDirectAudioRecorderFallback();
  }

  async function startDirectAudioRecorderFallback() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $('ptt-sub-label').textContent = '⚠️ Microfone indisponível neste navegador — use o botão Texto ao lado';
      setTimeout(cancelLiveVoiceSession, 1800);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.micStream = stream;
      state.recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 16000 })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) state.recordedChunks.push(e.data);
      };
      recorder.start(200);
      state.mediaRecorder = recorder;
      $('ptt-sub-label').textContent = '🎙️ Gravando áudio direto (solte ou toque para enviar)...';
    } catch (_) {
      $('ptt-sub-label').textContent = '⚠️ Permissão de microfone negada — libere o microfone na barra de endereço';
      setTimeout(cancelLiveVoiceSession, 1800);
    }
  }

  function cancelLiveVoiceSession() {
    if (state.silenceFlushTimer) clearTimeout(state.silenceFlushTimer);
    state.isMicActive = false;
    state.isLiveHandsFree = false;
    state.activeSpeakerId = null;
    if (state.speechRecognition) {
      const rec = state.speechRecognition;
      state.speechRecognition = null;
      try { rec.abort(); } catch (_) {}
    }
    if (state.mediaRecorder) {
      try { state.mediaRecorder.stop(); } catch (_) {}
      state.mediaRecorder = null;
    }
    if (state.micStream) {
      state.micStream.getTracks().forEach(t => t.stop());
      state.micStream = null;
    }
    hideLiveInterimBanner();
    setMicUiActive(false);
    renderRoomView();
    CloudRelay.publish('speaking_state', {
      roomSlug: state.roomSlug,
      speakerId: state.userId,
      speaking: false
    });
  }

  async function stopLiveVoiceSession() {
    if (!state.isMicActive) return;
    if (state.silenceFlushTimer) clearTimeout(state.silenceFlushTimer);

    state.isMicActive = false;
    state.isLiveHandsFree = false;
    state.activeSpeakerId = null;

    setMicUiActive(false);
    hideLiveInterimBanner();
    renderRoomView();

    CloudRelay.publish('speaking_state', {
      roomSlug: state.roomSlug,
      speakerId: state.userId,
      speaking: false
    });

    // 1. If SpeechRecognition was active, wait for final onresult/onend flush (up to 480ms) before reading transcript!
    if (state.speechRecognition) {
      const rec = state.speechRecognition;
      state.speechRecognition = null;

      await new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };
        const prevOnEnd = rec.onend;
        rec.onend = (e) => {
          if (prevOnEnd) {
            try { prevOnEnd(e); } catch (_) {}
          }
          finish();
        };
        setTimeout(finish, 480);
        try { rec.stop(); } catch (_) { finish(); }
      });

      const finalSpeech = state.unflushedTranscript.trim();
      state.unflushedTranscript = '';

      if (finalSpeech) {
        playSonicCue(520, 0.04);
        await publishAndRenderClause(finalSpeech);
      } else {
        $('ptt-sub-label').textContent = 'Toque para ativar o Modo Live e fale próximo ao microfone';
      }
      return;
    }

    // 2. If MediaRecorder fallback was active, package voice clip & send bidirectionally
    if (state.mediaRecorder) {
      const rec = state.mediaRecorder;
      state.mediaRecorder = null;

      await new Promise((resolve) => {
        rec.onstop = resolve;
        setTimeout(resolve, 400);
        try { rec.stop(); } catch (_) { resolve(); }
      });

      if (state.micStream) {
        state.micStream.getTracks().forEach(t => t.stop());
        state.micStream = null;
      }

      if (state.recordedChunks.length > 0) {
        const blob = new Blob(state.recordedChunks, { type: rec.mimeType || 'audio/webm' });
        state.recordedChunks = [];
        if (blob.size > 200 && blob.size < 95000) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              publishAndRenderClause('', reader.result);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }

  function resolveSpeakerAvatar(speakerId, speakerName) {
    const found = state.participants.find(p => p.id === speakerId);
    if (found && found.avatar) return found.avatar;
    return generateSvgAvatarDataUrl(speakerName || 'Participante', '#0EA5E9');
  }

  async function receiveSpeechClause(payload) {
    const emptyHint = $('feed-empty-hint');
    if (emptyHint) emptyHint.remove();

    let targetLang = state.nativeLang;
    if (payload.speakerId === state.userId) {
      const otherGuest = state.participants.find(p => !p.isMe && p.lang !== state.nativeLang);
      if (otherGuest) {
        targetLang = otherGuest.lang;
      } else {
        const anyGuest = state.participants.find(p => !p.isMe);
        if (anyGuest) {
          targetLang = anyGuest.lang;
        } else if (state.nativeLang.startsWith('pt')) {
          targetLang = 'en-US';
        } else {
          targetLang = 'pt-BR';
        }
      }
    }

    const translatedText = payload.audioDataUrl
      ? payload.originalText
      : await translateUniversalAsync(payload.originalText, payload.sourceLang, targetLang);

    const srcMeta = getLangMeta(payload.sourceLang);
    const tgtMeta = getLangMeta(targetLang);
    const avatarUrl = payload.speakerAvatar || resolveSpeakerAvatar(payload.speakerId, payload.speakerName);

    const feed = $('conversation-feed');
    const card = document.createElement('div');
    card.className = 'speech-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('title', 'Toque para ouvir novamente esta tradução');
    card.innerHTML = `
      <img class="speech-card-avatar" src="${avatarUrl}" alt="${escapeHtml(payload.speakerName)}" />
      <div class="speech-card-body">
        <div class="speech-card-meta">
          <strong>${escapeHtml(payload.speakerName)} (${srcMeta.flag} ${srcMeta.short}) → ${tgtMeta.flag} ${escapeHtml(tgtMeta.short)}</strong>
          <span class="speech-replay-badge">🔊 Ouvir</span>
        </div>
        <div class="speech-card-translated">${escapeHtml(translatedText)}</div>
        <div class="speech-card-original">Original: "${escapeHtml(payload.originalText)}"</div>
      </div>
    `;

    const replayCardAudio = () => {
      unlockMobileAudio(false);
      playSonicCue(560, 0.04);
      if (payload.audioDataUrl) {
        playDirectAudioDataUrl(payload.audioDataUrl, card);
      } else {
        NeuralVoiceEngine.enqueue(translatedText, tgtMeta.code, card, true);
      }
    };

    card.addEventListener('click', replayCardAudio);
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        replayCardAudio();
      }
    });

    feed.prepend(card);

    // Play out loud automatically on receiving phones (or when testing solo on 1 device)
    const hasRemoteParticipants = state.participants.some(p => !p.isMe);
    if (payload.speakerId !== state.userId || !hasRemoteParticipants) {
      if (payload.audioDataUrl) {
        playDirectAudioDataUrl(payload.audioDataUrl, card);
      } else {
        NeuralVoiceEngine.enqueue(translatedText, tgtMeta.code, card, false);
      }
    }
  }

  function clearAllReplayingCards() {
    document.querySelectorAll('.speech-card.replaying').forEach(el => {
      el.classList.remove('replaying');
      const badge = el.querySelector('.speech-replay-badge');
      if (badge) badge.textContent = '🔊 Ouvir';
    });
  }

  function playDirectAudioDataUrl(dataUrl, activeCard) {
    clearAllReplayingCards();
    let badge = null;
    if (activeCard) {
      activeCard.classList.add('replaying');
      badge = activeCard.querySelector('.speech-replay-badge');
      if (badge) badge.textContent = '🔊 Ouvindo...';
    }
    const done = () => {
      if (activeCard) {
        activeCard.classList.remove('replaying');
        if (badge) badge.textContent = '🔊 Ouvir';
      }
    };
    try {
      const audio = new Audio(dataUrl);
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    } catch (_) {
      done();
    }
  }

  // ==========================================================================
  // 13. ANTIGRAVITY LIVE NEURAL VOICE ENGINE (CLOUD WAVENET + FIFO QUEUE + HD DEVICE VOICE)
  // ==========================================================================
  const NeuralVoiceEngine = (() => {
    const queue = [];
    let isPlaying = false;

    function splitIntoNaturalChunks(text, maxLen = 170) {
      const clean = (text || '').trim();
      if (!clean) return [];
      if (clean.length <= maxLen) return [clean];

      const rawParts = clean.match(/[^.!?¡¿,;]+[.!?¡¿,;]*/g) || [clean];
      const chunks = [];
      let current = '';

      for (const part of rawParts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if ((current + ' ' + trimmed).trim().length <= maxLen) {
          current = (current + ' ' + trimmed).trim();
        } else {
          if (current) chunks.push(current);
          if (trimmed.length <= maxLen) {
            current = trimmed;
          } else {
            for (let i = 0; i < trimmed.length; i += maxLen) {
              chunks.push(trimmed.slice(i, i + maxLen));
            }
            current = '';
          }
        }
      }
      if (current) chunks.push(current);
      return chunks;
    }

    function playViaCloudNeuralStream(chunkText, langCode, playbackRate) {
      return new Promise((resolve) => {
        try {
          const meta = getLangMeta(langCode);
          // Google Cloud Neural TTS language tag (preserve zh-CN, zh-TW, pt-BR, or ISO code)
          const tl = ['zh-CN', 'zh-TW', 'pt-BR', 'pt-PT', 'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'fr-CA'].includes(meta.code)
            ? meta.code
            : meta.iso;
          const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(chunkText)}`;

          const audio = state.sharedAudioEl || new Audio();
          state.sharedAudioEl = audio;
          audio.referrerPolicy = 'no-referrer';
          audio.src = url;
          audio.playbackRate = playbackRate;

          let settled = false;
          const finish = (ok) => {
            if (settled) return;
            settled = true;
            audio.onended = null;
            audio.onerror = null;
            resolve(ok);
          };

          const timeoutMs = Math.min(9000, Math.max(2200, chunkText.length * 75));
          const timer = setTimeout(() => finish(true), timeoutMs);

          audio.onended = () => {
            clearTimeout(timer);
            finish(true);
          };
          audio.onerror = () => {
            clearTimeout(timer);
            finish(false);
          };

          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              clearTimeout(timer);
              finish(false);
            });
          }
        } catch (_) {
          resolve(false);
        }
      });
    }

    function playViaRankedDeviceNeuralVoice(text, langCode, playbackRate) {
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
          setTimeout(resolve, 800);
          return;
        }
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = langCode;
          utter.rate = playbackRate;
          utter.pitch = 1.0;

          const bestVoice = pickBestNeuralDeviceVoice(langCode);
          if (bestVoice) utter.voice = bestVoice;

          let finished = false;
          const done = () => {
            if (!finished) {
              finished = true;
              resolve();
            }
          };

          const fallbackMs = Math.min(8500, Math.max(1500, text.length * 65));
          const timer = setTimeout(done, fallbackMs);

          utter.onend = () => {
            clearTimeout(timer);
            done();
          };
          utter.onerror = () => {
            clearTimeout(timer);
            done();
          };

          window.speechSynthesis.speak(utter);
        } catch (_) {
          resolve();
        }
      });
    }

    async function processQueue() {
      if (isPlaying) return;
      isPlaying = true;

      while (queue.length > 0) {
        const item = queue.shift();
        const { text, langCode, activeCard } = item;
        // Dynamic speed catch-up (1.12x when queue has backlog, 1.05x normal Antigravity Live cadence)
        const rate = queue.length >= 1 ? 1.12 : 1.05;

        clearAllReplayingCards();
        let badge = null;
        if (activeCard) {
          activeCard.classList.add('replaying');
          badge = activeCard.querySelector('.speech-replay-badge');
          if (badge) badge.textContent = '🔊 Ouvindo...';
        }

        const chunks = splitIntoNaturalChunks(text);
        let cloudSucceeded = true;

        for (const chunk of chunks) {
          const ok = await playViaCloudNeuralStream(chunk, langCode, rate);
          if (!ok) {
            cloudSucceeded = false;
            break;
          }
        }

        if (!cloudSucceeded) {
          await playViaRankedDeviceNeuralVoice(text, langCode, rate);
        }

        if (activeCard) {
          activeCard.classList.remove('replaying');
          if (badge) badge.textContent = '🔊 Ouvir';
        }
      }

      isPlaying = false;
    }

    function enqueue(text, langCode, activeCard = null, immediateInterrupt = false) {
      if (!text || !text.trim()) return;
      if (immediateInterrupt) {
        queue.length = 0;
        if (state.sharedAudioEl) {
          try { state.sharedAudioEl.pause(); } catch (_) {}
        }
        if ('speechSynthesis' in window) {
          try { window.speechSynthesis.cancel(); } catch (_) {}
        }
        isPlaying = false;
      }
      queue.push({ text, langCode, activeCard });
      processQueue();
    }

    return { enqueue };
  })();

  async function sendWrittenMessage() {
    const input = $('input-text-message');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    unlockMobileAudio(false);
    input.value = '';
    await publishAndRenderClause(text);
  }

  // ==========================================================================
  // 14. LIGHT / DARK THEME SYSTEM (LOCALSTORAGE + DATA-THEME + 5s AUTO-COLLAPSE)
  // ==========================================================================
  let themeCollapseTimer = null;

  function getSavedUiTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return 'dark';
  }

  function expandThemeButtonFor5Seconds() {
    const btn = $('btn-theme-toggle');
    if (!btn) return;
    btn.classList.remove('collapsed');
    if (themeCollapseTimer) clearTimeout(themeCollapseTimer);
    themeCollapseTimer = setTimeout(() => {
      btn.classList.add('collapsed');
    }, 5000);
  }

  function applyUiTheme(theme, expandFor5s = true) {
    const normalized = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', normalized);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch (_) {}

    const metaTheme = $('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', normalized === 'light' ? '#F1F5F9' : '#070B10');
    }

    const btn = $('btn-theme-toggle');
    const sunIcon = $('theme-icon-sun');
    const moonIcon = $('theme-icon-moon');
    const label = $('theme-toggle-label');

    if (btn && sunIcon && moonIcon && label) {
      if (normalized === 'dark') {
        // Active theme is Dark -> Button offers switch to Light ("Claro" + Sun)
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        label.textContent = 'Claro';
        btn.setAttribute('aria-label', 'Alternar para tema claro');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Mudar para Tema Claro');
      } else {
        // Active theme is Light -> Button offers switch to Dark ("Escuro" + Moon)
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        label.textContent = 'Escuro';
        btn.setAttribute('aria-label', 'Alternar para tema escuro');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Mudar para Tema Escuro');
      }
    }

    if (expandFor5s) {
      expandThemeButtonFor5Seconds();
    }
  }

  function toggleUiTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getSavedUiTheme();
    const next = current === 'light' ? 'dark' : 'light';
    applyUiTheme(next, true);
  }

  // ==========================================================================
  // 15. EVENT BINDINGS (ANTIGRAVITY LIVE TAP + HOLD + BIDIRECTIONAL RECOVERY)
  // ==========================================================================
  function bindEvents() {
    $('btn-theme-toggle')?.addEventListener('click', toggleUiTheme);

    $('btn-camera-selfie').addEventListener('click', handleCameraButton);
    $('btn-upload-photo').addEventListener('click', () => $('input-file-photo').click());
    $('input-file-photo').addEventListener('change', (e) => handleFileSelected(e.target.files[0]));
    $('input-file-camera-fallback').addEventListener('change', (e) => handleFileSelected(e.target.files[0]));

    document.querySelectorAll('.quick-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectNativeLanguage(btn.dataset.lang);
      });
    });

    $('btn-other-languages').addEventListener('click', openLanguageCatalogModal);
    $('btn-inroom-lang-switch').addEventListener('click', openLanguageCatalogModal);
    $('btn-close-lang-modal').addEventListener('click', closeLanguageCatalogModal);
    $('lang-catalog-modal').addEventListener('click', (e) => {
      if (e.target === $('lang-catalog-modal')) closeLanguageCatalogModal();
    });

    $('input-search-lang').addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderLanguageCatalogModal();
    });

    document.querySelectorAll('.region-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeRegionFilter = tab.dataset.region;
        renderLanguageCatalogModal();
      });
    });

    $('form-setup-room').addEventListener('submit', handleSetupSubmit);

    const triggerShare = async () => {
      const shareUrl = getShareableRoomUrl();
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Sala Omnivox: ${state.roomName}`,
            text: `Entre na sala "${state.roomName}" para conversarmos com tradução simultânea Live:`,
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

    $('btn-corner-qr').addEventListener('click', () => {
      $('qr-modal').classList.remove('hidden');
    });
    $('btn-close-qr-modal').addEventListener('click', () => {
      $('qr-modal').classList.add('hidden');
    });
    $('qr-modal').addEventListener('click', (e) => {
      if (e.target === $('qr-modal')) $('qr-modal').classList.add('hidden');
    });

    // Antigravity Live Dual-Gesture Microphone Button (Supports BOTH Tap-to-Live AND Hold-to-Talk!)
    const pttBtn = $('btn-fixed-ptt');
    let pointerActive = false;

    const handlePressStart = (e) => {
      e.preventDefault();
      if (pointerActive) return;
      pointerActive = true;
      state.pressStartTime = Date.now();

      // If already in hands-free Live mode, tapping again finishes and sends!
      if (state.isMicActive) {
        state.isEndingOnTap = true;
        return;
      }

      state.isEndingOnTap = false;
      state.isLiveHandsFree = false;
      startLiveVoiceSession();
    };

    const handlePressEnd = (e) => {
      if (!pointerActive) return;
      if (e) e.preventDefault();
      pointerActive = false;

      if (state.isEndingOnTap) {
        state.isEndingOnTap = false;
        stopLiveVoiceSession();
        return;
      }

      const pressDuration = Date.now() - state.pressStartTime;
      if (pressDuration < 420) {
        // Quick tap (<420ms) -> Keep mic open in Antigravity Live Hands-Free Mode!
        if (state.isMicActive) {
          state.isLiveHandsFree = true;
          setMicUiActive(true, 'MODO LIVE ATIVO • TOQUE PARA ENVIAR');
        }
      } else {
        // Held down (>=420ms) and released -> Flush and send immediately!
        stopLiveVoiceSession();
      }
    };

    const handlePressCancel = () => {
      if (!pointerActive) return;
      pointerActive = false;
      // When mobile OS steals touch to display "Allow Microphone?" dialog, keep Live mode open or reset cleanly
      if (state.isMicActive) {
        state.isLiveHandsFree = true;
        setMicUiActive(true, 'MODO LIVE ATIVO • TOQUE PARA ENVIAR');
      }
    };

    pttBtn.addEventListener('mousedown', handlePressStart);
    window.addEventListener('mouseup', handlePressEnd);

    pttBtn.addEventListener('touchstart', handlePressStart, { passive: false });
    pttBtn.addEventListener('touchend', handlePressEnd, { passive: false });
    pttBtn.addEventListener('touchcancel', handlePressCancel, { passive: false });

    const btnToggleChat = $('btn-toggle-text-chat');
    const chatDrawer = $('text-chat-drawer');
    if (btnToggleChat && chatDrawer) {
      btnToggleChat.addEventListener('click', () => {
        const isHidden = chatDrawer.classList.toggle('hidden');
        btnToggleChat.classList.toggle('active', !isHidden);
        if (!isHidden) {
          setTimeout(() => $('input-text-message')?.focus(), 50);
        }
      });
    }

    $('btn-send-text-message')?.addEventListener('click', sendWrittenMessage);
    $('input-text-message')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendWrittenMessage();
      }
    });

    // Re-sync immediately when phone returns from permission prompt or lock screen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && state.inRoom) {
        CloudRelay.pollNow();
        broadcastMyPresence();
      }
    });
    window.addEventListener('focus', () => {
      if (state.inRoom) {
        CloudRelay.pollNow();
        broadcastMyPresence();
      }
    });

    // Unlock audio output on any interaction inside the room
    $('room-screen')?.addEventListener('touchstart', () => {
      if (!state.isMicActive) unlockMobileAudio(true);
    }, { passive: true });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=0.10').catch(() => {});
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
    applyUiTheme(getSavedUiTheme(), true);
    bindEvents();
    initSplashAndUrl();
  });
})();
