export class Reading {
  constructor({ id, sensorId, hourStart, valueC, sampleAt, polledAt }) {
    this.id = id;
    this.sensorId = sensorId;
    this.hourStart = hourStart;
    this.valueC = valueC;
    // Support both sampleAt (readings table) and polledAt (readings_raw table)
    this.sampleAt = sampleAt;
    this.polledAt = polledAt;
    // Use whichever timestamp is available
    this.timestamp = sampleAt || polledAt;
  }

  getTemperature() {
    return parseFloat(this.valueC);
  }
}