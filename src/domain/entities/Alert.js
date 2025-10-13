export class Alert {
  constructor({
    id,
    siloId,
    levelIndex,
    limitType,
    thresholdC,
    firstSeenAt,
    lastSeenAt,
    status
  }) {
    this.id = id;
    this.siloId = siloId;
    this.levelIndex = levelIndex;
    this.limitType = limitType;
    this.thresholdC = thresholdC;
    this.firstSeenAt = firstSeenAt;
    this.lastSeenAt = lastSeenAt;
    this.status = status;
  }

  isActive() {
    return this.status === 'active';
  }
}