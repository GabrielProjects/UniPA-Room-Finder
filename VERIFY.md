# Verifica Installazione - UnipaTool

Questo documento ti aiuta a verificare che tutto sia configurato correttamente.

## ✅ Checklist Pre-Installazione

- [ ] Node.js 18+ installato (`node --version`)
- [ ] npm installato (`npm --version`)
- [ ] Git installato (opzionale, per versioning)

## ✅ Checklist Post-Installazione

### Backend

- [ ] `backend/node_modules/` esiste
- [ ] `backend/package.json` presente
- [ ] `backend/server.js` presente
- [ ] `backend/src/` contiene tutti i moduli:
  - [ ] `src/routes/api.js`
  - [ ] `src/scraper/` (browser.js, buildings.js, rooms.js, calendar.js)
  - [ ] `src/cache/cache.js`
  - [ ] `src/utils/` (logger.js, retry.js, validators.js)
  - [ ] `src/config.js`

### Frontend

- [ ] `frontend/node_modules/` esiste
- [ ] `frontend/package.json` presente
- [ ] `frontend/index.html` presente
- [ ] `frontend/src/` contiene:
  - [ ] `src/App.vue`
  - [ ] `src/main.js`
  - [ ] `src/components/` (SearchForm.vue, ResultsTable.vue)
  - [ ] `src/services/api.js`
  - [ ] `src/styles/main.css`

## 🧪 Test Funzionali

### 1. Test Backend

```bash
cd backend
npm start
```

**Verifica:**
- [ ] Server si avvia senza errori
- [ ] Messaggio "Server running on port 3000" appare
- [ ] Nessun errore nella console

**Test API:**
```bash
# In un altro terminale
curl http://localhost:3000/api/health
```

**Risultato atteso:**
```json
{"status":"ok","timestamp":"2025-11-14T..."}
```

### 2. Test Frontend

```bash
cd frontend
npm run dev
```

**Verifica:**
- [ ] Server di sviluppo si avvia
- [ ] Nessun errore nella console
- [ ] Pagina si apre su `http://localhost:5173`

**Test UI:**
- [ ] La pagina si carica correttamente
- [ ] Il form di ricerca è visibile
- [ ] La lista edifici si carica (potrebbe richiedere qualche secondo)

### 3. Test Integrazione

1. Avvia backend: `cd backend && npm start`
2. Avvia frontend: `cd frontend && npm run dev`
3. Apri browser su `http://localhost:5173`
4. Seleziona un edificio
5. Scegli data e orario
6. Clicca "Cerca aule disponibili"

**Verifica:**
- [ ] La ricerca parte senza errori
- [ ] I risultati appaiono (o messaggio "Nessuna aula disponibile")
- [ ] Nessun errore nella console del browser
- [ ] Nessun errore nella console del backend

## 🐛 Troubleshooting

### Backend non si avvia

**Errore: "Cannot find module"**
- Soluzione: Esegui `cd backend && npm install`

**Errore: "Port already in use"**
- Soluzione: Cambia porta in `backend/.env` o termina il processo che usa la porta 3000

**Errore Puppeteer**
- Soluzione: Puppeteer scarica automaticamente Chrome. Se fallisce, installa manualmente Chrome/Chromium

### Frontend non si connette al backend

**Errore CORS**
- Verifica: `CORS_ORIGIN` in backend config
- Soluzione: Aggiungi `http://localhost:5173` a `CORS_ORIGIN`

**Errore "Network Error"**
- Verifica: Backend è in esecuzione
- Verifica: `VITE_API_URL` in `frontend/.env` è corretto

### Nessun edificio nella lista

- Verifica: Connessione internet attiva
- Verifica: Il sito Unipa è raggiungibile
- Verifica: Log del backend per errori di scraping

## 📊 Metriche di Successo

Se tutti i test passano:
- ✅ Backend risponde alle richieste
- ✅ Frontend si connette al backend
- ✅ Scraping funziona (edifici caricati)
- ✅ Ricerca funziona (risultati o messaggio appropriato)
- ✅ UI è responsive e funzionale

## 🚀 Pronto per Deploy

Se tutti i test passano, puoi procedere con il deploy seguendo `DEPLOY.md`.

