import { useState, useEffect, useRef, useCallback } from 'react';
import { getPomodoroRemainingTime } from '../utils/timeHelpers';
import api from '../services/api';
import { MODES } from '../utils/constants';
import {
  getSavedDurations,
  saveDurations,
  saveSessionState,
  getSessionState,
  clearSessionState
} from '../utils/pomodoroStorage';

export function usePomodoro(onSessionComplete) {
  const savedDurations = getSavedDurations();
  const [mode, setMode] = useState(MODES[0].key);
  const [workDuration, setWorkDuration] = useState(savedDurations.work);
  const [shortBreak, setShortBreak] = useState(savedDurations.short);
  const [longBreak, setLongBreak] = useState(savedDurations.long);
  const [timer, setTimer] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const finishSession = useCallback(async (completed = true) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);

    const savedSession = getSessionState();
    clearSessionState();

    if (sessionId && mode === "pomodoro") {
      let timeCompleted;
      if (savedSession && savedSession.startTime) {
        const start = new Date(savedSession.startTime);
        const end = new Date();
        const paused = savedSession.pausedDuration || 0;
        timeCompleted = (end - start - paused * 1000) / 60000;
      } else {
        timeCompleted = (workDuration * 60 - (timer || 0)) / 60;
      }
      await api.finishPomodoroSession(sessionId, completed, timeCompleted);
      setSessionId(null);
      if (onSessionComplete) onSessionComplete();
    }

    if (completed && mode === 'pomodoro') {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  }, [sessionId, mode, workDuration, timer, onSessionComplete]);

  useEffect(() => {
    const restoreSession = async () => {
      const savedSession = getSessionState();
      if (!savedSession) {
        setTimer(workDuration * 60);
        return;
      }

      const {
        mode: savedMode,
        sessionId: savedSessionId,
        workDuration: savedWorkDuration,
        shortBreak: savedShortBreak,
        longBreak: savedLongBreak
      } = savedSession;

      if (savedWorkDuration !== undefined) setWorkDuration(savedWorkDuration);
      if (savedShortBreak !== undefined) setShortBreak(savedShortBreak);
      if (savedLongBreak !== undefined) setLongBreak(savedLongBreak);
      setMode(savedMode);

      const remainingTime = getPomodoroRemainingTime(savedSession);

      if (remainingTime <= 0) {
        if (savedSessionId && savedMode === "pomodoro") {
          await finishSession(true);
        }
        clearSessionState();
        setTimer(savedMode === "pomodoro" ? (savedWorkDuration || workDuration) * 60 :
                savedMode === "short_break" ? (savedShortBreak || shortBreak) * 60 :
                (savedLongBreak || longBreak) * 60);
      } else {
        setTimer(remainingTime);
        setSessionId(savedSessionId);
        if (savedSession.pausedAt) {
          setIsPaused(true);
        } else {
          setIsRunning(true);
        }
      }
    };
    restoreSession();
  }, [finishSession, workDuration, shortBreak, longBreak]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (isRunning && timer <= 0) {
      finishSession(true);
    }
  }, [timer, isRunning, finishSession]);

  useEffect(() => {
    saveDurations(workDuration, shortBreak, longBreak);
  }, [workDuration, shortBreak, longBreak]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const syncInterval = setInterval(() => {
      const savedSession = getSessionState();
      if (savedSession) {
        setTimer(Math.max(0, getPomodoroRemainingTime(savedSession)));
      }
    }, 10000);
    return () => clearInterval(syncInterval);
  }, [isRunning, isPaused]);

  const startSession = async () => {
    let newSessionId = null;
    if (mode === "pomodoro") {
      const res = await api.startPomodoroSession(workDuration);
      newSessionId = res.session_id;
      setSessionId(newSessionId);
    }
    setIsRunning(true);
    setIsPaused(false);
    saveSessionState({
      mode,
      startTime: new Date().toISOString(),
      sessionId: newSessionId,
      pausedAt: null,
      pausedDuration: 0,
      totalDuration: mode === "pomodoro" ? workDuration * 60 :
                     mode === "short_break" ? shortBreak * 60 :
                     longBreak * 60,
      workDuration, shortBreak, longBreak
    });
  };

  const pauseSession = () => {
    setIsRunning(false);
    setIsPaused(true);
    const savedSession = getSessionState();
    if (savedSession) {
      saveSessionState({ ...savedSession, pausedAt: new Date().toISOString() });
    }
  };

  const resumeSession = () => {
    const savedSession = getSessionState();
    if (savedSession && savedSession.pausedAt) {
      const pauseStart = new Date(savedSession.pausedAt);
      const pauseEnd = new Date();
      const thisPauseDuration = Math.floor((pauseEnd - pauseStart) / 1000);
      const updatedSession = {
        ...savedSession,
        pausedAt: null,
        pausedDuration: (savedSession.pausedDuration || 0) + thisPauseDuration
      };
      saveSessionState(updatedSession);
      setTimer(Math.max(0, getPomodoroRemainingTime(updatedSession)));
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleStop = () => finishSession(false);

  // Move formatTime to a utility if used elsewhere
  const formatTime = (t) => {
    const totalSeconds = Math.floor(t);
    return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
  };

  return {
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
  };
}
