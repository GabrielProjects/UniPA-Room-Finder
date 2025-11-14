import puppeteer from "puppeteer";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

let browserInstance = null;
const pagePool = [];
const MAX_POOL_SIZE = 5; // Maximum pages to keep in pool
let activePages = 0;

/**
 * Get or create browser instance (singleton pattern)
 */
export async function getBrowser() {
  if (!browserInstance) {
    logger.info("Launching browser...");
    try {
      browserInstance = await puppeteer.launch({
        headless: config.PUPPETEER.headless,
        args: config.PUPPETEER.args,
        timeout: config.PUPPETEER.timeout
      });
      logger.info("Browser launched successfully");
      
      // Handle browser disconnection
      browserInstance.on("disconnected", () => {
        logger.warn("Browser disconnected, will recreate on next request");
        browserInstance = null;
        pagePool.length = 0; // Clear page pool
      });
      
      // Cleanup on process exit
      const cleanup = async () => {
        await closeBrowser();
        process.exit(0);
      };
      
      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);
    } catch (error) {
      logger.error("Failed to launch browser:", error);
      throw error;
    }
  }
  
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser() {
  if (browserInstance) {
    logger.info("Closing browser and cleaning up pages...");
    
    // Close all pages in pool
    for (const page of pagePool) {
      try {
        if (!page.isClosed()) {
          await page.close();
        }
      } catch (error) {
        logger.debug("Error closing pooled page:", error.message);
      }
    }
    pagePool.length = 0;
    activePages = 0;
    
    try {
      await browserInstance.close();
    } catch (error) {
      logger.warn("Error closing browser:", error.message);
    }
    
    browserInstance = null;
    logger.info("Browser closed");
  }
}

/**
 * Create a new page with common settings
 * Improved with page pooling for better performance
 */
export async function createPage() {
  const browser = await getBrowser();
  
  // Try to reuse a page from pool if available
  while (pagePool.length > 0) {
    const pooledPage = pagePool.pop();
    try {
      if (!pooledPage.isClosed()) {
        // Clear any existing content
        await pooledPage.goto("about:blank", { waitUntil: "domcontentloaded", timeout: 5000 }).catch(() => {});
        activePages++;
        return pooledPage;
      }
    } catch (error) {
      logger.debug("Pooled page is invalid, creating new one:", error.message);
      // Page is invalid, continue to create new one
    }
  }
  
  // Create new page if pool is empty
  try {
    const page = await browser.newPage();
    activePages++;
    
    // Set timeouts
    page.setDefaultNavigationTimeout(config.PAGE_LOAD_TIMEOUT);
    page.setDefaultTimeout(config.ELEMENT_WAIT_TIMEOUT);
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Optimize page performance
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      // Block images, fonts, and stylesheets to speed up loading (we only need HTML/JS)
      if (["image", "font", "stylesheet", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    return page;
  } catch (error) {
    logger.error("Failed to create page:", error);
    throw error;
  }
}

/**
 * Return a page to the pool for reuse
 * If pool is full, close the page instead
 */
export async function returnPage(page) {
  if (!page || page.isClosed()) {
    activePages = Math.max(0, activePages - 1);
    return;
  }
  
  try {
    // Clear page state
    await page.goto("about:blank", { waitUntil: "domcontentloaded", timeout: 5000 }).catch(() => {});
    
    // Add to pool if there's space
    if (pagePool.length < MAX_POOL_SIZE) {
      pagePool.push(page);
      activePages = Math.max(0, activePages - 1);
      if (config.DEBUG) {
        logger.debug(`Page returned to pool (${pagePool.length}/${MAX_POOL_SIZE} in pool, ${activePages} active)`);
      }
    } else {
      // Pool is full, close the page
      await page.close();
      activePages = Math.max(0, activePages - 1);
      if (config.DEBUG) {
        logger.debug("Page pool full, closing page");
      }
    }
  } catch (error) {
    logger.debug("Error returning page to pool, closing instead:", error.message);
    try {
      await page.close();
    } catch (closeError) {
      // Ignore close errors
    }
    activePages = Math.max(0, activePages - 1);
  }
}

