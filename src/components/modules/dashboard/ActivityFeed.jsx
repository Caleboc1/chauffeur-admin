import { formatRelativeTime } from '@/utils/formatters';
import Skeleton from '@/components/ui/Skeleton';
import styles from './ActivityFeed.module.css';

/**
 * Real-time activity feed displaying recent audit logs.
 */
export default function ActivityFeed({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className={styles.feed}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <Skeleton width="80%" height="14px" style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height="12px" />
          </div>
        ))}
      </div>
    );
  }
  if (activities.length === 0) return <div className={styles.empty}>No recent activity.</div>;

  return (
    <div className={styles.feed}>
      <h2 className={styles.title}>Real-time Activity</h2>
      <div className={styles.list}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.item}>
            <div className={styles.indicator} />
            <div className={styles.content}>
              <p className={styles.description}>
                <span className={styles.actor}>{activity.actor_name || 'Admin'}</span>
                {' '}
                {activity.action}
              </p>
              <span className={styles.time}>
                {formatRelativeTime(activity.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
