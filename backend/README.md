# UnipaTool Backend

Backend API Node.js per UnipaTool - Room Finder.

## Installazione

```bash
npm install
```

## Avvio

```bash
npm start
```

Per sviluppo con auto-reload:

```bash
npm run dev
```

## Configurazione

Crea un file `.env` nella root del backend:

```env
PORT=3000
CORS_ORIGIN=*
LOG_LEVEL=info
```

## API Endpoints

- `GET /api/buildings` - Lista edifici
- `POST /api/search` - Ricerca aule
- `GET /api/health` - Health check

Vedi il README principale per dettagli sugli endpoint.

## Struttura

- `server.js` - Entry point Express
- `src/routes/` - API routes
- `src/scraper/` - Logica scraping con Puppeteer
- `src/cache/` - Sistema caching
- `src/utils/` - Utility functions

## Note

- Il browser Puppeteer viene riutilizzato tra le richieste (singleton)
- Il caching è configurato per ottimizzare le performance
- Gli eventi calendario sono cached per data (gli orari cambiano giorno per giorno)

