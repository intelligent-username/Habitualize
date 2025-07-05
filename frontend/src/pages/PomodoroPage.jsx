import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import "../App.css";
import "../styles/pomodoro.css";
import { PomodoroLineGraph } from "../components/pages";
import { usePomodoro } from '../hooks/usePomodoro';
import { usePomodoroData } from '../hooks/usePomodoroData';
import { usePomodoroNavigation } from '../hooks/usePomodoroNavigation';

const PomodoroPage = () => {
  const [isCompact, setIsCompact] = useState(window.innerWidth < 700);
  const timerSectionRef = useRef(null);
  const [timerDimensions, setTimerDimensions] = useState({ width: 600, height: 400 });

  const {
    earliestDate,
    ...navigation
  } = usePomodoroNavigation(null, isCompact);

  const {
    stats, weekStats, monthStats, streaks,
    graphData, isGraphLoading,
    refreshAllData
  } = usePomodoroData(navigation.dayDate, navigation.weekStart, navigation.monthDate, navigation.graphViewType, navigation.graphWeekStart, navigation.graphMonthDate);

  const {
    mode, setMode,
    workDuration, setWorkDuration,
    shortBreak, setShortBreak,
    longBreak, setLongBreak,
    timer,
    isRunning, isPaused,
    celebrate,
    audioRef,
    startSession, pauseSession, resumeSession, handleStop,
    formatTime,
    MODES
  } = usePomodoro(refreshAllData);

  const {
    getGraphTitle, getDayLabel, getWeekLabel, getMonthLabel,
    handlePrevDay, handleNextDay, handleReturnToToday,
    handlePrevWeek, handleNextWeek, handleReturnToWeek,
    handlePrevMonth, handleNextMonth, handleReturnToMonth,
    handleGraphPrevious, handleGraphNext, handleGraphReturnToCurrent,
    setDayDate, setGraphViewType
  } = navigation;

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const outlineRef = useRef(null);
  useEffect(() => {
    if (!outlineRef.current || !timerDimensions.width || !timerDimensions.height) return;

    const totalDuration =
      mode === "pomodoro" ? workDuration * 60 :
      mode === "short_break" ? shortBreak * 60 :
      longBreak * 60;

    const strokeWidth = 5;
    const perimeter = (timerDimensions.width - strokeWidth) * 2 + (timerDimensions.height - strokeWidth) * 2;
    if (outlineRef.current) {
        outlineRef.current.style.strokeDasharray = perimeter;
    }

    if (totalDuration > 0) {
      const percent = Math.max(0, Math.min(1, timer / totalDuration));
      const offset = perimeter * (1 - percent);
      if (outlineRef.current) {
        outlineRef.current.style.strokeDashoffset = offset;
      }
    } else if (outlineRef.current) {
        outlineRef.current.style.strokeDashoffset = 0;
    }
  }, [timer, mode, workDuration, shortBreak, longBreak, timerDimensions]);


  return (
    <div className="page-container">
      <audio ref={audioRef} src="/ding.mp3" preload="auto" />
      {celebrate && (
        <div className="celebration">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{ '--x': `${Math.random() * 400 - 200}px`, '--y': `${Math.random() * 400 - 200}px` }} />
          ))}
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
      {timer !== null && timerDimensions.width > 0 && timerDimensions.height > 0 && (
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
                  <button className="pomo-main-btn danger" onClick={handleStop}>END</button>
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
      )}
      <div className="pomo-stats-multi">
        <div className="pomo-stats" style={{ position: 'relative' }}>
          <button className="return-btn" style={{ position: 'absolute', left: '50%', top: 0, transform: 'translate(-50%, -50%)' }} onClick={handleReturnToWeek}>↺</button>
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
        <div className="pomo-stats" style={{ position: 'relative' }}>
          <button className="return-btn" style={{ position: 'absolute', left: '50%', top: 0, transform: 'translate(-50%, -50%)' }} onClick={handleReturnToMonth}>↺</button>
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
      <PomodoroLineGraph
        data={graphData}
        viewType={navigation.graphViewType}
        onPrevious={handleGraphPrevious}
        onNext={handleGraphNext}
        onReturnToCurrent={handleGraphReturnToCurrent}
        onViewChange={setGraphViewType}
        title={getGraphTitle()}
        isLoading={isGraphLoading}
        onPointClick={(date) => setDayDate(date)}
      />
      <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
        <div>Worked {streaks.current_day_streak} day{streaks.current_day_streak === 1 ? '' : 's'} in a row</div>
        <div>Worked {streaks.current_week_streak} week{streaks.current_week_streak === 1 ? '' : 's'} in a row</div>
      </div>
    </div>
  );
};

export default PomodoroPage;
