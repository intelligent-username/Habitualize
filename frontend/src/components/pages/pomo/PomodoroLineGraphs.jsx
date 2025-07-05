import React from 'react';
import { Line } from 'react-chartjs-2';
import { registerPomodoroChartPlugins } from './registerPomodoroChartPlugins';
import { usePomodoroChartConfig } from './usePomodoroChartConfig';
import PomodoroChartHeader from './PomodoroChartHeader';

export default function PomodoroLineGraph({
  data,
  viewType,
  onPrevious,
  onNext,
  onReturnToCurrent,
  onViewChange,
  title,
  isLoading,
  onPointClick
}) {
  registerPomodoroChartPlugins();
  const { chartData, options } = usePomodoroChartConfig(data, viewType, onPointClick);
  return (
    <div className="pomo-line-graph" style={{ position: 'relative' }}>
      <button
        className="return-btn"
        style={{ position: 'absolute', right: '-1rem', top: 0, left: 'auto', transform: 'translateY(-50%)', zIndex: 2 }}
        onClick={onReturnToCurrent}
      >↺</button>
      <PomodoroChartHeader
        title={title}
        viewType={viewType}
        onPrevious={onPrevious}
        onNext={onNext}
        onViewChange={onViewChange}
      />
      <div className="pomo-graph-container">
        {isLoading ? (
          <div>Loading chart...</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}

