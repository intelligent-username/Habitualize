// Utility functions for the mobile backend

/**
 * Extract required fields from data object, falling back to defaults if not provided.
 * @param {Object} data - Input data object (e.g., request body)
 * @param {string[]} requiredFields - List of field names to extract
 * @param {Object} defaults - Optional default values map
 * @returns {Array} - Array of extracted values in the order of requiredFields
 */
function extractData(data, requiredFields, defaults = {}) {
  const defaultValues = {
    name: 'Unnamed',
    color: 'gray',
    category_id: 1,
    cumulative: 0,
    type: 'binary',
    step_order: 0,
    ...defaults,
  };
  return requiredFields.map((field) => data[field] !== undefined ? data[field] : defaultValues[field]);
}

/**
 * Returns today's date in ISO format (YYYY-MM-DD).
 */
function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate the start date for a given period.
 * Supports "day", "week", "weekly", "month", "monthly".
 * startDayStr determines the first day of the week (e.g., "sunday").
 * referenceDate can be a string (YYYY-MM-DD) or Date object.
 */
function calculateStartDate(period, startDayStr = 'sunday', referenceDate = null) {
  let today;
  if (referenceDate) {
    if (typeof referenceDate === 'string') {
      today = new Date(referenceDate);
    } else {
      today = referenceDate;
    }
  } else {
    today = new Date();
  }

  const weekStartMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };
  const startDay = weekStartMap[startDayStr.toLowerCase()] ?? 0;

  function startOfWeek(date) {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = (day - startDay + 7) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  switch (period) {
    case 'day':
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    case 'week':
    case 'weekly':
      return startOfWeek(today);
    case 'month':
    case 'monthly':
      return new Date(today.getFullYear(), today.getMonth(), 1);
    default:
      return null;
  }
}

/**
 * Calculate the end date for a given period based on a start date.
 */
function calculateEndDate(period, startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  switch (period) {
    case 'day':
      return start;
    case 'week':
    case 'weekly':
      const endWeek = new Date(start);
      endWeek.setDate(start.getDate() + 6);
      return endWeek;
    case 'month':
    case 'monthly':
      const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const endMonth = new Date(nextMonth - 1);
      return endMonth;
    default:
      return null;
  }
}

module.exports = { extractData, getToday, calculateStartDate, calculateEndDate };
