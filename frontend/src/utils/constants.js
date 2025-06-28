export const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

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

export const DEFAULT_HABIT_COLOR = "gray";
export const DEFAULT_HABIT_TYPE = "binary";

// Timer formatting utility
// TODO: Add more formats, make this easier to use on PC
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};
