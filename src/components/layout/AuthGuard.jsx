import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowTimeoutMessage(true), 10000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-layer-1)',
        color: 'var(--color-neutral-400)',
        gap: 'var(--spacing-4)'
      }}>
        <div className="spinner">Verifying session...</div>
        {showTimeoutMessage && (
          <p style={{ color: 'var(--color-yellow-100)', fontSize: 'var(--typography-body-b-3-fontsize)' }}>
            Connection is taking longer than expected. Please check your internet or Supabase status.
          </p>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
