import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatRating, formatDate } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/ActionMenu';
import { User, Wallet, Star, Ban, ShieldAlert } from 'lucide-react';
import { adminApi, mapAdminUser } from '@/lib/adminApi';
import styles from './RidersPage.module.css';

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadRiders() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUsers({ userType: 'user', limit: 100 });
        if (!cancelled) setRiders(data.map(mapAdminUser));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRiders();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { 
      key: 'full_name', 
      label: 'Rider',
      render: (val, row) => (
        <div className={styles.riderCell}>
          <div className={styles.avatar}>{val.charAt(0)}</div>
          <div className={styles.info}>
            <span className={styles.name}>{val}</span>
            <span className={styles.email}>{row.email}</span>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'wallet_balance', 
      label: 'Wallet',
      render: (val) => (
        <div className={styles.walletCell}>
          <Wallet size={14} className={styles.walletIcon} />
          <span>{formatCurrency(val)}</span>
        </div>
      )
    },
    { 
      key: 'rating', 
      label: 'Rating',
      render: (val) => (
        <div className={styles.ratingCell}>
          <Star size={14} className={styles.starIcon} />
          <span>{formatRating(val)}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    { 
      key: 'created_at', 
      label: 'Joined',
      render: (v) => formatDate(v)
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <ActionMenu actions={[
          { label: 'View Profile', onClick: () => navigate(`/riders/${row.id}`) },
        ]} />
      )
    }
  ];

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Rider Directory</h1>
          <p className={styles.subtitle}>Monitor passenger behavior, manage wallet balances, and enforce safety policies</p>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <User size={24} />
          <div>
            <h3>{riders.length}</h3>
            <label>Total Passengers</label>
          </div>
        </div>
        <div className={styles.statBox}>
          <ShieldAlert size={24} className={styles.alertIcon} />
          <div>
            <h3>{riders.filter(r => r.status === 'suspended' || r.status === 'banned').length}</h3>
            <label>Restricted Accounts</label>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {error && <div>{error}</div>}
        <DataTable 
          columns={columns} 
          data={riders} 
          loading={loading}
          onRowClick={(row) => navigate(`/riders/${row.id}`)}
          searchPlaceholder="Search by name, email or phone..."
        />
      </div>
    </div>
  );
}
