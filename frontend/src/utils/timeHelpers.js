/**
 * Date utility functions for Habitualize
 * Handles date formatting, calculations, and comparisons
 */

import { format, startOfWeek, parseISO, addDays, subDays } from 'date-fns';

/**
 * Parse ISO date string to local Date object
 * @param {string} isoString - ISO date string (YYYY-MM-DD)
 * @returns {Date} - Local Date object
 * @example parseISODateToLocal("2025-05-30") // Date object for May 30, 2025
 */
export function parseISODateToLocal(isoString) {
    const [year, month, day] = isoString.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * Convert date to local date string format (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 * @example getLocalDateString(new Date()) // "2025-05-30"
 */
export function getLocalDateString(date) {
    return format(date, 'yyyy-MM-dd');
}

/**
 * Get start of week for given date
 * @param {Date} date - Date object
 * @returns {Date} - Start of week date
 */
export function getStartOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

/**
 * Get array of 7 dates starting from given date
 * @param {Date} startDate - Starting date
 * @returns {Date[]} - Array of 7 consecutive dates
 */
export function getWeekDates(startDate) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });
}

/**
 * Get month name from date
 * @param {Date} date - Date object
 * @returns {string} - Month name
 */
export function getMonthName(date) {
    return date.toLocaleString('default', { month: 'long' });
}

/**
 * Check if two dates are the same day
 * @param {Date} a - First date
 * @param {Date} b - Second date
 * @returns {boolean} - True if same day
 */
export function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/**
 * Get current week start using date-fns
 * @param {string} selectedDate - Selected date string
 * @returns {Date} - Week start date
 */
export function getCurrentWeekStart(selectedDate) {
    return startOfWeek(parseISO(selectedDate), { weekStartsOn: 0 });
}

/**
 * Navigate to previous week
 * @param {string} selectedDate - Current selected date
 * @returns {string} - Previous week date string
 */
export function getPreviousWeek(selectedDate) {
    const prevWeek = subDays(parseISO(selectedDate), 7);
    return getLocalDateString(prevWeek);
}

/**
 * Navigate to next week
 * @param {string} selectedDate - Current selected date
 * @returns {string} - Next week date string
 */
export function getNextWeek(selectedDate) {
    const nextWeek = addDays(parseISO(selectedDate), 7);
    return getLocalDateString(nextWeek);
}

/**
 * Get number of days in a given month
 * @param {number} year - Year (4 digits)
 * @param {number} month - Month (0-11, JavaScript month indexing)
 * @returns {number} - Number of days in the month
 * @example getDaysInMonth(2025, 4) // 31 (May has 31 days)
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Calculate remaining time for a Pomodoro session with accurate elapsed time tracking
 * Handles paused state and ensures accurate time calculation even after tab-out or refresh
 * @param {Object} sessionData - Session data from localStorage
 * @param {string} sessionData.startTime - ISO timestamp when session started
 * @param {string|null} sessionData.pausedAt - ISO timestamp when session was paused (null if not paused)
 * @param {number} sessionData.totalDuration - Total session duration in seconds
 * @param {number} sessionData.pausedDuration - Total time spent paused in seconds
 * @returns {number} - Remaining time in seconds (0 if session should be finished)
 */
export function getPomodoroRemainingTime(sessionData) {
    const { startTime, pausedAt, totalDuration, pausedDuration } = sessionData;
    
    if (!startTime || !totalDuration) {
        return 0;
    }
    
    const now = new Date();
    const sessionStart = new Date(startTime);
    
    // Calculate elapsed time
    let elapsedTime;
    if (pausedAt) {
        // Session is paused - use time up to when it was paused
        const pauseTime = new Date(pausedAt);
        elapsedTime = Math.floor((pauseTime - sessionStart) / 1000);
    } else {
        // Session is running - use current time
        elapsedTime = Math.floor((now - sessionStart) / 1000);
    }
    
    // Subtract any time spent paused from elapsed time
    const activeElapsedTime = elapsedTime - (pausedDuration || 0);
    
    // Calculate remaining time
    const remainingTime = totalDuration - activeElapsedTime;
    
    // Return 0 if session should be finished
    return Math.max(0, remainingTime);
}
