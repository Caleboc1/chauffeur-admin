import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import KPICard from '@/components/modules/dashboard/KPICard';
import { DollarSign, Percent, TrendingUp, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { adminApi, mapAdminTransaction } from '@/lib/adminApi';
import styles from './EarningsPage.module.css';

import ManualAdjustmentModal from '@/components/modules/earnings/ManualAdjustmentModal';
import ProcessPayoutsModal from '@/components/modules/earnings/ProcessPayoutsModal';

export default function EarningsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    activePayouts: 0
  });
  const [payouts, setPayouts] = useState([]);

  const fetchFinancials = async () => {
    setLoading(true);
    setError('');
    try {
      const [earnings, transactions, payouts] = await Promise.all([
        adminApi.getEarningsAndCommission().catch(() => null),
        adminApi.listTransactions({ limit: 100 }),
        adminApi.listPayouts({ limit: 100 }).catch(() => []),
      ]);
      setStats({
        totalRevenue: Number(
          earnings?.totalRevenue?.total ??
            earnings?.totalRevenue?.current ??
            earnings?.totalEarnings ??
            earnings?.totalDriverEarnings ??
            0,
        ),
        platformCommission: Number(
          earnings?.totalCommission?.total ?? earnings?.totalCommission?.current ?? 0,
        ),
        activePayouts: payouts.filter((p) => !['processed', 'completed', 'paid'].includes(p.status)).length,
      });
      setPayouts(payouts);
      setTransactions(transactions.map(mapAdminTransaction));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const columns = [
    { 
      key: 'created_at', 
      label: 'Date',
      render: (v) => formatDate(v)
    },
    { 
      key: 'rider', 
      label: 'Participant',
      render: (v) => v?.full_name || 'System'
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (v) => <StatusBadge status={v} />
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (v) => (
        <span className={v > 0 ? styles.credit : styles.debit}>
          {v > 0 ? '+' : ''}{formatCurrency(v)}
        </span>
      )
    },
    { 
      key: 'reason', 
      label: 'Reference'
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Earnings & Commission</h1>
          <p className={styles.subtitle}>Track platform revenue, driver payouts, and commission structures</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setIsAdjModalOpen(true)}>Manual Adjustment</Button>
          <Button variant="primary" onClick={() => setIsPayoutModalOpen(true)}>Process Payouts</Button>
          <Button variant="ghost" icon={Download}>Export</Button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <KPICard
          loading={loading}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend="up"
          trendValue={8}
        />
        <KPICard
          loading={loading}
          label="Platform Commission"
          value={formatCurrency(stats.platformCommission)}
          icon={Percent}
          trend="up"
          trendValue={12}
        />
        <KPICard
          loading={loading}
          label="Pending Payouts"
          value={stats.activePayouts}
          icon={TrendingUp}
        />
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>Transaction Ledger</h2>
        </div>
        {error && <div>{error}</div>}
        <DataTable 
          columns={columns} 
          data={transactions} 
          loading={loading}
          searchPlaceholder="Search transactions..."
        />
      </div>
      <ManualAdjustmentModal 
        isOpen={isAdjModalOpen}
        onClose={() => setIsAdjModalOpen(false)}
        onSuccess={fetchFinancials}
        entityId={transactions[0]?.rider_id}
        entityType="rider"
      />
      <ProcessPayoutsModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onSuccess={fetchFinancials}
        payouts={payouts.filter((p) => !['processed', 'completed', 'paid'].includes(p.status))}
      />
    </div>
  );
}
