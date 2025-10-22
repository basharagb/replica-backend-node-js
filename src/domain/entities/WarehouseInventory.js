// Domain Entity: WarehouseInventory
// Represents inventory items stored in warehouse silos

class WarehouseInventory {
  constructor({
    id = null,
    siloId,
    materialTypeId,
    quantity = 0.000,
    reservedQuantity = 0.000,
    availableQuantity = null,
    entryDate = null,
    expiryDate = null,
    batchNumber = null,
    supplier = null,
    qualityGrade = 'A',
    purchasePrice = null,
    notes = null,
    lastUpdated = null
  }) {
    this.id = id;
    this.siloId = siloId;
    this.materialTypeId = materialTypeId;
    this.quantity = quantity;
    this.reservedQuantity = reservedQuantity;
    this.availableQuantity = availableQuantity || (quantity - reservedQuantity);
    this.entryDate = entryDate;
    this.expiryDate = expiryDate;
    this.batchNumber = batchNumber;
    this.supplier = supplier;
    this.qualityGrade = qualityGrade;
    this.purchasePrice = purchasePrice;
    this.notes = notes;
    this.lastUpdated = lastUpdated;
  }

  // Business logic methods
  canReserve(requestedQuantity) {
    return this.availableQuantity >= requestedQuantity;
  }

  reserve(quantity) {
    if (!this.canReserve(quantity)) {
      throw new Error(`Cannot reserve ${quantity} tons. Only ${this.availableQuantity} tons available.`);
    }
    this.reservedQuantity += quantity;
    this.availableQuantity = this.quantity - this.reservedQuantity;
    return this;
  }

  release(quantity) {
    if (quantity > this.reservedQuantity) {
      throw new Error(`Cannot release ${quantity} tons. Only ${this.reservedQuantity} tons reserved.`);
    }
    this.reservedQuantity -= quantity;
    this.availableQuantity = this.quantity - this.reservedQuantity;
    return this;
  }

  addQuantity(quantity) {
    if (quantity <= 0) {
      throw new Error('Quantity to add must be positive');
    }
    this.quantity += quantity;
    this.availableQuantity = this.quantity - this.reservedQuantity;
    return this;
  }

  removeQuantity(quantity) {
    if (quantity <= 0) {
      throw new Error('Quantity to remove must be positive');
    }
    if (quantity > this.availableQuantity) {
      throw new Error(`Cannot remove ${quantity} tons. Only ${this.availableQuantity} tons available.`);
    }
    this.quantity -= quantity;
    this.availableQuantity = this.quantity - this.reservedQuantity;
    return this;
  }

  isExpired() {
    if (!this.expiryDate) return false;
    return new Date() > new Date(this.expiryDate);
  }

  isExpiringSoon(daysThreshold = 30) {
    if (!this.expiryDate) return false;
    const expiryTime = new Date(this.expiryDate).getTime();
    const thresholdTime = new Date().getTime() + (daysThreshold * 24 * 60 * 60 * 1000);
    return expiryTime <= thresholdTime;
  }

  getUtilizationPercentage() {
    if (this.quantity === 0) return 0;
    return ((this.quantity - this.availableQuantity) / this.quantity) * 100;
  }

  toJSON() {
    return {
      id: this.id,
      siloId: this.siloId,
      materialTypeId: this.materialTypeId,
      quantity: this.quantity,
      reservedQuantity: this.reservedQuantity,
      availableQuantity: this.availableQuantity,
      entryDate: this.entryDate,
      expiryDate: this.expiryDate,
      batchNumber: this.batchNumber,
      supplier: this.supplier,
      qualityGrade: this.qualityGrade,
      purchasePrice: this.purchasePrice,
      notes: this.notes,
      lastUpdated: this.lastUpdated,
      isExpired: this.isExpired(),
      isExpiringSoon: this.isExpiringSoon(),
      utilizationPercentage: this.getUtilizationPercentage()
    };
  }
}

export default WarehouseInventory;
