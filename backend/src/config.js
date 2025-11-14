export const config = {
  BASE_URL: "https://offweb.unipa.it/offweb/public/aula/aulaCalendar.seam",
  PORT: process.env.PORT || 3000,
  
  // Puppeteer settings
  PUPPETEER: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--log-level=3"
    ],
    timeout: 45000
  },
  
  // Timeouts
  PAGE_LOAD_TIMEOUT: 20000,
  ELEMENT_WAIT_TIMEOUT: 20000,
  PAGINATION_DELAY: 400,
  HTTP_TIMEOUT: 15000,
  
  // Performance settings
  CONCURRENCY: parseInt(process.env.CONCURRENCY) || 25, // Parallel requests for room checking
  MAX_CONCURRENT_REQUESTS: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 30, // Max HTTP connections
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE) || 25, // Rooms per batch
  
  // Caching
  CACHE: {
    BUILDINGS_TTL: 24 * 60 * 60, // 24 hours
    ROOMS_TTL: 60 * 60, // 1 hour
    EVENTS_TTL_CURRENT: 60 * 60, // 1 hour for current date
    EVENTS_TTL_FUTURE: 24 * 60 * 60 // 24 hours for future dates
  },
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  
  // Debug mode
  DEBUG: process.env.DEBUG === "true" || false
};

