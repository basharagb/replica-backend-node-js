// ==============================
// 📦 Response Formatters - Match Old Python System
// ==============================

// ==============================
// 🎨 Color and Status Mapping
// ==============================
const STATUS_COLORS = {
  'normal': '#46d446',
  'warn': '#c7c150', 
  'critical': '#d14141',
  'disconnect': '#8c9494'
};

const DISCONNECT_SENTINELS = new Set([-127.0]);

// ==============================
// 🌡️ Helper Functions
// ==============================
function isDisconnectTemp(temp) {
  if (temp === null || temp === undefined) return true;
  if (typeof temp === 'number') {
    if (isNaN(temp) || !isFinite(temp)) return true;
    if (DISCONNECT_SENTINELS.has(parseFloat(temp))) return true;
  }
  return false;
}

function getStatusColor(temp, product = null) {
  if (isDisconnectTemp(temp)) {
    return ['disconnect', STATUS_COLORS.disconnect];
  }
  
  // For now, use simple thresholds (can be enhanced with product-specific thresholds)
  const tempValue = parseFloat(temp);
  if (tempValue >= 60) return ['critical', STATUS_COLORS.critical];
  if (tempValue >= 40) return ['warn', STATUS_COLORS.warn];
  return ['normal', STATUS_COLORS.normal];
}

function normalizeHex(color) {
  if (!color || typeof color !== 'string') return '#ffffff';
  return color.toLowerCase();
}

function roundTemp(temp) {
  if (temp === null || temp === undefined) return null;
  return Math.round(parseFloat(temp) * 100) / 100;
}

// ==============================
// 📊 Format Functions - Match Python System
// ==============================

/**
 * Format sensor row from readings_raw (latest data)
 * Matches Python format_sensor_row_from_raw()
 */
export function formatSensorRowFromRaw(rawRow, sensorInfo, productBySilo = {}) {
  const temp = rawRow.value_c;
  const product = productBySilo[sensorInfo.silo_id] || null;
  const [state, color] = getStatusColor(temp, product);
  
  return {
    sensor_id: rawRow.sensor_id,
    group_id: sensorInfo.group_id,
    silo_number: sensorInfo.silo_number,
    cable_index: sensorInfo.cable_index,
    level_index: sensorInfo.sensor_index,
    state: state,
    color: normalizeHex(color),
    temperature: roundTemp(temp),
    timestamp: rawRow.polled_at ? new Date(rawRow.polled_at).toISOString() : null
  };
}

/**
 * Format sensor row from readings (reports data)
 * Matches Python format_sensor_row_from_reading()
 */
export function formatSensorRowFromReading(readingRow, sensorInfo, productBySilo = {}) {
  const temp = readingRow.value_c || readingRow.temperature;
  const product = productBySilo[sensorInfo.silo_id] || null;
  const [state, color] = getStatusColor(temp, product);
  
  return {
    sensor_id: readingRow.sensor_id,
    group_id: sensorInfo.group_id,
    silo_number: sensorInfo.silo_number,
    cable_index: sensorInfo.cable_index,
    level_index: sensorInfo.sensor_index,
    state: state,
    color: normalizeHex(color),
    temperature: roundTemp(temp),
    timestamp: readingRow.sampled_at ? new Date(readingRow.sampled_at).toISOString() : 
               (readingRow.timestamp ? new Date(readingRow.timestamp).toISOString() : null)
  };
}

/**
 * Format levels row for silo-level data
 * Matches Python format_levels_row()
 */
export function formatLevelsRow(silo, cableNumber, timestampIso, levelValues, product = null) {
  const row = {
    silo_group: silo.group_name || null,
    silo_number: silo.silo_number,
    cable_number: cableNumber
  };
  
  const states = [];
  
  // Add 8 levels (0-7) with temperatures and colors
  for (let lvl = 0; lvl < 8; lvl++) {
    const temp = levelValues[lvl];
    let state, color;
    
    if (temp === null || temp === undefined) {
      state = 'disconnect';
      color = STATUS_COLORS.disconnect;
    } else {
      [state, color] = getStatusColor(temp, product);
    }
    
    row[`level_${lvl}`] = roundTemp(temp);
    row[`color_${lvl}`] = normalizeHex(color);
    states.push(state);
  }
  
  // Determine worst state for silo_color (disconnect > critical > warn > normal)
  const stateRank = { 'disconnect': 4, 'critical': 3, 'warn': 2, 'normal': 1 };
  const worstState = states.reduce((worst, current) => 
    stateRank[current] > stateRank[worst] ? current : worst, 'normal');
  
  row.silo_color = normalizeHex(STATUS_COLORS[worstState]) || STATUS_COLORS.disconnect;
  row.timestamp = timestampIso;
  
  return row;
}

/**
 * Flatten per-cable rows into per-silo rows
 * Matches Python _flatten_rows_per_silo()
 */
export function flattenRowsPerSilo(perCableRows) {
  const grouped = {};
  
  for (const row of perCableRows) {
    const key = `${row.silo_group || 'null'}_${row.silo_number}_${row.timestamp}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        silo_group: row.silo_group,
        silo_number: row.silo_number,
        timestamp: row.timestamp
      };
      
      // Initialize all levels to null
      for (let i = 0; i < 8; i++) {
        grouped[key][`level_${i}`] = null;
        grouped[key][`color_${i}`] = STATUS_COLORS.disconnect;
      }
    }
    
    // Merge level data from this cable
    for (let i = 0; i < 8; i++) {
      if (row[`level_${i}`] !== null && row[`level_${i}`] !== undefined) {
        grouped[key][`level_${i}`] = row[`level_${i}`];
        grouped[key][`color_${i}`] = row[`color_${i}`];
      }
    }
  }
  
  // Calculate silo_color for each flattened row
  for (const row of Object.values(grouped)) {
    const colors = [];
    for (let i = 0; i < 8; i++) {
      colors.push(row[`color_${i}`]);
    }
    
    // Find worst color
    const colorRank = { 
      [STATUS_COLORS.disconnect]: 4, 
      [STATUS_COLORS.critical]: 3, 
      [STATUS_COLORS.warn]: 2, 
      [STATUS_COLORS.normal]: 1 
    };
    
    const worstColor = colors.reduce((worst, current) => 
      colorRank[current] > colorRank[worst] ? current : worst, STATUS_COLORS.normal);
    
    row.silo_color = normalizeHex(worstColor);
  }
  
  return Object.values(grouped);
}

// ==============================
// 📤 Export Functions
// ==============================
export {
  isDisconnectTemp,
  getStatusColor,
  normalizeHex,
  roundTemp,
  STATUS_COLORS
};
