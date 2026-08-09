import { useAuthContext } from '@/context/AuthContext';
import { canAccess } from '@/lib/rbac';

export function useRole() {
  const { role } = useAuthContext();

  const can = (permission) => {
    return canAccess(role, permission);
  };

  return { role, can };
}
