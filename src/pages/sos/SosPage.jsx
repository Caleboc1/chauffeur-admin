import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSos } from '@/hooks/useSos';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import { Activity, History, MoreVertical, ShieldAlert } from 'lucide-react';
import styles from './SosPage.module.css';

export default function SosPage() {
  const { alerts, loading } = useSos();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const filtered = alerts.filter(a => {
    if (activeTab === 'active') return a.status === 'active' || a.status === 'responding';
    return a.status === 'resolved';
  });

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const handleMenuClick = (e, alert) => {
    e.stopPropagation();
    if (openMenu === alert.id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, left: Math.max(8, rect.left + rect.width - 160) });
    setOpenMenu(alert.id);
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_, row) => (
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>{row.user?.full_name?.charAt(0) || '?'}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{row.user?.full_name || 'Unknown'}</span>
            <span className={styles.userRole}>{row.triggered_by}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'sos_type',
      label: 'Type',
      render: (v) => (
        <span className={styles.typeCell}>{v.replace('_', ' ').toUpperCase()}</span>
      ),
    },
    {
      key: 'triggered_at',
      label: 'Time',
      render: (v) => formatDate(v),
    },
    {
      key: 'location_address',
      label: 'Location',
      render: (v) => v || 'Unknown',
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <StatusBadge
          status={v === 'active' ? 'sos_active' : v === 'responding' ? 'in_progress' : 'completed'}
          label={v}
        />
      ),
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
          <h1 className={styles.title}>SOS Command Centre</h1>
          <p className={styles.subtitle}>Monitor and respond to emergency alerts</p>
        </div>
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'active' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <Activity size={18} />
            Active & Responding ({alerts.filter(a => a.status === 'active' || a.status === 'responding').length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'resolved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            <History size={18} />
            Resolved ({alerts.filter(a => a.status === 'resolved').length})
          </button>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchPlaceholder="Search by user name, type or location..."
        />
      </div>

      {openMenu && (
        <div className={styles.dropdownOverlay} onClick={() => setOpenMenu(null)} />
      )}
      {openMenu && (
        <div className={styles.actionDropdown} style={{ top: menuPosition.top, left: menuPosition.left }}>
          <button onClick={() => { navigate(`/sos/${openMenu}`); setOpenMenu(null); }} style={{ justifyContent: 'center', textAlign: 'center' }}>
            <ShieldAlert size={14} className={styles.dropdownIcon} />
            Respond
          </button>
        </div>
      )}
    </div>
  );
}
