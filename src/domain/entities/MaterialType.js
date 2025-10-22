// Domain Entity: MaterialType
// Represents different types of materials stored in silos

class MaterialType {
  constructor({
    id = null,
    name,
    nameAr,
    description = null,
    iconPath = null,
    colorCode = '#4ECDC4',
    density = 1.000,
    unit = 'tons',
    notes = null,
    isActive = true,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.name = name;
    this.nameAr = nameAr;
    this.description = description;
    this.iconPath = iconPath;
    this.colorCode = colorCode;
    this.density = density;
    this.unit = unit;
    this.notes = notes;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Business logic methods
  isValidDensity() {
    return this.density > 0 && this.density <= 10.0;
  }

  getDisplayName(language = 'en') {
    return language === 'ar' ? this.nameAr : this.name;
  }

  calculateVolume(weight) {
    if (!this.isValidDensity() || weight <= 0) {
      throw new Error('Invalid density or weight for volume calculation');
    }
    return weight / this.density;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      nameAr: this.nameAr,
      description: this.description,
      iconPath: this.iconPath,
      colorCode: this.colorCode,
      density: this.density,
      unit: this.unit,
      notes: this.notes,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default MaterialType;
