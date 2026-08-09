import { useAuthContext } from '@/context/AuthContext';
import { signOut as authSignOut } from '@/lib/auth';

export function useAuth() {
  const { admin, role, loading } = useAuthContext();

  const signOut = async () => {
    await authSignOut();
    window.location.href = '/login';
  };

  return { 
    admin, 
    role, 
    loading, 
    isAuthenticated: !!admin,
    signOut 
  };
}
