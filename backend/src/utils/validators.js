/**
 * Normalize building name (trim, case-insensitive comparison)
 */
export function normalizeBuildingName(name) {
  return name.trim();
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate time string format (HH:MM)
 */
export function isValidTime(timeString) {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeString);
}

/**
 * Validate search request
 */
export function validateSearchRequest(body) {
  const { building, date, start_time, end_time, flexible_mode, duration } = body;
  
  if (!building || typeof building !== "string" || !building.trim()) {
    return { valid: false, error: "Building is required" };
  }
  
  if (!date || !isValidDate(date)) {
    return { valid: false, error: "Valid date (YYYY-MM-DD) is required" };
  }
  
  if (!start_time || !isValidTime(start_time)) {
    return { valid: false, error: "Valid start time (HH:MM) is required" };
  }
  
  if (!end_time || !isValidTime(end_time)) {
    return { valid: false, error: "Valid end time (HH:MM) is required" };
  }
  
  const start = new Date(`${date}T${start_time}`);
  const end = new Date(`${date}T${end_time}`);
  
  if (end <= start) {
    return { valid: false, error: "End time must be after start time" };
  }
  
  if (flexible_mode) {
    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      return { valid: false, error: "Valid duration (hours) is required for flexible mode" };
    }
  }
  
  return { valid: true };
}

