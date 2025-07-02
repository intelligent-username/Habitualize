import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import api from "../services/api";
import "../App.css";
import "../styles/pomodoro.css";
import { addDays, subDays, format, startOfWeek, addWeeks, subWeeks, startOfMonth, addMonths, subMonths, getWeek, getWeekYear, isThisYear, isToday, isThisWeek, isThisMonth, differenceInDays } from "date-fns";

const MODES = [
  { key: "pomodoro", label: "Work Session", color: "#ba4949", default: 25 },
  { key: "short_break", label: "Short Break", color: "#1b4636", default: 5 },
  { key: "long_break", label: "Long Break", color: "#1260cc", default: 15 },
];

function getSavedDurations() {
  const saved = localStorage.getItem("pomodoro_durations");
  if (saved) return JSON.parse(saved);
  return { work: 25, short: 5, long: 15 };
}
function saveDurations(work, short, long) {
  localStorage.setItem("pomodoro_durations", JSON.stringify({ work, short, long }));
}

const PomodoroPage = () => {
  const saved = getSavedDurations();
  const [mode, setMode] = useState(MODES[0].key);
  const [workDuration, setWorkDuration] = useState(saved.work);
  const [shortBreak, setShortBreak] = useState(saved.short);
  const [longBreak, setLongBreak] = useState(saved.long);
  const [timer, setTimer] = useState(saved.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [stats, setStats] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [monthStats, setMonthStats] = useState(null);
  const [isCompact, setIsCompact] = useState(window.innerWidth < 700);
  const [dayDate, setDayDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [monthDate, setMonthDate] = useState(startOfMonth(new Date()));
  const [earliestDate, setEarliestDate] = useState(null);
  const [streaks, setStreaks] = useState({ current_day_streak: 0, current_week_streak: 0 });
  const [celebrate, setCelebrate] = useState(false);
  const intervalRef = useRef(null);
  const outlineRef = useRef(null);
  const [outlineLength, setOutlineLength] = useState(0);
  const timerSectionRef = useRef(null);
  const [timerDimensions, setTimerDimensions] = useState({ width: 0, height: 0 });
  const audioRef = useRef(null);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (timerSectionRef.current) {
        const { width, height } = timerSectionRef.current.getBoundingClientRect();
        setTimerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const fetchEarliestDate = async () => {
    const data = await api.getEarliestPomodoroDate();
    setEarliestDate(new Date(data.earliest_date));
  };

  const fetchStreaks = async () => {
    try {
      const data = await api.getPomodoroStreaks();
      setStreaks(data);
    } catch (e) {
      setStreaks({ current_day_streak: 0, current_week_streak: 0 });
    }
  };

  // Update timer when mode or durations change
  useEffect(() => {
    if (!isRunning && !isPaused) {
      if (mode === "pomodoro") setTimer(workDuration * 60);
      else if (mode === "short_break") setTimer(shortBreak * 60);
      else setTimer(longBreak * 60);
    }
    // If paused, DO NOT reset timer!!
  }, [mode, workDuration, shortBreak, longBreak, isRunning, isPaused]);

  useEffect(() => {
    fetchStats(dayDate);
  }, [dayDate]);

  useEffect(() => {
    fetchWeekStats(weekStart);
  }, [weekStart]);

  useEffect(() => {
    fetchMonthStats(monthDate);
  }, [monthDate]);

  // Save durations to localStorage when changed
  useEffect(() => {
    saveDurations(workDuration, shortBreak, longBreak);
  }, [workDuration, shortBreak, longBreak]);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchEarliestDate();
    fetchStreaks();
  }, []);

  useEffect(() => {
    if (outlineRef.current) {
      setOutlineLength(outlineRef.current.getTotalLength());
    }
  }, []);

  // Animation for the rectangular outline (proportional to time)
  useEffect(() => {
    if (!outlineRef.current || !timerDimensions.width || !timerDimensions.height) return;

    const totalDuration =
      mode === "pomodoro"
        ? workDuration * 60
        : mode === "short_break"
        ? shortBreak * 60
        : longBreak * 60;

    const strokeWidth = 5;
    const perimeter = (timerDimensions.width - strokeWidth) * 2 + (timerDimensions.height - strokeWidth) * 2;
    outlineRef.current.style.strokeDasharray = perimeter;

    if (totalDuration > 0) {
      const percent = Math.max(0, Math.min(1, timer / totalDuration));
      const offset = perimeter * (1 - percent);
      outlineRef.current.style.strokeDashoffset = offset;
    } else {
      outlineRef.current.style.strokeDashoffset = 0;
    }
  }, [timer, mode, workDuration, shortBreak, longBreak, timerDimensions]);

  const fetchStats = async (dateObj) => {
    try {
      const dateStr = format(dateObj, "yyyy-MM-dd");
      const data = await api.getPomodoroStats("day", dateStr);
      setStats(data);
    } catch (e) { setStats(null); }
  };
  const fetchWeekStats = async (weekStartObj) => {
    try {
      const weekStartStr = format(weekStartObj, "yyyy-MM-dd");
      const data = await api.getPomodoroStats("week", weekStartStr);
      setWeekStats(data);
    } catch (e) { setWeekStats(null); }
  };
  const fetchMonthStats = async (monthObj) => {
    try {
      const monthStr = format(monthObj, "yyyy-MM");
      const data = await api.getPomodoroStats("month", monthStr);
      setMonthStats(data);
    } catch (e) { setMonthStats(null); }
  };

  const startSession = async () => {
    if (mode === "pomodoro") {
      const res = await api.startPomodoroSession(workDuration);
      setSessionId(res.session_id);
    }
    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  };

  const pauseSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  };

  const finishSession = async (completed = true) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    if (sessionId && mode === "pomodoro") {
      // Calculate ACTUAL time completed in minutes. Potential bug?
      const timeCompleted = (workDuration * 60 - timer) / 60;
      await api.finishPomodoroSession(sessionId, completed, timeCompleted);
      setSessionId(null);
      fetchStats(dayDate);
      fetchWeekStats(weekStart);
      fetchMonthStats(monthDate);
      fetchEarliestDate(); // Refetch earliest date
      fetchStreaks(); // Refetch streaks
    }
  };

  useEffect(() => {
    if (isRunning && timer <= 0) {
      finishSession(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      if (mode === 'pomodoro') {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2000); // Animation duration
      }
    }
  }, [timer, isRunning, mode]);

  const handleStop = () => finishSession(false);

  const formatTime = (t) => {
    const totalSeconds = Math.floor(t); // Round down to nearest second
    return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
  };

  // Navigation handlers
  const handlePrevDay = () => {
    if (dayDate > earliestDate) setDayDate(subDays(dayDate, 1));
  };
  const handleNextDay = () => {
    if (!isToday(dayDate)) setDayDate(addDays(dayDate, 1));
  };
  const handlePrevWeek = () => {
    if (weekStart > earliestDate) setWeekStart(subWeeks(weekStart, 1));
  };
  const handleNextWeek = () => {
    if (!isThisWeek(weekStart, { weekStartsOn: 1 })) setWeekStart(addWeeks(weekStart, 1));
  };
  const handlePrevMonth = () => {
    if (monthDate > earliestDate) setMonthDate(subMonths(monthDate, 1));
  };
  const handleNextMonth = () => {
    if (!isThisMonth(monthDate)) setMonthDate(addMonths(monthDate, 1));
  };

  const handleReturnToToday = () => setDayDate(new Date());
  const handleReturnToWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const handleReturnToMonth = () => setMonthDate(startOfMonth(new Date()));

  // Dynamic label helpers
  const getDayLabel = () => {
    const now = new Date();
    if (isToday(dayDate)) return isCompact ? "Today" : "Today's Stats";
    if (isToday(addDays(dayDate, 1))) return isCompact ? "Yesterday" : "Yesterday's Stats";

    const daysDiff = differenceInDays(now, dayDate);

    if (daysDiff > 1 && daysDiff < 7) {
        return `${format(dayDate, "EEEE")}${isCompact ? '' : "'s Stats"}`;
    }

    if (isThisYear(dayDate)) {
        return `${format(dayDate, "MMMM do")}${isCompact ? '' : "'s Stats"}`;
    }

    return `${format(dayDate, "MMMM do, yyyy")}${isCompact ? '' : "'s Stats"}`;
  };

  const getWeekLabel = () => {
    const options = { weekStartsOn: 1 };
    const weekNum = getWeek(weekStart, options);
    const year = getWeekYear(weekStart, options);
    const thisWeek = isThisWeek(weekStart, { weekStartsOn: 1 });
    const lastWeek = isThisWeek(addWeeks(weekStart, 1), { weekStartsOn: 1 });

    if (thisWeek) return isCompact ? "This Week" : "This Week's Stats";
    if (lastWeek) return isCompact ? "Last Week" : "Last Week's Stats";

    const currentYear = new Date().getFullYear();
    const displayYear = year !== currentYear;

    return isCompact
      ? `Week ${weekNum}`
      : `Week ${weekNum}${displayYear ? `, ${year}` : ""} Stats`;
  };
  const getMonthLabel = () => {
    const thisMonth = isThisMonth(monthDate);
    const lastMonth = isThisMonth(addMonths(monthDate, 1));
    if (thisMonth) return isCompact ? "This Month" : "This Month's Stats";
    if (lastMonth) return isCompact ? "Last Month" : "Last Month's Stats";
    return isCompact
      ? `${format(monthDate, isThisYear(monthDate) ? "MMM" : "MMM yyyy")}`
      : `${format(monthDate, isThisYear(monthDate) ? "MMMM" : "MMMM, yyyy")}'s Stats`;
  };

  return (
    <div className="page-container">
      <audio ref={audioRef} src="public/ding.mp3" preload="auto" />
      {celebrate && (
        <div className="celebration">
          {[...Array(15)].map((_, i) => {
            const style = {
              '--x': `${Math.random() * 400 - 200}px`,
              '--y': `${Math.random() * 400 - 200}px`,
            };
            return <div key={i} className="particle" style={style} />;
          })}
        </div>
      )}
      <div className="pomo-header">
        <div className="pomo-mode-tabs">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`pomo-mode-btn${mode === m.key ? " active" : ""}`}
              style={mode === m.key ? { background: m.color } : {}}
              onClick={() => setMode(m.key)}
              id={`stage-button-${m.key}`}
            >
              {m.label.split(" ")[0]}
              {m.label.split(" ")[1] && <span className="pomo-mode-span">{m.label.split(" ")[1]}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="pomo-timer-section" ref={timerSectionRef}>
        <svg className="timer-outline-svg" viewBox={`0 0 ${timerDimensions.width} ${timerDimensions.height}`}>
          <path
            className="timer-progress-background"
            d={`M 2.5,2.5 L ${timerDimensions.width - 2.5},2.5 L ${timerDimensions.width - 2.5},${timerDimensions.height - 2.5} L 2.5,${timerDimensions.height - 2.5} Z`}
          />
          <path
            ref={outlineRef}
            className="timer-progress-bar"
            style={{ color: MODES.find((m) => m.key === mode).color }}
            d={`M 2.5,2.5 L ${timerDimensions.width - 2.5},2.5 L ${timerDimensions.width - 2.5},${timerDimensions.height - 2.5} L 2.5,${timerDimensions.height - 2.5} Z`}
          />
        </svg>
        <div style={{position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div className="pomo-timer-string">{formatTime(timer)}</div>
          <div className="pomo-controls">
            {!isRunning && !isPaused ? (
              <button className="pomo-main-btn" style={{ background: MODES.find(m => m.key === mode).color }} onClick={startSession}>START</button>
            ) : null}
            {isRunning ? (
              <button className="pomo-main-btn danger" onClick={pauseSession}>PAUSE</button>
            ) : null}
            {isPaused ? (
              <>
                <button className="pomo-main-btn" style={{ background: MODES.find(m => m.key === mode).color }} onClick={resumeSession}>RESUME</button>
                <button className="pomo-main-btn danger" onClick={() => finishSession(false)}>END</button>
              </>
            ) : null}
          </div>
          <div className="pomo-customize">
            <label>Work: <input type="number" min={5} max={1440} step={0.01} value={workDuration} disabled={isRunning || isPaused} onChange={e => setWorkDuration(Math.min(1440, Number(e.target.value)))} /> min</label>
            <label>Short Break: <input type="number" min={1} max={1440} step={0.01} value={shortBreak} disabled={isRunning || isPaused} onChange={e => setShortBreak(Math.min(1440, Number(e.target.value)))} /> min</label>
            <label>Long Break: <input type="number" min={5} max={1440} step={0.01} value={longBreak} disabled={isRunning || isPaused} onChange={e => setLongBreak(Math.min(1440, Number(e.target.value)))} /> min</label>
          </div>
        </div>
      </div>
      <div className="pomo-stats-multi">
        {/* Weekly Stats */}
        <div className="pomo-stats">
          <button className="return-btn" onClick={handleReturnToWeek}>↺</button>
          <div className="pomo-stats-nav">
            <button className="pomo-arrow-btn" onClick={handlePrevWeek}>&lt;</button>
            <h2 className="pomo-stats-label">{getWeekLabel()}</h2>
            <button className="pomo-arrow-btn" onClick={handleNextWeek}>&gt;</button>
          </div>
          {weekStats ? (
            <>
              <div>{isCompact ? `${weekStats.filter(s => s.completed).length} sessions` : `Sessions completed: ${weekStats.filter(s => s.completed).length}`}</div>
              <div>{isCompact ? `${Number(weekStats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))} min` : `Total focus time: ${Number(weekStats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))} min`}</div>
            </>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>
        {/* Daily Stats */}
        <div className="pomo-stats" id="pomo-today">
          <button className="return-btn" onClick={handleReturnToToday}>↺</button>
          <div className="pomo-stats-nav">
            <button className="pomo-arrow-btn" onClick={handlePrevDay}>&lt;</button>
            <h2 className="pomo-stats-label">{getDayLabel()}</h2>
            <button className="pomo-arrow-btn" onClick={handleNextDay}>&gt;</button>
          </div>
          {stats ? (
            <>
              <div>{isCompact ? `${stats.filter(s => s.completed).length} sessions` : `Sessions completed: ${stats.filter(s => s.completed).length}`}</div>
              <div>{isCompact ? `${Number(stats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))} min` : `Total focus time: ${Number(stats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))} min`}</div>
            </>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>
        {/* Monthly Stats */}
        <div className="pomo-stats">
          <button className="return-btn" onClick={handleReturnToMonth}>↺</button>
          <div className="pomo-stats-nav">
            <button className="pomo-arrow-btn" onClick={handlePrevMonth}>&lt;</button>
            <h2 className="pomo-stats-label">{getMonthLabel()}</h2>
            <button className="pomo-arrow-btn" onClick={handleNextMonth}>&gt;</button>
          </div>
          {monthStats ? (
            <>
              <div>{isCompact ? `${monthStats.filter(s => s.completed).length} sessions` : `Sessions completed: ${monthStats.filter(s => s.completed).length}`}</div>
              <div>{isCompact ? `${Number(monthStats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))} min` : `Total focus time: ${Number(monthStats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))} min`}</div>
            </>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>
      </div>
      <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
        <div>Worked {streaks.current_day_streak} day{streaks.current_day_streak === 1 ? '' : 's'} in a row</div>
        <div>Worked {streaks.current_week_streak} week{streaks.current_week_streak === 1 ? '' : 's'} in a row</div>
      </div>
    </div>
  );
};

export default PomodoroPage;
