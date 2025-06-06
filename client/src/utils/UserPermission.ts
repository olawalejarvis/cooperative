import { UserRole } from "../store/user";

export class UserPermission {
  static isRootUser(role?: string | null): boolean {
    return role === UserRole.ROOT_USER;
  }

  static isSuperAdmin(role?: string | null): boolean {
    return role === UserRole.SUPER_ADMIN || this.isRootUser(role);
  }
  
  static isAdmin(role?: string | null): boolean {
    return role === UserRole.ADMIN || this.isSuperAdmin(role);
  }

  static isUser(role?: string | null): boolean {
    return role === UserRole.USER || this.isAdmin(role);
  }
}
