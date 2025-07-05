import React from "react";
import './App.css';
import { Sidebar } from "./components/ui";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './pages/SettingsPage.jsx';
import PomodoroPage from './pages/PomodoroPage.jsx';
import QuoteOfTheDayPage from './pages/QuoteOfTheDayPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import { UIProvider } from "./context/UIContext.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";

const App = () => {
    return (
        <UIProvider>
            <Router>
                <Sidebar />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/pomodoro" element={<PomodoroPage />} />
                    <Route path="/quote-of-the-day" element={<QuoteOfTheDayPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
            </Router>
        </UIProvider>
    );
};

export default App;
