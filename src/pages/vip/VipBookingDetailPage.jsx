import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVip } from '@/hooks/useVip';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import styles from './VipBookingDetailPage.module.css';
import { ArrowLeft, Star, Navigation } from 'lucide-react';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

export default function VipBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, vipDrivers, vehicles, loading } = useVip();
  const [driverSearch, setDriverSearch] = useState('');

  const filteredDrivers = useMemo(() => {
    if (!driverSearch.trim()) return vipDrivers.slice(0, 3);
    const q = driverSearch.trim().toLowerCase();
    return vipDrivers.filter(d =>
      d.id.toLowerCase().includes(q) || d.full_name.toLowerCase().includes(q)
    );
  }, [driverSearch, vipDrivers]);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!loading && bookings.length > 0) {
      const found = bookings.find(b => b.id === id);
      setBooking(found);
    }
  }, [id, bookings, loading]);

  if (loading) return <div>Loading booking details...</div>;
  if (!booking) return <div>Booking not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/vip')}>
          <ArrowLeft size={20} /> Back
        </Button>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>VIP Booking {booking.id.slice(0, 8).toUpperCase()}</h1>
          <StatusBadge status={booking.status} label={booking.status} />
        </div>
      </header>

      <div className={styles.grid}>
        {booking.status === 'in_progress' && (
          <section className={styles.mapCard}>
            <div className={styles.mapHeader}>
              <h2 className={styles.sectionTitle}>Live Map View</h2>
            </div>
            <div className={styles.mapPlaceholder}>
              <div className={styles.mapOverlay}>
                <Navigation size={48} className={styles.mapIcon} />
                <h3>Tracking Ride</h3>
                <p className={styles.mapSubtext}>
                  From {booking.pickup_address} to {booking.destination_address}
                </p>
                <div className={styles.mapCoords}>
                  <span>Driver ETA: ~12 min</span>
                  <span>Speed: 38 km/h</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Driver Assignment</h2>
          {booking.driver_id ? (
            <div className={styles.assignedCard}>
              <div>Assigned to: <strong>{booking.driver?.full_name}</strong></div>
              <Button variant="secondary">Reassign Driver</Button>
            </div>
          ) : (
            <div className={styles.unassignedBox}>
              <p className={styles.emptyText}>No driver assigned yet.</p>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by driver ID or name..."
                value={driverSearch}
                onChange={e => setDriverSearch(e.target.value)}
              />
              {filteredDrivers.length > 0 ? (
                <div className={styles.assignmentList}>
                  {filteredDrivers.map(d => (
                    <div key={d.id} className={styles.assignItem}>
                      <div className={styles.driverInfo}>
                        <div className={styles.nameRow}>
                          <span className={styles.driverName}>{d.full_name}</span>
                          <span className={styles.driverRating}>
                            <Star size={14} fill="var(--brand-gold)" color="var(--brand-gold)" />
                            {d.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className={styles.driverId}>{d.id}</span>
                      </div>
                      <Button variant="primary">Assign</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No drivers match your search.</p>
              )}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vehicle Assignment</h2>
          {booking.vehicle_id ? (
            <div className={styles.assignedCard}>
              <div>Vehicle: <strong>{booking.vehicle?.plate_number} ({booking.vehicle?.make} {booking.vehicle?.model})</strong></div>
              <Button variant="secondary">Reassign Vehicle</Button>
            </div>
          ) : (
            <div className={styles.unassignedBox}>
              <p className={styles.emptyText}>No vehicle assigned yet.</p>
              <div className={styles.assignmentList}>
                {vehicles.slice(0, 3).map(v => (
                  <div key={v.id} className={styles.assignItem}>
                    <span>{v.make} {v.model} ({v.plate_number})</span>
                    <Button variant="primary">Assign</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Status Actions</h2>
          <div className={styles.actionsBox}>
            <Button variant="secondary" disabled={booking.status !== 'confirmed'}>Mark In Progress</Button>
            <Button variant="secondary" disabled={booking.status !== 'in_progress'}>Mark Completed</Button>
            <Button variant="danger" disabled={booking.status === 'completed' || booking.status === 'cancelled'}>Cancel Booking</Button>
          </div>
        </section>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Timeline</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineTime}>{formatDate(booking.created_at || new Date().toISOString())}</div>
              <div className={styles.timelineContent}>Booking Created</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
