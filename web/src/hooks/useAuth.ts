import { useGetIdentity, useLogout, useIsAuthenticated } from "@refinedev/core";
import type { User } from "@/types/auth.types";

export function useAuth() {
  const { data: identity, isLoading: identityLoading } = useGetIdentity<User>();
  const { data: authStatus, isLoading: authLoading } = useIsAuthenticated();
  const { mutate: logout } = useLogout();

  return {
    user: identity ?? null,
    isAuthenticated: authStatus?.authenticated ?? false,
    isLoading: identityLoading || authLoading,
    logout: () => logout(),
  };
}
