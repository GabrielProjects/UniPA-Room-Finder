import requests
import re
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

# ========== SELENIUM SETUP ==========
options = Options()
options.add_argument("--log-level=3")
options.add_argument("--headless")
options.add_experimental_option('excludeSwitches',['enable-logging'])

# Mute logs
service = Service(log_path="nul")

# ========== USER TIME INPUT ==========
user_date = input("Insert Date (YYYY-MM-DD) (Example: 2025-05-20): ")
start_time = input("Insert start time (HH-MM): ")
end_time = input("Insert end time (HH-MM): ")
user_start = datetime.strptime(f"{user_date} {start_time}", "%Y-%m-%d %H:%M")
user_end = datetime.strptime(f"{user_date} {end_time}", "%Y-%m-%d %H:%M")

# ========== LAUNCH SELENIUM ==========
driver = webdriver.Chrome(service=service, options=options)

wait = WebDriverWait(driver, 10)
driver.get("https://offweb.unipa.it/offweb/public/aula/aulaCalendar.seam")

# Click "Ricerca Avanzata"
wait.until(EC.element_to_be_clickable((By.ID, "ricercaAula:j_id99"))).click()

# Wait for dropdown
select_elem = wait.until(EC.presence_of_element_located((By.ID, "ricercaAula:codEdificioAula")))
select = Select(select_elem)

# List all available buildings
print("\n📍 Available buildings:")
building_options = [option.text for option in select.options if option.get_attribute("value").strip() != '']
for i, name in enumerate(building_options):
    print(f"{i+1}. {name}")

# Ask user to pick
selected_index = int(input("\n🔢 Select a building (by number): ")) - 1
selected_building_text = building_options[selected_index]
print(f"\n✅ Selected: {selected_building_text}")

# Select it
select.select_by_visible_text(selected_building_text)

# Click "Cerca"
driver.find_element(By.ID, "ricercaAula:searchAulaSubmit").click()

# Wait for results table
wait.until(EC.presence_of_element_located((By.ID, "ricercaAula:aulaList")))

# ========== BUILD ROOM DICTIONARY ==========
room_dict = {}

def extract_current_page_rooms():
    rows = driver.find_elements(By.CSS_SELECTOR, "#ricercaAula\\:aulaList tbody tr")
    for row in rows:
        cols = row.find_elements(By.TAG_NAME, "td")
        if len(cols) == 3:
            room_name = cols[0].text.strip()
            seats = cols[1].text.strip()
            link = cols[0].find_element(By.TAG_NAME, "a").get_attribute("href")

            # Filter: Only LETTER+3DIGITS and seats > 0
            if re.match(r"^[A-Z]\d{3}$", room_name) and seats != "0":
                room_dict[room_name] = [seats, link]

# First page
extract_current_page_rooms()

# Pagination
while True:
    try:
        next_btn = driver.find_element(By.XPATH, "//td[contains(@class, 'rich-datascr-button') and text()='»']")
        if "rich-datascr-button-dsbld" in next_btn.get_attribute("class"):
            break
        next_btn.click()
        time.sleep(0.35)
        wait.until(EC.presence_of_element_located((By.ID, "ricercaAula:aulaList")))
        extract_current_page_rooms()
    except:
        break

driver.quit()
print(f"\n📦 Total rooms found: {len(room_dict)}")

# ========== PARSE EVENTS AND CHECK AVAILABILITY ==========
def parse_events_from_html(html):
    # Improved regex to extract start and end times (in ms)
    pattern = re.compile(r"start\s*:\s*new Date\((\d+)\).*?end\s*:\s*new Date\((\d+)\)", re.DOTALL)
    matches = pattern.findall(html)

    events = []
    for start_ms, end_ms in matches:
        try:
            start = datetime.fromtimestamp(int(start_ms) / 1000)
            end = datetime.fromtimestamp(int(end_ms) / 1000)
            events.append((start, end))
        except Exception as e:
            print(f"⚠️ Invalid timestamp: {start_ms}, {end_ms} → {e}")
    return events

def is_room_free(events, user_start, user_end):
    for start, end in events:
        if start < user_end and user_start < end:
            return False
    return True

available_rooms = {}

for room_name, (seats, url) in room_dict.items():
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"⚠️ Failed to fetch {room_name}")
            continue

        html = response.text
        events = parse_events_from_html(html)

        if is_room_free(events, user_start, user_end):
            available_rooms[room_name] = [seats, url]
            print(f"✅ Room {room_name} is FREE")
        else:
            print(f"❌ Room {room_name} is OCCUPIED")
    except Exception as e:
        print(f"⚠️ Error on {room_name}: {e}")

# ========== FINAL OUTPUT ==========
print("\n✅ Available Rooms:")
for name, (seats, link) in available_rooms.items():
    print(f"📝 {name} | 🪑Seats: {seats} |🔗 {link}")