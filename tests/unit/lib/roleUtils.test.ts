import { hasRole, isAdmin, isModerator, validateRoleChange, ROLES, Role } from "@/lib/roleUtils";
import { User } from "@clerk/nextjs/server";

describe("roleUtils", () => {
  // Helper function to create a mock Clerk User object
  const createMockUser = (role: Role | undefined, userId: string = "user_123"): User => {
    return {
      id: userId,
      publicMetadata: { role: role },
      // Add other necessary User properties if they are used by the functions
      // For these tests, only id and publicMetadata.role are relevant
    } as User;
  };

  describe("hasRole", () => {
    it("should return true if user has the specified role", () => {
      const user = createMockUser(ROLES.ADMIN);
      expect(hasRole(user, ROLES.ADMIN)).toBe(true);
    });

    it("should return false if user does not have the specified role", () => {
      const user = createMockUser(ROLES.USER);
      expect(hasRole(user, ROLES.ADMIN)).toBe(false);
    });

    it("should return false if user has no role", () => {
      const user = createMockUser(undefined);
      expect(hasRole(user, ROLES.ADMIN)).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true if user is an admin", () => {
      const user = createMockUser(ROLES.ADMIN);
      expect(isAdmin(user)).toBe(true);
    });

    it("should return false if user is not an admin", () => {
      const user = createMockUser(ROLES.USER);
      expect(isAdmin(user)).toBe(false);
    });

    it("should return false if user has no role", () => {
      const user = createMockUser(undefined);
      expect(isAdmin(user)).toBe(false);
    });
  });

  describe("isModerator", () => {
    it("should return true if user is a moderator", () => {
      const user = createMockUser(ROLES.MODERATOR);
      expect(isModerator(user)).toBe(true);
    });

    it("should return true if user is an admin (moderator or higher)", () => {
      const user = createMockUser(ROLES.ADMIN);
      expect(isModerator(user)).toBe(true);
    });

    it("should return false if user is a regular user", () => {
      const user = createMockUser(ROLES.USER);
      expect(isModerator(user)).toBe(false);
    });

    it("should return false if user has no role", () => {
      const user = createMockUser(undefined);
      expect(isModerator(user)).toBe(false);
    });
  });

  describe("validateRoleChange", () => {
    const currentUserId = "current_user_id";
    const targetUserId = "target_user_id";

    // Test case: Cannot remove admin role from yourself
    it("should not allow an admin to remove their own admin role", () => {
      const result = validateRoleChange(
        ROLES.ADMIN,
        ROLES.USER,
        currentUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: false,
        message: "Cannot remove admin role from yourself",
      });
    });

    it("should allow an admin to change their own role to admin", () => {
      const result = validateRoleChange(
        ROLES.ADMIN,
        ROLES.ADMIN,
        currentUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: true,
      });
    });

    // Test case: Only admins can assign admin roles
    it("should not allow a moderator to assign an admin role", () => {
      const result = validateRoleChange(
        ROLES.MODERATOR,
        ROLES.ADMIN,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: false,
        message: "Only administrators can assign admin roles",
      });
    });

    it("should not allow a regular user to assign an admin role", () => {
      const result = validateRoleChange(
        ROLES.USER,
        ROLES.ADMIN,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: false,
        message: "Only administrators can assign admin roles",
      });
    });

    it("should allow an admin to assign an admin role", () => {
      const result = validateRoleChange(
        ROLES.ADMIN,
        ROLES.ADMIN,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: true,
      });
    });

    // Test case: Only admins can assign moderator roles
    it("should not allow a regular user to assign a moderator role", () => {
      const result = validateRoleChange(
        ROLES.USER,
        ROLES.MODERATOR,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: false,
        message: "Only administrators can assign moderator roles",
      });
    });

    it("should allow an admin to assign a moderator role", () => {
      const result = validateRoleChange(
        ROLES.ADMIN,
        ROLES.MODERATOR,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: true,
      });
    });

    // Test case: Valid role changes
    it("should allow an admin to change a user's role to user", () => {
      const result = validateRoleChange(
        ROLES.ADMIN,
        ROLES.USER,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: true,
      });
    });

    it("should allow a moderator to change a user's role to user", () => {
      const result = validateRoleChange(
        ROLES.MODERATOR,
        ROLES.USER,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: true,
      });
    });

    it("should allow a user to change a user's role to user (if not self and not admin/moderator)", () => {
      const result = validateRoleChange(
        ROLES.USER,
        ROLES.USER,
        targetUserId,
        currentUserId
      );
      expect(result).toEqual({
        allowed: true,
      });
    });
  });
});
