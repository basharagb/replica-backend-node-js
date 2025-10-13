export class StatusColor {
  constructor({ id, status, colorHex, priority }) {
    this.id = id;
    this.status = status;
    this.colorHex = colorHex;
    this.priority = priority;
  }

  static defaultColors() {
    return {
      normal: '#46d446',
      warn: '#c7c150',
      critical: '#d14141',
      disconnect: '#808080',
    };
  }
}