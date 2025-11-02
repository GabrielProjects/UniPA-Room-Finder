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

## Deploy on Render (via GitHub)

1. Push this folder to a new GitHub repository (for example, `unipa-room-finder`).
2. Go to https://render.com and create a free account.
3. Create a New Web Service and connect your GitHub repo.
4. Render will detect `render.yaml` and prefill settings:
	- Environment: Python
	- Build command: `pip install -r requirements.txt`
	- Start command: `gunicorn app:app`
	- Plan: Free, Region: Frankfurt (or your nearest)
5. Click Create Web Service. After the build, you’ll get a public URL everyone can use.

Notes:
- The service runs behind Gunicorn and will execute the same logic as local.
- You don’t need to change app code for Render; the `render.yaml` handles commands.

## Notes
- First load may take a few seconds while Selenium fetches building options.
- If Chrome is not installed or blocked, Selenium may fail to start. Install Chrome and retry.
- This app makes live requests to the Unipa site; performance depends on network speed and the site's responsiveness.
