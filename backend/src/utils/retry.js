import { logger } from "./logger.js";

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @param {string} context - Context for logging
 * @returns {Promise<any>}
 */
export async function retry(fn, maxRetries = 3, initialDelay = 1000, context = "operation") {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        logger.warn(`${context} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error(`${context} failed after ${maxRetries + 1} attempts:`, error.message);
      }
    }
  }
  
  throw lastError;
}

