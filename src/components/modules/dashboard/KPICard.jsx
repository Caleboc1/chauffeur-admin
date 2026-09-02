import { TrendingUp, TrendingDown } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import styles from './KPICard.module.css';

export default function KPICard({ label, value, trend, trendValue, icon: Icon, loading = false }) {
  const isPositive = trend === 'up';

  if (loading) {
    return (
      <div className={styles.card}>
        <Skeleton width="48px" height="48px" radius="12px" />
        <div className={styles.separator} />
        <div className={styles.body}>
          <Skeleton width="70%" height="24px" style={{ marginBottom: 8 }} />
          <Skeleton width="50%" height="14px" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        {Icon && <Icon size={24} />}
      </div>

      <div className={styles.separator} />

      <div className={styles.body}>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.label}>{label}</p>
        {trendValue && (
          <div className={`${styles.trend} ${isPositive ? styles.up : styles.down}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
