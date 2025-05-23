import React, { useState, useEffect } from 'react';
import './FaultProbabilityChart.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import type { ChartData, ChartOptions, ChartDataset } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin // Register the annotation plugin
);

// Types for our data structure
interface TimeSeries {
  date: string;
  probability: number;
}

interface Event {
  date: string;
  value: number;
  type: 'alarm' | 'warning';
  component: string;
  turbineId: number;
}

interface ComponentData {
  [key: string]: TimeSeries[];
}

interface TurbineData {
  turbineId: number;
  components: ComponentData;
}

interface Metadata {
  startDate: string;
  endDate: string;
  totalDays: number;
  components: string[];
  turbineIds: number[];
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface FaultProbabilityChartProps {
  turbineId: number | null;
  timeRange?: TimeRange;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: TimeRange) => void;
  onGranularityChange?: (granularity: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
}

// Granularity options
type TimeGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

const FaultProbabilityChart: React.FC<FaultProbabilityChartProps> = ({ 
  turbineId, 
  timeRange: propTimeRange,
  granularity: propGranularity,
  onTimeRangeChange,
  onGranularityChange
}) => {
  // State for chart data and options
  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [turbineData, setTurbineData] = useState<TurbineData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Time range and component selection - use props if provided, otherwise use local state
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    end: new Date()
  });
  const [selectedComponent, setSelectedComponent] = useState<string>('tower'); // Default component
  const [localGranularity, setLocalGranularity] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Use the prop values if provided, otherwise use local state
  const timeRange = propTimeRange || localTimeRange;
  const granularity = propGranularity || localGranularity;
  
  // Update handlers that notify parent component
  const handleTimeRangeChange = (newRange: TimeRange) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    } else {
      setLocalTimeRange(newRange);
    }
  };
  
  const handleGranularityChange = (newGranularity: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    if (onGranularityChange) {
      onGranularityChange(newGranularity);
    } else {
      setLocalGranularity(newGranularity);
    }
  };

  // Load metadata on component mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await axios.get('./data/simulated/metadata.json');
        setMetadata(response.data);
        
        // Set initial time range based on metadata
        if (response.data.startDate && response.data.endDate) {
          const end = new Date(response.data.endDate);
          const start = new Date(end);
          // Default to 1 year timeframe
          start.setFullYear(end.getFullYear() - 1);
          
          handleTimeRangeChange({ start, end });
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
        setError('Failed to load chart metadata');
      }
    };
    
    loadMetadata();
  }, []);
  
  // Load turbine data when turbineId changes
  useEffect(() => {
    const loadTurbineData = async () => {
      if (!turbineId) {
        setTurbineData(null);
        return;
      }
      
      setLoading(true);
      
      try {
        const response = await axios.get(`./data/simulated/turbine${turbineId}.json`);
        setTurbineData(response.data);
        setLoading(false);
      } catch (err) {
        console.error(`Error loading data for turbine ${turbineId}:`, err);
        setError(`Failed to load data for turbine ${turbineId}`);
        setLoading(false);
      }
    };
    
    loadTurbineData();
  }, [turbineId]);
  
  // Load events data on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get('./data/simulated/events.json');
        setEvents(response.data);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };
    
    loadEvents();
  }, []);
  
  // Store filtered events in state so we can access them for rendering leader lines
  const [filteredAlarms, setFilteredAlarms] = useState<Event[]>([]);
  const [filteredWarnings, setFilteredWarnings] = useState<Event[]>([]);
  
  // Filter data based on selected time range, component, and granularity
  useEffect(() => {
    if (!turbineData || !selectedComponent) {
      return;
    }
    
    // Get component data
    const componentTimeSeries = turbineData.components[selectedComponent];
    if (!componentTimeSeries) {
      return;
    }
    
    // Filter data to selected time range
    const filteredData = componentTimeSeries.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= timeRange.start && pointDate <= timeRange.end;
    });
    
    // Apply granularity (aggregate data points)
    const aggregatedData = aggregateDataByGranularity(filteredData, granularity);
    
    // Filter events by time range, turbine, and component
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate >= timeRange.start && 
        eventDate <= timeRange.end && 
        (!turbineId || event.turbineId === turbineId) &&
        event.component.toLowerCase() === selectedComponent
      );
    });
    
    // Store filtered events for leader lines
    setFilteredAlarms(filteredEvents.filter(e => e.type === 'alarm'));
    setFilteredWarnings(filteredEvents.filter(e => e.type === 'warning'));
    
    // Create new datasets array to avoid mutation issues
    const newDatasets: ChartDataset<'line'>[] = [
      {
        label: 'Fault Probability Index',
        data: aggregatedData.map(point => ({
          x: new Date(point.date).valueOf(), // Convert Date to number timestamp for Chart.js
          y: point.probability
        })),
        borderColor: 'rgba(30, 55, 153, 1)',
        backgroundColor: 'rgba(30, 55, 153, 0.1)',
        tension: 0.3,
        pointRadius: 0.5,
        borderWidth: 2,
        fill: false
      }
    ];
    
    // Add events as separate datasets if needed
    if (filteredEvents && filteredEvents.length > 0) {
      // Group events by type
      const alarms = filteredEvents.filter(e => e.type === 'alarm');
      const warnings = filteredEvents.filter(e => e.type === 'warning');
      
      // Add alarms dataset if any exist
      if (alarms.length > 0) {
        newDatasets.push({
          label: 'Alarms',
          data: alarms.map(event => ({
            x: new Date(event.date).valueOf(),
            y: event.value
          })),
          borderColor: 'rgba(255, 0, 0, 1)',
          backgroundColor: 'rgba(255, 0, 0, 1)',
          pointRadius: 6,
          pointStyle: 'triangle' as const,
          showLine: false
        });
      }
      
      // Add warnings dataset if any exist
      if (warnings.length > 0) {
        newDatasets.push({
          label: 'Warnings',
          data: warnings.map(event => ({
            x: new Date(event.date).valueOf(),
            y: event.value
          })),
          borderColor: 'rgba(255, 204, 0, 1)',
          backgroundColor: 'rgba(255, 204, 0, 1)',
          pointRadius: 6,
          pointStyle: 'triangle' as const,
          showLine: false
        });
      }
    }
    
    setChartData({ datasets: newDatasets });
    
  }, [turbineData, selectedComponent, timeRange, granularity, events, turbineId]);
  
  // Helper function to aggregate data by granularity
  const aggregateDataByGranularity = (data: TimeSeries[], granularity: TimeGranularity): TimeSeries[] => {
    if (granularity === 'day' || data.length === 0) {
      return data; // No aggregation needed
    }
    
    const result: TimeSeries[] = [];
    const groupedData: {[key: string]: number[]} = {};
    
    // Group data points by granularity
    data.forEach(point => {
      const date = new Date(point.date);
      let key: string;
      
      switch (granularity) {
        case 'week':
          // Get the week number (approximate by dividing days by 7)
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.floor(
            (date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          key = `${date.getFullYear()}-W${weekNumber}`;
          break;
          
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
          
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
          
        case 'year':
          key = `${date.getFullYear()}`;
          break;
          
        default:
          key = point.date;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      
      groupedData[key].push(point.probability);
    });
    
    // Calculate average for each group
    Object.keys(groupedData).forEach(key => {
      const values = groupedData[key];
      const avgProbability = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Use the middle date of the period for display
      let displayDate: string;
      
      if (granularity === 'week') {
        const [year, week] = key.split('-W');
        const date = new Date(parseInt(year), 0, 1);
        date.setDate(date.getDate() + (parseInt(week) * 7) + 3); // Middle of week (Wednesday)
        displayDate = date.toISOString().split('T')[0];
      } else if (granularity === 'month') {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 15); // Middle of month
        displayDate = date.toISOString().split('T')[0];
      } else if (granularity === 'quarter') {
        const [year, quarter] = key.split('-Q');
        const quarterMonth = (parseInt(quarter) - 1) * 3 + 1; // First month of quarter
        const date = new Date(parseInt(year), quarterMonth, 15); // Middle of middle month
        displayDate = date.toISOString().split('T')[0];
      } else if (granularity === 'year') {
        const date = new Date(parseInt(key), 6, 1); // Middle of year (July 1)
        displayDate = date.toISOString().split('T')[0];
      } else {
        displayDate = key;
      }
      
      result.push({
        date: displayDate,
        probability: parseFloat(avgProbability.toFixed(4))
      });
    });
    
    // Sort by date
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  // Chart options with time scale
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: granularity === 'day' ? 'day' : 
                granularity === 'week' ? 'week' : 
                granularity === 'month' ? 'month' : 
                granularity === 'quarter' ? 'quarter' : 'year',
          displayFormats: {
            day: 'MMM d, yyyy',
            week: 'MMM d, yyyy',
            month: 'MMM yyyy',
            quarter: 'QQQ yyyy',
            year: 'yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Fault Probability',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        min: 0,
        max: 1,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Fault Probability Index - ${selectedComponent.charAt(0).toUpperCase() + selectedComponent.slice(1)}${turbineId ? ` (Turbine #${turbineId})` : ''}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
      annotation: {
        annotations: {
          // Add annotations for leader lines - these will be properly positioned by Chart.js
          ...filteredAlarms.reduce((acc, alarm, index) => {
            const alarmDate = new Date(alarm.date).valueOf();
            return {
              ...acc,
              [`alarm-line-${index}`]: {
                type: 'line',
                yMin: 0.001, // Start slightly above 0 to stay within chart area
                yMax: alarm.value,
                xMin: alarmDate,
                xMax: alarmDate,
                borderColor: 'rgba(255, 0, 0, 0.7)',
                borderWidth: 3,
                drawTime: 'beforeDatasetsDraw', // Draw behind the points
              }
            };
          }, {}),
          ...filteredWarnings.reduce((acc, warning, index) => {
            const warningDate = new Date(warning.date).valueOf();
            return {
              ...acc,
              [`warning-line-${index}`]: {
                type: 'line',
                yMin: 0.001, // Start slightly above 0 to stay within chart area
                yMax: warning.value,
                xMin: warningDate,
                xMax: warningDate,
                borderColor: 'rgba(255, 204, 0, 0.7)',
                borderWidth: 3,
                drawTime: 'beforeDatasetsDraw', // Draw behind the points
              }
            };
          }, {})
        }
      }
    },
  };
  
  // Time range selection handlers
  const handleTimeRangeSelect = (range: 'week' | 'month' | 'quarter' | 'year' | 'all') => {
    if (!metadata) return;
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        handleGranularityChange('day');
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        handleGranularityChange('day');
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        handleGranularityChange('week');
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        handleGranularityChange('month');
        break;
      case 'all':
        if (metadata) {
          startDate = new Date(metadata.startDate);
          // Create a new Date object for the end date
          const metadataEndDate = new Date(metadata.endDate);
          // Only update the range with the new end date if we have metadata
          handleTimeRangeChange({ start: startDate, end: metadataEndDate });
          handleGranularityChange('quarter');
          return; // Return early as we've already called handleTimeRangeChange
        } else {
          startDate.setFullYear(endDate.getFullYear() - 10);
          handleGranularityChange('quarter');
        }
        break;
    }
    
    // Handle standard time ranges
    handleTimeRangeChange({ start: startDate, end: endDate });
  };
  
  // Helper function to check if current time range matches a preset
  const timeRangeEquals = (preset: 'week' | 'month' | 'quarter' | 'year' | 'all'): boolean => {
    const now = new Date();
    const start = timeRange.start;
    // We use end for 'all' case when comparing with metadata.endDate
    
    switch(preset) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return Math.abs(start.getTime() - weekAgo.getTime()) < 86400000; // Within a day
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return Math.abs(start.getTime() - monthAgo.getTime()) < 86400000;
      case 'quarter':
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(now.getMonth() - 3);
        return Math.abs(start.getTime() - quarterAgo.getTime()) < 86400000;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return Math.abs(start.getTime() - yearAgo.getTime()) < 86400000;
      case 'all':
        return metadata ? start.getTime() === new Date(metadata.startDate).getTime() : false;
      default:
        return false;
    }
  };
  
  // Handler for granularity select change
  const handleGranularitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleGranularityChange(e.target.value as 'day' | 'week' | 'month' | 'quarter' | 'year');
  };
  
  // Handler for component selection
  const handleComponentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedComponent(e.target.value);
  };

  return (
    <div className="fault-probability-chart-container">
      {loading ? (
        <div className="loading-indicator">Loading chart data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="chart-controls">
            <div className="component-selector">
              <label htmlFor="componentSelect">Component: </label>
              <select 
                id="componentSelect" 
                value={selectedComponent}
                onChange={handleComponentChange}
              >
                {metadata?.components.map((comp) => (
                  <option key={comp} value={comp.toLowerCase()}>
                    {comp.charAt(0).toUpperCase() + comp.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="time-range-display">
              <span>From: {timeRange.start.toLocaleDateString()}</span>
              <span>To: {timeRange.end.toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="chart-area">
            <div className="chart-container">
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>
          
          <div className="time-controls">
            <div className="time-buttons">
              <button 
                className={`time-button${timeRangeEquals('week') ? ' active' : ''}`} 
                onClick={() => handleTimeRangeSelect('week')}
                title="View Last Week"
              >
                <div className="icon week-icon">W</div>
              </button>
              <button 
                className={`time-button${timeRangeEquals('month') ? ' active' : ''}`} 
                onClick={() => handleTimeRangeSelect('month')}
                title="View Last Month"
              >
                <div className="icon month-icon">M</div>
              </button>
              <button 
                className={`time-button${timeRangeEquals('quarter') ? ' active' : ''}`} 
                onClick={() => handleTimeRangeSelect('quarter')}
                title="View Last Quarter"
              >
                <div className="icon quarter-icon">Q</div>
              </button>
              <button 
                className={`time-button${timeRangeEquals('year') ? ' active' : ''}`} 
                onClick={() => handleTimeRangeSelect('year')}
                title="View Last Year"
              >
                <div className="icon year-icon">Y</div>
              </button>
              <button 
                className={`time-button${timeRangeEquals('all') ? ' active' : ''}`} 
                onClick={() => handleTimeRangeSelect('all')}
                title="View All Data"
              >
                <div className="icon all-icon">A</div>
              </button>
            </div>
            
            <div className="granularity-control">
              <label htmlFor="granularity">Time Granularity:</label>
              <select 
                id="granularity" 
                value={granularity}
                onChange={handleGranularitySelectChange}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FaultProbabilityChart;
