# UnipaTool Frontend

Frontend Vue.js 3 per UnipaTool - Room Finder.

## Installazione

```bash
npm install
```

## Sviluppo

```bash
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

## Build

```bash
npm run build
```

I file compilati saranno in `dist/`

## Preview Build

```bash
npm run preview
```

## Configurazione

Crea un file `.env` nella root del frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

Per produzione, questa variabile deve puntare all'URL del backend deployato.

## Struttura

- `src/App.vue` - Componente root
- `src/components/` - Componenti Vue
  - `SearchForm.vue` - Form di ricerca
  - `ResultsTable.vue` - Tabella risultati
- `src/services/` - API client
- `src/styles/` - CSS globale

## Responsive Design

Il frontend è completamente responsive con breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

