import { useState, useEffect } from 'react';
import { MOCK_CONTENT_ITEMS } from '@/lib/mockData';

export function useContent() {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContentItems(MOCK_CONTENT_ITEMS);
    setLoading(false);
  }, []);

  return { contentItems, loading };
}
