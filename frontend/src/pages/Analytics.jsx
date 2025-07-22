import React from "react";
import "../styles/analytics.css";
import AnalyticsTrendsGraph from "../components/pages/analytics/AnalyticsTrendsGraph";
import HabitConsistencyList from "../components/pages/analytics/HabitConsistencyList";

// Analytics page with trends graph and habit consistency list

const AnalyticsPage = () => {
  return (
    <>
      <title>Analytics</title>
      <div className="page-container">
        <h1 className="page-title">Analytics</h1>
        {/* Section 1: Trends Graph */}
        <section className="analytics-section">
          <h2>Overall Trends</h2>
          <AnalyticsTrendsGraph />
        </section>
        {/* Section 2: Habit Consistency List */}
        <section className="analytics-section">
          <h2>Individual Consistency</h2>
          <HabitConsistencyList />
        </section>
      </div>
    </>
  );
};
export default AnalyticsPage;
