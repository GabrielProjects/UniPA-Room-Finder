# Unipa Room Finder (Web)

A tiny Flask web app that replicates the behavior of `FindRooms.py` in a browser UI. It uses Selenium to fetch buildings and rooms from the Unipa "Ricerca Avanzata" page, then checks each room's calendar events to find free slots.

## Features
- Building picker loaded directly from the official site
- Date and time range selection
- Shows available rooms (name, seats, and link to the room's calendar)

## Requirements
- Python 3.10+
- Google Chrome installed (Selenium Manager will fetch the matching ChromeDriver automatically)
- Windows is supported (the app silences ChromeDriver logs via `nul`)

## Setup (Windows PowerShell)

```powershell
# (Optional) Create and activate a virtual environment
python -m venv .venv ; .\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the web app
python app.py
```

Then open http://127.0.0.1:5000 in your browser.
