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
 * Get the worst color from an array of colors
 * Matches Python _worst_color_from_row() logic
 */
function getWorstColor(colors) {
  if (!colors || colors.length === 0) return STATUS_COLORS.disconnect;
  
  const colorRank = {
    [STATUS_COLORS.disconnect]: 4,
    [STATUS_COLORS.critical]: 3, 
    [STATUS_COLORS.warn]: 2,
    [STATUS_COLORS.normal]: 1
  };
  
  return colors.reduce((worst, current) => {
    const currentRank = colorRank[current] || 0;
    const worstRank = colorRank[worst] || 0;
    return currentRank > worstRank ? current : worst;
  }, STATUS_COLORS.normal);
}

/**
 * Flatten per-cable rows into per-silo rows with detailed cable information
 * Matches Python _flatten_rows_per_silo() exactly
 */
export function flattenRowsPerSilo(perCableRows) {
  const grouped = {};
  
  for (const row of perCableRows) {
    const sg = row.silo_group;
    const sn = row.silo_number;
    const ts = row.timestamp;
    const cn = row.cable_number;
    const key = `${sg || 'null'}_${sn}_${ts}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        silo_group: sg,
        silo_number: sn,
        cable_count: 0,
        timestamp: ts
      };
    }
    
    // Track max cable index seen (0-based)
    if (typeof cn === 'number') {
      grouped[key].cable_count = Math.max(grouped[key].cable_count, cn + 1);
    }
    
    // Copy levels/colors from this cable row into the flat row
    for (let lvl = 0; lvl < 8; lvl++) {
      const lvKey = `level_${lvl}`;
      const clKey = `color_${lvl}`;
      grouped[key][`cable_${cn}_${lvKey}`] = row[lvKey];
      grouped[key][`cable_${cn}_${clKey}`] = row[clKey];
    }
  }
  
  // Finalize: compute worst color in each flat row
  const out = [];
  for (const g of Object.values(grouped)) {
    // Find worst color from all cable colors
    const allColors = [];
    for (let cable = 0; cable < g.cable_count; cable++) {
      for (let level = 0; level < 8; level++) {
        const color = g[`cable_${cable}_color_${level}`];
        if (color) allColors.push(color);
      }
    }
    g.silo_color = getWorstColor(allColors);
    out.push(g);
  }
  
  // Sort by silo_number then timestamp
  return out.sort((a, b) => {
    if (a.silo_number !== b.silo_number) return a.silo_number - b.silo_number;
    return (a.timestamp || '').localeCompare(b.timestamp || '');
  });
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
