import Skeleton from './Skeleton';
import styles from './DetailSkeleton.module.css';

export default function DetailSkeleton({ cards = 3 }) {
  return (
    <div className={styles.container}>
      <Skeleton width="140px" height="16px" style={{ marginBottom: 24 }} />

      <div className={styles.header}>
        <div>
          <Skeleton width="260px" height="26px" style={{ marginBottom: 10 }} />
          <Skeleton width="180px" height="14px" />
        </div>
        <Skeleton width="120px" height="38px" radius="8px" />
      </div>

      <div className={styles.grid}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton width="45%" height="16px" style={{ marginBottom: 18 }} />
            <Skeleton width="90%" height="12px" style={{ marginBottom: 10 }} />
            <Skeleton width="75%" height="12px" style={{ marginBottom: 10 }} />
            <Skeleton width="85%" height="12px" style={{ marginBottom: 10 }} />
            <Skeleton width="60%" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}
