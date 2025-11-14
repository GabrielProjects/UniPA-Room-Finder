# 🆓 Deploy Completamente Gratuito (Senza Carta di Credito)

Opzioni per deployare UnipaTool **completamente gratis** senza richiedere carta di credito.

## ⚠️ Limitazione Tecnica

**GitHub Pages può solo servire file statici** (HTML, CSS, JS frontend). Non può eseguire:
- ❌ Node.js
- ❌ Puppeteer (browser headless)
- ❌ Server backend
- ❌ Scraping in tempo reale

Quindi serve **necessariamente** un servizio esterno per il backend.

## 🆓 Opzioni Gratuite (Nessuna Carta di Credito)

### 1. **Render.com** (Raccomandato)
- ✅ **Gratuito** senza carta di credito
- ✅ Supporta Puppeteer
- ⚠️ **Cold start**: Prima richiesta dopo 15 min di inattività può richiedere 30-60s
- ⚠️ **Sleep dopo 15 min**: Il servizio va in sleep se non usato

**Come fare:**
1. Vai su [render.com](https://render.com)
2. Accedi con GitHub (non serve carta di credito)
3. Crea un "Web Service"
4. Connetti il repository
5. Usa il file `backend/render.yaml` già configurato

**Vantaggi:**
- Zero configurazione (usa `render.yaml`)
- Completamente gratuito
- Nessuna carta di credito richiesta

**Svantaggi:**
- Cold start dopo inattività
- Può essere lento al primo utilizzo

### 2. **Fly.io**
- ✅ **Gratuito** con limiti generosi
- ✅ Nessuna carta di credito per iniziare
- ✅ Supporta Puppeteer
- ✅ Nessun cold start

**Come fare:**
1. Vai su [fly.io](https://fly.io)
2. Installa CLI: `curl -L https://fly.io/install.sh | sh`
3. Login: `fly auth signup` (con GitHub)
4. Deploy: `fly launch` nella cartella `backend`

**Vantaggi:**
- Nessun cold start
- Più veloce di Render
- Gratuito

**Svantaggi:**
- Richiede CLI (più setup)
- Limiti di traffico (ma generosi)

### 3. **Railway** (Richiede Carta)
- ⚠️ Richiede carta di credito (anche se gratuito)
- ✅ $5 crediti/mese gratuiti
- ✅ Nessun cold start

## 🎯 Raccomandazione

**Per iniziare subito senza carta di credito:**
👉 **Usa Render.com** - È il più semplice e funziona subito.

**Se vuoi performance migliori:**
👉 **Fly.io** - Nessun cold start, ma richiede più setup.

## 📝 Setup Render.com (5 minuti)

1. **Crea account**: [render.com](https://render.com) → Sign up with GitHub
2. **Nuovo servizio**: "New +" → "Web Service"
3. **Connetti repo**: Seleziona il tuo repository GitHub
4. **Configurazione automatica**: Render leggerà `backend/render.yaml`
5. **Deploy**: Clicca "Create Web Service"
6. **Copia URL**: Dopo il deploy, copia l'URL (es: `unipatool-backend.onrender.com`)
7. **Configura GitHub**: Aggiungi secret `VITE_API_URL` = `https://TUO-URL.onrender.com/api`

**Fatto!** 🎉

## 💡 Suggerimento

Se il cold start di Render ti dà fastidio:
- Usa un servizio di "ping" gratuito (es: [uptimerobot.com](https://uptimerobot.com)) per mantenere il servizio attivo
- Oppure accetta che la prima richiesta dopo inattività sia più lenta

## ❓ FAQ

**Q: Posso usare solo GitHub Pages?**
A: No, GitHub Pages non può eseguire Node.js o Puppeteer.

**Q: Render è davvero gratuito?**
A: Sì, il piano gratuito è sufficiente per progetti personali.

**Q: Cosa succede se supero i limiti?**
A: Render ti avvisa ma non addebita nulla automaticamente.

**Q: Posso usare GitHub Actions come backend?**
A: No, GitHub Actions non può rimanere attivo 24/7 per rispondere a richieste.

---

**Conclusione**: Per un'app con backend Node.js, serve un servizio esterno. Render.com è la scelta più semplice e gratuita senza carta di credito.

