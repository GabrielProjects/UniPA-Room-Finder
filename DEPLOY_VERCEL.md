# Deploy su Vercel (Alternativa a Render.com)

Questa guida spiega come deployare il backend su Vercel, un servizio gratuito simile a GitHub Pages ma che supporta Node.js e serverless functions.

## Vantaggi di Vercel

- ✅ Gratuito (piano hobby)
- ✅ Deploy automatico da GitHub (come GitHub Pages)
- ✅ Supporta Node.js completo
- ✅ SSL automatico
- ✅ CDN globale
- ✅ Nessun cold start per funzioni frequenti

## Prerequisiti

1. Account GitHub (già ce l'hai)
2. Account Vercel (gratuito) - [vercel.com](https://vercel.com)

## Step 1: Crea Account Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "Sign Up" e accedi con GitHub
3. Autorizza Vercel ad accedere ai tuoi repository

## Step 2: Deploy del Backend

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Seleziona il repository `UnipaTool` (o il nome del tuo repo)
3. Vercel rileverà automaticamente la configurazione
4. **IMPORTANTE**: Configura le seguenti impostazioni:

   - **Framework Preset**: Other
   - **Root Directory**: `backend` (o lascia vuoto se la config è nella root)
   - **Build Command**: `cd backend && npm install` (o `npm install` se root è backend)
   - **Output Directory**: (lascia vuoto, non serve per API)
   - **Install Command**: `cd backend && npm install`

5. Aggiungi **Environment Variables**:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://gabrielprojects.github.io
   LOG_LEVEL=info
   CONCURRENCY=25
   MAX_CONCURRENT_REQUESTS=30
   DEBUG=false
   ```

6. Clicca "Deploy"
7. Aspetta che il deploy completi (2-3 minuti)
8. Copia l'URL del deploy (es: `https://unipatool-abc123.vercel.app`)

## Step 3: Configura CORS

1. Vai su Vercel Dashboard > Il tuo progetto > Settings > Environment Variables
2. Assicurati che `CORS_ORIGIN` sia impostato su `https://gabrielprojects.github.io`
3. Se necessario, aggiungi anche `https://gabrielprojects.github.io/UnipaTool`

## Step 4: Configura Frontend

1. Vai su GitHub > Il tuo repository > Settings > Secrets and variables > Actions
2. Aggiungi o aggiorna il secret `VITE_API_URL`:
   - **Value**: `https://unipatool-abc123.vercel.app/api` (sostituisci con il tuo URL Vercel)

## Step 5: Test

1. Testa il backend: `https://unipatool-abc123.vercel.app/api/health`
2. Dovresti vedere una risposta JSON con status "ok"
3. Fai push su `main` per triggerare il deploy del frontend
4. Testa l'app completa su GitHub Pages

## Limitazioni Vercel (Piano Gratuito)

- **Timeout**: 10 secondi per funzione (può essere un problema per scraping lunghi)
- **Bandwidth**: 100GB/mese
- **Funzioni**: 100 invocazioni/giorno per progetto

### Soluzione per Timeout Lunghi

Se le richieste di scraping superano i 10 secondi, considera:

1. **Ottimizzare il codice** (già fatto con parallelismo)
2. **Usare Vercel Pro** (60s timeout, $20/mese)
3. **Usare Railway o Fly.io** (timeout più lunghi, sempre gratuiti)

## Alternative Gratuite con Timeout Più Lunghi

### Railway.app
- Gratuito con $5 di crediti/mese
- Timeout: nessun limite pratico
- Deploy da GitHub
- [railway.app](https://railway.app)

### Fly.io
- Gratuito con limiti generosi
- Timeout: nessun limite pratico
- Deploy da GitHub
- [fly.io](https://fly.io)

## Troubleshooting

### Errore: Function timeout
- Le richieste di scraping sono troppo lunghe
- Soluzione: Ottimizza il codice o usa Railway/Fly.io

### Errore: CORS
- Verifica che `CORS_ORIGIN` in Vercel sia corretto
- Deve includere `https://gabrielprojects.github.io`

### Errore: Puppeteer non funziona
- Vercel supporta Puppeteer ma potrebbe richiedere configurazione aggiuntiva
- Considera di usare `puppeteer-core` con Chrome fornito da Vercel

## Note

- Vercel deploya automaticamente ad ogni push su `main`
- Puoi avere più deploy (preview per ogni PR)
- Il dominio è gratuito: `tuo-progetto.vercel.app`

