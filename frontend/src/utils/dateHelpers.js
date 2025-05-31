/**
 * Date utility functions for Habitualize
 * Handles date formatting, calculations, and comparisons
 */

import { format, startOfWeek, parseISO, addDays, subDays } from 'date-fns';

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
