import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const AnalyticsTrendsGraph = () => {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [customDays, setCustomDays] = useState(30);
  const [editingDays, setEditingDays] = useState(false);

  useEffect(() => {
    fetchTrendsData();
  }, [period, currentPage, customDays]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range for current page (customDays data points max)
      const today = new Date();
      let endDate, startDate;
      
      if (period === 'daily') {
        // For daily: if customDays=15, we want 15 days of data
        // So from today going back 15 days: [today-14, today-13, ..., today-1, today]
        endDate = new Date(today.getTime() - (currentPage * customDays * 24 * 60 * 60 * 1000));
        startDate = new Date(endDate.getTime() - ((customDays - 1) * 24 * 60 * 60 * 1000));
      } else if (period === 'weekly') {
        endDate = new Date(today.getTime() - (currentPage * customDays * 7 * 24 * 60 * 60 * 1000));
        startDate = new Date(endDate.getTime() - ((customDays - 1) * 7 * 24 * 60 * 60 * 1000));
      } else if (period === 'monthly') {
        endDate = new Date(today.getFullYear(), today.getMonth() - (currentPage * customDays), today.getDate());
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - (customDays - 1), endDate.getDate());
      }
      
      console.log(`Requesting ${customDays} ${period} periods from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      
      const result = await api.getCompletionsTrend(
        period,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      console.log(`Received ${result.length} data points`);
      setData(result);
    } catch (err) {
      console.error('Error fetching trends data:', err);
      setError('Failed to load trends data');
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Calculate nice Y-axis scale
  const calculateNiceScale = (maxValue) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalizedMax = maxValue / magnitude;
    
    let niceMax;
    if (normalizedMax <= 1) niceMax = 1;
    else if (normalizedMax <= 2) niceMax = 2;
    else if (normalizedMax <= 5) niceMax = 5;
    else niceMax = 10;
    
    const scaledMax = niceMax * magnitude;
    const step = scaledMax / 5;
    
    return {
      max: scaledMax + step, // One tick above maximum
      step: step,
      ticks: Array.from({length: 6}, (_, i) => Math.round((scaledMax + step - i * step) * 100) / 100)
    };
  };

  const yScale = calculateNiceScale(maxCount);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCurrentPage(0); // Reset to first page when changing period
  };

  const handleRefresh = () => {
    fetchTrendsData();
  };

  const handleDaysSubmit = (e) => {
    e.preventDefault();
    const newDays = parseInt(e.target.days.value);
    console.log('Submitting new days:', newDays, 'Current customDays:', customDays);
    if (newDays > 0 && newDays <= 365) {
      setCustomDays(newDays);
      setCurrentPage(0);
      console.log('Set customDays to:', newDays);
    } else {
      console.log('Invalid days value:', newDays);
    }
    setEditingDays(false);
  };

  const canGoBack = true; // Can always go back to see older data
  const canGoForward = currentPage > 0; // Can go forward only if not on the most recent page

  if (loading) return <div className="analytics-loading">Loading trends...</div>;
  if (error) return <div className="analytics-error">{error}</div>;

  return (
    <div className="analytics-trends">
      <div className="analytics-period-selector">
        <button 
          className={period === 'daily' ? 'active' : ''} 
          onClick={() => handlePeriodChange('daily')}
        >
          Daily
        </button>
        <button 
          className={period === 'weekly' ? 'active' : ''} 
          onClick={() => handlePeriodChange('weekly')}
        >
          Weekly
        </button>
        <button 
          className={period === 'monthly' ? 'active' : ''} 
          onClick={() => handlePeriodChange('monthly')}
        >
          Monthly
        </button>
        <button 
          onClick={handleRefresh}
          className="refresh-button"
          title="Refresh data"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="analytics-navigation">
        <button 
          onClick={() => {
            console.log('Going to older data, currentPage:', currentPage, '-> ', currentPage + 1);
            setCurrentPage(currentPage + 1);
          }}
          disabled={!canGoBack}
          className="nav-button"
        >
          ← Older
        </button>
        <span className="nav-info">
          {editingDays ? (
            <form onSubmit={handleDaysSubmit} className="days-editor">
              <input 
                type="number" 
                name="days" 
                defaultValue={customDays}
                min="1" 
                max="365"
                className="days-input"
                autoFocus
                onBlur={() => setEditingDays(false)}
              />
              <span> {period === 'daily' ? 'days' : period === 'weekly' ? 'weeks' : 'months'}</span>
            </form>
          ) : (
            <span 
              className="clickable-days"
              onClick={() => setEditingDays(true)}
              title="Click to edit number of periods"
            >
              Showing {customDays} {period === 'daily' ? 'days' : period === 'weekly' ? 'weeks' : 'months'} ({data.length} with data)
            </span>
          )}
        </span>
        <button 
          onClick={() => {
            console.log('Going to newer data, currentPage:', currentPage, '-> ', currentPage - 1);
            setCurrentPage(currentPage - 1);
          }}
          disabled={!canGoForward}
          className="nav-button"
        >
          Newer →
        </button>
      </div>

      <div className="analytics-chart-container">
        {data.length === 0 ? (
          <div className="analytics-no-data">No completion data available</div>
        ) : (
          <div className="analytics-line-chart">
            <div className="chart-y-axis">
              {yScale.ticks.map((tick, i) => (
                <span key={i}>{tick}</span>
              ))}
            </div>
            <div className="chart-content">
              <svg viewBox="0 0 800 300" className="chart-svg">
                {/* Grid lines */}
                {yScale.ticks.map((tick, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={300 - (i / (yScale.ticks.length - 1)) * 280}
                    x2="800"
                    y2={300 - (i / (yScale.ticks.length - 1)) * 280}
                    stroke="#333"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                ))}
                
                {/* Data points and line */}
                {data.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2"
                    points={data.map((d, i) => {
                      const x = (i / (data.length - 1)) * 780 + 10;
                      const y = 290 - (d.count / yScale.max) * 280;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}
                
                {/* Data points */}
                {data.map((d, i) => {
                  const x = (i / Math.max(data.length - 1, 1)) * 780 + 10;
                  const y = 290 - (d.count / yScale.max) * 280;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#4f46e5"
                      stroke="white"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredPoint({ ...d, index: i, x, y })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
                
                {/* Tooltip */}
                {hoveredPoint && (
                  <g>
                    <rect
                      x={hoveredPoint.x - 40}
                      y={hoveredPoint.y - 35}
                      width="80"
                      height="30"
                      fill="rgba(0, 0, 0, 0.8)"
                      rx="4"
                    />
                    <text
                      x={hoveredPoint.x}
                      y={hoveredPoint.y - 20}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="500"
                    >
                      {hoveredPoint.count} habits
                    </text>
                    <text
                      x={hoveredPoint.x}
                      y={hoveredPoint.y - 8}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                    >
                      {hoveredPoint.period}
                    </text>
                  </g>
                )}
              </svg>
              
              <div className="chart-x-labels">
                {data.map((d, i) => (
                  <span key={i} className="x-label">
                    {d.period}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTrendsGraph;
