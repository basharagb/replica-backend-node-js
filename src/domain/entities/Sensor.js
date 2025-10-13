export class Sensor {
  constructor({ id, cableId, sensorIndex }) {
    this.id = id;
    this.cableId = cableId;
    this.sensorIndex = sensorIndex; // 0 = bottom, 7 = top
  }

  getLevelLabel() {
    return `Level ${this.sensorIndex}`;
  }
}