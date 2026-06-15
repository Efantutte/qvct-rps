const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── STATIC FILES ──
const publicDir = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;
app.use(express.static(publicDir));

// ── MONGODB ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err.message));

// ── SCHEMA ──
const defiSchema = new mongoose.Schema({
  defiId:   { type: Number, required: true },
  answer:   { type: String, required: true },
  hasPhoto: { type: Boolean, default: false },
  ts:       { type: Date, default: Date.now }
});

const participantSchema = new mongoose.Schema({
  pseudo: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
  defis:  { type: Map, of: defiSchema, default: {} }
}, { timestamps: true });

const Participant = mongoose.model('Participant', participantSchema);

// ── HELPERS ──
// Convertit un participant Mongoose en objet plat { defiId: { ts, answer, hasPhoto } }
function toPlain(participant) {
  const done = {};
  if (participant.defis) {
    for (const [id, val] of participant.defis.entries()) {
      done[id] = { ts: val.ts, answer: val.answer, hasPhoto: val.hasPhoto };
    }
  }
  return done;
}

// ── ROUTES ──

// GET /api/data — toutes les données
app.get('/api/data', async (req, res) => {
  try {
    const participants = await Participant.find({});
    const result = {};
    participants.forEach(p => { result[p.pseudo] = toPlain(p); });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/join — rejoindre ou se reconnecter
app.post('/api/join', async (req, res) => {
  try {
    const { pseudo } = req.body;
    if (!pseudo || pseudo.trim().length === 0) {
      return res.status(400).json({ error: 'Pseudo invalide' });
    }
    const p = pseudo.trim().slice(0, 20);
    let participant = await Participant.findOne({ pseudo: p });
    if (!participant) {
      participant = await Participant.create({ pseudo: p });
    }
    res.json({ pseudo: p, done: toPlain(participant) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/validate — valider un défi
app.post('/api/validate', async (req, res) => {
  try {
    const { pseudo, defiId, answer, hasPhoto } = req.body;
    if (!pseudo || !defiId || !answer) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    const participant = await Participant.findOne({ pseudo });
    if (!participant) {
      return res.status(404).json({ error: 'Participant introuvable' });
    }
    participant.defis.set(String(defiId), {
      defiId: Number(defiId),
      answer: answer.trim(),
      hasPhoto: !!hasPhoto,
      ts: new Date()
    });
    await participant.save();
    res.json({ ok: true, done: toPlain(participant) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reset — remise à zéro (admin)
app.post('/api/reset', async (req, res) => {
  try {
    const { secret } = req.body;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    await Participant.deleteMany({});
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Fallback → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serveur QVCT démarré sur le port ${PORT}`);
  console.log(`📁 Fichiers statiques : ${publicDir}`);
});
