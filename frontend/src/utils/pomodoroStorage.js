// Utility functions for Pomodoro session and duration storage

export function getSavedDurations() {
  const saved = localStorage.getItem("pomodoro_durations");
  if (saved) return JSON.parse(saved);
  return { work: 25, short: 5, long: 15 };
}

export function saveDurations(work, short, long) {
  localStorage.setItem("pomodoro_durations", JSON.stringify({ work, short, long }));
}

export function saveSessionState(sessionData) {
  localStorage.setItem("pomodoro_session", JSON.stringify(sessionData));
}

export function getSessionState() {
  const saved = localStorage.getItem("pomodoro_session");
  return saved ? JSON.parse(saved) : null;
}

export function clearSessionState() {
  localStorage.removeItem("pomodoro_session");
}
