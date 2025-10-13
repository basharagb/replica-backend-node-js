export class Reading {
  constructor({ id, sensorId, hourStart, valueC, sampleAt }) {
    this.id = id;
    this.sensorId = sensorId;
    this.hourStart = hourStart;
    this.valueC = valueC;
    this.sampleAt = sampleAt;
  }

  getTemperature() {
    return parseFloat(this.valueC);
  }
}