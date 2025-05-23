const fs = require('fs');
const path = require('path');

// List of turbine components to generate data for
const COMPONENTS = [
  'Converter', 'Generator', 'Nacelle', 'Rotor', 'Tower', 
  'Transformer', 'Transmission', 'Turbine', 'Yaw'
];

// List of turbine IDs
const TURBINE_IDS = [1, 2, 3, 4];

// Date range: 10 years of daily data (using simplified days for easier calculation)
const END_DATE = new Date();
const START_DATE = new Date(END_DATE);
START_DATE.setFullYear(START_DATE.getFullYear() - 10);

// Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get days between two dates
function getDaysBetween(startDate, endDate) {
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
}

const DAYS_TOTAL = getDaysBetween(START_DATE, END_DATE);

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

// Function to generate a fault probability time series with patterns
function generateTimeSeries(component, turbineId, seedOffset = 0) {
  const timeSeries = [];
  const events = [];
  
  // Base probability function with noise
  for (let day = 0; day < DAYS_TOTAL; day++) {
    const currentDate = new Date(START_DATE);
    currentDate.setDate(START_DATE.getDate() + day);
    const date = formatDate(currentDate);
    
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
      probability: parseFloat(probability.toFixed(4))
    });
    
    // Create events at peaks
    if (isPeak) {
      if (peakType === 'major' || (peakType === 'minor' && Math.random() > 0.7)) {
        events.push({
          date,
          value: parseFloat(probability.toFixed(4)),
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
function generateAllData() {
  const allEvents = [];
  
  // Create directory if it doesn't exist
  const dataDir = path.join(__dirname, '../public/data/simulated');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Generate data for each turbine and component
  for (const turbineId of TURBINE_IDS) {
    const turbineData = {
      turbineId,
      components: {}
    };
    
    for (const component of COMPONENTS) {
      const seedOffset = Math.floor(Math.random() * 30);
      const { timeSeries, events } = generateTimeSeries(component, turbineId, seedOffset);
      
      // Add to turbine data
      turbineData.components[component.toLowerCase()] = timeSeries;
      
      // Collect events
      allEvents.push(...events);
    }
    
    // Save turbine data
    const filename = `turbine${turbineId}.json`;
    fs.writeFileSync(
      path.join(dataDir, filename),
      JSON.stringify(turbineData, null, 2)
    );
  }
  
  // Save all events
  fs.writeFileSync(
    path.join(dataDir, 'events.json'),
    JSON.stringify(allEvents, null, 2)
  );
  
  // Create a metadata file with date range information
  const metadata = {
    startDate: formatDate(START_DATE),
    endDate: formatDate(END_DATE),
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
generateAllData();
