import React, { useEffect, useState } from "react";
import './App.css';
import { Sidebar } from "./components/ui";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './pages/Settings.jsx';
import PomodoroPage from './pages/Pomodoro.jsx';
import QuoteOfTheDayPage from './pages/QuoteOfTheDay.jsx';
import AnalyticsPage from './pages/Analytics.jsx';
import { UIProvider } from "./context/UIContext.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import HomeButton from "./components/ui/HomeButton.jsx";
import { useSettings } from "./hooks/useSettings.js";
import { setWeekStartDay as setTimeHelpersWeekStart } from './utils/timeHelpers.js';
import { updateWeekStartDay } from './hooks/usePomodoroNavigation.js';

const AppContent = () => {
    const { getWeekStartDay, getTheme } = useSettings();
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    useEffect(() => {
        const weekStartDay = getWeekStartDay();
        setTimeHelpersWeekStart(weekStartDay);
        updateWeekStartDay(weekStartDay); // Use the correct function
        setSettingsLoaded(true); // Signal that settings are loaded
    }, [getWeekStartDay]);

    // Apply theme from settings
    useEffect(() => {
        const theme = getTheme() || 'dark';
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    }, [getTheme]);

    if (!settingsLoaded) {
        return <div>Loading...</div>; // Or a spinner component
    }

    return (
        <>
            <Sidebar />
            <HomeButton />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/pomodoro" element={<PomodoroPage />} />
                <Route path="/quote-of-the-day" element={<QuoteOfTheDayPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <UIProvider>
            <Router>
                <AppContent />
            </Router>
        </UIProvider>
    );
};

export default App;
