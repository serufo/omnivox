# Omnivox — Tradução Simultânea Multidirecional (PWA)

Progressive Web App (PWA) de tradução simultânea multidirecional em tempo real via QR Code e Push-to-Talk, com baixa latência e arquitetura validada para dispositivos móveis (incluindo Safari/iOS em segundo plano).

## Pilares Arquiteturais Implementados

1. **Blindagem de Áudio Safari/iOS (`-70dB` Keep-Alive + `MediaSession` + `WakeLock`):**
   - Desbloqueio do `AudioContext` no gesto de entrada na sala.
   - Loop contínuo de oscilador sub-audível (`1Hz` a `-70dB`) para impedir que o WebKit suspenda a sessão de áudio com a tela bloqueada.
   - Registro na `MediaSession API` e `Screen Wake Lock API`, com detecção automática do estado `interrupted`/`suspended`.
2. **Streaming por Cláusulas Semânticas (`Sub-1s TTFB`):**
   - Fatiamento incremental da fala durante o Push-to-Talk por pontuação/pausa com janela deslizante de contexto da frase anterior.
3. **Controle de Piso via Mutex + Fila de Mão Levantada + Cooldown Acústico (`650ms`):**
   - Apenas 1 locutor ativo por vez (com *hard-cap* de 45s).
   - Participantes que acionam o PTT durante outra fala entram automaticamente na fila visual e ganham a vez após o *Acoustic Cooldown* (`650ms` se houver celulares em modo alto-falante na mesa; `120ms` se todos estiverem de fone).
4. **Fila FIFO de Áudio no Ouvinte com Catch-up Dinâmico (`1.12x`):**
   - Nunca interrompe nem corta uma tradução pela metade; acelera suavemente a taxa de reprodução para `1.12x` quando há mais de 1 chunk aguardando na fila.
5. **Unit Economics em Tempo Real (Fan-Out por Idioma Único & Modelo Host-Pays):**
   - Calcula o fan-out por idioma distinto na sala (e não por participante) e suporta **Trial Gratuito** (`$0.00/min` de TTS em nuvem usando síntese nativa do sistema operacional) e **Passe Evento Pro**.

## Como Rodar Localmente (Servidor WebSocket Node.js)

```bash
node server.js
```
O servidor HTTP + WebSocket RFC 6455 (zero dependências externas) inicia na porta `3000`.
