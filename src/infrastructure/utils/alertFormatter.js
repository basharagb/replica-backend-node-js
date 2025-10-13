// ==============================
// 📦 Alert Formatter Utility
// ==============================
// Formats alerts to match the old Python system structure exactly

import { getStatusColor } from './colorMapper.js';

// ==============================
// 🎨 Color and Status Utilities
// ==============================
const STATUS_COLORS = {
  normal: '#46d446',
  warn: '#c7c150', 
  critical: '#d14141',
  disconnect: '#8c9494'
};

const normalizeHex = (color) => {
  if (!color) return '#ffffff';
  return color.toLowerCase();
};

const getColorForState = (state) => {
  return STATUS_COLORS[state] || '#ffffff';
};

const worstStateColor = (states) => {
  const stateRank = { disconnect: 4, critical: 3, warn: 2, normal: 1 };
  
  let worstState = 'normal';
  let worstRank = 0;
  
  for (const state of states) {
    const rank = stateRank[state] || 0;
    if (rank > worstRank) {
      worstRank = rank;
      worstState = state;
    }
  }
  
  return [worstState, getColorForState(worstState)];
};

// ==============================
// 🏗️ Format Levels Row (matches Python format_levels_row)
// ==============================
export const formatLevelsRow = (silo, cableNumber, timestampIso, levelValues, product) => {
  const row = {};
  
  // Basic silo info
  row.silo_group = silo.siloGroupName || null;
  row.silo_number = silo.siloNumber;
  row.cable_number = cableNumber;
  
  const states = [];
  
  // Format each level (0-7)
  for (let lvl = 0; lvl < 8; lvl++) {
    const temp = levelValues[lvl];
    
    let state, color;
    
    if (temp === null || temp === undefined) {
      // Treat missing reading as disconnect
      state = 'disconnect';
      color = getColorForState('disconnect');
    } else if (temp === -127.0) {
      // Explicit disconnect detection
      state = 'disconnect';
      color = getColorForState('disconnect');
    } else {
      // Normal threshold-based coloring
      const statusResult = getStatusColor(temp, product);
      state = statusResult.status;
      color = statusResult.color;
    }
    
    row[`level_${lvl}`] = temp !== null ? Math.round(temp * 100) / 100 : null;
    row[`color_${lvl}`] = normalizeHex(color);
    states.push(state);
  }
  
  // Set overall silo color to worst state
  const [, siloColor] = worstStateColor(states);
  row.silo_color = normalizeHex(siloColor) || getColorForState('disconnect');
  row.timestamp = timestampIso;
  
  return row;
};

// ==============================
// 🚨 Format Alert Response (matches Python alerts/active structure)
// ==============================
export const formatAlertResponse = (alert, levelValues, product) => {
  const timestampAnchor = alert.lastSeenAt || alert.firstSeenAt || new Date();
  const timestampIso = timestampAnchor.toISOString().replace(/\.\d{3}Z$/, '');
  
  // Create silo object for formatting
  const siloObj = {
    siloNumber: alert.siloNumber,
    siloGroupName: alert.siloGroupName
  };
  
  // Use the common formatter for consistency
  const row = formatLevelsRow(
    siloObj,
    null, // cable_number = null for alerts (averaged across cables)
    timestampIso,
    levelValues,
    product
  );
  
  // Add alert-specific metadata
  let affectedLevels = null;
  if (alert.levelIndex !== null && alert.levelIndex !== undefined) {
    affectedLevels = [parseInt(alert.levelIndex)];
  } else if (alert.levelMask) {
    const mask = parseInt(alert.levelMask);
    affectedLevels = [];
    for (let i = 0; i < 8; i++) {
      if (mask & (1 << i)) {
        affectedLevels.push(i);
      }
    }
    if (affectedLevels.length === 0) {
      affectedLevels = null;
    }
  }
  
  row.alert_type = alert.limitType;
  row.affected_levels = affectedLevels;
  row.active_since = alert.firstSeenAt ? 
    alert.firstSeenAt.toISOString().replace(/\.\d{3}Z$/, '') : null;
  
  return row;
};

// ==============================
// 📄 Format Paginated Response
// ==============================
export const formatPaginatedResponse = (data, pagination, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    pagination: {
      current_page: pagination.page,
      per_page: pagination.limit,
      total_items: pagination.total,
      total_pages: pagination.totalPages,
      has_next_page: pagination.hasNext,
      has_previous_page: pagination.hasPrev
    }
  };
};
