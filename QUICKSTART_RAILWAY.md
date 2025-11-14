# 🚀 Quick Start: Deploy su Railway

Guida rapida per deployare il backend su Railway in 5 minuti.

## ⚡ Passi Rapidi

### 1️⃣ Crea Account (1 minuto)
- Vai su [railway.app](https://railway.app)
- Clicca **"Start a New Project"**
- Accedi con **GitHub**
- Autorizza Railway

### 2️⃣ Deploy Repository (2 minuti)
- Clicca **"New Project"**
- Seleziona **"Deploy from GitHub repo"**
- Scegli il repository **`UnipaTool`**
- Railway rileverà automaticamente Node.js

### 3️⃣ Configura Root Directory (30 secondi)
- Nel servizio creato, vai su **"Settings"**
- Scrolla fino a **"Root Directory"**
- Imposta: `backend`
- Salva

### 4️⃣ Aggiungi Environment Variables (1 minuto)
- Vai su **"Variables"** (tab in alto)
- Clicca **"+ New Variable"** per ogni variabile:

| Nome | Valore |
|------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CORS_ORIGIN` | `https://gabrielprojects.github.io` |
| `LOG_LEVEL` | `info` |
| `CONCURRENCY` | `25` |
| `MAX_CONCURRENT_REQUESTS` | `30` |
| `DEBUG` | `false` |

### 5️⃣ Genera Dominio (30 secondi)
- Vai su **"Settings"** > **"Networking"**
- Clicca **"Generate Domain"**
- Railway genererà un URL tipo: `unipatool-production-xxxx.up.railway.app`
- **COPIA QUESTO URL** 📋

### 6️⃣ Configura Frontend GitHub (1 minuto)
- Vai su GitHub > Il tuo repository
- **Settings** > **Secrets and variables** > **Actions**
- Clicca **"New repository secret"**
- **Name**: `VITE_API_URL`
- **Secret**: `https://TUO-URL-RAILWAY.up.railway.app/api` (sostituisci con il tuo URL)
- Clicca **"Add secret"**

### 7️⃣ Test! 🎉
- Apri il browser e vai su: `https://TUO-URL-RAILWAY.up.railway.app/api/health`
- Dovresti vedere: `{"status":"ok","timestamp":"...","uptime":...}`
- ✅ **Backend funzionante!**

## 🔄 Deploy Automatico

Railway deploya automaticamente ad ogni push su `main`:
- Vai su **Settings** > **Source**
- Verifica che **"Auto Deploy"** sia attivo
- Branch: `main`

## 📊 Monitoraggio

- **Logs**: Clicca sul servizio > tab **"Deployments"** > clicca su un deploy > **"View Logs"**
- **Metrics**: Tab **"Metrics"** per vedere CPU, RAM, traffico

## 💰 Costi

- **Gratuito**: $5 crediti/mese
- **Costo stimato**: ~$0.50-2/mese
- Railway ti avvisa se superi i crediti (non addebita automaticamente)

## 🆘 Problemi Comuni

### ❌ Build Failed
**Soluzione**: Verifica che `backend/package.json` esista e che tutte le dipendenze siano corrette.

### ❌ Port Error
**Soluzione**: Railway usa automaticamente la variabile `PORT`. Non serve configurare manualmente.

### ❌ Puppeteer Error
**Soluzione**: Railway supporta Puppeteer. Se hai problemi, controlla i log per dettagli specifici.

### ❌ CORS Error
**Soluzione**: Verifica che `CORS_ORIGIN` sia esattamente `https://gabrielprojects.github.io` (senza trailing slash).

## ✅ Checklist Finale

- [ ] Account Railway creato
- [ ] Repository deployato
- [ ] Root Directory impostata a `backend`
- [ ] Tutte le environment variables aggiunte
- [ ] Dominio generato e URL copiato
- [ ] Secret `VITE_API_URL` configurato in GitHub
- [ ] Health check funziona (`/api/health`)
- [ ] Frontend deployato su GitHub Pages
- [ ] App completa testata

## 🎯 Prossimi Passi

Dopo il deploy:
1. Testa l'app su GitHub Pages
2. Verifica che la ricerca aule funzioni
3. Monitora i log per eventuali errori
4. Goditi la tua app live! 🚀

---

**Hai bisogno di aiuto?** Controlla i log in Railway Dashboard o apri un issue su GitHub.

