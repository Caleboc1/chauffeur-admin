import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './KPICard.module.css';

export default function KPICard({ label, value, trend, trendValue, icon: Icon }) {
  const isPositive = trend === 'up';

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
