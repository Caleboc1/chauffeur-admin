import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConnectionTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runTest() {
      try {
        const start = Date.now();
        const { data, error: err } = await supabase.from('admins').select('count');
        const duration = Date.now() - start;

        if (err) throw err;
        setStatus(`Success. Mock data layer returned ${data.length} admins in ${duration}ms.`);
      } catch (err) {
        console.error('Test failed:', err);
        setError(err.message);
        setStatus('Failed');
      }
    }
    runTest();
  }, []);

  return (
    <div style={{ padding: '40px', background: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1>Mock Data Diagnostics</h1>
      <p>Status: <strong>{status}</strong></p>
      {error && <pre style={{ color: 'red', background: '#222', padding: '10px' }}>{error}</pre>}
      <hr />
      <p>External Supabase integration is disabled for this build.</p>
      <button onClick={() => window.location.reload()}>Retry Test</button>
      <p><a href="/login" style={{ color: '#44ff44' }}>Back to Login</a></p>
    </div>
  );
}
