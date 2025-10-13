export class ReadingRaw {
  constructor({ id, sensorId, valueC, polledAt, pollRunId }) {
    this.id = id;
    this.sensorId = sensorId;
    this.valueC = valueC;
    this.polledAt = polledAt;
    this.pollRunId = pollRunId;
  }
}