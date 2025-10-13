export class User {
  constructor({ id, username, role, createdAt }) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.createdAt = createdAt;
  }

  isAdmin() {
    return this.role === 'admin';
  }
}