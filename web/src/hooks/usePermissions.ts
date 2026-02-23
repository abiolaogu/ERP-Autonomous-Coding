import { usePermissions as useRefinePermissions } from "@refinedev/core";

export function usePermissions() {
  const { data: permissions, isLoading } = useRefinePermissions<string[]>();

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    if (!permissions) return false;
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    if (!permissions) return false;
    return perms.every((p) => permissions.includes(p));
  };

  return {
    permissions: permissions ?? [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
