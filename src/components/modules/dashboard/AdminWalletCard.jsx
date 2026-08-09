import {
  Wallet, CreditCard, XCircle, BarChart3, Flame
} from 'lucide-react';
import styles from './AdminWalletCard.module.css';

const formatValue = (amount) => {
  const num = amount / 100;
  if (num === 0) return '0';
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(num);
};

const GRID_METRICS = [
  {
    key: 'alreadyWithdrawn',
    label: 'Already Withdraw',
    icon: CreditCard,
    variant: 'withdrawn',
  },
  {
    key: 'pendingWithdraw',
    label: 'Pending Withdraw',
    icon: XCircle,
    variant: 'pending',
  },
  {
    key: 'totalCommission',
    label: 'Total Commission',
    icon: BarChart3,
    variant: 'commission',
  },
  {
    key: 'rejectedWithdraw',
    label: 'Rejected Withdraw',
    icon: Flame,
    variant: 'rejected',
  },
];

export default function AdminWalletCard({ data }) {
  return (
    <div className={styles.card}>
      {/* ── Top Section — Total Earning ──────────────── */}
      <div className={styles.topSection}>
        <span className={styles.cardTitle}>Admin Wallet</span>

        <div className={styles.earningValue}>{formatValue(data.totalEarning)}</div>

        <div className={styles.earningMeta}>
          <div className={styles.earningMetaLeft}>
            <span className={styles.trendBadge}>
              {data.trend}
              <span className={styles.trendArrow}>↑</span>
            </span>
            <span className={styles.earningLabel}>Total Earning</span>
          </div>
          <div className={styles.walletIconBox}>
            <Wallet size={18} />
          </div>
        </div>
      </div>

      {/* ── Bottom Section — Four Metric Cells ────────── */}
      <div className={styles.bottomGrid}>
        {GRID_METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} className={styles.gridCell}>
              <div className={styles.cellContent}>
                <div className={styles.cellValue}>{formatValue(data[m.key])}</div>
                <div className={styles.cellLabel}>{m.label}</div>
              </div>
              <div className={`${styles.cellIcon} ${styles[m.variant]}`}>
                <Icon size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
