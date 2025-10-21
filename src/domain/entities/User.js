export class User {
  constructor({ id, username, email, passwordHash, role, createdAt, updatedAt, isActive }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive !== undefined ? isActive : true;
  }

  isAdmin() {
    return this.role === 'admin';
  }
}