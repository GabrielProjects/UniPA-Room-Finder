# Unipa Room Finder

Made by Gabriele D'Asta

A lightweight Flask web app that finds free rooms from the official Unipa calendar. It drives the “Ricerca Avanzata” page with Selenium (headless Chrome), collects rooms, parses events from the room calendars, and shows which rooms are free.

## Features
- Live building list fetched from the official site (Selenium)
- Exact time search: free rooms for your chosen start → end
- Flexible search: find any X-hour slot within a broader range (e.g., any 2h between 08:00–15:00)
- Includes all rooms (no strict regex), filters seats > 0
- Sorts results by seats (descending)
- Clean, server-rendered UI with loading overlay

## Tech Stack
- Flask (server, templates)
- Selenium + headless Chrome (scraping)
- Gunicorn (production server)
- Docker (containerized deploy)
- Render (hosting)

## Requirements
- Python 3.10+
- Google Chrome installed locally (Selenium Manager auto-installs matching ChromeDriver)
- Windows/macOS/Linux supported locally

## Run Locally (Windows PowerShell)

```powershell
# 1) Create and activate a virtual environment
python -m venv .venv ; .\.venv\Scripts\Activate.ps1

# 2) Install dependencies
pip install -r requirements.txt

# 3) Start the app (dev server)
python app.py
```

Open http://127.0.0.1:5000

Notes:
- First load may take a few seconds while Selenium fetches buildings.
- If Chrome is not installed or is blocked by policy, Selenium will fail to start.

## Deploy on Render (Docker)

This repo includes `Dockerfile` and `render.yaml` configured for a Docker-based web service on Render.

Steps:
1) Push this repo to GitHub.
2) On https://render.com, create a new Web Service connected to this repo.
3) Render will detect `render.yaml` and build the Docker image.
4) The app will start with Gunicorn and bind to the port set by Render (`PORT`).

Free plan (512MB RAM) tips:
- Chrome runs in memory-optimized headless mode with stability flags.
- Gunicorn runs with a single worker to reduce RAM.
- If you still hit OOM, set env var `MALLOC_ARENA_MAX=2` in Render.

## Configuration
- No app-specific environment variables are required.
- Optional (Render): `MALLOC_ARENA_MAX=2` may reduce allocator memory usage.

## Project Structure
- `app.py` — Flask app, routes, Selenium scraping, availability logic
- `templates/` — HTML templates (Jinja2)
- `Dockerfile` — Chrome + Python image, memory-friendly config
- `render.yaml` — Render service definition (Docker)
- `requirements.txt` — Python dependencies
- `FindRooms.py` — original CLI script (reference only; not used by the web app)

## Troubleshooting
- Failed to load buildings / session errors:
  - Ensure Chrome is installed (local).
  - On Render, wait for cold start and retry (Chrome boot can take several seconds).
  - The app uses headless Chrome with stability and low-memory flags.
- No results:
  - Make sure the selected date/time includes open hours and that the site has data for the chosen building.
- Slow first request:
  - Selenium + live site requests add startup time; subsequent requests are faster.

## Credits
- Built by Gabriele D'Asta

This project is for educational purposes and relies on publicly available information from Unipa’s site.
