import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

// List of turbine components to generate data for
const COMPONENTS = [
  'Converter', 'Generator', 'Nacelle', 'Rotor', 'Tower', 
  'Transformer', 'Transmission', 'Turbine', 'Yaw'
];

// List of turbine IDs
const TURBINE_IDS = [1, 2, 3, 4];

// Date range: 10 years of daily data
const END_DATE = dayjs().startOf('day');
const START_DATE = END_DATE.subtract(10, 'year');
const DAYS_TOTAL = END_DATE.diff(START_DATE, 'day');

// Event patterns for creating realistic fault probability spikes
const EVENT_PATTERNS = [
  // Standard maintenance pattern - small regular peaks
  {
    frequency: 90, // days between events
    duration: 5,   // days each event lasts
    magnitude: 0.3, // max height of peak
    type: 'maintenance'
  },
  // Minor issue pattern - occasional medium peaks
  {
    frequency: 180,
    duration: 8,
    magnitude: 0.6,
    type: 'minor'
  },
  // Major failure pattern - rare high peaks
  {
    frequency: 900,
    duration: 15,
    magnitude: 0.95,
    type: 'major'
  }
];

// Alarms and warnings to generate
interface Event {
  date: string;
  value: number;
  type: 'alarm' | 'warning';
  component: string;
  turbineId: number;
}

// Function to generate a fault probability time series with patterns
function generateTimeSeries(component: string, turbineId: number, seedOffset = 0) {
  const timeSeries = [];
  const events: Event[] = [];
  
  // Base probability function with noise
  for (let day = 0; day < DAYS_TOTAL; day++) {
    const date = START_DATE.add(day, 'day').format('YYYY-MM-DD');
    
    // Base probability is very low (0.01-0.03) with some random noise
    let probability = 0.01 + (Math.random() * 0.02);
    
    // Add component and turbine specific variations
    const componentFactor = (COMPONENTS.indexOf(component) + 1) / COMPONENTS.length;
    const turbineFactor = turbineId / TURBINE_IDS.length;
    probability *= (0.8 + (componentFactor * 0.4)) * (0.8 + (turbineFactor * 0.4));
    
    // Track if this is a peak for event creation
    let isPeak = false;
    let peakType = '';
    
    // Add event patterns
    EVENT_PATTERNS.forEach(pattern => {
      // Each component and turbine has slightly different event timing
      const componentOffset = COMPONENTS.indexOf(component) * 13;
      const turbineOffset = turbineId * 23;
      const totalOffset = seedOffset + componentOffset + turbineOffset;
      
      // Check if we're in an event window
      const adjustedDay = day + totalOffset;
      const dayInCycle = adjustedDay % pattern.frequency;
      
      if (dayInCycle < pattern.duration) {
        // Create a bell curve shape for the event
        const peakDay = pattern.duration / 2;
        const distanceFromPeak = Math.abs(dayInCycle - peakDay);
        const peakFactor = 1 - (distanceFromPeak / peakDay);
        
        // Calculate the probability increase
        const probIncrease = pattern.magnitude * peakFactor * peakFactor;
        
        // If this is the highest point, mark it for potential event creation
        if (dayInCycle === Math.floor(peakDay) && pattern.magnitude > 0.4) {
          isPeak = true;
          peakType = pattern.type;
        }
        
        // Add to base probability
        probability += probIncrease;
      }
    });
    
    // Ensure probability is between 0 and 1
    probability = Math.min(Math.max(probability, 0), 1);
    
    // Add to time series
    timeSeries.push({
      date,
      probability
    });
    
    // Create events at peaks
    if (isPeak) {
      if (peakType === 'major' || (peakType === 'minor' && Math.random() > 0.7)) {
        events.push({
          date,
          value: probability,
          type: peakType === 'major' ? 'alarm' : 'warning',
          component,
          turbineId
        });
      }
    }
  }
  
  return { timeSeries, events };
}

// Generate and save data for each component and turbine
async function generateAllData() {
  const allEvents: Event[] = [];
  
  // Create directory if it doesn't exist
  const dataDir = path.join(__dirname, 'simulated');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Generate data for each turbine and component
  for (const turbineId of TURBINE_IDS) {
    for (const component of COMPONENTS) {
      const seedOffset = Math.floor(Math.random() * 30);
      const { timeSeries, events } = generateTimeSeries(component, turbineId, seedOffset);
      
      // Save time series data
      const filename = `turbine${turbineId}_${component.toLowerCase()}.json`;
      fs.writeFileSync(
        path.join(dataDir, filename),
        JSON.stringify(timeSeries, null, 2)
      );
      
      // Collect events
      allEvents.push(...events);
    }
  }
  
  // Save all events
  fs.writeFileSync(
    path.join(dataDir, 'events.json'),
    JSON.stringify(allEvents, null, 2)
  );
  
  // Create a metadata file with date range information
  const metadata = {
    startDate: START_DATE.format('YYYY-MM-DD'),
    endDate: END_DATE.format('YYYY-MM-DD'),
    totalDays: DAYS_TOTAL,
    components: COMPONENTS,
    turbineIds: TURBINE_IDS
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`Generated data for ${TURBINE_IDS.length} turbines and ${COMPONENTS.length} components over ${DAYS_TOTAL} days`);
}

// Run the generator
generateAllData().catch(console.error);
