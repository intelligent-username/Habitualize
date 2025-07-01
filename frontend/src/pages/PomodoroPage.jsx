import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import "../App.css";
import "../styles/pomodoro.css";

const MODES = [
  { key: "pomodoro", label: "Pomo", color: "#ba4949", default: 25 },
  { key: "short_break", label: "Short Break", color: "#38858a", default: 5 },
  { key: "long_break", label: "Long Break", color: "#397097", default: 15 },
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
  const intervalRef = useRef(null);

  // Update timer when mode or durations change
  useEffect(() => {
    if (!isRunning && !isPaused) {
      if (mode === "pomodoro") setTimer(workDuration * 60);
      else if (mode === "short_break") setTimer(shortBreak * 60);
      else setTimer(longBreak * 60);
    }
    // If paused, do NOT reset timer
  }, [mode, workDuration, shortBreak, longBreak, isRunning, isPaused]);

  useEffect(() => { 
    fetchStats(); 
    fetchWeekStats();
    fetchMonthStats();
  }, []);

  // Save durations to localStorage when changed
  useEffect(() => {
    saveDurations(workDuration, shortBreak, longBreak);
  }, [workDuration, shortBreak, longBreak]);

  const fetchStats = async () => {
    try {
      const data = await api.getPomodoroStats("today");
      setStats(data);
    } catch (e) { setStats(null); }
  };
  const fetchWeekStats = async () => {
    try {
      const data = await api.getPomodoroStats("week");
      setWeekStats(data);
    } catch (e) { setWeekStats(null); }
  };
  const fetchMonthStats = async () => {
    try {
      const data = await api.getPomodoroStats("month");
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
      // Calculate actual time completed in minutes
      const timeCompleted = (workDuration * 60 - timer) / 60;
      await api.finishPomodoroSession(sessionId, completed, timeCompleted);
      setSessionId(null);
      fetchStats();
      fetchWeekStats();
      fetchMonthStats();
    }
  };

  useEffect(() => {
    if (isRunning && timer <= 0) {
      finishSession(true);
    }
  }, [timer, isRunning]);

  const handleStop = () => finishSession(false);

  const formatTime = (t) => `${String(Math.floor(t/60)).padStart(2, '0')}:${String(t%60).padStart(2, '0')}`;

  return (
    <div className="page-container">
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
      <div className="pomo-timer-section">
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
          <label>Work: <input type="number" min={5} max={120} value={workDuration} disabled={isRunning || isPaused} onChange={e => setWorkDuration(Number(e.target.value))} /> min</label>
          <label>Short Break: <input type="number" min={1} max={30} value={shortBreak} disabled={isRunning || isPaused} onChange={e => setShortBreak(Number(e.target.value))} /> min</label>
          <label>Long Break: <input type="number" min={5} max={60} value={longBreak} disabled={isRunning || isPaused} onChange={e => setLongBreak(Number(e.target.value))} /> min</label>
        </div>
      </div>
      <div className="pomo-stats-multi">
        {/* This Week's Stats */}
        <div className="pomo-stats">
          <h2>This Week's Stats</h2>
          {weekStats ? (
            <>
              <div>Sessions completed: {weekStats.filter(s => s.completed).length}</div>
              <div>Total focus time: {
                Number(weekStats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))
              } min</div>
            </>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>
        {/* Today's Stats */}
        <div className="pomo-stats" id="pomo-today">
          <h2>Today's Stats</h2>
          {stats ? (
            <>
              <div>Sessions completed: {stats.filter(s => s.completed).length}</div>
              <div>Total focus time: {
                Number(stats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))
              } min</div>
            </>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>
        {/* This Month's Stats */}
        <div className="pomo-stats">
          <h2>This Month's Stats</h2>
          {monthStats ? (
            <>
              <div>Sessions completed: {monthStats.filter(s => s.completed).length}</div>
              <div>Total focus time: {
                Number(monthStats.reduce((acc, s) => acc + (parseFloat(s.time_completed) || 0), 0).toFixed(1))
              } min</div>
            </>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
