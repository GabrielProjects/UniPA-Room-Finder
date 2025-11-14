import { createPage, returnPage } from "./browser.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { retry } from "../utils/retry.js";

const BASE_URL = config.BASE_URL;

/**
 * Get list of available buildings from Unipa website
 */
export async function getBuildings() {
  const page = await createPage();
  
  try {
    logger.info("Fetching buildings list...");
    
    await retry(async () => {
      await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    }, 3, 1000, "Navigate to BASE_URL");
    
    // Click "Ricerca Avanzata"
    await retry(async () => {
      await page.waitForSelector("#ricercaAula\\:j_id99", { timeout: config.ELEMENT_WAIT_TIMEOUT });
      await page.click("#ricercaAula\\:j_id99");
      await page.waitForTimeout(500); // Wait for form to load
    }, 3, 1000, "Click Ricerca Avanzata");
    
    // Wait for building dropdown and extract options
    await page.waitForSelector("#ricercaAula\\:codEdificioAula", { timeout: config.ELEMENT_WAIT_TIMEOUT });
    
    const buildings = await page.evaluate(() => {
      const select = document.querySelector("#ricercaAula\\:codEdificioAula");
      if (!select) return [];
      
      const options = Array.from(select.options);
      return options
        .filter(opt => opt.value && opt.value.trim() !== "")
        .map(opt => opt.text.trim());
    });
    
    logger.info(`Found ${buildings.length} buildings`);
    return buildings;
    
  } catch (error) {
    logger.error("Error fetching buildings:", error);
    throw new Error(`Failed to fetch buildings: ${error.message}`);
  } finally {
    await returnPage(page);
  }
}

