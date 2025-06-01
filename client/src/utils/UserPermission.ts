// src/utils/UserRole.ts

export const UserRole = {
  ROOT_USER: 'root_user',
  ADMIN: 'admin',
  USER: 'user',
  SUPER_ADMIN: 'superadmin'
  // Add other roles as needed
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

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
