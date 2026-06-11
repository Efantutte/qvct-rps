const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── IN-MEMORY STORE ──
// Structure: { [pseudo]: { [defiId]: { ts, answer, hasPhoto } } }
let store = {};

// ── ROUTES ──

// GET /api/data — toutes les données (pour classement et dashboard)
app.get('/api/data', (req, res) => {
  res.json(store);
});

// GET /api/data/:pseudo — données d'un participant
app.get('/api/data/:pseudo', (req, res) => {
  const { pseudo } = req.params;
  res.json(store[pseudo] || {});
});

// POST /api/join — rejoindre (crée le pseudo si nouveau)
app.post('/api/join', (req, res) => {
  const { pseudo } = req.body;
  if (!pseudo || pseudo.trim().length === 0) {
    return res.status(400).json({ error: 'Pseudo invalide' });
  }
  const p = pseudo.trim().slice(0, 20);
  if (!store[p]) store[p] = {};
  res.json({ pseudo: p, done: store[p] });
});

// POST /api/validate — valider un défi
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

// GET /api/reset — reset (admin only, à supprimer en prod si besoin)
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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serveur QVCT démarré sur le port ${PORT}`);
});
