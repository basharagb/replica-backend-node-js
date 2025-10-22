// Domain Entity: Shipment
// Represents incoming and outgoing shipments

class Shipment {
  constructor({
    id = null,
    shipmentType,
    referenceNumber,
    siloId,
    materialTypeId,
    quantity,
    scheduledDate,
    actualDate = null,
    truckPlate = null,
    driverName = null,
    driverPhone = null,
    supplierCustomer = null,
    status = 'SCHEDULED',
    confirmationCode = null,
    notes = null,
    createdBy = null,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.shipmentType = shipmentType;
    this.referenceNumber = referenceNumber;
    this.siloId = siloId;
    this.materialTypeId = materialTypeId;
    this.quantity = quantity;
    this.scheduledDate = scheduledDate;
    this.actualDate = actualDate;
    this.truckPlate = truckPlate;
    this.driverName = driverName;
    this.driverPhone = driverPhone;
    this.supplierCustomer = supplierCustomer;
    this.status = status;
    this.confirmationCode = confirmationCode;
    this.notes = notes;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Business logic methods
  static generateReferenceNumber(type) {
    const prefix = type === 'INCOMING' ? 'IN' : 'OUT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  static generateConfirmationCode() {
    return Math.floor(Math.random() * 900000 + 100000).toString();
  }

  isIncoming() {
    return this.shipmentType === 'INCOMING';
  }

  isOutgoing() {
    return this.shipmentType === 'OUTGOING';
  }

  canStart() {
    return ['SCHEDULED', 'ARRIVED'].includes(this.status);
  }

  canComplete() {
    return this.status === 'IN_PROGRESS';
  }

  canCancel() {
    return ['SCHEDULED', 'IN_TRANSIT', 'ARRIVED'].includes(this.status);
  }

  start() {
    if (!this.canStart()) {
      throw new Error(`Cannot start shipment with status: ${this.status}`);
    }
    this.status = 'IN_PROGRESS';
    if (!this.actualDate) {
      this.actualDate = new Date();
    }
    return this;
  }

  complete() {
    if (!this.canComplete()) {
      throw new Error(`Cannot complete shipment with status: ${this.status}`);
    }
    this.status = 'COMPLETED';
    if (!this.confirmationCode) {
      this.confirmationCode = Shipment.generateConfirmationCode();
    }
    return this;
  }

  cancel(reason = null) {
    if (!this.canCancel()) {
      throw new Error(`Cannot cancel shipment with status: ${this.status}`);
    }
    this.status = 'CANCELLED';
    if (reason && this.notes) {
      this.notes += `\nCancellation reason: ${reason}`;
    } else if (reason) {
      this.notes = `Cancellation reason: ${reason}`;
    }
    return this;
  }

  isOverdue() {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      return false;
    }
    return new Date() > new Date(this.scheduledDate);
  }

  getDaysUntilScheduled() {
    const now = new Date();
    const scheduled = new Date(this.scheduledDate);
    const diffTime = scheduled - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusColor() {
    const statusColors = {
      'SCHEDULED': '#4ECDC4',
      'IN_TRANSIT': '#FFE66D',
      'ARRIVED': '#A8E6CF',
      'IN_PROGRESS': '#FF8B94',
      'COMPLETED': '#6BCF7F',
      'CANCELLED': '#FF6B6B'
    };
    return statusColors[this.status] || '#95E1D3';
  }

  toJSON() {
    return {
      id: this.id,
      shipmentType: this.shipmentType,
      referenceNumber: this.referenceNumber,
      siloId: this.siloId,
      materialTypeId: this.materialTypeId,
      quantity: this.quantity,
      scheduledDate: this.scheduledDate,
      actualDate: this.actualDate,
      truckPlate: this.truckPlate,
      driverName: this.driverName,
      driverPhone: this.driverPhone,
      supplierCustomer: this.supplierCustomer,
      status: this.status,
      confirmationCode: this.confirmationCode,
      notes: this.notes,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isOverdue: this.isOverdue(),
      daysUntilScheduled: this.getDaysUntilScheduled(),
      statusColor: this.getStatusColor()
    };
  }
}

export default Shipment;
