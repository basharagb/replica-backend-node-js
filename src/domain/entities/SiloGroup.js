export class SiloGroup {
  constructor({ id, name, type }) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  // ✅ Methods related to domain logic can be added here later
  describe() {
    return `${this.name} (${this.type || 'General'})`;
  }
}