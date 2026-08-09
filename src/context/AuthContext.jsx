import { createContext, useState, useEffect, useContext } from 'react';
import { getAdminSession } from '@/lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const sessionData = await getAdminSession();
      if (isMounted) {
        if (sessionData) {
          setAdmin(sessionData.profile);
          setRole(sessionData.role);
        }
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ admin, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
