import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, fullName, mapAdminRide } from '@/lib/adminApi';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { MapPin, Navigation, ArrowLeft, Clock, User, Car, ShieldAlert } from 'lucide-react';
import styles from './RideDetailPage.module.css';

export default function RideDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadRide() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getRide(id);
        if (!cancelled) setRide(data ? mapAdminRide(data) : null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setRide(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRide();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading ride details...</div>;

  if (!ride) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <ShieldAlert size={48} />
          <h2>Ride Not Found</h2>
          <p>{error || 'The ride you are looking for does not exist or has been removed.'}</p>
          <Button variant="primary" onClick={() => navigate('/rides')}>Back to Rides</Button>
        </div>
      </div>
    );
  }

  const isLive = ['requested', 'accepted', 'arrived', 'progress', 'destination', 'at_stop'].includes(ride.trip_status);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/rides')}>
          <ArrowLeft size={18} />
          <span>Back to Rides</span>
        </button>
        <div className={styles.headerMeta}>
          <StatusBadge status={ride.trip_status} />
          {isLive && <span className={styles.liveBadge}>LIVE</span>}
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.mapSection}>
          <div className={styles.mapPlaceholder}>
            <div className={styles.mapOverlay}>
              <Navigation size={48} className={styles.mapIcon} />
              <h3>Live Map View</h3>
              <p className={styles.mapSubtext}>
                {isLive
                  ? `Tracking ride from ${ride.pickup_address} to ${ride.dropoff_address}`
                  : 'This trip has been completed.'}
              </p>
              {isLive && (
                <div className={styles.mapCoords}>
                  <span>Driver ETA: ~8 min</span>
                  <span>Speed: 42 km/h</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}><Car size={16} /> Trip Details</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Service Tier</label>
                <span className={styles.tier}>{ride.service_tier}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Distance</label>
                <span>{ride.distance_km ? `${ride.distance_km} km` : '—'}</span>
              </div>
              {ride.fare && (
                <div className={styles.infoItem}>
                  <label>Fare</label>
                  <span className={styles.fare}>{formatCurrency(ride.fare)}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <label>Started</label>
                <span>{formatDateTime(ride.created_at)}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}><User size={16} /> Rider</h3>
            <div className={styles.personInfo}>
              <div className={styles.personAvatar}>{fullName(ride.riders)?.charAt(0) || '?'}</div>
              <div>
                <span className={styles.personName}>{fullName(ride.riders) || 'Unknown'}</span>
                <span className={styles.personLabel}>Rider</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}><Car size={16} /> Driver</h3>
            {ride.drivers ? (
              <div className={styles.personInfo}>
                <div className={styles.personAvatar}>{fullName(ride.drivers).charAt(0)}</div>
                <div>
                  <span className={styles.personName}>{fullName(ride.drivers)}</span>
                  <span className={styles.personLabel}>Driver</span>
                </div>
              </div>
            ) : (
              <p className={styles.unassigned}>No driver assigned yet</p>
            )}
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}><MapPin size={16} /> Route</h3>
            <div className={styles.routeList}>
              <div className={styles.routeItem}>
                <div className={`${styles.routeDot} ${styles.pickup}`} />
                <div>
                  <label>Pickup</label>
                  <span>{ride.pickup_address}</span>
                </div>
              </div>
              <div className={styles.routeLine} />
              <div className={styles.routeItem}>
                <div className={`${styles.routeDot} ${styles.dropoff}`} />
                <div>
                  <label>Dropoff</label>
                  <span>{ride.dropoff_address}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
