export class TemperatureValue {
  constructor(value) {
    this.value = value !== null ? parseFloat(value) : null;
  }

  // ✅ التحقق من صلاحية القيمة
  isValid() {
    return this.value !== null && !isNaN(this.value) && this.value !== -127.0;
  }

  // ⚠️ تحقق من الانقطاع
  isDisconnected() {
    return this.value === null || this.value === -127.0 || isNaN(this.value);
  }

  // 🌡️ الحصول على القيمة بالدرجة المئوية
  toCelsius() {
    return this.isDisconnected() ? null : this.value;
  }

  // 📜 عرض منسق للقيمة
  toString() {
    if (this.isDisconnected()) return 'Disconnected';
    return `${this.value.toFixed(2)} °C`;
  }
}