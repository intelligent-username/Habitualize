import React from 'react';

export default function PomodoroChartHeader({
  title,
  viewType,
  onPrevious,
  onNext,
  onViewChange
}) {
  return (
    <div className="pomo-graph-header">
      <div className="pomo-graph-nav">
        <button className="pomo-arrow-btn" onClick={onPrevious}>&lt;</button>
        <h3 className="pomo-graph-title">{title}</h3>
        <button className="pomo-arrow-btn" onClick={onNext}>&gt;</button>
      </div>
      <div className="pomo-view-toggle">
        <button
          className={`pomo-view-btn ${viewType === 'week' ? 'active' : ''}`}
          onClick={() => onViewChange('week')}
        >
          Week
        </button>
        <button
          className={`pomo-view-btn ${viewType === 'month' ? 'active' : ''}`}
          onClick={() => onViewChange('month')}
        >
          Month
        </button>
      </div>
    </div>
  );
}
