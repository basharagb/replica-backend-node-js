export class Cable {
  constructor({ id, siloId, cableIndex, slaveId, channel }) {
    this.id = id;
    this.siloId = siloId;
    this.cableIndex = cableIndex;
    this.slaveId = slaveId;
    this.channel = channel;
  }

  getDisplayName() {
    return `Cable ${this.cableIndex} (Channel ${this.channel})`;
  }
}