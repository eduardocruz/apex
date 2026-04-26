// server.js — local proxy + UI for the two-node AXL hello world.
//
// Why a proxy? AXL nodes expose their HTTP API on 127.0.0.1:9002 and 9012.
// A static HTML page can't hit two different ports without CORS pain, so we
// run a single HTTP server that serves the UI and forwards calls to whichever
// node the UI asks for.
//
// Endpoints:
//   GET  /                  -> index.html
//   GET  /api/topology/{a|b}  -> proxies node's /topology
//   POST /api/send            -> { from: "a"|"b", toPeerId, message } -> node's /send
//   GET  /api/recv/{a|b}      -> proxies node's /recv (204 if empty)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NODES = {
  a: 'http://127.0.0.1:9002',
  b: 'http://127.0.0.1:9012',
};
const PORT = Number(process.env.PORT) || 5959;

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });
}

function whichNode(req) {
  const m = req.url.match(/\/(a|b)(?:\?|$)/);
  return m ? m[1] : null;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
      return;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/topology/')) {
      const node = whichNode(req);
      if (!node) { res.writeHead(404); res.end('{}'); return; }
      const r = await fetch(`${NODES[node]}/topology`);
      res.writeHead(r.status, { 'Content-Type': 'application/json' });
      res.end(await r.text());
      return;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/recv/')) {
      const node = whichNode(req);
      if (!node) { res.writeHead(404); res.end('{}'); return; }
      const r = await fetch(`${NODES[node]}/recv`);
      if (r.status === 204) { res.writeHead(204); res.end(); return; }
      const body = await r.text();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(r.status);
      res.end(JSON.stringify({
        from: r.headers.get('x-from-peer-id') || null,
        body,
      }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/send') {
      const { from, toPeerId, message } = await readBody(req);
      if (!from || !NODES[from]) throw new Error('from must be "a" or "b"');
      if (!/^[0-9a-fA-F]{64}$/.test(toPeerId || '')) throw new Error('toPeerId must be a 64-char hex public key');
      const r = await fetch(`${NODES[from]}/send`, {
        method: 'POST',
        headers: { 'X-Destination-Peer-Id': toPeerId },
        body: message ?? '',
      });
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(r.status);
      res.end(JSON.stringify({
        ok: r.ok,
        status: r.status,
        sentBytes: r.headers.get('x-sent-bytes'),
      }));
      return;
    }

    res.writeHead(404);
    res.end('{}');
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`AXL hello: http://localhost:${PORT}`);
  console.log(`Proxying node A: ${NODES.a}`);
  console.log(`Proxying node B: ${NODES.b}`);
});
