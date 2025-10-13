export const colorMapper = {
  getColorByStatus(status) {
    const map = {
      normal: '#46d446',     // 🟢
      warn: '#c7c150',       // 🟡
      critical: '#d14141',   // 🔴
      disconnect: '#808080'  // ⚫
    };
    return map[status] || '#808080';
  }
};