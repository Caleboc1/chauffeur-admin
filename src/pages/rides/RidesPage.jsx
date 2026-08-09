import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RIDE_STATUSES } from '@/utils/constants';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import { MapPin, Navigation, Activity, History, MoreVertical } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { adminApi, mapAdminRide } from '@/lib/adminApi';
import styles from './RidesPage.module.css';

export default function RidesPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function loadRides() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listRides({ limit: 100 });
        const mapped = data.map(mapAdminRide);
        const filtered = mapped.filter(ride => {
          if (activeTab === 'live') {
            return !['completed', 'cancelled', 'rejected'].includes(ride.trip_status);
          }
          return ['completed', 'cancelled', 'rejected'].includes(ride.trip_status);
        });
        if (!cancelled) setRides(filtered);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRides();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleMenuClick = (e, ride) => {
    e.stopPropagation();
    if (openMenu === ride.id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, left: Math.max(8, rect.left + rect.width - 160) });
    setOpenMenu(ride.id);
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Date/Time',
      render: (v) => formatDateTime(v),
    },
    {
      key: 'riders',
      label: 'Rider',
      render: (v) => v?.full_name || '—',
    },
    {
      key: 'drivers',
      label: 'Driver',
      render: (v) => v?.full_name || 'Unassigned',
    },
    {
      key: 'pickup_address',
      label: 'Pickup',
      render: (v) => (
        <div className={styles.cellWithIcon}>
          <MapPin size={12} className={styles.pickupIcon} />
          <span className={styles.addressText}>{v}</span>
        </div>
      ),
    },
    {
      key: 'dropoff_address',
      label: 'Dropoff',
      render: (v) => (
        <div className={styles.cellWithIcon}>
          <MapPin size={12} className={styles.dropoffIcon} />
          <span className={styles.addressText}>{v}</span>
        </div>
      ),
    },
    {
      key: 'service_tier',
      label: 'Tier',
      render: (v) => <span className={styles.tierCell}>{v}</span>,
    },
    {
      key: 'trip_status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'fare',
      label: 'Fare',
      render: (v) => v ? formatCurrency(v) : '—',
    },
    {
      key: 'actions',
      label: '',
      width: '3rem',
      render: (_, row) => (
        <button
          className={styles.menuButton}
          onClick={(e) => handleMenuClick(e, row)}
        >
          <MoreVertical size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Ride Monitoring</h1>
          <p className={styles.subtitle}>Real-time tracking and historical trip analysis</p>
        </div>
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'live' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <Activity size={18} />
            Active Queue
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            Trip History
          </button>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        {error && <div>{error}</div>}
        <DataTable
          columns={columns}
          data={rides}
          loading={loading}
          searchPlaceholder="Search by rider, driver or address..."
        />
      </div>

      {openMenu && (
        <div className={styles.dropdownOverlay} onClick={() => setOpenMenu(null)} />
      )}
      {openMenu && (
        <div className={styles.actionDropdown} style={{ top: menuPosition.top, left: menuPosition.left }}>
          <button onClick={() => { navigate(`/rides/${openMenu}`); setOpenMenu(null); }} style={{ justifyContent: 'center', textAlign: 'center' }}>
            View Live Map
          </button>
        </div>
      )}
    </div>
  );
}
