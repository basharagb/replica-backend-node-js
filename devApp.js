// ============================================================
// 🚀 Development Mode Silo Monitoring API (No Database Required)
// ============================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ============================================================
// ⚙️ Environment Configuration
// ============================================================
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================
// 🚀 Initialize Express App
// ============================================================
const app = express();

// Middleware setup
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 📊 Mock Data for Development
// ============================================================
const mockSilos = Array.from({ length: 150 }, (_, i) => ({
  id: i + 1,
  silo_number: i + 1,
  name: `Silo ${i + 1}`,
  cable_count: Math.floor(Math.random() * 4) + 1,
  status: 'active'
}));

const mockReadings = {
  silo_number: 1,
  cables: {
    "1": {
      levels: {
        "0": { temperature: 25.5, status: "normal", color: "#00FF00" },
        "1": { temperature: 26.2, status: "normal", color: "#00FF00" },
        "2": { temperature: -127.0, status: "disconnect", color: "#808080" },
        "3": { temperature: 27.1, status: "warning", color: "#FFFF00" },
        "4": { temperature: 28.5, status: "normal", color: "#00FF00" },
        "5": { temperature: 45.2, status: "critical", color: "#FF0000" },
        "6": { temperature: 26.8, status: "normal", color: "#00FF00" },
        "7": { temperature: 25.9, status: "normal", color: "#00FF00" }
      }
    },
    "2": {
      levels: {
        "0": { temperature: 24.8, status: "normal", color: "#00FF00" },
        "1": { temperature: 25.5, status: "normal", color: "#00FF00" },
        "2": { temperature: 26.1, status: "normal", color: "#00FF00" },
        "3": { temperature: -127.0, status: "disconnect", color: "#808080" },
        "4": { temperature: 27.8, status: "normal", color: "#00FF00" },
        "5": { temperature: 28.2, status: "normal", color: "#00FF00" },
        "6": { temperature: 26.5, status: "normal", color: "#00FF00" },
        "7": { temperature: 25.2, status: "normal", color: "#00FF00" }
      }
    }
  },
  timestamp: new Date().toISOString()
};

// Enhanced mock alerts matching old Python system format
const mockAlerts = [
  {
    silo_group: "Group A",
    silo_number: 5,
    cable_number: null,
    level_0: 22.1, color_0: "#46d446",
    level_1: 24.3, color_1: "#46d446", 
    level_2: 28.7, color_2: "#c7c150",
    level_3: 45.2, color_3: "#d14141",
    level_4: 42.1, color_4: "#d14141",
    level_5: 38.9, color_5: "#c7c150",
    level_6: 25.4, color_6: "#46d446",
    level_7: 23.1, color_7: "#46d446",
    silo_color: "#d14141",
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
    alert_type: "critical",
    affected_levels: [3, 4],
    active_since: new Date(Date.now() - 3600000).toISOString().replace(/\.\d{3}Z$/, '')
  },
  {
    silo_group: "Group B", 
    silo_number: 12,
    cable_number: null,
    level_0: 21.5, color_0: "#46d446",
    level_1: 23.8, color_1: "#46d446",
    level_2: 26.2, color_2: "#46d446", 
    level_3: 29.1, color_3: "#c7c150",
    level_4: 32.4, color_4: "#c7c150",
    level_5: 38.5, color_5: "#c7c150",
    level_6: 27.3, color_6: "#c7c150",
    level_7: 24.7, color_7: "#46d446",
    silo_color: "#c7c150",
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
    alert_type: "warn",
    affected_levels: [5],
    active_since: new Date(Date.now() - 1800000).toISOString().replace(/\.\d{3}Z$/, '')
  },
  {
    silo_group: "Group C",
    silo_number: 18,
    cable_number: null,
    level_0: -127.0, color_0: "#8c9494",
    level_1: -127.0, color_1: "#8c9494",
    level_2: 24.1, color_2: "#46d446",
    level_3: 26.8, color_3: "#46d446",
    level_4: 28.2, color_4: "#c7c150",
    level_5: 31.5, color_5: "#c7c150",
    level_6: 25.9, color_6: "#46d446",
    level_7: 23.4, color_7: "#46d446",
    silo_color: "#8c9494",
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
    alert_type: "disconnect",
    affected_levels: [0, 1],
    active_since: new Date(Date.now() - 7200000).toISOString().replace(/\.\d{3}Z$/, '')
  }
];

// ============================================================
// 🩺 Health Check Endpoint
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Mock Mode (Development)',
    uptime: process.uptime() + 's',
    mode: 'development'
  });
});

// ============================================================
// 🏭 Silo Management Endpoints
// ============================================================
app.get('/api/silos', (req, res) => {
  res.json({
    success: true,
    data: mockSilos,
    total: mockSilos.length
  });
});

app.get('/api/silos/by-number', (req, res) => {
  const siloNumber = parseInt(req.query.silo_number);
  const silo = mockSilos.find(s => s.silo_number === siloNumber);
  
  if (!silo) {
    return res.status(404).json({
      success: false,
      message: 'Silo not found'
    });
  }

  res.json({
    success: true,
    data: {
      ...silo,
      cables: [
        { id: 1, cable_number: 1, sensor_count: 8 },
        { id: 2, cable_number: 2, sensor_count: 8 }
      ]
    }
  });
});

app.get('/api/silos/:id', (req, res) => {
  const siloId = parseInt(req.params.id);
  const silo = mockSilos.find(s => s.id === siloId);
  
  if (!silo) {
    return res.status(404).json({
      success: false,
      message: 'Silo not found'
    });
  }

  res.json({
    success: true,
    data: silo
  });
});

// ============================================================
// 🌡️ Temperature Readings Endpoints
// ============================================================

// Helper function to generate mock readings in old system format
const generateMockReadings = (siloNumbers, type = 'individual') => {
  const results = [];
  
  siloNumbers.forEach(siloNumber => {
    const groupId = siloNumber <= 10 ? 1 : 2;
    const groupName = `Group ${groupId}`;
    
    if (type === 'averaged') {
      // Generate averaged readings in old system format
      const siloData = {
        silo_group: groupName,
        silo_number: siloNumber,
        cable_number: null,
        timestamp: new Date().toISOString().slice(0, 19)
      };
      
      let maxTemp = 0;
      let siloColor = "#46d446"; // Default green
      
      // Generate 8 levels of averaged data
      for (let level = 0; level < 8; level++) {
        const baseTemp = 20 + Math.random() * 20;
        const temp = Math.round(baseTemp * 100) / 100;
        
        let color = "#46d446"; // Green - normal
        if (temp > 35) {
          color = "#c7c150"; // Yellow - warning
          if (temp > 38) {
            color = "#d14141"; // Red - critical
          }
        }
        
        siloData[`level_${level}`] = temp;
        siloData[`color_${level}`] = color;
        
        if (temp > maxTemp) {
          maxTemp = temp;
          siloColor = color;
        }
      }
      
      siloData.silo_color = siloColor;
      results.push(siloData);
      
    } else {
      // Generate flattened silo readings (matches Python _flatten_rows_per_silo)
      const siloData = {
        silo_group: groupName,
        silo_number: siloNumber,
        cable_number: null, // Flattened data has no specific cable
        timestamp: new Date().toISOString().slice(0, 19)
      };
      
      let siloColor = "#46d446"; // Default green
      
      // Generate flattened data for 8 levels (combining data from multiple cables)
      for (let level = 0; level < 8; level++) {
        let temp, color;
        
        // Simulate disconnect for silo 14 (all levels -127)
        if (siloNumber === 14) {
          temp = -127.0;
          color = "#8c9494"; // Gray for disconnect
          siloColor = "#8c9494";
        } else {
          const baseTemp = 20 + Math.random() * 15;
          temp = Math.round(baseTemp * 100) / 100;
          color = "#46d446"; // Green - normal
          
          if (temp > 35) {
            color = "#c7c150"; // Yellow - warning
            if (temp > 38) {
              color = "#d14141"; // Red - critical
              siloColor = "#d14141";
            } else if (siloColor === "#46d446") {
              siloColor = "#c7c150";
            }
          }
        }
        
        siloData[`level_${level}`] = temp;
        siloData[`color_${level}`] = color;
      }
      
      siloData.silo_color = siloColor;
      results.push(siloData);
    }
  });
  
  return results;
};

// Helper function to generate sensor data in Python format
const generateSensorData = (sensorId, isMax = false) => {
  const siloNumber = Math.floor((sensorId - 1) / 16) + 1; // 16 sensors per silo
  const cableIndex = Math.floor(((sensorId - 1) % 16) / 8); // 8 sensors per cable
  const levelIndex = (sensorId - 1) % 8; // Level within cable
  const groupId = Math.floor((siloNumber - 1) / 50) + 1; // 50 silos per group
  
  const baseTemp = isMax ? 35 + Math.random() * 10 : 20 + Math.random() * 15;
  const temperature = Math.round(baseTemp * 100) / 100;
  
  let state = "normal";
  let color = "#46d446"; // Green
  
  if (temperature > 35) {
    state = "warn";
    color = "#c7c150"; // Yellow
    if (temperature > 38) {
      state = "critical";
      color = "#d14141"; // Red
    }
  }
  
  // Simulate disconnect for sensor 112 (silo 14)
  if (sensorId === 112) {
    return {
      sensor_id: sensorId,
      group_id: groupId,
      silo_number: siloNumber,
      cable_index: cableIndex,
      level_index: levelIndex,
      state: "disconnect",
      color: "#8c9494",
      temperature: -127.0,
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    sensor_id: sensorId,
    group_id: groupId,
    silo_number: siloNumber,
    cable_index: cableIndex,
    level_index: levelIndex,
    state: state,
    color: color,
    temperature: temperature,
    timestamp: new Date().toISOString()
  };
};

// Sensor-level endpoints
app.get('/readings/by-sensor', (req, res) => {
  const sensorIds = Array.isArray(req.query.sensor_id) ? req.query.sensor_id : [req.query.sensor_id];
  const data = sensorIds.map(id => generateSensorData(parseInt(id)));
  res.json(data);
});

app.get('/readings/latest/by-sensor', (req, res) => {
  const sensorIds = Array.isArray(req.query.sensor_id) ? req.query.sensor_id : [req.query.sensor_id];
  const data = sensorIds.map(id => generateSensorData(parseInt(id)));
  res.json(data);
});

app.get('/readings/max/by-sensor', (req, res) => {
  const sensorIds = Array.isArray(req.query.sensor_id) ? req.query.sensor_id : [req.query.sensor_id];
  const data = sensorIds.map(id => generateSensorData(parseInt(id), true));
  res.json(data);
});

// Cable-level endpoints
app.get('/readings/by-cable', (req, res) => {
  const cableIds = Array.isArray(req.query.cable_id) ? req.query.cable_id : [req.query.cable_id];
  const data = cableIds.map(id => ({
    cable_id: parseInt(id),
    sensors: Array.from({length: 8}, (_, i) => ({
      level: i,
      temperature: Math.round((20 + Math.random() * 15) * 10) / 10
    })),
    timestamp: new Date().toISOString()
  }));
  res.json({ success: true, data });
});

app.get('/readings/latest/by-cable', (req, res) => {
  const cableIds = Array.isArray(req.query.cable_id) ? req.query.cable_id : [req.query.cable_id];
  const data = cableIds.map(id => ({
    cable_id: parseInt(id),
    sensors: Array.from({length: 8}, (_, i) => ({
      level: i,
      temperature: Math.round((20 + Math.random() * 15) * 10) / 10
    })),
    timestamp: new Date().toISOString()
  }));
  res.json({ success: true, data });
});

app.get('/readings/max/by-cable', (req, res) => {
  const cableIds = Array.isArray(req.query.cable_id) ? req.query.cable_id : [req.query.cable_id];
  const data = cableIds.map(id => ({
    cable_id: parseInt(id),
    max_sensors: Array.from({length: 8}, (_, i) => ({
      level: i,
      max_temperature: Math.round((35 + Math.random() * 10) * 10) / 10
    })),
    timestamp: new Date().toISOString()
  }));
  res.json({ success: true, data });
});

// Silo-level endpoints
app.get('/readings/by-silo-id', (req, res) => {
  const siloIds = Array.isArray(req.query.silo_id) ? req.query.silo_id.map(Number) : [Number(req.query.silo_id)];
  const data = generateMockReadings(siloIds, 'individual');
  res.json(data);
});

app.get('/readings/latest/by-silo-id', (req, res) => {
  const siloIds = Array.isArray(req.query.silo_id) ? req.query.silo_id.map(Number) : [Number(req.query.silo_id)];
  const data = generateMockReadings(siloIds, 'individual');
  res.json(data);
});

app.get('/readings/max/by-silo-id', (req, res) => {
  const siloIds = Array.isArray(req.query.silo_id) ? req.query.silo_id.map(Number) : [Number(req.query.silo_id)];
  const data = generateMockReadings(siloIds, 'individual');
  res.json(data);
});

// Silo averaged endpoints
app.get('/readings/avg/by-silo-id', (req, res) => {
  const siloIds = Array.isArray(req.query.silo_id) ? req.query.silo_id.map(Number) : [Number(req.query.silo_id)];
  const data = generateMockReadings(siloIds, 'averaged');
  res.json(data);
});

app.get('/readings/avg/latest/by-silo-id', (req, res) => {
  const siloIds = Array.isArray(req.query.silo_id) ? req.query.silo_id.map(Number) : [Number(req.query.silo_id)];
  const data = generateMockReadings(siloIds, 'averaged');
  res.json(data);
});

app.get('/readings/avg/max/by-silo-id', (req, res) => {
  const siloIds = Array.isArray(req.query.silo_id) ? req.query.silo_id.map(Number) : [Number(req.query.silo_id)];
  const data = generateMockReadings(siloIds, 'averaged');
  res.json(data);
});

// Silo number endpoints
app.get('/readings/by-silo-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  const data = generateMockReadings(siloNumbers, 'individual');
  res.json(data);
});

app.get('/readings/latest/by-silo-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  const data = generateMockReadings(siloNumbers, 'individual');
  res.json(data);
});

app.get('/readings/max/by-silo-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  const data = generateMockReadings(siloNumbers, 'individual');
  res.json(data);
});

// Silo number averaged endpoints
app.get('/readings/avg/by-silo-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  const data = generateMockReadings(siloNumbers, 'averaged');
  res.json(data);
});

app.get('/readings/avg/latest/by-silo-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  const data = generateMockReadings(siloNumbers, 'averaged');
  res.json(data);
});

app.get('/readings/avg/max/by-silo-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  const data = generateMockReadings(siloNumbers, 'averaged');
  res.json(data);
});

// Silo group endpoints
app.get('/readings/by-silo-group-id', (req, res) => {
  const groupId = Number(req.query.silo_group_id);
  const siloNumbers = [1, 2, 3, 4, 5]; // Mock silos in group
  const data = generateMockReadings(siloNumbers, 'individual');
  res.json({ success: true, data, group_id: groupId });
});

app.get('/readings/latest/by-silo-group-id', (req, res) => {
  const groupId = Number(req.query.silo_group_id);
  const siloNumbers = [1, 2, 3, 4, 5]; // Mock silos in group
  const data = generateMockReadings(siloNumbers, 'individual');
  res.json({ success: true, data, group_id: groupId });
});

app.get('/readings/max/by-silo-group-id', (req, res) => {
  const groupId = Number(req.query.silo_group_id);
  const siloNumbers = [1, 2, 3, 4, 5]; // Mock silos in group
  const data = generateMockReadings(siloNumbers, 'individual');
  res.json({ success: true, data, group_id: groupId });
});

app.get('/readings/avg/by-silo-group-id', (req, res) => {
  const groupId = Number(req.query.silo_group_id);
  const siloNumbers = [1, 2, 3, 4, 5]; // Mock silos in group
  const data = generateMockReadings(siloNumbers, 'averaged');
  res.json({ success: true, data, group_id: groupId });
});

app.get('/readings/avg/latest/by-silo-group-id', (req, res) => {
  const groupId = Number(req.query.silo_group_id);
  const siloNumbers = [1, 2, 3, 4, 5]; // Mock silos in group
  const data = generateMockReadings(siloNumbers, 'averaged');
  res.json({ success: true, data, group_id: groupId });
});

app.get('/readings/avg/max/by-silo-group-id', (req, res) => {
  const groupId = Number(req.query.silo_group_id);
  const siloNumbers = [1, 2, 3, 4, 5]; // Mock silos in group
  const data = generateMockReadings(siloNumbers, 'averaged');
  res.json({ success: true, data, group_id: groupId });
});

// ============================================================
// 🚨 Alerts Endpoints
// ============================================================
app.get('/alerts/active', (req, res) => {
  const { page = 1, limit = 50, window_hours = 2.0 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;
  
  // Simulate pagination
  const paginatedAlerts = mockAlerts.slice(offset, offset + limitNum);
  const total = mockAlerts.length;
  const totalPages = Math.ceil(total / limitNum);
  
  // Return in new enhanced format matching old Python system
  const response = {
    success: true,
    message: 'Active alerts retrieved successfully',
    data: paginatedAlerts,
    pagination: {
      current_page: pageNum,
      per_page: limitNum,
      total_items: total,
      total_pages: totalPages,
      has_next_page: pageNum < totalPages,
      has_previous_page: pageNum > 1
    }
  };
  
  res.json(response);
});

// ============================================================
// 📊 Analytics Endpoints
// ============================================================
app.get('/silos/level-estimate', (req, res) => {
  const siloNumber = parseInt(req.query.silo_number);
  
  res.json({
    success: true,
    data: {
      silo_number: siloNumber,
      estimated_fill_level: Math.round(Math.random() * 100 * 10) / 10,
      fill_status: "medium",
      analysis_method: "k-means clustering",
      confidence: 0.92,
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/silos/level-estimate/by-number', (req, res) => {
  const siloNumbers = Array.isArray(req.query.silo_number) ? req.query.silo_number.map(Number) : [Number(req.query.silo_number)];
  
  const data = siloNumbers.map(siloNumber => ({
    silo_number: siloNumber,
    estimated_fill_level: Math.round(Math.random() * 100 * 10) / 10,
    fill_status: Math.random() > 0.5 ? "high" : "medium",
    analysis_method: "k-means clustering",
    confidence: Math.round((0.8 + Math.random() * 0.2) * 100) / 100,
    timestamp: new Date().toISOString()
  }));
  
  res.json({
    success: true,
    data: data
  });
});

// ============================================================
// 🔐 Authentication Endpoints
// ============================================================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mock authentication - accept any valid username/password
  if (username && password) {
    res.json({
      success: true,
      token: "mock-jwt-token-" + Date.now(),
      user: {
        id: 1,
        username: username,
        role: "administrator"
      },
      message: "Login successful"
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Username and password are required"
    });
  }
});

// Alternative login endpoint for compatibility
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mock authentication - accept any valid username/password
  if (username && password) {
    res.json({
      success: true,
      token: "mock-jwt-token-" + Date.now(),
      user: {
        id: 1,
        username: username,
        role: "administrator"
      },
      message: "Login successful"
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Username and password are required"
    });
  }
});

// ============================================================
// 📱 SMS Endpoints
// ============================================================
app.post('/sms', (req, res) => {
  const { to, message } = req.body;
  res.json({
    success: true,
    message: "SMS sent successfully (mock mode)",
    to: to,
    content: message,
    timestamp: new Date().toISOString()
  });
});

app.post('/sms/send', (req, res) => {
  const { to, message } = req.body;
  res.json({
    success: true,
    message: "SMS sent successfully (mock mode)",
    to: to,
    content: message,
    timestamp: new Date().toISOString()
  });
});

// SMS Health endpoint (different from main health)
app.get('/sms/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SMS Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + 's'
  });
});

// ============================================================
// 🌡️ Environment Endpoints
// ============================================================
app.get('/env_temp', (req, res) => {
  // Mock cottage temperature data
  // slave_id 21 = Inside temperature
  // slave_id 22 = Outside temperature
  const mockCottageData = [
    {
      slave_id: 21,
      temperature_c: Math.round((22.5 + Math.random() * 5) * 10) / 10, // Inside: 22.5-27.5°C
      timestamp: new Date().toISOString()
    },
    {
      slave_id: 22,
      temperature_c: Math.round((15.0 + Math.random() * 10) * 10) / 10, // Outside: 15-25°C
      timestamp: new Date().toISOString()
    }
  ];
  
  res.json(mockCottageData);
});

app.get('/environment/temperature/latest', (req, res) => {
  res.json({
    success: true,
    data: {
      temperature: Math.round((Math.random() * 10 + 20) * 10) / 10,
      humidity: Math.round((Math.random() * 30 + 40) * 10) / 10,
      timestamp: new Date().toISOString()
    }
  });
});


// ============================================================
// 🚀 Start Server
// ============================================================
app.listen(PORT, HOST, () => {
  console.log('🚀 ===================================');
  console.log('🏭 Silo Monitoring API (Dev Mode)');
  console.log('🚀 ===================================');
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log(`🩺 Health: http://${HOST}:${PORT}/health`);
  console.log(`📊 Mode: Development (Mock Data)`);
  console.log(`⚡ Status: Ready for testing!`);
  console.log('🚀 ===================================');
});

// ============================================================
// 🛡️ Graceful Shutdown
// ============================================================
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Export app for testing
export default app;
