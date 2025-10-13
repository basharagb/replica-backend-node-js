export const timeHelper = {
  nowISO() {
    return new Date().toISOString();
  },

  normalizeToSecond(date) {
    const dt = new Date(date);
    dt.setMilliseconds(0);
    return dt.toISOString();
  },

  toLocalTime(date) {
    return new Date(date).toLocaleString('en-GB');
  }
};