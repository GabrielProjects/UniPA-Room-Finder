# Diagrammi Mermaid - UnipaTool

Questa pagina contiene tutti i diagrammi progettuali in formato Mermaid, che possono essere visualizzati direttamente su GitHub, GitLab, o in qualsiasi editor che supporta Mermaid.

## 1. Architecture Diagram

Diagramma dell'architettura a layer del sistema.

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#2563eb', 'primaryTextColor':'#fff', 'primaryBorderColor':'#22d3ee', 'lineColor':'#22d3ee', 'secondaryColor':'#111827', 'tertiaryColor':'#0b1220'}}}%%
graph TB
    subgraph "Presentation Layer"
        IndexPage[index.html]
        ResultsPage[results.html]
        Routes[Flask Routes]
    end

    subgraph "Application Layer"
        Handlers[Route Handlers]
        BusinessLogic[Business Logic]
        WebDriverMgr[WebDriver Manager]
        Parser[Data Parser]
    end

    subgraph "Data Access Layer"
        Selenium[Selenium WebDriver]
        Requests[HTTP Requests]
    end

    subgraph "External Services"
        UnipaSite[Unipa Website]
        CalendarPages[(Room Calendar Pages)]
    end

    IndexPage --> Routes
    ResultsPage --> Routes
    Routes --> Handlers
    Handlers --> BusinessLogic
    BusinessLogic --> WebDriverMgr
    BusinessLogic --> Parser
    WebDriverMgr --> Selenium
    BusinessLogic --> Requests
    Selenium --> UnipaSite
    Requests --> CalendarPages
    UnipaSite --> CalendarPages

    style IndexPage fill:#2563eb,stroke:#22d3ee,stroke-width:2px
    style ResultsPage fill:#2563eb,stroke:#22d3ee,stroke-width:2px
    style BusinessLogic fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style Parser fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style UnipaSite fill:#7c3aed,stroke:#a78bfa,stroke-width:2px
```

## 2. Components Diagram

Diagramma dei componenti con moduli e funzioni principali.

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#2563eb', 'primaryTextColor':'#fff', 'primaryBorderColor':'#22d3ee', 'lineColor':'#22d3ee', 'secondaryColor':'#111827', 'tertiaryColor':'#0b1220'}}}%%
graph TB
    subgraph "app.py"
        subgraph "Flask App"
            AppInstance[app: Flask]
            SecretKey[secret_key]
        end

        subgraph "Route Handlers"
            IndexRoute[index]
            SearchRoute[search]
        end

        subgraph "WebDriver Functions"
            BuildDriver[_build_driver]
        end

        subgraph "Building Functions"
            GetBuildings[get_buildings]
        end

        subgraph "Room Functions"
            GetRooms[get_rooms_for_building]
            ExtractRooms[_extract_current_page_rooms]
        end

        subgraph "Calendar Parser"
            ParseEvents[parse_events_from_html]
        end

        subgraph "Availability Logic"
            IsFree[is_room_free]
            FindAvailable[find_available_rooms]
            FindFlexible[find_flexible_slots]
        end

        subgraph "Cache"
            CachedBuildings[_cached_buildings]
        end
    end

    subgraph "Templates"
        IndexTemplate[index.html]
        ResultsTemplate[results.html]
    end

    subgraph "External Libraries"
        FlaskLib[Flask]
        SeleniumLib[Selenium]
        RequestsLib[Requests]
    end

    subgraph "External System"
        UnipaSite[Unipa Website]
    end

    AppInstance --> IndexRoute
    AppInstance --> SearchRoute
    IndexRoute --> GetBuildings
    IndexRoute --> CachedBuildings
    IndexRoute --> IndexTemplate
    SearchRoute --> FindAvailable
    SearchRoute --> FindFlexible
    SearchRoute --> ResultsTemplate

    GetBuildings --> BuildDriver
    GetBuildings --> UnipaSite
    GetRooms --> BuildDriver
    GetRooms --> ExtractRooms
    GetRooms --> UnipaSite
    FindAvailable --> GetRooms
    FindAvailable --> ParseEvents
    FindAvailable --> IsFree
    FindAvailable --> RequestsLib
    FindFlexible --> GetRooms
    FindFlexible --> ParseEvents
    FindFlexible --> IsFree
    FindFlexible --> RequestsLib

    BuildDriver --> SeleniumLib
    ParseEvents --> RequestsLib
    RequestsLib --> UnipaSite

    AppInstance -.-> FlaskLib
    BuildDriver -.-> SeleniumLib
    FindAvailable -.-> RequestsLib

    style AppInstance fill:#2563eb,stroke:#22d3ee,stroke-width:2px
    style GetBuildings fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style GetRooms fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style ParseEvents fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style FindAvailable fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style FindFlexible fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style UnipaSite fill:#7c3aed,stroke:#a78bfa,stroke-width:2px
```

## 3. Sequence Diagram

Diagramma di sequenza che mostra il flusso completo di interazione.

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#2563eb', 'primaryTextColor':'#fff', 'primaryBorderColor':'#22d3ee', 'lineColor':'#22d3ee', 'secondaryColor':'#111827', 'tertiaryColor':'#0b1220'}}}%%
sequenceDiagram
    participant U as User
    participant B as Browser
    participant F as Flask App<br/>(app.py)
    participant BL as Business Logic
    participant S as Selenium<br/>WebDriver
    participant UW as Unipa Website
    participant R as Requests<br/>Library

    Note over U,R: Caricamento Pagina Iniziale

    U->>B: Accede a http://127.0.0.1:5000/
    B->>F: GET /
    activate F
    F->>BL: get_buildings()
    activate BL
    BL->>S: _build_driver()
    activate S
    S->>S: Crea Chrome headless
    BL->>S: Navigate to BASE_URL
    S->>UW: GET aulaCalendar.seam
    activate UW
    UW-->>S: HTML page
    deactivate UW
    BL->>S: Click "Ricerca Avanzata"
    S->>UW: Submit form
    UW-->>S: Advanced search page
    BL->>S: Extract building options
    S-->>BL: List[building_names]
    BL->>S: driver.quit()
    deactivate S
    BL-->>F: buildings list
    F->>F: Cache buildings
    F->>B: Render index.html
    deactivate BL
    B-->>U: Form con lista edifici
    deactivate F

    Note over U,R: Ricerca Aule Disponibili

    U->>B: Compila form (building, date, time)
    U->>B: Submit form
    B->>F: POST /search
    activate F
    F->>F: Parse form data
    F->>F: Validate input
    F->>BL: find_available_rooms(building, start, end)
    activate BL

    Note over BL,S: Scraping Aule

    BL->>BL: get_rooms_for_building(building)
    BL->>S: _build_driver()
    activate S
    S->>S: Crea Chrome headless
    BL->>S: Navigate to BASE_URL
    S->>UW: GET aulaCalendar.seam
    activate UW
    UW-->>S: HTML page
    deactivate UW
    BL->>S: Click "Ricerca Avanzata"
    S->>UW: Submit form
    UW-->>S: Advanced search page
    BL->>S: Select building
    BL->>S: Click "Cerca"
    S->>UW: Submit search
    UW-->>S: Results page 1
    BL->>S: Extract rooms from page
    S-->>BL: rooms_dict (page 1)

    loop Paginazione
        BL->>S: Check next button
        alt Next page exists
            BL->>S: Click next
            S->>UW: Load next page
            UW-->>S: Results page N
            BL->>S: Extract rooms from page
            S-->>BL: rooms_dict (page N)
        else No more pages
            BL->>BL: Break loop
        end
    end

    BL->>S: driver.quit()
    deactivate S
    BL->>BL: Complete rooms_dict

    Note over BL,R: Verifica Disponibilità

    loop Per ogni aula
        BL->>R: GET room_calendar_url
        activate R
        R->>UW: HTTP GET request
        activate UW
        UW-->>R: HTML calendar page
        deactivate UW
        R-->>BL: HTML content
        deactivate R
        
        BL->>BL: parse_events_from_html(html)
        BL->>BL: Extract Date(start_ms, end_ms)
        BL->>BL: Convert to datetime tuples
        BL->>BL: is_room_free(events, user_start, user_end)
        
        alt Aula libera
            BL->>BL: Add to available_rooms
        else Aula occupata
            BL->>BL: Skip room
        end
    end

    BL-->>F: available_rooms dict
    deactivate BL

    Note over F,B: Rendering Risultati

    F->>F: Format results for template
    F->>B: Render results.html
    B-->>U: Pagina risultati con aule disponibili
    deactivate F
```

## 4. Data Flow Diagram

Diagramma del flusso dati che mostra la trasformazione dei dati attraverso il sistema.

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#2563eb', 'primaryTextColor':'#fff', 'primaryBorderColor':'#22d3ee', 'lineColor':'#22d3ee', 'secondaryColor':'#111827', 'tertiaryColor':'#0b1220'}}}%%
flowchart TD
    Start([User Input]) --> ParseInput[Parse Input]
    
    ParseInput --> UserStart[user_start = datetime<br/>user_end = datetime]
    
    UserStart --> CheckCache{get_buildings?}
    
    CheckCache -->|First load| Scrape[Scrape Unipa Website]
    CheckCache -->|Cached| UseCache[Use Cached Buildings]
    
    Scrape --> ExtractBuildings[Extract Building Options]
    ExtractBuildings --> CacheBuildings[Cache Buildings List]
    CacheBuildings --> BuildingsList[List str buildings]
    UseCache --> BuildingsList
    
    BuildingsList --> GetRooms[get_rooms_for_building building]
    
    GetRooms --> InitSelenium[Initialize Selenium WebDriver]
    InitSelenium --> Navigate[Navigate to BASE_URL]
    Navigate --> ClickAdvanced[Click Ricerca Avanzata]
    ClickAdvanced --> SelectBuilding[Select Building]
    SelectBuilding --> ClickSearch[Click Cerca]
    
    ClickSearch --> ExtractPage1[Extract Rooms from Page 1]
    
    ExtractPage1 --> CheckPages{More pages?}
    CheckPages -->|Yes| ExtractCurrent[Extract Current Page Rooms]
    ExtractCurrent --> AddToDict[Add to rooms_dict]
    AddToDict --> CheckPages
    CheckPages -->|No| RoomsDict[Dict str, Tuple str, str<br/>rooms_dict]
    
    RoomsDict --> SearchMode{Search Mode?}
    
    SearchMode -->|Exact Time| FindAvailable[find_available_rooms]
    SearchMode -->|Flexible Slots| FindFlexible[find_flexible_slots]
    
    FindAvailable --> LoopRooms1[For each room]
    LoopRooms1 --> GET1[GET room calendar URL]
    GET1 --> HTML1[HTML Response]
    HTML1 --> Parse1[parse_events_from_html html]
    Parse1 --> Events1[List Tuple datetime, datetime<br/>events]
    Events1 --> IsFree[is_room_free events, user_start, user_end]
    IsFree --> FreeCheck{Free?}
    FreeCheck -->|Yes| AddAvailable[Add to available_rooms]
    FreeCheck -->|No| SkipRoom1[Skip room]
    AddAvailable --> NextRoom1{More rooms?}
    SkipRoom1 --> NextRoom1
    NextRoom1 -->|Yes| LoopRooms1
    NextRoom1 -->|No| AvailableDict[Dict str, Tuple str, str<br/>available_rooms]
    
    FindFlexible --> LoopRooms2[For each room]
    LoopRooms2 --> GET2[GET room calendar URL]
    GET2 --> HTML2[HTML Response]
    HTML2 --> Parse2[parse_events_from_html html]
    Parse2 --> Events2[List Tuple datetime, datetime<br/>events]
    Events2 --> FindSlots[Find Free Slots<br/>Scan range with duration]
    FindSlots --> SlotsCheck{Slots found?}
    SlotsCheck -->|Yes| AddSlots[Add room with slots]
    SlotsCheck -->|No| SkipRoom2[Skip room]
    AddSlots --> FreeSlots[List Tuple datetime, datetime<br/>free_slots]
    FreeSlots --> NextRoom2{More rooms?}
    SkipRoom2 --> NextRoom2
    NextRoom2 -->|Yes| LoopRooms2
    NextRoom2 -->|No| FlexibleDict[Dict str, Tuple str, str, List<br/>results]
    
    AvailableDict --> FormatResults[Format Results for Template]
    FlexibleDict --> FormatResults
    
    FormatResults --> Render[Render results.html]
    Render --> Display([Display Results to User])
    
    style Start fill:#2563eb,stroke:#22d3ee,stroke-width:3px
    style Display fill:#2563eb,stroke:#22d3ee,stroke-width:3px
    style GetRooms fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style FindAvailable fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style FindFlexible fill:#22d3ee,stroke:#2563eb,stroke-width:2px
    style Parse1 fill:#7c3aed,stroke:#a78bfa,stroke-width:2px
    style Parse2 fill:#7c3aed,stroke:#a78bfa,stroke-width:2px
    style IsFree fill:#7c3aed,stroke:#a78bfa,stroke-width:2px
```

## Come Visualizzare

I diagrammi Mermaid possono essere visualizzati:

1. **Su GitHub/GitLab**: I file `.md` con blocchi `mermaid` vengono renderizzati automaticamente
2. **Online**: [Mermaid Live Editor](https://mermaid.live/)
3. **VS Code**: Con l'estensione "Markdown Preview Mermaid Support"
4. **Altri editor**: Molti editor moderni supportano Mermaid nativamente

I file `.mmd` possono essere aperti direttamente in [Mermaid Live Editor](https://mermaid.live/) per una visualizzazione interattiva.

