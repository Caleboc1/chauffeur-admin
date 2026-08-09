import { Clock, Truck, MapPin, Package, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import styles from './RideAnalyticsCard.module.css';

const RIDE_STATES = [
  { key: 'accepted', label: 'Accepted Ride', icon: Clock, variant: 'accepted' },
  { key: 'onTheWay', label: 'On The Way', icon: Truck, variant: 'onTheWay' },
  { key: 'arrived', label: 'Confirm Ride Arrival', icon: MapPin, variant: 'arrived' },
  { key: 'pickup', label: 'Pickup', icon: Package, variant: 'pickup' },
  { key: 'starting', label: 'Starting Ride', icon: PlayCircle, variant: 'starting' },
  { key: 'completed', label: 'Completed Ride', icon: CheckCircle, variant: 'completed' },
  { key: 'cancelled', label: 'Cancelled Ride', icon: XCircle, variant: 'cancelled' },
];

export default function RideAnalyticsCard({ data }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Ride Analytics</h3>
      <div className={styles.list}>
        {RIDE_STATES.map((state) => {
          const count = data[state.key] ?? 0;
          const Icon = state.icon;
          return (
            <div key={state.key} className={styles.row}>
              <div className={styles.rowLeft}>
                <Icon size={20} className={styles.icon} />
                <span className={styles.label}>{state.label}</span>
              </div>
              <span className={`${styles.badge} ${styles[state.variant]}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
