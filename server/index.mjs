// Folk Print — maket-builder order relay.
// Receives the designer's order POST (spec + artwork PNG + 3D snapshot PNG) and
// forwards it to a Telegram chat via the bot. The bot token lives ONLY here
// (env), never in the browser bundle.
import http from 'node:http';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const PORT = Number(process.env.PORT || 8090);
const MAX_BODY = 50 * 1024 * 1024; // 50 MB (board + 3D + composite + source uploads)
const API = `https://api.telegram.org/bot${TOKEN}`;

const ZONE_ORDER = ['front', 'back', 'sleeveL', 'sleeveR'];
const PART_LABELS = {
  front: 'Перед',
  back: 'Спина',
  sleeveL: 'Левый рукав',
  sleeveR: 'Правый рукав',
};

function dataUrlToFile(dataUrl, name) {
  if (typeof dataUrl !== 'string') return null;
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], buf: Buffer.from(m[2], 'base64'), name };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function tgJson(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`${method}: ${json.description || res.status}`);
  return json;
}

async function tgFile(method, fields, fileField, file) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, String(v));
  fd.append(fileField, new Blob([file.buf], { type: file.mime }), file.name);
  const res = await fetch(`${API}/${method}`, { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`${method}: ${json.description || res.status}`);
  return json;
}

// Sends a photo album (2–10) with per-item captions. items: [{ key, buf, caption }].
async function tgMediaGroup(items) {
  const fd = new FormData();
  fd.append('chat_id', CHAT_ID);
  const media = items.slice(0, 10).map((it, i) => {
    fd.append(`file${i}`, new Blob([it.buf], { type: 'image/png' }), `${it.key}.png`);
    return { type: 'photo', media: `attach://file${i}`, caption: it.caption };
  });
  fd.append('media', JSON.stringify(media));
  const res = await fetch(`${API}/sendMediaGroup`, { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`sendMediaGroup: ${json.description || res.status}`);
  return json;
}

function summaryText(p) {
  const zones = ZONE_ORDER.map((k) => {
    const prints = (p.pieces && p.pieces[k] && p.pieces[k].prints) || [];
    const names = prints.map((pr) => pr.fileName || 'принт').join(', ');
    return `• <b>${PART_LABELS[k]}</b>: ${prints.length ? esc(names) : '—'}`;
  });
  return [
    '🆕 <b>Новый макет</b> · Folk Print',
    `Изделие: <b>${esc(p.product || 'футболка')}</b>`,
    `Цвет ткани: <code>${esc(p.shirtColor || '—')}</code>`,
    '',
    '<b>Что на каждой зоне:</b>',
    ...zones,
    '',
    'Ниже — фото каждой стороны и файлы, загруженные клиентом.',
    `🕑 ${esc((p.generatedAt || new Date().toISOString()).replace('T', ' ').slice(0, 19))} UTC`,
  ].join('\n');
}

async function relay(payload) {
  await tgJson('sendMessage', {
    chat_id: CHAT_ID,
    text: summaryText(payload),
    parse_mode: 'HTML',
  });

  // One photo PER side, sent as an album — each side its own labelled photo.
  const zonePhotos = ZONE_ORDER
    .map((k) => {
      const f = dataUrlToFile(payload.zonePngs && payload.zonePngs[k], `${k}.png`);
      return f && f.buf.length <= 10 * 1024 * 1024 ? { key: k, buf: f.buf, caption: PART_LABELS[k] } : null;
    })
    .filter(Boolean);
  if (zonePhotos.length >= 2) {
    await tgMediaGroup(zonePhotos);
  } else if (zonePhotos.length === 1) {
    await tgFile(
      'sendPhoto',
      { chat_id: CHAT_ID, caption: zonePhotos[0].caption },
      'photo',
      { buf: zonePhotos[0].buf, mime: 'image/png', name: `${zonePhotos[0].key}.png` },
    );
  }

  // The customer's ORIGINAL uploaded files — the real artwork, sent as documents
  // (full quality), each labelled with the zone it was placed on.
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  for (const s of sources) {
    const f = dataUrlToFile(s.src, s.fileName || 'print');
    if (!f) continue;
    f.name = s.fileName || f.name;
    const zoneLabel = PART_LABELS[s.zone] || s.zone || '';
    await tgFile(
      'sendDocument',
      { chat_id: CHAT_ID, caption: `Загрузка клиента — ${esc(zoneLabel)}: ${esc(s.fileName || '')}` },
      'document',
      f,
    );
  }

  const snap = dataUrlToFile(payload.snapshotPng, 'preview-3d.png');
  if (snap && snap.buf.length <= 10 * 1024 * 1024) {
    await tgFile('sendPhoto', { chat_id: CHAT_ID, caption: '3D-превью' }, 'photo', snap);
  }

  const art = dataUrlToFile(payload.artworkPng, 'folk-print-artwork.png');
  if (art) {
    await tgFile('sendDocument', { chat_id: CHAT_ID, caption: 'Файл печати (артворк PNG)' }, 'document', art);
  }

  // The placement spec as a JSON file — strip the heavy data URLs first.
  const { artworkPng, snapshotPng, boardPng, zonePngs, sources: _src, ...spec } = payload;
  const specFile = {
    mime: 'application/json',
    buf: Buffer.from(JSON.stringify(spec, null, 2)),
    name: 'folk-print-spec.json',
  };
  await tgFile('sendDocument', { chat_id: CHAT_ID, caption: 'Спецификация (JSON)' }, 'document', specFile);
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'content-type': 'text/plain', ...CORS });
    return res.end(TOKEN && CHAT_ID ? 'ok' : 'misconfigured');
  }
  if (req.method === 'POST' && req.url === '/api/order') {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        res.writeHead(413, { 'content-type': 'application/json', ...CORS });
        res.end('{"ok":false,"error":"payload too large"}');
        req.destroy();
      } else {
        chunks.push(c);
      }
    });
    req.on('end', async () => {
      if (res.writableEnded) return;
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        await relay(payload);
        res.writeHead(200, { 'content-type': 'application/json', ...CORS });
        res.end('{"ok":true}');
      } catch (e) {
        console.error('[order] relay failed:', e.message);
        res.writeHead(502, { 'content-type': 'application/json', ...CORS });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }
  res.writeHead(404, CORS);
  res.end();
});

server.listen(PORT, () => {
  console.log(`[maket-order-api] listening on :${PORT} — token:${TOKEN ? 'set' : 'MISSING'} chat:${CHAT_ID || 'MISSING'}`);
});
