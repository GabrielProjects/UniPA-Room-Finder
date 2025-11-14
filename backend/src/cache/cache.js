import NodeCache from "node-cache";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

// Separate caches for different data types
const buildingsCache = new NodeCache({ stdTTL: config.CACHE.BUILDINGS_TTL });
const roomsCache = new NodeCache({ stdTTL: config.CACHE.ROOMS_TTL });
const eventsCache = new NodeCache({ stdTTL: config.CACHE.EVENTS_TTL_CURRENT });

/**
 * Get cache key for events (includes date for proper invalidation)
 */
function getEventsCacheKey(roomUrl, date) {
  return `events:${roomUrl}:${date}`;
}

/**
 * Get TTL for events based on date
 */
function getEventsTTL(date) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;
  return isToday ? config.CACHE.EVENTS_TTL_CURRENT : config.CACHE.EVENTS_TTL_FUTURE;
}

export const cache = {
  // Buildings cache
  getBuildings() {
    return buildingsCache.get("buildings");
  },
  
  setBuildings(buildings) {
    buildingsCache.set("buildings", buildings);
    logger.debug("Cached buildings list");
  },
  
  // Rooms cache
  getRooms(building) {
    return roomsCache.get(`rooms:${building}`);
  },
  
  setRooms(building, rooms) {
    roomsCache.set(`rooms:${building}`, rooms);
    logger.debug(`Cached rooms for building: ${building}`);
  },
  
  // Events cache (per room, per date)
  getEvents(roomUrl, date) {
    const key = getEventsCacheKey(roomUrl, date);
    return eventsCache.get(key);
  },
  
  setEvents(roomUrl, date, events) {
    const key = getEventsCacheKey(roomUrl, date);
    const ttl = getEventsTTL(date);
    eventsCache.set(key, events, ttl);
    logger.debug(`Cached events for room ${roomUrl} on date ${date} (TTL: ${ttl}s)`);
  },
  
  // Clear all caches (useful for testing)
  clearAll() {
    buildingsCache.flushAll();
    roomsCache.flushAll();
    eventsCache.flushAll();
    logger.info("All caches cleared");
  }
};

