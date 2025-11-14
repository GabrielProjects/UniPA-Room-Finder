# Quick Start Guide - UnipaTool

Guida rapida per iniziare con UnipaTool.

## Prerequisiti

- Node.js 18+ installato
- npm o yarn
- Git

## Installazione Rapida

### 1. Clona il repository (se non l'hai già fatto)

```bash
git clone <repository-url>
cd UnipaTool
```

### 2. Installa dipendenze Backend

```bash
cd backend
npm install
```

### 3. Installa dipendenze Frontend

```bash
cd ../frontend
npm install
```

## Avvio Locale

### Terminale 1 - Backend

```bash
cd backend
npm start
```

Il backend sarà disponibile su `http://localhost:3000`

### Terminale 2 - Frontend

```bash
cd frontend
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

## Configurazione

### Backend

Crea `backend/.env` (opzionale):

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### Frontend

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Test

1. Apri il browser su `http://localhost:5173`
2. Seleziona un edificio
3. Scegli data e orario
4. Clicca "Cerca aule disponibili"

## Troubleshooting

### Backend non si avvia

- Verifica che Node.js sia installato: `node --version`
- Verifica che tutte le dipendenze siano installate: `cd backend && npm install`
- Controlla i log per errori

### Frontend non si connette al backend

- Verifica che il backend sia in esecuzione
- Controlla che `VITE_API_URL` in `frontend/.env` sia corretto
- Apri la console del browser (F12) per vedere errori

### Errori Puppeteer

- Puppeteer scarica automaticamente Chrome
- Su Linux potrebbe essere necessario installare dipendenze: `sudo apt-get install -y libgbm-dev`
- Su Windows/Mac dovrebbe funzionare out-of-the-box

## Prossimi Passi

- Vedi `README.md` per documentazione completa
- Vedi `DEPLOY.md` per istruzioni di deploy
- Vedi `docs/DESIGN.md` per architettura del sistema

