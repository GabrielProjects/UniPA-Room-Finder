# UnipaTool - Room Finder

Un'applicazione web per trovare aule disponibili presso l'Università di Palermo (Unipa). L'applicazione interroga il sistema ufficiale di prenotazione aule e mostra le aule libere per un periodo specificato.

## 🚀 Live Demo

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://YOUR_USERNAME.github.io/UnipaTool/)

**Nota**: Sostituisci `YOUR_USERNAME` con il tuo username GitHub nel file `backend/render.yaml` e nelle configurazioni.

## 📋 Caratteristiche

- 🔍 Ricerca aule disponibili per edificio, data e orario
- 📅 Modalità flessibile: trova qualsiasi slot disponibile di durata specifica
- 📱 Design responsive (mobile e desktop)
- ⚡ Performance ottimizzate con caching intelligente
- 🔄 Aggiornamento automatico degli orari (cache per data)

## 🏗️ Architettura

L'applicazione è divisa in due parti:

- **Backend**: Node.js + Express + Puppeteer (API REST)
- **Frontend**: Vue.js 3 + Vite (SPA)

### Stack Tecnologico

- **Backend**:
  - Node.js + Express
  - Puppeteer (web scraping)
  - node-cache (caching)
  - axios (HTTP client)

- **Frontend**:
  - Vue.js 3 (Composition API)
  - Vite (build tool)
  - axios (API client)

## 📦 Installazione Locale

### Prerequisiti

- Node.js 18+ e npm
- Git (opzionale)

### Installazione Automatica

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Installazione Manuale

**Backend:**
```bash
cd backend
npm install
npm start
```

Il backend sarà disponibile su `http://localhost:3000`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

### Configurazione

Crea un file `.env` nella cartella `frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Deploy

### Frontend (GitHub Pages)

Il frontend viene deployato automaticamente su GitHub Pages tramite GitHub Actions quando si fa push su `main`.

1. Vai su Settings > Pages nel tuo repository GitHub
2. Seleziona "GitHub Actions" come source
3. Il workflow `.github/workflows/deploy.yml` si occuperà del deploy

### Backend (Railway - Raccomandato)

**Opzione 1: Render.com** (Raccomandato - Gratuito, Nessuna Carta)
- ✅ Completamente gratuito senza carta di credito
- ✅ Deploy automatico da GitHub
- ✅ Configurazione automatica con `render.yaml`
- ⚠️ Cold start dopo 15 min di inattività (normale per servizi gratuiti)
- 📖 **Guida rapida**: Vedi [QUICKSTART_RENDER.md](QUICKSTART_RENDER.md)
- 📖 **Guida dettagliata**: Vedi [DEPLOY.md](DEPLOY.md)

**Opzione 2: Railway**
- ✅ Gratuito con $5 crediti/mese
- ✅ Nessun limite di timeout
- ⚠️ Richiede carta di credito (anche se gratuito)
- 📖 Vedi [QUICKSTART_RAILWAY.md](QUICKSTART_RAILWAY.md) o [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

**Opzione 3: Vercel**
- ⚠️ Timeout limitato (10s free, 60s pro) - può essere insufficiente per scraping
- 📖 Vedi [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) per istruzioni

## 📁 Struttura Progetto

```
UnipaTool/
├── backend/              # Backend Node.js
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── scraper/     # Logica scraping
│   │   ├── cache/       # Sistema caching
│   │   └── utils/       # Utility functions
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/            # Frontend Vue.js
│   ├── src/
│   │   ├── components/  # Componenti Vue
│   │   ├── services/    # API client
│   │   └── styles/      # CSS
│   ├── index.html
│   └── package.json
├── docs/                # Documentazione
└── README.md
```

## 🔧 Configurazione

### Backend

Variabili d'ambiente (opzionali):

- `PORT`: Porta del server (default: 3000)
- `CORS_ORIGIN`: Origine permessa per CORS (default: *)
- `LOG_LEVEL`: Livello di log (default: info)

### Frontend

Variabili d'ambiente:

- `VITE_API_URL`: URL del backend API (default: http://localhost:3000/api)

## 📝 API Endpoints

### GET /api/buildings

Ottiene la lista degli edifici disponibili.

**Response**:
```json
{
  "buildings": ["Edificio 8", "Edificio 15", ...]
}
```

### POST /api/search

Cerca aule disponibili.

**Request**:
```json
{
  "building": "Edificio 8",
  "date": "2025-11-15",
  "start_time": "14:00",
  "end_time": "16:00",
  "flexible_mode": false,
  "duration": 2
}
```

**Response**:
```json
{
  "results": [
    {
      "name": "A101",
      "seats": "50",
      "url": "https://...",
      "slots": [] // Solo se flexible_mode = true
    }
  ],
  "total": 5,
  "flexible_mode": false
}
```

### GET /api/health

Health check endpoint.

## 🐛 Troubleshooting

### Backend non si avvia

- Verifica che Node.js 18+ sia installato
- Controlla che tutte le dipendenze siano installate: `npm install`
- Verifica i log per errori specifici

### Frontend non si connette al backend

- Verifica che `VITE_API_URL` sia configurato correttamente
- Controlla che il backend sia in esecuzione
- Verifica CORS settings nel backend

### Errori di scraping

- Il sito Unipa potrebbe essere temporaneamente non disponibile
- Verifica la connessione internet
- Controlla i log del backend per dettagli

## 📄 Licenza

MIT

## 👤 Autore

Creato per facilitare la ricerca di aule disponibili presso l'Università di Palermo.
