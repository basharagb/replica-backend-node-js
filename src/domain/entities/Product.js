export class Product {
  constructor({ id, name, tempNormal, tempWarn, tempCritical }) {
    this.id = id;
    this.name = name;
    this.tempNormal = tempNormal;
    this.tempWarn = tempWarn;
    this.tempCritical = tempCritical;
  }

  getStatus(temp) {
    if (temp === null || temp === undefined) return 'disconnect';
    if (temp >= this.tempCritical) return 'critical';
    if (temp >= this.tempWarn) return 'warn';
    return 'normal';
  }
}