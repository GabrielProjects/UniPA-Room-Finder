# Diagramma Progettuale UnipaTool

## Panoramica

**UnipaTool** è un'applicazione web Flask che permette di cercare aule disponibili presso l'Università di Palermo (Unipa) interrogando il sistema ufficiale di prenotazione aule. L'applicazione utilizza web scraping con Selenium per estrarre dati dal sito Unipa e analizza i calendari delle aule per determinare la disponibilità.

## Architettura del Sistema

L'applicazione segue un'architettura a **3 layer**:

### 1. Presentation Layer (Livello Presentazione)
- **Templates HTML**: `index.html` e `results.html`
- **Flask Routes**: Gestione delle richieste HTTP (`/` e `/search`)
- **Interfaccia Utente**: Form di ricerca e visualizzazione risultati

### 2. Application Layer (Livello Applicazione)
- **Route Handlers**: Gestione logica delle richieste
- **Business Logic**: Funzioni per scraping, parsing e ricerca
- **WebDriver Manager**: Creazione e gestione istanze Selenium
- **Data Parser**: Estrazione e trasformazione dati

### 3. Data Access Layer (Livello Accesso Dati)
- **Selenium WebDriver**: Automatizzazione browser per scraping
- **HTTP Requests**: Fetching diretto delle pagine calendario
- **External Services**: Comunicazione con il sito Unipa

## Componenti Principali

### app.py - Modulo Principale

#### Route Handlers
- **`index()`**: Gestisce GET `/` - Carica lista edifici e renderizza form
- **`search()`**: Gestisce POST `/search` - Esegue ricerca e mostra risultati

#### Funzioni WebDriver
- **`_build_driver()`**: Crea istanza Chrome WebDriver in modalità headless

#### Funzioni Building
- **`get_buildings()`**: Recupera lista edifici disponibili dal sito Unipa

#### Funzioni Room
- **`get_rooms_for_building(building_text)`**: Scraping paginato delle aule per un edificio
- **`_extract_current_page_rooms(driver)`**: Estrae aule dalla pagina corrente

#### Calendar Parser
- **`parse_events_from_html(html)`**: Estrae eventi calendario da HTML usando regex
  - Pattern: `start: new Date(ms)` e `end: new Date(ms)`
  - Converte timestamp in millisecondi a oggetti `datetime`

#### Availability Logic
- **`is_room_free(events, user_start, user_end)`**: Verifica sovrapposizione eventi
- **`find_available_rooms(building, user_start, user_end)`**: Ricerca esatta per slot temporale
- **`find_flexible_slots(building, range_start, range_end, duration_hours)`**: Ricerca flessibile per slot di durata specifica

### Templates

#### index.html
- Form di ricerca con:
  - Selezione edificio (dropdown)
  - Data (date picker)
  - Ora inizio/fine (time picker)
  - Modalità flessibile (checkbox)
  - Durata richiesta (se modalità flessibile)

#### results.html
- Tabella risultati con:
  - Nome aula
  - Numero posti
  - Slot disponibili (se modalità flessibile)
  - Link al calendario ufficiale

## Flusso di Dati

### 1. Caricamento Iniziale
```
User → Browser → Flask (GET /) → get_buildings() → Selenium → Unipa Website
                                                              ↓
User ← Browser ← Flask (index.html) ← Cache ← Lista Edifici
```

### 2. Ricerca Aule
```
User → Browser → Flask (POST /search) → find_available_rooms()
                                              ↓
                                    get_rooms_for_building()
                                              ↓
                                    Selenium Scraping (paginato)
                                              ↓
                                    Dict[room_name: (seats, url)]
                                              ↓
                                    Per ogni aula:
                                    - GET calendar URL
                                    - Parse HTML events
                                    - Check availability
                                              ↓
                                    Dict[available_rooms]
                                              ↓
User ← Browser ← Flask (results.html) ← Formatted Results
```

### 3. Trasformazione Dati

**Input Utente:**
- Building name (string)
- Date (YYYY-MM-DD)
- Start/End time (HH:MM)
- Optional: Flexible mode + duration

**Dati Intermedi:**
- `List[str]` buildings
- `Dict[str, Tuple[str, str]]` rooms (name → (seats, url))
- `List[Tuple[datetime, datetime]]` events (per ogni aula)
- `Dict[str, Tuple[str, str]]` available_rooms (name → (seats, url))
- `Dict[str, Tuple[str, str, List]]` flexible_results (name → (seats, url, slots))

**Output:**
- Template Jinja2 con risultati formattati

## Diagrammi Progettuali

### 1. Architecture Diagram (`architecture.puml`)
Mostra l'architettura a layer del sistema con le interconnessioni tra:
- Presentation Layer (Templates, Routes)
- Application Layer (Business Logic, Parser)
- Data Access Layer (Selenium, Requests)
- External Services (Unipa Website)

**Visualizzazione:**
```bash
# Con PlantUML
plantuml docs/architecture.puml

# Online
# Copia il contenuto su http://www.plantuml.com/plantuml/uml/
```

### 2. Components Diagram (`components.puml`)
Dettaglia i componenti del modulo `app.py` e le loro dipendenze:
- Flask App e Route Handlers
- Funzioni WebDriver
- Funzioni Building e Room
- Calendar Parser
- Availability Logic
- Dipendenze esterne (Flask, Selenium, Requests)

**Visualizzazione:**
```bash
plantuml docs/components.puml
```

### 3. Sequence Diagram (`sequence.puml`)
Mostra il flusso completo di interazione tra:
- User
- Browser
- Flask App
- Business Logic
- Selenium WebDriver
- Unipa Website
- Requests Library

Include due scenari:
1. Caricamento pagina iniziale (recupero edifici)
2. Ricerca aule disponibili (scraping + verifica disponibilità)

**Visualizzazione:**
```bash
plantuml docs/sequence.puml
```

### 4. Data Flow Diagram (`data-flow.puml`)
Illustra la trasformazione dei dati attraverso il sistema:
- Input utente
- Parsing e validazione
- Scraping edifici e aule
- Estrazione eventi calendario
- Verifica disponibilità
- Formattazione risultati

**Visualizzazione:**
```bash
plantuml docs/data-flow.puml
```

## Tecnologie Utilizzate

### Backend
- **Flask 3.x**: Framework web Python
- **Selenium 4.x**: Automatizzazione browser per web scraping
- **Requests 2.x**: Libreria HTTP per fetching diretto
- **Gunicorn**: WSGI server per produzione

### Frontend
- **HTML5**: Struttura pagine
- **CSS3**: Styling (dark theme, responsive)
- **JavaScript**: Interattività form (modalità flessibile)

### Deployment
- **Docker**: Containerizzazione
- **Render.com**: Hosting (configurato in `render.yaml`)

## Pattern e Design Decisions

### 1. Web Scraping con Selenium
- **Motivazione**: Il sito Unipa utilizza JavaScript dinamico, richiede browser reale
- **Approccio**: Chrome headless per performance e compatibilità

### 2. Caching Edifici
- **Motivazione**: Lista edifici cambia raramente, evita scraping ripetuto
- **Implementazione**: Variabile globale `_cached_buildings`

### 3. Paginazione Risultati
- **Motivazione**: Le aule possono essere su più pagine
- **Implementazione**: Loop con controllo button "next" disabilitato

### 4. Parsing Eventi con Regex
- **Motivazione**: Eventi embedded in JavaScript inline
- **Pattern**: `start: new Date(ms)` e `end: new Date(ms)`

### 5. Due Modalità di Ricerca
- **Esatta**: Slot temporale specifico (start → end)
- **Flessibile**: Qualsiasi slot di durata X all'interno di un range

## Limitazioni e Considerazioni

### Performance
- Scraping può essere lento (dipende da numero aule)
- Ogni ricerca crea nuova istanza WebDriver
- Parsing HTML per ogni aula (richieste HTTP sequenziali)

### Robustezza
- Dipendenza dalla struttura HTML del sito Unipa
- Nessun retry mechanism per errori temporanei
- Gestione errori base (try/except con continue)

### Scalabilità
- Single-threaded (Flask dev server)
- Gunicorn con 3 workers in produzione
- Nessuna cache risultati (ogni ricerca è fresh)

## Estensioni Future

1. **Caching Risultati**: Redis per cache risultati recenti
2. **Background Jobs**: Celery per ricerche asincrone
3. **API REST**: Endpoint JSON per integrazioni
4. **Notifiche**: Alert quando aule diventano disponibili
5. **Database**: Persistenza aule e eventi per analisi

## Riferimenti

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [PlantUML Documentation](https://plantuml.com/)

