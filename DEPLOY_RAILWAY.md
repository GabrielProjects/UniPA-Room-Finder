# Deploy su Railway (Raccomandato per Puppeteer)

Railway è perfetto per applicazioni Node.js con Puppeteer perché:
- ✅ Gratuito con $5 di crediti/mese (più che sufficiente)
- ✅ Nessun limite di timeout
- ✅ Deploy automatico da GitHub
- ✅ Supporta Puppeteer senza problemi

## Prerequisiti

1. Account GitHub (già ce l'hai)
2. Account Railway - [railway.app](https://railway.app) (gratuito)

## Step 1: Crea Account Railway

1. Vai su [railway.app](https://railway.app)
2. Clicca "Start a New Project"
3. Accedi con GitHub
4. Autorizza Railway ad accedere ai tuoi repository

## Step 2: Deploy del Backend

1. Clicca "New Project"
2. Seleziona "Deploy from GitHub repo"
3. Scegli il repository `UnipaTool`
4. Railway rileverà automaticamente che è un progetto Node.js

## Step 3: Configura il Servizio

1. Railway creerà automaticamente un servizio
2. Vai su "Settings" del servizio
3. Imposta:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start` (già configurato automaticamente)

## Step 4: Configura Environment Variables

1. Vai su "Variables" nel servizio
2. Aggiungi le seguenti variabili:

```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://gabrielprojects.github.io
LOG_LEVEL=info
CONCURRENCY=25
MAX_CONCURRENT_REQUESTS=30
DEBUG=false
```

## Step 5: Ottieni l'URL del Deploy

1. Vai su "Settings" > "Networking"
2. Clicca "Generate Domain"
3. Railway genererà un dominio (es: `unipatool-production.up.railway.app`)
4. Copia questo URL

## Step 6: Configura Frontend

1. Vai su GitHub > Il tuo repository > Settings > Secrets and variables > Actions
2. Aggiungi o aggiorna il secret `VITE_API_URL`:
   - **Value**: `https://unipatool-production.up.railway.app/api` (sostituisci con il tuo URL Railway)

## Step 7: Test

1. Testa il backend: `https://unipatool-production.up.railway.app/api/health`
2. Dovresti vedere una risposta JSON con status "ok"
3. Fai push su `main` per triggerare il deploy del frontend
4. Testa l'app completa su GitHub Pages

## Deploy Automatico

Railway deploya automaticamente ad ogni push su `main` (se configurato).
Per abilitarlo:
1. Vai su "Settings" > "Source"
2. Assicurati che "Auto Deploy" sia abilitato
3. Seleziona il branch `main`

## Costi

- **Piano Gratuito**: $5 di crediti/mese
- **Costi stimati**: ~$0.50-2/mese per un'app con traffico moderato
- Se superi i $5, Railway ti avviserà (non addebiterà automaticamente)

## Vantaggi rispetto a Vercel

- ✅ Nessun limite di timeout (Vercel: 10s free, 60s pro)
- ✅ Supporto completo per Puppeteer
- ✅ Più adatto per operazioni lunghe (scraping)

## Troubleshooting

### Errore: Build failed
- Verifica che `backend/package.json` esista
- Controlla i log in Railway Dashboard

### Errore: Port already in use
- Railway assegna automaticamente la porta tramite `PORT` env var
- Non serve configurare manualmente

### Errore: Puppeteer non funziona
- Railway supporta Puppeteer out-of-the-box
- Se hai problemi, verifica i log

