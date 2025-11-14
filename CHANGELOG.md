# Changelog - UnipaTool

## [2.0.0] - 2025-11-14

### 🎉 Refactoring Completo

#### Aggiunto
- **Backend Node.js**: Riscritto completamente in Node.js con Express
- **Frontend Vue.js 3**: Nuovo frontend moderno con Vue 3 e Vite
- **API REST**: Separazione completa frontend/backend
- **Puppeteer**: Sostituito Selenium con Puppeteer per web scraping
- **Caching Intelligente**: Sistema caching per data (eventi per data)
- **Parallelismo**: Fetch paralleli per migliorare performance
- **Responsive Design**: Design mobile-first completamente responsive
- **Deployment**: Setup per GitHub Pages e Render.com
- **Documentazione**: Documentazione completa e diagrammi

#### Migliorato
- **Performance**: Ricerche molto più veloci grazie a parallelismo e caching
- **Robustezza**: Supporto per tutti gli edifici (non solo Edificio 8)
- **Gestione Errori**: Retry mechanism e logging completo
- **Filtro Aule**: Rimosso filtro regex restrittivo, supporta tutti i formati
- **UI/UX**: Interfaccia moderna e intuitiva

#### Rimosso
- **Flask Backend**: Sostituito con Express
- **Selenium**: Sostituito con Puppeteer
- **Templates HTML**: Sostituiti con componenti Vue

#### Note
- Il vecchio codice Python è mantenuto per riferimento
- Breaking changes: API completamente nuova
- Richiede Node.js 18+

## [1.0.0] - Versione Iniziale

### Aggiunto
- Flask backend con Selenium
- Templates HTML base
- Scraping edifici e aule
- Ricerca aule disponibili
- Modalità flessibile per slot

