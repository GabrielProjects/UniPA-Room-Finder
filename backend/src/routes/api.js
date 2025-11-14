import express from "express";
import { getBuildings } from "../scraper/buildings.js";
import { getRoomsForBuilding } from "../scraper/rooms.js";
import { getRoomEvents, isRoomFree, findFreeSlots } from "../scraper/calendar.js";
import { cache } from "../cache/cache.js";
import { validateSearchRequest } from "../utils/validators.js";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

const router = express.Router();

/**
 * GET /api/buildings
 * Get list of available buildings
 */
router.get("/buildings", async (req, res) => {
  try {
    // Check cache first
    let buildings = cache.getBuildings();
    
    if (!buildings) {
      buildings = await getBuildings();
      cache.setBuildings(buildings);
    }
    
    res.json({ buildings });
  } catch (error) {
    logger.error("Error in /api/buildings:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/search
 * Search for available rooms
 */
router.post("/search", async (req, res) => {
  try {
    // Validate request
    const validation = validateSearchRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const { building, date, start_time, end_time, flexible_mode, duration } = req.body;
    
    // Parse datetime
    const userStart = new Date(`${date}T${start_time}`);
    const userEnd = new Date(`${date}T${end_time}`);
    
    logger.info(`Search request: building=${building}, date=${date}, time=${start_time}-${end_time}, flexible=${flexible_mode}`);
    
    // Get rooms for building (check cache first)
    let rooms = cache.getRooms(building);
    if (!rooms) {
      rooms = await getRoomsForBuilding(building);
      cache.setRooms(building, rooms);
    }
    
    logger.info(`Checking ${Object.keys(rooms).length} rooms for availability...`);
    
    if (flexible_mode) {
      // Flexible slot search
      const durationHours = parseFloat(duration);
      const results = {};
      
      // Process rooms in parallel (with optimized concurrency)
      const roomEntries = Object.entries(rooms);
      const concurrency = config.CONCURRENCY;
      const totalRooms = roomEntries.length;
      let processedRooms = 0;
      
      logger.info(`Processing ${totalRooms} rooms with concurrency ${concurrency}...`);
      const startTime = Date.now();
      
      // Process in batches for better progress tracking
      for (let i = 0; i < roomEntries.length; i += concurrency) {
        const batch = roomEntries.slice(i, i + concurrency);
        const batchStartTime = Date.now();
        
        await Promise.all(
          batch.map(async ([roomName, [seats, url]]) => {
            try {
              // Check cache first
              let events = cache.getEvents(url, date);
              if (!events) {
                events = await getRoomEvents(url, date);
                cache.setEvents(url, date, events);
              }
              
              const freeSlots = findFreeSlots(events, userStart, userEnd, durationHours);
              
              if (freeSlots.length > 0) {
                results[roomName] = {
                  seats,
                  url,
                  slots: freeSlots
                };
              }
            } catch (error) {
              if (config.DEBUG) {
                logger.debug(`Error processing room ${roomName}:`, error.message);
              }
              // Skip rooms with errors
            } finally {
              processedRooms++;
            }
          })
        );
        
        const batchTime = Date.now() - batchStartTime;
        const progress = ((processedRooms / totalRooms) * 100).toFixed(1);
        logger.debug(`Processed ${processedRooms}/${totalRooms} rooms (${progress}%) - Batch took ${batchTime}ms`);
      }
      
      const totalTime = Date.now() - startTime;
      logger.info(`Completed processing ${totalRooms} rooms in ${totalTime}ms (avg ${(totalTime / totalRooms).toFixed(0)}ms per room)`);
      
      // Format results
      const formattedResults = Object.entries(results)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, data]) => ({
          name,
          seats: data.seats,
          url: data.url,
          slots: data.slots.map(([start, end]) => ({
            start: start.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
            end: end.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
          }))
        }));
      
      res.json({
        results: formattedResults,
        total: formattedResults.length,
        flexible_mode: true,
        duration: durationHours
      });
      
    } else {
      // Exact time search
      const available = {};
      
      // Process rooms in parallel (with optimized concurrency)
      const roomEntries = Object.entries(rooms);
      const concurrency = config.CONCURRENCY;
      const totalRooms = roomEntries.length;
      let processedRooms = 0;
      
      logger.info(`Processing ${totalRooms} rooms with concurrency ${concurrency}...`);
      const startTime = Date.now();
      
      // Process in batches for better progress tracking
      for (let i = 0; i < roomEntries.length; i += concurrency) {
        const batch = roomEntries.slice(i, i + concurrency);
        const batchStartTime = Date.now();
        
        await Promise.all(
          batch.map(async ([roomName, [seats, url]]) => {
            try {
              // Check cache first
              let events = cache.getEvents(url, date);
              if (!events) {
                events = await getRoomEvents(url, date);
                cache.setEvents(url, date, events);
              }
              
              if (isRoomFree(events, userStart, userEnd)) {
                available[roomName] = { seats, url };
              }
            } catch (error) {
              if (config.DEBUG) {
                logger.debug(`Error processing room ${roomName}:`, error.message);
              }
              // Skip rooms with errors
            } finally {
              processedRooms++;
            }
          })
        );
        
        const batchTime = Date.now() - batchStartTime;
        const progress = ((processedRooms / totalRooms) * 100).toFixed(1);
        logger.debug(`Processed ${processedRooms}/${totalRooms} rooms (${progress}%) - Batch took ${batchTime}ms`);
      }
      
      const totalTime = Date.now() - startTime;
      logger.info(`Completed processing ${totalRooms} rooms in ${totalTime}ms (avg ${(totalTime / totalRooms).toFixed(0)}ms per room)`);
      
      // Format results
      const formattedResults = Object.entries(available)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, data]) => ({
          name,
          seats: data.seats,
          url: data.url
        }));
      
      res.json({
        results: formattedResults,
        total: formattedResults.length,
        flexible_mode: false
      });
    }
    
  } catch (error) {
    logger.error("Error in /api/search:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health
 * Health check endpoint with detailed status
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});

export default router;

