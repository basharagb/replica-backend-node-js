export class AlertLevel {
  static NORMAL = 'normal';
  static WARN = 'warn';
  static CRITICAL = 'critical';
  static DISCONNECT = 'disconnect';

  // 🔍 تحديد الحالة بناءً على درجة الحرارة وحدود المنتج
  static fromTemperature(temp, product) {
    if (temp === null || temp === undefined) return this.DISCONNECT;
    if (temp >= product.tempCritical) return this.CRITICAL;
    if (temp >= product.tempWarn) return this.WARN;
    return this.NORMAL;
  }

  // 🎨 اللون المناسب للحالة
  static color(level) {
    const map = {
      normal: '#46d446',
      warn: '#c7c150',
      critical: '#d14141',
      disconnect: '#808080'
    };
    return map[level] || '#808080';
  }
}