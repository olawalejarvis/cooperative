import { Organization } from "../entity/Organization";
import { UserRole } from "../entity/User";
import { AuthUser } from "../services/JwtTokenService";


export class UserPermission {
  static canCreateOrganization(user: AuthUser): boolean {
    return UserRole.isRootUser(user.userRole)
  }

  static canDeleteOrganization(user: AuthUser): boolean {
    return UserRole.isRootUser(user.userRole);
  }

  static canUpdateOrganization(user: AuthUser, org?: Organization): boolean {
    if (user.orgId !== org?.id) {
      return UserRole.isRootUser(user.userRole);
    }
    return UserRole.isAdmin(user.userRole)
  }

  static canSearchOrganizations(user: AuthUser, org?: Organization): boolean {
    if (user.orgId !== org?.id) {
      return UserRole.isRootUser(user.userRole);
    }
    return UserRole.isAdmin(user.userRole);
  }

  static canCreateUser(user: AuthUser, org?: Organization): boolean {
    if (user.orgId !== org?.id) {
      return UserRole.isRootUser(user.userRole);
    }
    return UserRole.isAdmin(user.userRole);
  }

  static canDeleteUser(user: AuthUser, org?: Organization): boolean {
    if (user.orgId !== org?.id) {
      return UserRole.isRootUser(user.userRole);
    }
    return UserRole.isAdmin(user.userRole);
  }

  static canCreateTransaction(user: AuthUser, org?: Organization): boolean {
    if (user.orgId !== org?.id) {
      return UserRole.isRootUser(user.userRole);
    }
    return UserRole.isUser(user.userRole);
  }

  static canUpdateTransactionStatus(user: AuthUser, org?: Organization): boolean {
    if (user.orgId !== org?.id) {
      return UserRole.isRootUser(user.userRole);
    }
    return UserRole.isAdmin(user.userRole);
  }
}
