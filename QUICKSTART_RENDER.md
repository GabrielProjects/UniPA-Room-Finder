# 🚀 Quick Start: Deploy su Render.com

Guida rapida per deployare il backend su Render.com in 5 minuti.

## ⚡ Passi Rapidi

### 1️⃣ Crea Account (1 minuto)
- Vai su [render.com](https://render.com)
- Clicca **"Get Started for Free"**
- Accedi con **GitHub** (non serve carta di credito!)
- Autorizza Render ad accedere ai tuoi repository

### 2️⃣ Crea Nuovo Servizio (1 minuto)
- Nel dashboard, clicca **"New +"** (in alto a destra)
- Seleziona **"Web Service"**
- Clicca **"Connect account"** se non hai ancora connesso GitHub
- Seleziona il repository **`UnipaTool`** (o il nome del tuo repo)

### 3️⃣ Configurazione Automatica (30 secondi)
Render leggerà automaticamente il file `backend/render.yaml` e configurerà tutto!

**Verifica che queste impostazioni siano corrette:**
- **Name**: `unipatool-backend` (o come preferisci)
- **Environment**: `Node`
- **Region**: `Frankfurt` (o più vicino a te)
- **Branch**: `main`
- **Root Directory**: (lascia vuoto, Render userà la root)
- **Build Command**: `cd backend && npm install` ✅ (già configurato)
- **Start Command**: `cd backend && npm start` ✅ (già configurato)

### 4️⃣ Verifica Environment Variables (1 minuto)
Le variabili sono già configurate in `render.yaml`, ma verifica che siano presenti:

Clicca su **"Advanced"** e verifica che ci siano:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `CORS_ORIGIN` = `https://gabrielprojects.github.io` ✅ (già configurato)
- `LOG_LEVEL` = `info`
- `CONCURRENCY` = `25`
- `MAX_CONCURRENT_REQUESTS` = `30`
- `DEBUG` = `false`

### 5️⃣ Deploy! (2 minuti)
- Clicca **"Create Web Service"**
- Render inizierà il build automaticamente
- Aspetta 2-3 minuti per il deploy
- Vedrai i log in tempo reale

### 6️⃣ Ottieni l'URL (30 secondi)
- Dopo il deploy completato, vedrai l'URL del servizio
- Sarà qualcosa tipo: `https://unipatool-backend.onrender.com`
- **COPIA QUESTO URL** 📋

### 7️⃣ Configura Frontend GitHub (1 minuto)
- Vai su GitHub > Il tuo repository
- **Settings** > **Secrets and variables** > **Actions**
- Clicca **"New repository secret"**
- **Name**: `VITE_API_URL`
- **Secret**: `https://TUO-URL.onrender.com/api` (sostituisci con il tuo URL Render)
- Clicca **"Add secret"**

### 8️⃣ Test! 🎉
- Apri il browser e vai su: `https://TUO-URL.onrender.com/api/health`
- Dovresti vedere: `{"status":"ok","timestamp":"...","uptime":...}`
- ✅ **Backend funzionante!**

## 🔄 Deploy Automatico

Render deploya automaticamente ad ogni push su `main`:
- Vai su **Settings** > **Auto-Deploy**
- Verifica che sia impostato su **"Yes"**
- Branch: `main`

## ⚠️ Nota sul Cold Start

Render mette il servizio in "sleep" dopo 15 minuti di inattività:
- **Prima richiesta dopo sleep**: Può richiedere 30-60 secondi
- **Richieste successive**: Veloci come sempre

**Soluzione (opzionale):**
- Usa un servizio di ping gratuito come [UptimeRobot](https://uptimerobot.com) per mantenere il servizio attivo
- Oppure accetta il cold start (è normale per servizi gratuiti)

## 📊 Monitoraggio

- **Logs**: Clicca sul servizio > tab **"Logs"** per vedere i log in tempo reale
- **Metrics**: Tab **"Metrics"** per vedere CPU, RAM, traffico
- **Events**: Tab **"Events"** per vedere la cronologia dei deploy

## 💰 Costi

- **Gratuito**: Piano free disponibile
- **Limiti**: 
  - Sleep dopo 15 min di inattività
  - 750 ore/mese di runtime gratuito
- **Nessuna carta di credito richiesta** per iniziare

## 🆘 Problemi Comuni

### ❌ Build Failed
**Soluzione**: 
- Controlla i log in Render Dashboard
- Verifica che `backend/package.json` esista
- Assicurati che tutte le dipendenze siano corrette

### ❌ Port Error
**Soluzione**: Render assegna automaticamente la porta. Non serve configurare manualmente.

### ❌ CORS Error
**Soluzione**: 
- Verifica che `CORS_ORIGIN` sia esattamente `https://gabrielprojects.github.io`
- Non includere trailing slash
- Se usi un dominio personalizzato, aggiorna anche quello

### ❌ Service in Sleep
**Soluzione**: 
- È normale dopo 15 min di inattività
- La prima richiesta dopo sleep sarà più lenta
- Usa UptimeRobot per mantenere attivo (opzionale)

## ✅ Checklist Finale

- [ ] Account Render creato (con GitHub)
- [ ] Web Service creato e connesso al repository
- [ ] Build completato con successo
- [ ] URL del servizio copiato
- [ ] Secret `VITE_API_URL` configurato in GitHub Actions
- [ ] Health check funziona (`/api/health`)
- [ ] Frontend deployato su GitHub Pages
- [ ] App completa testata

## 🎯 Prossimi Passi

Dopo il deploy:
1. Testa l'app su GitHub Pages: `https://gabrielprojects.github.io/UnipaTool/`
2. Verifica che la ricerca aule funzioni
3. Monitora i log per eventuali errori
4. Goditi la tua app live! 🚀

---

**Hai bisogno di aiuto?** Controlla i log in Render Dashboard o apri un issue su GitHub.

