export class TimestampValue {
  constructor(date) {
    this.date = date ? new Date(date) : new Date();
  }

  // 🕓 الحصول على الوقت كـ ISO string
  toISOString() {
    return this.date.toISOString();
  }

  // ⏱️ تحويل إلى Unix Timestamp
  toUnix() {
    return Math.floor(this.date.getTime() / 1000);
  }

  // 🧠 الفرق بين توقيتين (بالثواني)
  differenceInSeconds(otherTimestamp) {
    const diff = this.date.getTime() - otherTimestamp.date.getTime();
    return Math.floor(diff / 1000);
  }

  // 🕘 قيمة الوقت الحالي
  static now() {
    return new TimestampValue(new Date());
  }
}