import os
import re
import time
from datetime import datetime
from typing import Dict, List, Tuple

import requests
from flask import Flask, render_template, request, redirect, url_for, flash
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait, Select

APP_TITLE = "Unipa Room Finder"
BASE_URL = "https://offweb.unipa.it/offweb/public/aula/aulaCalendar.seam"

app = Flask(__name__)
app.secret_key = "change-me"  # for flash messages


def _build_driver() -> webdriver.Chrome:
    """Create a headless Chrome WebDriver with reduced logging (Windows friendly)."""
    options = Options()
    options.add_argument("--log-level=3")
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_experimental_option("excludeSwitches", ["enable-logging"])  # mute webdriver logs

    # If running in a container with Chrome installed at a known path
    chrome_bin = os.environ.get("CHROME_BIN")
    if chrome_bin:
        options.binary_location = chrome_bin

    # On Windows, "nul" is the null device to silence logs from chromedriver
    # On Linux containers, there's no nul; guard per-OS
    log_path = "nul" if os.name == "nt" else os.devnull
    service = Service(log_path=log_path)

    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(45)
    return driver


def get_buildings() -> List[str]:
    """Return visible building names from the 'Ricerca Avanzata' page."""
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        driver.get(BASE_URL)
        # Click "Ricerca Avanzata"
        wait.until(EC.element_to_be_clickable((By.ID, "ricercaAula:j_id99"))).click()

        # Wait for building dropdown and collect options
        select_elem = wait.until(
            EC.presence_of_element_located((By.ID, "ricercaAula:codEdificioAula"))
        )
        select = Select(select_elem)
        buildings = [
            opt.text.strip()
            for opt in select.options
            if opt.get_attribute("value") and opt.get_attribute("value").strip() != ""
        ]
        return buildings
    finally:
        driver.quit()


def _extract_current_page_rooms(driver: webdriver.Chrome) -> Dict[str, Tuple[str, str]]:
    """Given the current results table page, return room_dict {name: (seats, link)}."""
    room_dict: Dict[str, Tuple[str, str]] = {}
    rows = driver.find_elements(By.CSS_SELECTOR, "#ricercaAula\\:aulaList tbody tr")
    for row in rows:
        cols = row.find_elements(By.TAG_NAME, "td")
        if len(cols) == 3:
            room_name = cols[0].text.strip()
            seats = cols[1].text.strip()
            link = cols[0].find_element(By.TAG_NAME, "a").get_attribute("href")

            # Filter: Only LETTER+3DIGITS and seats > 0
            if re.match(r"^[A-Z]\d{3}$", room_name) and seats != "0":
                room_dict[room_name] = (seats, link)
    return room_dict


def get_rooms_for_building(building_text: str) -> Dict[str, Tuple[str, str]]:
    """Run the site search for a building and return rooms mapping {room: (seats, url)}."""
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        driver.get(BASE_URL)

        # Click "Ricerca Avanzata"
        wait.until(EC.element_to_be_clickable((By.ID, "ricercaAula:j_id99"))).click()

        # Select building
        select_elem = wait.until(
            EC.presence_of_element_located((By.ID, "ricercaAula:codEdificioAula"))
        )
        Select(select_elem).select_by_visible_text(building_text)

        # Click "Cerca"
        driver.find_element(By.ID, "ricercaAula:searchAulaSubmit").click()

        # Wait for results table
        wait.until(EC.presence_of_element_located((By.ID, "ricercaAula:aulaList")))

        # Collect across pagination
        room_dict: Dict[str, Tuple[str, str]] = {}
        while True:
            # current page
            room_dict.update(_extract_current_page_rooms(driver))

            # try next page
            try:
                next_btn = driver.find_element(
                    By.XPATH, "//td[contains(@class, 'rich-datascr-button') and text()='»']"
                )
                if "rich-datascr-button-dsbld" in next_btn.get_attribute("class"):
                    break
                next_btn.click()
                time.sleep(0.4)
                wait.until(EC.presence_of_element_located((By.ID, "ricercaAula:aulaList")))
            except Exception:
                break

        return room_dict
    finally:
        driver.quit()


# ====== Parsing calendar events from room HTML ======

def parse_events_from_html(html: str) -> List[Tuple[datetime, datetime]]:
    """Extract event start/end Date(...) in ms from inline JS and return datetime tuples."""
    pattern = re.compile(
        r"start\s*:\s*new Date\((\d+)\).*?end\s*:\s*new Date\((\d+)\)", re.DOTALL
    )
    matches = pattern.findall(html)

    events: List[Tuple[datetime, datetime]] = []
    for start_ms, end_ms in matches:
        try:
            start = datetime.fromtimestamp(int(start_ms) / 1000)
            end = datetime.fromtimestamp(int(end_ms) / 1000)
            events.append((start, end))
        except Exception:
            # ignore malformed timestamps
            continue
    return events


def is_room_free(events: List[Tuple[datetime, datetime]], user_start: datetime, user_end: datetime) -> bool:
    for start, end in events:
        if start < user_end and user_start < end:
            return False
    return True


def find_available_rooms(building_text: str, user_start: datetime, user_end: datetime) -> Dict[str, Tuple[str, str]]:
    rooms = get_rooms_for_building(building_text)

    available: Dict[str, Tuple[str, str]] = {}
    for room_name, (seats, url) in rooms.items():
        try:
            resp = requests.get(url, timeout=15)
            if resp.status_code != 200:
                continue
            events = parse_events_from_html(resp.text)
            if is_room_free(events, user_start, user_end):
                available[room_name] = (seats, url)
        except Exception:
            # ignore per-room errors
            continue
    return available


# ====== Flask routes ======

_cached_buildings: List[str] = []


@app.route("/", methods=["GET"])
def index():
    global _cached_buildings
    if not _cached_buildings:
        try:
            _cached_buildings = get_buildings()
        except Exception as e:
            flash(f"Failed to load buildings: {e}", "error")
            _cached_buildings = []
    return render_template(
        "index.html",
        title=APP_TITLE,
        buildings=_cached_buildings,
    )


@app.route("/search", methods=["POST"])
def search():
    try:
        building = request.form.get("building", "").strip()
        date_str = request.form.get("date", "").strip()
        start_time = request.form.get("start_time", "").strip()
        end_time = request.form.get("end_time", "").strip()

        if not (building and date_str and start_time and end_time):
            flash("Please fill in all fields.", "error")
            return redirect(url_for("index"))

        user_start = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
        user_end = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
        if user_end <= user_start:
            flash("End time must be after start time.", "error")
            return redirect(url_for("index"))

        available = find_available_rooms(building, user_start, user_end)

        # Sort by room name
        sorted_items = sorted(available.items(), key=lambda kv: kv[0])
        result = [
            {"name": name, "seats": seats, "url": url}
            for name, (seats, url) in sorted_items
        ]

        return render_template(
            "results.html",
            title=APP_TITLE,
            building=building,
            date=date_str,
            start_time=start_time,
            end_time=end_time,
            results=result,
            total=len(result),
        )

    except Exception as e:
        flash(f"Search failed: {e}", "error")
        return redirect(url_for("index"))


if __name__ == "__main__":
    # Local dev server (no reloader to keep a single background process)
    app.run(host="127.0.0.1", port=5000, debug=False)