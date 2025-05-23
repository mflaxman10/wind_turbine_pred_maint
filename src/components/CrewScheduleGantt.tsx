import React, { useState, useEffect } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import type { Task } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import './CrewScheduleGantt.css';

// Define TaskType since it's not exported from the library
type TaskType = 'task' | 'milestone' | 'project';

interface TimeRange {
  start: Date;
  end: Date;
}

interface CrewScheduleGanttProps {
  turbineId: number | null;
  timeRange?: TimeRange;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: TimeRange) => void;
  onGranularityChange?: (granularity: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
}

// Define task types for crew schedules
interface MaintenanceTask extends Task {
  crewId: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed';
  maintenanceType: 'preventative' | 'corrective' | 'emergency';
}

const CrewScheduleGantt: React.FC<CrewScheduleGanttProps> = ({ 
  turbineId, 
  timeRange,
  granularity = 'week',
  onTimeRangeChange,
  onGranularityChange
}) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Map granularity to ViewMode
  useEffect(() => {
    switch(granularity) {
      case 'day':
        setViewMode(ViewMode.Day);
        break;
      case 'week':
        setViewMode(ViewMode.Week);
        break;
      case 'month':
      case 'quarter':
      case 'year':
        setViewMode(ViewMode.Month);
        break;
      default:
        setViewMode(ViewMode.Week);
    }
  }, [granularity]);
  
  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    
    // Map ViewMode back to granularity and notify parent
    if (onGranularityChange) {
      switch(mode) {
        case ViewMode.Day:
          onGranularityChange('day');
          break;
        case ViewMode.Week:
          onGranularityChange('week');
          break;
        case ViewMode.Month:
          onGranularityChange('month');
          break;
        default:
          onGranularityChange('week');
      }
    }
  };
  
  // Generate sample data based on turbineId and adjust to timeRange if provided
  useEffect(() => {
    if (!turbineId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // In a real app, this would fetch from an API
    setTimeout(() => {
      // Use provided timeRange if available, otherwise use default range
      const today = timeRange ? new Date(timeRange.end) : new Date();
      const startDate = timeRange ? new Date(timeRange.start) : new Date(today);
      
      // Sample tasks for the selected turbine
      const newTasks: MaintenanceTask[] = [
        {
          id: '1',
          name: 'Gearbox Inspection',
          start: new Date(startDate.setDate(today.getDate() - 3)),
          end: new Date(startDate.setDate(startDate.getDate() + 1)),
          progress: 100,
          type: 'task' as TaskType,
          isDisabled: false,
          styles: { progressColor: '#0077B6', progressSelectedColor: '#0077B6' },
          crewId: 'Crew A',
          priority: 'high',
          status: 'completed',
          maintenanceType: 'preventative',
        },
        {
          id: '2',
          name: 'Nacelle Maintenance',
          start: new Date(today),
          end: new Date(new Date(today).setDate(today.getDate() + 2)),
          progress: 50,
          type: 'task' as TaskType,
          isDisabled: false,
          styles: { progressColor: '#0096C7', progressSelectedColor: '#0096C7' },
          crewId: 'Crew B',
          priority: 'medium',
          status: 'in-progress',
          maintenanceType: 'preventative',
        },
        {
          id: '3',
          name: 'Converter Repair',
          start: new Date(new Date(today).setDate(today.getDate() + 3)),
          end: new Date(new Date(today).setDate(today.getDate() + 5)),
          progress: 0,
          type: 'task' as TaskType,
          isDisabled: false,
          styles: { progressColor: '#00B4D8', progressSelectedColor: '#00B4D8' },
          crewId: 'Crew A',
          priority: 'high',
          status: 'scheduled',
          maintenanceType: 'corrective',
        },
        {
          id: '4',
          name: 'Blade Inspection',
          start: new Date(new Date(today).setDate(today.getDate() + 5)),
          end: new Date(new Date(today).setDate(today.getDate() + 6)),
          progress: 0,
          type: 'task' as TaskType,
          isDisabled: false,
          styles: { progressColor: '#48CAE4', progressSelectedColor: '#48CAE4' },
          crewId: 'Crew C',
          priority: 'medium',
          status: 'scheduled',
          maintenanceType: 'preventative',
        },
        {
          id: '5',
          name: 'Tower Inspection',
          start: new Date(new Date(today).setDate(today.getDate() + 7)),
          end: new Date(new Date(today).setDate(today.getDate() + 8)),
          progress: 0,
          type: 'task' as TaskType,
          isDisabled: false,
          styles: { progressColor: '#90E0EF', progressSelectedColor: '#90E0EF' },
          crewId: 'Crew B',
          priority: 'low',
          status: 'scheduled',
          maintenanceType: 'preventative',
        }
      ];
      
      setTasks(newTasks);
      setLoading(false);
    }, 800);
  }, [turbineId]);
  
  // Set task colors based on status and priority
  useEffect(() => {
    // Apply colors to tasks based on their status and priority
    // This is an alternative to using a custom TaskBarComponent
    if (tasks.length > 0) {
      tasks.forEach(task => {
        // Set colors based on status
        switch (task.status) {
          case 'completed':
            task.styles = { 
              ...task.styles,
              backgroundColor: '#ADE8F4',
              backgroundSelectedColor: '#8CD0E0'
            };
            break;
          case 'in-progress':
            task.styles = { 
              ...task.styles,
              backgroundColor: '#48CAE4',
              backgroundSelectedColor: '#30B0CE'
            };
            break;
          case 'scheduled':
            task.styles = { 
              ...task.styles,
              backgroundColor: '#CAF0F8',
              backgroundSelectedColor: '#B0E0F0'
            };
            break;
        }
        
        // Add border colors based on priority
        if (task.priority === 'high') {
          task.styles.progressColor = '#f44336';
          task.styles.progressSelectedColor = '#d32f2f';
        } else if (task.priority === 'medium') {
          task.styles.progressColor = '#ff9800';
          task.styles.progressSelectedColor = '#f57c00';
        } else {
          task.styles.progressColor = '#4caf50';
          task.styles.progressSelectedColor = '#388e3c';
        }
      });
    }
  }, [tasks]);
  
  return (
    <div className="crew-schedule-gantt-container">
      <div className="gantt-header">
        <h3>Crew Schedule {turbineId ? `- Turbine #${turbineId}` : ''}</h3>
        <div className="view-mode-controls">
          <button 
            className={viewMode === ViewMode.Day ? 'active' : ''} 
            onClick={() => handleViewModeChange(ViewMode.Day)}
          >
            Day
          </button>
          <button 
            className={viewMode === ViewMode.Week ? 'active' : ''} 
            onClick={() => handleViewModeChange(ViewMode.Week)}
          >
            Week
          </button>
          <button 
            className={viewMode === ViewMode.Month ? 'active' : ''} 
            onClick={() => handleViewModeChange(ViewMode.Month)}
          >
            Month
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="gantt-loading">Loading crew schedule...</div>
      ) : tasks.length === 0 ? (
        <div className="gantt-no-data">
          {turbineId 
            ? `No scheduled maintenance for Turbine #${turbineId}` 
            : 'Select a turbine to view maintenance schedule'}
        </div>
      ) : (
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          columnWidth={60}
          listCellWidth="155px"
          rowHeight={50}
          // Pass custom styling via the barBackgroundColor and barBackgroundSelectedColor props
          // instead of using a custom TaskBarComponent which isn't supported
        />
      )}
      
      <div className="gantt-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#CAF0F8', borderLeft: '4px solid #f44336' }}></div>
          <span>High Priority</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#CAF0F8', borderLeft: '4px solid #ff9800' }}></div>
          <span>Medium Priority</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#CAF0F8', borderLeft: '4px solid #4caf50' }}></div>
          <span>Low Priority</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ADE8F4' }}></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#48CAE4' }}></div>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#CAF0F8' }}></div>
          <span>Scheduled</span>
        </div>
      </div>
    </div>
  );
};

export default CrewScheduleGantt;
