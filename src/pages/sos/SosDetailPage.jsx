import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSos } from '@/hooks/useSos';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import DetailSkeleton from '@/components/ui/DetailSkeleton';
import styles from './SosDetailPage.module.css';

export default function SosDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alerts, actions, loading } = useSos();
  const [alert, setAlert] = useState(null);
  const [alertActions, setAlertActions] = useState([]);
  const [resolveModal, setResolveModal] = useState(false);
  const [resolveReason, setResolveReason] = useState('');

  useEffect(() => {
    if (!loading && alerts.length > 0) {
      setAlert(alerts.find(a => a.id === id));
      const filtered = actions.filter(a => a.sos_id === id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAlertActions(filtered);
    }
  }, [id, alerts, actions, loading]);

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const getBannerClass = () => {
    if (alert.status === 'active') return styles.bannerActive;
    if (alert.status === 'responding') return styles.bannerResponding;
    return styles.bannerResolved;
  };

  const addActionLog = (actionType, notes) => {
    const now = new Date().toISOString();
    const newAction = {
      id: `sact-${Date.now()}`,
      sos_id: id,
      admin_id: 'adm-001',
      admin: { full_name: 'Current Admin', role: 'ops_admin' },
      action_type: actionType,
      action_notes: notes || null,
      created_at: now,
    };
    setAlertActions(prev => [newAction, ...prev]);
  };

  const handleAcknowledge = () => {
    setAlert(prev => ({ ...prev, status: 'responding', first_responded_by: 'adm-001', first_responded_at: new Date().toISOString() }));
    addActionLog('acknowledged', 'Admin acknowledged the alert and is responding.');
  };

  const handleEscalate = () => {
    addActionLog('escalated', 'Escalated to Super Admin for further action.');
  };

  const handleResolve = () => {
    setAlert(prev => ({ ...prev, status: 'resolved', resolved_by: 'adm-001', resolved_at: new Date().toISOString(), resolution_notes: resolveReason }));
    addActionLog('resolved', resolveReason);
    setResolveModal(false);
    setResolveReason('');
  };

  if (loading) return <DetailSkeleton cards={2} />;
  if (!alert) return <div>Alert not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/sos')}>
          <ArrowLeft size={20} /> Back to Command Centre
        </Button>
      </header>

      <div className={`${styles.banner} ${getBannerClass()}`}>
        <h1 className={styles.bannerTitle}>SOS Alert: {alert.status.toUpperCase()}</h1>
        <p className={styles.bannerSubtitle}>Triggered at {formatDate(alert.triggered_at)}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>User Context</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Triggered By</span>
                <span className={styles.value}>{alert.user?.full_name} ({alert.triggered_by})</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>{alert.user?.phone}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Location</span>
                <span className={styles.value}>{alert.location_address}</span>
              </div>
              {alert.ride && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>Ride Context</span>
                  <span className={styles.value}>
                    Pickup: {alert.ride.pickup_address}<br/>
                    Dropoff: {alert.ride.dropoff_address}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.mapPlaceholder}>
              Map View (Lat: {alert.location_lat}, Lng: {alert.location_lng})
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payload</h2>
            {alert.sos_type === 'voice_recording' ? (
              <div className={styles.payloadBox}>
                <p>Voice Recording ({alert.voice_duration_seconds}s)</p>
                <audio controls src={alert.voice_recording_url} className={styles.audioPlayer}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className={styles.payloadBox}>
                <p><strong>Message:</strong></p>
                <p>{alert.message_text || 'No message provided.'}</p>
              </div>
            )}
          </section>
        </div>

        <div className={styles.sideColumn}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Action Panel</h2>
            <div className={styles.actionsBox}>
              <Button
                variant="primary"
                disabled={alert.status !== 'active'}
                onClick={handleAcknowledge}
              >
                Acknowledge (Responding)
              </Button>
              <Button
                variant="secondary"
                disabled={alert.status === 'resolved'}
                onClick={handleEscalate}
              >
                Escalate to Super Admin
              </Button>
              <Button
                variant="danger"
                disabled={alert.status === 'resolved'}
                onClick={() => setResolveModal(true)}
              >
                Resolve Alert
              </Button>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Action Log</h2>
            <div className={styles.timeline}>
              {alertActions.map(act => (
                <div key={act.id} className={styles.timelineItem}>
                  <div className={styles.timelineTime}>{formatDate(act.created_at)}</div>
                  <div className={styles.timelineTitle}>
                    <strong>{act.admin?.full_name}</strong> {act.action_type.replace(/_/g, ' ')}
                  </div>
                  {act.action_notes && <div className={styles.timelineNotes}>{act.action_notes}</div>}
                </div>
              ))}
              {alertActions.length === 0 && <div className={styles.emptyText}>No actions logged yet.</div>}
            </div>
          </section>
        </div>
      </div>

      {resolveModal && (
        <div className={styles.overlay} onClick={() => { setResolveModal(false); setResolveReason(''); }}>
          <div className={styles.resolveModal} onClick={e => e.stopPropagation()}>
            <h3>Resolve SOS Alert</h3>
            <p>Provide a summary of how this alert was resolved. This will be recorded in the action log.</p>
            <textarea
              className={styles.resolveTextarea}
              placeholder="Resolution details (required)..."
              value={resolveReason}
              onChange={e => setResolveReason(e.target.value)}
              rows={4}
            />
            <div className={styles.resolveActions}>
              <Button variant="ghost" onClick={() => { setResolveModal(false); setResolveReason(''); }}>Cancel</Button>
              <Button variant="danger" disabled={!resolveReason.trim()} onClick={handleResolve}>Confirm Resolve</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
