import { createPage, returnPage } from "./browser.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { retry } from "../utils/retry.js";

const BASE_URL = config.BASE_URL;

/**
 * Extract rooms from current page
 * Improved to handle all room formats and provide detailed logging
 */
async function extractCurrentPageRooms(page) {
  const rooms = await page.evaluate(() => {
    const rows = document.querySelectorAll("#ricercaAula\\:aulaList tbody tr");
    const result = {};
    let skippedCount = 0;
    let skippedReasons = {
      noLink: 0,
      noName: 0,
      invalidSeats: 0,
      duplicate: 0
    };
    
    for (const row of rows) {
      const cols = row.querySelectorAll("td");
      if (cols.length >= 3) {
        const roomNameCell = cols[0];
        const roomName = roomNameCell.textContent.trim();
        const seats = cols[1].textContent.trim();
        const linkElement = roomNameCell.querySelector("a");
        
        // More permissive: accept any room with a valid link and name
        // Removed strict seat filter to include all valid rooms
        if (!linkElement || !linkElement.href) {
          skippedReasons.noLink++;
          continue;
        }
        
        if (!roomName || roomName.length === 0) {
          skippedReasons.noName++;
          continue;
        }
        
        // Accept rooms with any seat count (including 0, as they might be valid)
        // Only skip if seats field is completely empty or invalid
        const seatsNum = parseInt(seats, 10);
        if (isNaN(seatsNum) && seats.trim() !== "") {
          // If seats is not a number but not empty, still accept it
          // Some rooms might have special seat descriptions
        }
        
        const link = linkElement.href;
        
        // Check for duplicates
        if (result[roomName]) {
          skippedReasons.duplicate++;
          continue;
        }
        
        // Accept the room
        result[roomName] = [seats || "0", link];
      }
    }
    
    return { rooms: result, stats: { total: rows.length, extracted: Object.keys(result).length, skipped: skippedReasons } };
  });
  
  // Handle both old format (direct object) and new format (with stats)
  const extractedRooms = rooms.rooms || rooms;
  const stats = rooms.stats;
  
  if (stats) {
    logger.debug(`Page extraction stats: ${stats.extracted} extracted, ${stats.total} total rows`);
    if (stats.skipped && Object.values(stats.skipped).some(v => v > 0)) {
      logger.debug(`Skipped: ${JSON.stringify(stats.skipped)}`);
    }
  }
  
  return extractedRooms;
}

/**
 * Get all rooms for a building (with pagination)
 */
export async function getRoomsForBuilding(buildingText) {
  const page = await createPage();
  
  try {
    logger.info(`Fetching rooms for building: ${buildingText}`);
    
    // Navigate to base URL
    await retry(async () => {
      await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    }, 3, 1000, "Navigate to BASE_URL");
    
    // Click "Ricerca Avanzata"
    await retry(async () => {
      await page.waitForSelector("#ricercaAula\\:j_id99", { timeout: config.ELEMENT_WAIT_TIMEOUT });
      await page.click("#ricercaAula\\:j_id99");
      await page.waitForTimeout(500);
    }, 3, 1000, "Click Ricerca Avanzata");
    
    // Select building
    await page.waitForSelector("#ricercaAula\\:codEdificioAula", { timeout: config.ELEMENT_WAIT_TIMEOUT });
    
    // Try to select by visible text, with fallback to value matching
    const buildingSelection = await page.evaluate((buildingName) => {
      const select = document.querySelector("#ricercaAula\\:codEdificioAula");
      if (!select) {
        return { success: false, reason: "Select element not found", availableBuildings: [] };
      }
      
      const options = Array.from(select.options);
      const availableBuildings = options
        .filter(opt => opt.value && opt.value.trim() !== "")
        .map(opt => opt.text.trim());
      
      const normalizedTarget = buildingName.trim().toLowerCase();
      
      // Try exact match first
      for (const opt of options) {
        if (opt.text.trim() === buildingName.trim()) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          return { success: true, matched: opt.text.trim(), availableBuildings };
        }
      }
      
      // Try case-insensitive match
      for (const opt of options) {
        if (opt.text.trim().toLowerCase() === normalizedTarget) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          return { success: true, matched: opt.text.trim(), availableBuildings };
        }
      }
      
      // Try partial match (contains)
      for (const opt of options) {
        if (opt.text.trim().toLowerCase().includes(normalizedTarget) || 
            normalizedTarget.includes(opt.text.trim().toLowerCase())) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          return { success: true, matched: opt.text.trim(), availableBuildings };
        }
      }
      
      return { success: false, reason: "No matching building found", availableBuildings };
    }, buildingText);
    
    if (!buildingSelection.success) {
      logger.error(`Building selection failed for "${buildingText}": ${buildingSelection.reason}`);
      logger.debug(`Available buildings: ${buildingSelection.availableBuildings.slice(0, 10).join(", ")}${buildingSelection.availableBuildings.length > 10 ? "..." : ""}`);
      throw new Error(`Building "${buildingText}" not found in dropdown. Available: ${buildingSelection.availableBuildings.slice(0, 5).join(", ")}...`);
    }
    
    logger.debug(`Building selected: "${buildingSelection.matched}" (requested: "${buildingText}")`);
    
    await page.waitForTimeout(300);
    
    // Click "Cerca"
    await retry(async () => {
      await page.waitForSelector("#ricercaAula\\:searchAulaSubmit", { timeout: config.ELEMENT_WAIT_TIMEOUT });
      await page.click("#ricercaAula\\:searchAulaSubmit");
    }, 3, 1000, "Click Cerca");
    
    // Wait for results table
    await page.waitForSelector("#ricercaAula\\:aulaList", { timeout: config.ELEMENT_WAIT_TIMEOUT });
    await page.waitForTimeout(500); // Wait for table to render
    
    // Collect rooms across pagination
    const roomDict = {};
    let pageNum = 1;
    const maxPages = 100; // Safety limit to prevent infinite loops
    let consecutiveErrors = 0;
    
    while (pageNum <= maxPages) {
      try {
        logger.debug(`Extracting rooms from page ${pageNum}...`);
        const pageRooms = await extractCurrentPageRooms(page);
        const roomsBefore = Object.keys(roomDict).length;
        Object.assign(roomDict, pageRooms);
        const roomsAfter = Object.keys(roomDict).length;
        const newRooms = roomsAfter - roomsBefore;
        
        logger.debug(`Page ${pageNum}: Found ${Object.keys(pageRooms).length} rooms (${newRooms} new, ${roomsAfter} total)`);
        
        // Try to go to next page
        const paginationResult = await page.evaluate(() => {
          const nextBtn = Array.from(document.querySelectorAll("td.rich-datascr-button"))
            .find(td => td.textContent.trim() === "»");
          
          if (!nextBtn) {
            return { hasNext: false, reason: "Next button not found" };
          }
          
          const isDisabled = nextBtn.classList.contains("rich-datascr-button-dsbld");
          if (isDisabled) {
            return { hasNext: false, reason: "Next button disabled" };
          }
          
          nextBtn.click();
          return { hasNext: true };
        });
        
        if (!paginationResult.hasNext) {
          logger.debug(`No more pages: ${paginationResult.reason}`);
          break;
        }
        
        // Wait for next page to load
        await page.waitForTimeout(config.PAGINATION_DELAY);
        await page.waitForSelector("#ricercaAula\\:aulaList", { timeout: config.ELEMENT_WAIT_TIMEOUT });
        pageNum++;
        consecutiveErrors = 0; // Reset error counter on success
        
      } catch (error) {
        consecutiveErrors++;
        logger.warn(`Error on page ${pageNum}: ${error.message}`);
        
        if (consecutiveErrors >= 3) {
          logger.error(`Too many consecutive errors (${consecutiveErrors}), stopping pagination`);
          break;
        }
        
        // Try to continue to next page anyway
        try {
          await page.waitForTimeout(config.PAGINATION_DELAY * 2);
          await page.waitForSelector("#ricercaAula\\:aulaList", { timeout: config.ELEMENT_WAIT_TIMEOUT });
          pageNum++;
        } catch (retryError) {
          logger.error(`Failed to recover from error, stopping pagination: ${retryError.message}`);
          break;
        }
      }
    }
    
    if (pageNum > maxPages) {
      logger.warn(`Reached maximum page limit (${maxPages}), stopping pagination`);
    }
    
    const totalRooms = Object.keys(roomDict).length;
    logger.info(`Building "${buildingText}": Found ${totalRooms} total rooms across ${pageNum} page(s)`);
    
    if (totalRooms === 0) {
      logger.warn(`No rooms found for building "${buildingText}" - this might indicate a problem`);
    }
    
    return roomDict;
    
  } catch (error) {
    logger.error(`Error fetching rooms for building ${buildingText}:`, error);
    throw new Error(`Failed to fetch rooms for building "${buildingText}": ${error.message}`);
  } finally {
    await returnPage(page);
  }
}

