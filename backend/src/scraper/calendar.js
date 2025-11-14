import axios from "axios";
import https from "https";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { retry } from "../utils/retry.js";

// Create axios instance with connection pooling for better performance
const httpAgent = new https.Agent({
  keepAlive: true,
  maxSockets: config.MAX_CONCURRENT_REQUESTS,
  maxFreeSockets: 10,
  timeout: config.HTTP_TIMEOUT,
  keepAliveMsecs: 1000
});

const axiosInstance = axios.create({
  timeout: config.HTTP_TIMEOUT,
  httpsAgent: httpAgent,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
    "Connection": "keep-alive"
  },
  maxRedirects: 5,
  validateStatus: (status) => status >= 200 && status < 400
});

/**
 * Parse calendar events from HTML
 * Extracts start/end Date(...) in milliseconds from inline JS
 * Improved to handle edge cases and validate events
 */
export function parseEventsFromHTML(html) {
  if (!html || typeof html !== "string") {
    logger.warn("Invalid HTML provided to parseEventsFromHTML");
    return [];
  }
  
  // Multiple patterns to catch different formats
  const patterns = [
    /start\s*:\s*new Date\((\d+)\).*?end\s*:\s*new Date\((\d+)\)/gs,
    /start\s*:\s*new\s+Date\s*\(\s*(\d+)\s*\).*?end\s*:\s*new\s+Date\s*\(\s*(\d+)\s*\)/gs,
    /"start"\s*:\s*(\d+).*?"end"\s*:\s*(\d+)/gs
  ];
  
  const events = [];
  const seenEvents = new Set(); // Prevent duplicates
  
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    
    for (const match of matches) {
      try {
        const startMs = parseInt(match[1], 10);
        const endMs = parseInt(match[2], 10);
        
        // Validate timestamps are reasonable (between 2000 and 2100)
        const minTimestamp = new Date("2000-01-01").getTime();
        const maxTimestamp = new Date("2100-01-01").getTime();
        
        if (isNaN(startMs) || isNaN(endMs)) {
          continue;
        }
        
        if (startMs < minTimestamp || startMs > maxTimestamp ||
            endMs < minTimestamp || endMs > maxTimestamp) {
          if (config.DEBUG) {
            logger.debug(`Skipping event with out-of-range timestamps: ${startMs}, ${endMs}`);
          }
          continue;
        }
        
        const start = new Date(startMs);
        const end = new Date(endMs);
        
        // Validate dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          continue;
        }
        
        // Validate end is after start
        if (end <= start) {
          if (config.DEBUG) {
            logger.debug(`Skipping event with invalid time range: ${start} to ${end}`);
          }
          continue;
        }
        
        // Create unique key to prevent duplicates
        const eventKey = `${startMs}-${endMs}`;
        if (seenEvents.has(eventKey)) {
          continue;
        }
        seenEvents.add(eventKey);
        
        events.push([start, end]);
      } catch (error) {
        if (config.DEBUG) {
          logger.debug("Error parsing event timestamp:", error.message);
        }
        // Skip malformed timestamps
      }
    }
  }
  
  // Sort events by start time
  events.sort((a, b) => a[0].getTime() - b[0].getTime());
  
  if (config.DEBUG) {
    logger.debug(`Parsed ${events.length} valid events from HTML`);
  }
  
  return events;
}

/**
 * Check if room is free during specified time range
 */
export function isRoomFree(events, userStart, userEnd) {
  for (const [eventStart, eventEnd] of events) {
    // Check for overlap: events overlap if start < userEnd AND userStart < end
    if (eventStart < userEnd && userStart < eventEnd) {
      return false;
    }
  }
  return true;
}

/**
 * Fetch and parse calendar events for a room
 */
export async function getRoomEvents(roomUrl, date) {
  try {
    const response = await retry(
      async () => {
        return await axiosInstance.get(roomUrl);
      },
      3,
      1000,
      `Fetch calendar for ${roomUrl}`
    );
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const events = parseEventsFromHTML(response.data);
    if (config.DEBUG) {
      logger.debug(`Parsed ${events.length} events from ${roomUrl}`);
    }
    return events;
    
  } catch (error) {
    if (error.response) {
      logger.warn(`Failed to fetch events for ${roomUrl}: HTTP ${error.response.status}`);
    } else {
      logger.warn(`Failed to fetch events for ${roomUrl}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Find all free slots of specified duration within a time range
 */
export function findFreeSlots(events, rangeStart, rangeEnd, durationHours) {
  const durationMs = durationHours * 60 * 60 * 1000;
  const freeSlots = [];
  let current = new Date(rangeStart);
  
  while (current.getTime() + durationMs <= rangeEnd.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMs);
    
    if (isRoomFree(events, current, slotEnd)) {
      freeSlots.push([new Date(current), new Date(slotEnd)]);
      // Jump to end of this slot to avoid overlapping results
      current = slotEnd;
    } else {
      // Move forward by 30 minutes
      current = new Date(current.getTime() + 30 * 60 * 1000);
    }
  }
  
  return freeSlots;
}

