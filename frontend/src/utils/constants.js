/**
 * Constants and utility functions for Habitualize
 * Defines color schemes, defaults, and mobile detection
 */

// Device detection
export const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Time formatting constants
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const TIME_PADDING = 2;

// All 12 Color options for habits
export const COLOR_OPTIONS = [
  { name: "Gray", value: "gray", hex: "#9e9e9e" },
  { name: "Light Blue", value: "light_blue", hex: "#4fc3f7" },
  { name: "Dark Blue", value: "dark_blue", hex: "#1565c0" },
  { name: "Yellow", value: "yellow", hex: "#ffeb3b" },
  { name: "Orange", value: "orange", hex: "#ff9800" },
  { name: "Red", value: "red", hex: "#e53935" },
  { name: "Dark Gray", value: "dark_gray", hex: "#616161" },
  { name: "Purple", value: "purple", hex: "#7e57c2" },
  { name: "Green", value: "green", hex: "#66bb6a" },
  { name: "Pink", value: "pink", hex: "#ec407a" },
  { name: "Gold", value: "gold", hex: "#ffc107" },
  { name: "Olive", value: "olive", hex: "#808000" },
];

// Default values
export const DEFAULT_HABIT_COLOR = "gray";
export const DEFAULT_HABIT_TYPE = "binary";

/**
 * Format time in seconds to HH:MM:SS or MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 * @example formatTime(3661) // "1:01:01"
 * @example formatTime(61) // "1:01"
 */
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / SECONDS_PER_HOUR);
  const m = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const s = seconds % SECONDS_PER_MINUTE;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(TIME_PADDING, "0")}:${s.toString().padStart(TIME_PADDING, "0")}`;
  }
  
  return `${m}:${s.toString().padStart(TIME_PADDING, "0")}`;
};

export const MODES = [
  { key: "pomodoro", label: "Work Session", color: "#ba4949", default: 25 },
  { key: "short_break", label: "Short Break", color: "#1b4636", default: 5 },
  { key: "long_break", label: "Long Break", color: "#1260cc", default: 15 },
];
