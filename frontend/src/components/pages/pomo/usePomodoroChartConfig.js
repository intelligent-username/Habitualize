// Business/data logic for PomodoroLineGraph
import { calculateYAxisScale } from '../../../utils/chartHelpers';
import { format } from 'date-fns';

export function usePomodoroChartConfig(data, viewType, onPointClick) {
  const yValues = data.map(d => d.timeWorked);
  const yAxisScale = calculateYAxisScale(yValues);

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Minutes Worked',
        data: yValues,
        borderColor: '#000000',
        pointBackgroundColor: '#000000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: false
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = data[context.dataIndex];
            return dataPoint ? `${dataPoint.timeWorked.toFixed(1)} minutes worked` : '';
          },
          title: (tooltipItems) => {
            const dataPoint = data[tooltipItems[0].dataIndex];
            if (!dataPoint) return '';
            return viewType === 'week'
              ? format(dataPoint.date, 'EEEE, MMM do')
              : format(dataPoint.date, 'MMM do, yyyy');
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        max: yAxisScale.max,
        ticks: {
          stepSize: yAxisScale.stepSize,
          callback: (value) => `${value}m`,
          values: yAxisScale.ticks
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedDate = data[index].date;
        const now = new Date();
        if (clickedDate > now) return;
        if (typeof onPointClick === 'function') onPointClick(clickedDate);
      }
    }
  };

  return { chartData, options };
}
