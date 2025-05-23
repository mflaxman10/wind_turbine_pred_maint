import { useState } from 'react'
import './App.css'

// Define interfaces for our data structures
interface TurbineComponent {
  id: number;
  name: string;
  status: 'operational' | 'maintenance' | 'offline';
  lastInspection?: string;
}

interface WindTurbine {
  id: number;
  name: string;
  location: string;
  lastMaintenanceType: string;
  lastMaintenanceDate: string;
  status: 'operational' | 'maintenance' | 'offline';
  expanded: boolean;
  components: TurbineComponent[];
}

interface MaintenanceTask {
  id: number;
  turbineId: number;
  taskName: string;
  scheduledDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  technician?: string;
}

function App() {
  // State for turbines and maintenance tasks
  const [turbines, setTurbines] = useState<WindTurbine[]>([
    { 
      id: 1, 
      name: 'Turbine A1', 
      location: 'Field North', 
      lastMaintenanceType: 'Full Service',
      lastMaintenanceDate: '2025-03-15', 
      status: 'operational',
      expanded: false,
      components: [
        { id: 101, name: 'Converter', status: 'operational', lastInspection: '2025-03-15' },
        { id: 102, name: 'Generator', status: 'operational', lastInspection: '2025-03-15' },
        { id: 103, name: 'Nacelle', status: 'operational', lastInspection: '2025-03-15' },
        { id: 104, name: 'Rotor', status: 'operational', lastInspection: '2025-03-10' },
        { id: 105, name: 'Tower', status: 'operational', lastInspection: '2025-03-10' },
        { id: 106, name: 'Transformer', status: 'operational', lastInspection: '2025-03-12' },
        { id: 107, name: 'Transmission', status: 'operational', lastInspection: '2025-03-12' },
        { id: 108, name: 'Turbine', status: 'operational', lastInspection: '2025-03-15' },
        { id: 109, name: 'Yaw', status: 'operational', lastInspection: '2025-03-10' },
      ] 
    },
    { 
      id: 2, 
      name: 'Turbine A2', 
      location: 'Field North', 
      lastMaintenanceType: 'Gearbox Repair',
      lastMaintenanceDate: '2025-04-02', 
      status: 'maintenance',
      expanded: false,
      components: [
        { id: 201, name: 'Converter', status: 'operational', lastInspection: '2025-04-02' },
        { id: 202, name: 'Generator', status: 'operational', lastInspection: '2025-04-02' },
        { id: 203, name: 'Nacelle', status: 'operational', lastInspection: '2025-04-02' },
        { id: 204, name: 'Rotor', status: 'operational', lastInspection: '2025-03-20' },
        { id: 205, name: 'Tower', status: 'operational', lastInspection: '2025-03-20' },
        { id: 206, name: 'Transformer', status: 'operational', lastInspection: '2025-03-25' },
        { id: 207, name: 'Transmission', status: 'maintenance', lastInspection: '2025-04-02' },
        { id: 208, name: 'Turbine', status: 'maintenance', lastInspection: '2025-04-02' },
        { id: 209, name: 'Yaw', status: 'operational', lastInspection: '2025-03-20' },
      ]
    },
    { 
      id: 3, 
      name: 'Turbine B1', 
      location: 'Field East', 
      lastMaintenanceType: 'Sensor Calibration',
      lastMaintenanceDate: '2025-02-20', 
      status: 'operational',
      expanded: false,
      components: [
        { id: 301, name: 'Converter', status: 'operational', lastInspection: '2025-02-20' },
        { id: 302, name: 'Generator', status: 'operational', lastInspection: '2025-02-20' },
        { id: 303, name: 'Nacelle', status: 'operational', lastInspection: '2025-02-20' },
        { id: 304, name: 'Rotor', status: 'operational', lastInspection: '2025-02-15' },
        { id: 305, name: 'Tower', status: 'operational', lastInspection: '2025-02-15' },
        { id: 306, name: 'Transformer', status: 'operational', lastInspection: '2025-02-18' },
        { id: 307, name: 'Transmission', status: 'operational', lastInspection: '2025-02-18' },
        { id: 308, name: 'Turbine', status: 'operational', lastInspection: '2025-02-20' },
        { id: 309, name: 'Yaw', status: 'operational', lastInspection: '2025-02-15' },
      ]
    },
    { 
      id: 4, 
      name: 'Turbine C1', 
      location: 'Field West', 
      lastMaintenanceType: 'Emergency Repair',
      lastMaintenanceDate: '2025-01-10', 
      status: 'offline',
      expanded: false,
      components: [
        { id: 401, name: 'Converter', status: 'offline', lastInspection: '2025-01-10' },
        { id: 402, name: 'Generator', status: 'offline', lastInspection: '2025-01-10' },
        { id: 403, name: 'Nacelle', status: 'operational', lastInspection: '2025-01-05' },
        { id: 404, name: 'Rotor', status: 'offline', lastInspection: '2025-01-10' },
        { id: 405, name: 'Tower', status: 'operational', lastInspection: '2025-01-05' },
        { id: 406, name: 'Transformer', status: 'operational', lastInspection: '2025-01-05' },
        { id: 407, name: 'Transmission', status: 'offline', lastInspection: '2025-01-10' },
        { id: 408, name: 'Turbine', status: 'offline', lastInspection: '2025-01-10' },
        { id: 409, name: 'Yaw', status: 'operational', lastInspection: '2025-01-05' },
      ]
    },
  ]);

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    { id: 1, turbineId: 1, taskName: 'Blade Inspection', scheduledDate: '2025-06-10', priority: 'medium', completed: false },
    { id: 2, turbineId: 2, taskName: 'Gearbox Replacement', scheduledDate: '2025-05-25', priority: 'high', completed: false, technician: 'John Smith' },
    { id: 3, turbineId: 3, taskName: 'Sensor Calibration', scheduledDate: '2025-06-15', priority: 'low', completed: false },
    { id: 4, turbineId: 4, taskName: 'Full System Repair', scheduledDate: '2025-05-30', priority: 'high', completed: false, technician: 'Maria Rodriguez' },
  ]);

  // State for form inputs
  const [selectedTurbine, setSelectedTurbine] = useState<number | null>(null);
  const [newTask, setNewTask] = useState<Omit<MaintenanceTask, 'id'>>({ 
    turbineId: 0, 
    taskName: '', 
    scheduledDate: '', 
    priority: 'medium', 
    completed: false 
  });

  // State for search filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Function to toggle turbine expansion
  const toggleExpand = (turbineId: number) => {
    setTurbines(prevTurbines => 
      prevTurbines.map(turbine => 
        turbine.id === turbineId ? { ...turbine, expanded: !turbine.expanded } : turbine
      )
    );
  };

  // Filter turbines based on search term
  const filteredTurbines = turbines.filter(turbine => 
    turbine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turbine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter tasks for the selected turbine
  const filteredTasks = selectedTurbine 
    ? maintenanceTasks.filter(task => task.turbineId === selectedTurbine)
    : maintenanceTasks;

  // Handle turbine selection
  const handleTurbineSelect = (turbineId: number) => {
    setSelectedTurbine(prevSelected => prevSelected === turbineId ? null : turbineId);
    setNewTask(prev => ({ ...prev, turbineId: turbineId }));
  };

  // Handle task completion toggle
  const toggleTaskCompletion = (taskId: number) => {
    setMaintenanceTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.taskName || !newTask.scheduledDate) return;

    const newTaskWithId: MaintenanceTask = {
      ...newTask,
      id: Math.max(0, ...maintenanceTasks.map(t => t.id)) + 1,
      turbineId: selectedTurbine || newTask.turbineId,
      priority: newTask.priority as 'high' | 'medium' | 'low'
    };

    setMaintenanceTasks(prev => [...prev, newTaskWithId]);
    
    // Reset form
    setNewTask({ 
      turbineId: selectedTurbine || 0, 
      taskName: '', 
      scheduledDate: '', 
      priority: 'medium', 
      completed: false 
    });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Wind Turbine Maintenance Scheduler</h1>
        <p>Plan and schedule preventative maintenance for your wind turbine fleet</p>
      </header>

      <main className="dashboard-layout">
        {/* Left Sidebar with Expandable Asset List */}
        <aside className="sidebar">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="asset-list-header">
            <span className="asset-name-col">Asset Name</span>
            <span className="asset-status-col">Status</span>
          </div>
          
          <ul className="asset-list">
            {filteredTurbines.map(turbine => (
              <li key={turbine.id} className={selectedTurbine === turbine.id ? 'selected-asset' : ''}>
                <div 
                  className="asset-list-item"
                  onClick={() => handleTurbineSelect(turbine.id)}
                >
                  <span className="asset-expand-col">
                    <button 
                      className={`expand-toggle ${turbine.expanded ? 'expanded' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(turbine.id);
                      }}
                      aria-label="Toggle expansion"
                    >
                      {turbine.expanded ? '▼' : '▶'}
                    </button>
                  </span>
                  <span className="asset-name-col">{turbine.name}</span>
                  <span className="asset-status-col">
                    <span className={`status-indicator ${turbine.status}`} title={turbine.status}></span>
                  </span>
                </div>
                
                {turbine.expanded && (
                  <div className="asset-details">
                    <div className="asset-info">
                      <p><strong>Location:</strong> {turbine.location}</p>
                      <p><strong>Last Maintenance Type:</strong> {turbine.lastMaintenanceType}</p>
                      <p><strong>Last Maintenance Date:</strong> {turbine.lastMaintenanceDate}</p>
                    </div>
                    
                    <div className="components-list">
                      <h4>Components</h4>
                      <table className="component-table">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Status</th>
                            <th>Last Inspection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {turbine.components.map(component => (
                            <tr key={component.id} className="component-item">
                              <td className="component-name">{component.name}</td>
                              <td className="component-status">
                                <span className={`status-indicator ${component.status}`} title={component.status}></span>
                              </td>
                              <td className="component-date">{component.lastInspection}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
        
        {/* Right Content Area */}
        <div className="main-content">
          <section className="maintenance-schedule">
            <div className="section-header">
              <h2>{selectedTurbine 
                ? `Maintenance Tasks for ${turbines.find(t => t.id === selectedTurbine)?.name}` 
                : 'All Maintenance Tasks'}</h2>
            </div>

            <table className="task-table">
              <thead>
                <tr>
                  <th>Turbine</th>
                  <th>Task</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Technician</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => {
                  const turbine = turbines.find(t => t.id === task.turbineId);
                  return (
                    <tr key={task.id} className={task.completed ? 'completed' : ''}>
                      <td>{turbine?.name}</td>
                      <td>{task.taskName}</td>
                      <td>{task.scheduledDate}</td>
                      <td><span className={`priority ${task.priority}`}>{task.priority}</span></td>
                      <td>{task.technician || 'Unassigned'}</td>
                      <td>
                        <label className="checkbox-container">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTaskCompletion(task.id)}
                          />
                          <span className="checkmark"></span>
                          {task.completed ? 'Complete' : 'Pending'}
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="new-task-form">
            <h2>Schedule New Maintenance Task</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Turbine:</label>
                <select 
                  name="turbineId" 
                  value={selectedTurbine || newTask.turbineId} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a turbine</option>
                  {turbines.map(turbine => (
                    <option key={turbine.id} value={turbine.id}>{turbine.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Task Name:</label>
                <input 
                  type="text" 
                  name="taskName" 
                  value={newTask.taskName} 
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Blade Inspection"
                />
              </div>

              <div className="form-group">
                <label>Scheduled Date:</label>
                <input 
                  type="date" 
                  name="scheduledDate" 
                  value={newTask.scheduledDate} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority:</label>
                <select 
                  name="priority" 
                  value={newTask.priority} 
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Technician (Optional):</label>
                <input 
                  type="text" 
                  name="technician" 
                  value={newTask.technician || ''} 
                  onChange={handleInputChange}
                  placeholder="e.g. John Smith"
                />
              </div>

              <button type="submit" className="submit-btn">Schedule Maintenance</button>
            </form>
          </section>
        </div>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Wind Turbine Maintenance Scheduler | Created with React</p>
      </footer>
    </div>
  )
}

export default App
