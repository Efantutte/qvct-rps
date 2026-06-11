# 🛸 QVCT Eleven Labs — Journée Pauses Actives

Application web de défis bien-être pour la semaine QVCT, avec classement en temps réel et dashboard admin.

---

## 📁 Structure du projet

```
qvct-app/
├── server.js          # Backend Express (API)
├── package.json
├── render.yaml        # Config déploiement Render
└── public/
    ├── index.html     # Application participants
    └── admin.html     # Dashboard admin
```

---

## 🚀 Déploiement (GitHub + Render)

### Étape 1 — Mettre le projet sur GitHub

1. Crée un nouveau repo sur [github.com](https://github.com) (ex: `qvct-eleven-labs`)
2. Dans un terminal :
```bash
cd qvct-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/qvct-eleven-labs.git
git push -u origin main
```

### Étape 2 — Déployer sur Render

1. Va sur [render.com](https://render.com) et connecte-toi avec GitHub
2. Clique **New → Web Service**
3. Sélectionne ton repo `qvct-eleven-labs`
4. Render détecte automatiquement le `render.yaml`
5. Clique **Deploy** — ton app sera live en ~2 minutes

### Étape 3 — Accéder à l'app

- **App participants** : `https://qvct-eleven-labs.onrender.com`
- **Dashboard admin** : `https://qvct-eleven-labs.onrender.com/admin.html`

---

## ⚠️ Note importante

Le stockage est **en mémoire** (RAM du serveur). Les données sont remises à zéro si le serveur redémarre. C'est parfait pour une journée d'événement — si tu veux de la persistance longue durée, il faudra ajouter une base de données (ex: Render PostgreSQL).

---

## 🔧 Lancer en local

```bash
npm install
npm start
# → http://localhost:3000
```
