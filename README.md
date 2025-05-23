# Wind Turbine Preventative Maintenance Scheduler

A modern React application for planning and scheduling preventative maintenance tasks for wind turbine fleets. Built with React, TypeScript, and Vite.

![Wind Turbine Maintenance Scheduler](https://github.com/yourusername/wind-turbine-scheduler/raw/main/screenshot.png)

## Features

- **Asset Management**: Track wind turbines and their components with detailed status information
- **Interactive Sidebar**: Expandable filterable list of assets with status indicators
- **Component Tracking**: Monitor the status of major wind turbine components: Converter, Generator, Nacelle, Rotor, Tower, Transformer, Transmission, Turbine, and Yaw
- **Task Scheduling**: Create and manage maintenance tasks with priority levels
- **Status Visualization**: Color-coded status indicators (red/amber/green) for operational status

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wind-turbine-scheduler.git
cd wind-turbine-scheduler

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. **Browse Assets**: Use the left sidebar to view and filter wind turbine assets
2. **Expand Details**: Click the triangle icon to reveal detailed information about each turbine
3. **View Components**: Expanded view shows all major components with their status
4. **Schedule Tasks**: Use the form to schedule new maintenance tasks
5. **Filter Tasks**: Select a turbine to filter tasks specific to that asset

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS Variables for theming

## Project Structure

```
src/
├── App.tsx         # Main application component
├── App.css         # Styling for the application
├── main.tsx        # Entry point
└── assets/         # Static assets
```

## License

MIT
