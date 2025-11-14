# Guida al Deploy - UnipaTool

Questa guida spiega come deployare UnipaTool su GitHub Pages (frontend) e Render.com (backend).

## Prerequisiti

1. Account GitHub
2. Account Render.com (gratuito)
3. Repository GitHub con il codice

## Step 1: Deploy Backend su Render.com

1. Vai su [Render.com](https://render.com) e crea un account
2. Clicca su "New +" > "Web Service"
3. Connetti il tuo repository GitHub
4. Configura il servizio:
   - **Name**: `unipatool-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Aggiungi Environment Variables:
   - `CORS_ORIGIN`: `https://TUO_USERNAME.github.io` (sostituisci TUO_USERNAME)
   - `LOG_LEVEL`: `info`
   - `NODE_ENV`: `production`

6. Clicca "Create Web Service"
7. Aspetta che il deploy completi e copia l'URL del servizio (es: `https://unipatool-backend.onrender.com`)

## Step 2: Configura GitHub Pages per Frontend

1. Vai su Settings > Pages nel tuo repository GitHub
2. Sotto "Source", seleziona "GitHub Actions"
3. Il workflow `.github/workflows/deploy.yml` si occuperà automaticamente del deploy

## Step 3: Configura Frontend per usare Backend Deployato

1. Vai su Settings > Secrets and variables > Actions nel tuo repository GitHub
2. Aggiungi un nuovo secret:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://unipatool-backend.onrender.com/api` (usa l'URL del tuo backend Render)

3. Aggiorna `.github/workflows/deploy.yml` se necessario per usare il secret:
   ```yaml
   env:
     VITE_API_URL: ${{ secrets.VITE_API_URL }}
   ```

## Step 4: Aggiorna CORS nel Backend

1. Vai su Render.com dashboard
2. Seleziona il tuo servizio backend
3. Vai su Environment
4. Aggiorna `CORS_ORIGIN` con l'URL completo del tuo frontend GitHub Pages:
   - Es: `https://TUO_USERNAME.github.io`

## Step 5: Test

1. Fai push su `main` per triggerare il deploy del frontend
2. Verifica che il frontend sia disponibile su `https://TUO_USERNAME.github.io/UnipaTool/`
3. Verifica che il backend risponda su `https://unipatool-backend.onrender.com/api/health`
4. Testa la ricerca di aule dal frontend

## Troubleshooting

### Frontend non si connette al backend

- Verifica che `VITE_API_URL` sia configurato correttamente nel workflow
- Controlla la console del browser per errori CORS
- Verifica che `CORS_ORIGIN` nel backend includa l'URL del frontend

### Backend non si avvia

- Controlla i log su Render.com
- Verifica che tutte le dipendenze siano in `package.json`
- Assicurati che `server.js` sia il file corretto

### Deploy GitHub Pages fallisce

- Verifica che il workflow `.github/workflows/deploy.yml` sia presente
- Controlla i log di GitHub Actions
- Assicurati che `vite.config.js` abbia il `base` corretto

## Note

- Il piano gratuito di Render.com mette il servizio in sleep dopo 15 minuti di inattività
- La prima richiesta dopo il sleep può richiedere 30-60 secondi
- Considera di usare un servizio di ping per mantenere il backend attivo

