// ==============================
// 🎨 Color Mapping Utilities
// ==============================

// Temperature thresholds (can be customized per product)
const DEFAULT_THRESHOLDS = {
  normal_max: 25.0,
  warn_max: 35.0,
  critical_max: 45.0
};

const STATUS_COLORS = {
  normal: '#46d446',     // 🟢 Green
  warn: '#c7c150',       // 🟡 Yellow  
  critical: '#d14141',   // 🔴 Red
  disconnect: '#8c9494'  // ⚫ Gray (matches old system)
};

export const colorMapper = {
  getColorByStatus(status) {
    return STATUS_COLORS[status] || STATUS_COLORS.disconnect;
  }
};

// ==============================
// 🌡️ Temperature Status Evaluation
// ==============================
export const getStatusColor = (temperature, product = null) => {
  // Handle disconnect cases
  if (temperature === null || temperature === undefined || temperature === -127.0) {
    return {
      status: 'disconnect',
      color: STATUS_COLORS.disconnect
    };
  }
  
  // Use product-specific thresholds if available, otherwise use defaults
  const thresholds = product?.thresholds || DEFAULT_THRESHOLDS;
  
  let status;
  if (temperature <= thresholds.normal_max) {
    status = 'normal';
  } else if (temperature <= thresholds.warn_max) {
    status = 'warn';
  } else {
    status = 'critical';
  }
  
  return {
    status,
    color: STATUS_COLORS[status]
  };
};

// ==============================
// 📊 Status Priority Ranking
// ==============================
export const getWorstStatus = (statuses) => {
  const priority = { disconnect: 4, critical: 3, warn: 2, normal: 1 };
  
  let worstStatus = 'normal';
  let highestPriority = 0;
  
  for (const status of statuses) {
    const currentPriority = priority[status] || 0;
    if (currentPriority > highestPriority) {
      highestPriority = currentPriority;
      worstStatus = status;
    }
  }
  
  return worstStatus;
};