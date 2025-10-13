export class Silo {
  constructor({ id, siloNumber, groupId, groupIndex, cableCount }) {
    this.id = id;
    this.siloNumber = siloNumber;
    this.groupId = groupId;
    this.groupIndex = groupIndex;
    this.cableCount = cableCount;
  }

  // Example domain behavior
  hasCables() {
    return this.cableCount > 0;
  }
}