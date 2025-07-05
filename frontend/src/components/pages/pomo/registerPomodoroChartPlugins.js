// Chart.js registration for Pomodoro charts (plugins and base components)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

let registered = false;
export function registerPomodoroChartPlugins() {
  if (registered) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  ChartJS.register({
    id: 'heatmapGlow',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0];
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;
      if (!dataset || !yScale || !xScale) return;
      const maxValue = Math.max(...dataset.data, 0);
      dataset.data.forEach((value, index) => {
        const x = xScale.getPixelForValue(index);
        const y = yScale.getPixelForValue(value);
        const intensity = Math.min(value / maxValue, 1);
        ctx.beginPath();
        ctx.arc(x, y, intensity * 20, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(186, 73, 73, ${intensity * 0.5})`;
        ctx.fill();
      });
    }
  });
  ChartJS.register({
    id: 'segmentAreaFill',
    beforeDatasetsDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0];
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;
      if (!dataset || !yScale || !xScale) return;
      ctx.save();
      ctx.globalAlpha = 0.7;
      for (let i = 1; i < dataset.data.length; i++) {
        const prevValue = dataset.data[i - 1];
        const currentValue = dataset.data[i];
        const xPrev = xScale.getPixelForValue(i - 1);
        const xCurrent = xScale.getPixelForValue(i);
        const yPrev = yScale.getPixelForValue(prevValue);
        const yCurrent = yScale.getPixelForValue(currentValue);
        const color = currentValue > prevValue ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
        ctx.save();
        ctx.filter = 'blur(6px)';
        ctx.beginPath();
        ctx.moveTo(xPrev, yPrev);
        ctx.lineTo(xCurrent, yCurrent);
        ctx.lineTo(xCurrent, yScale.getPixelForValue(0));
        ctx.lineTo(xPrev, yScale.getPixelForValue(0));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
  });
  registered = true;
}
