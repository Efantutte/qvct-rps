const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Cherche les fichiers statiques dans public/ ou à la racine
const publicDir = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

app.use(express.static(publicDir));

// ── IN-MEMORY STORE ──
let store = {};

// GET /api/data
app.get('/api/data', (req, res) => {
  res.json(store);
});

// GET /api/data/:pseudo
app.get('/api/data/:pseudo', (req, res) => {
  const { pseudo } = req.params;
  res.json(store[pseudo] || {});
});

// POST /api/join
app.post('/api/join', (req, res) => {
  const { pseudo } = req.body;
  if (!pseudo || pseudo.trim().length === 0) {
    return res.status(400).json({ error: 'Pseudo invalide' });
  }
  const p = pseudo.trim().slice(0, 20);
  if (!store[p]) store[p] = {};
  res.json({ pseudo: p, done: store[p] });
});

// POST /api/validate
app.post('/api/validate', (req, res) => {
  const { pseudo, defiId, answer, hasPhoto } = req.body;
  if (!pseudo || !defiId || !answer) {
    return res.status(400).json({ error: 'Données manquantes' });
  }
  if (!store[pseudo]) store[pseudo] = {};
  store[pseudo][defiId] = {
    ts: Date.now(),
    answer: answer.trim(),
    hasPhoto: !!hasPhoto
  };
  res.json({ ok: true, done: store[pseudo] });
});

// POST /api/reset
app.post('/api/reset', (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Non autorisé' });
  }
  store = {};
  res.json({ ok: true });
});

// Fallback → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serveur QVCT démarré sur le port ${PORT}`);
  console.log(`📁 Fichiers statiques servis depuis : ${publicDir}`);
});
