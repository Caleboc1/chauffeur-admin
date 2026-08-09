import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatRating, formatId } from '@/utils/formatters';
import { adminApi, mapAdminRide, mapAdminTransaction, mapAdminUser } from '@/lib/adminApi';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DataTable from '@/components/ui/DataTable';
import { 
  User, 
  Wallet, 
  Calendar, 
  ShieldAlert, 
  Ban, 
  CheckCircle,
  PlusCircle,
  Mail,
  Phone,
  Clock,
  FileText
} from 'lucide-react';
import styles from './RiderDetailPage.module.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'history', label: 'Ride History', icon: Calendar },
  { id: 'wallet', label: 'Wallet Transactions', icon: Wallet },
];

export default function RiderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [rider, setRider] = useState(null);
  const [rides, setRides] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, action: '' });

  useEffect(() => {
    async function fetchRiderData() {
      setLoading(true);
      setError('');
      try {
        const [profile, rideRows, txRows] = await Promise.all([
          adminApi.getUserProfile(id),
          adminApi.listRides({ userId: id, limit: 100 }).catch(() => []),
          adminApi.listTransactions({ userId: id, limit: 100 }).catch(() => []),
        ]);
        const riderData = mapAdminUser(profile);
        
        setRider(riderData);
        setRides(rideRows.map(mapAdminRide));
        setTransactions(txRows.map(mapAdminTransaction));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRiderData();
  }, [id]);

  const handleStatusUpdate = async (newStatus, reason) => {
    try {
      await adminApi.toggleBlockUser(id, { status: newStatus, statusReason: reason });
      setRider(prev => ({ ...prev, status: newStatus }));
      setModal({ open: false, action: '' });
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleWalletAdjustment = async (amount, reason) => {
    try {
      throw new Error('Wallet adjustment endpoint is not available in the admin API docs yet.');
    } catch (err) {
      alert('Adjustment failed: ' + err.message);
    }
  };

  if (loading) return <div>Loading rider profile...</div>;
  if (!rider) return <div>{error || 'Rider not found.'}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            <User size={48} />
          </div>
          <div className={styles.mainInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{rider.full_name}</h1>
              <StatusBadge status={rider.status} />
            </div>
            <div className={styles.meta}>
              <span className={styles.riderId}>ID: {formatId(rider.id, 'rider')}</span>
              <span className={styles.divider}>•</span>
              <span className={styles.rating}>⭐ {formatRating(rider.rating)}</span>
              <span className={styles.divider}>•</span>
              <span className={styles.joined}>Member since {formatDate(rider.created_at)}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button 
            variant="secondary" 
            icon={PlusCircle}
            onClick={() => setModal({ open: true, action: 'wallet' })}
          >
            Adjust Wallet
          </Button>
          
          {rider.status === 'active' ? (
            <Button 
              variant="danger" 
              icon={Ban}
              onClick={() => setModal({ open: true, action: 'suspend' })}
            >
              Suspend Account
            </Button>
          ) : (
            <Button 
              variant="primary" 
              icon={CheckCircle}
              onClick={() => handleStatusUpdate('active', 'Re-activated by admin')}
            >
              Re-activate
            </Button>
          )}
        </div>
      </header>

      <nav className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Identity & Contact</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <FileText size={16} />
                  <div>
                    <label>Rider ID</label>
                    <span>{formatId(rider.id, 'rider')}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <span>{rider.email}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Phone size={16} />
                  <div>
                    <label>Phone</label>
                    <span>{rider.phone}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Clock size={16} />
                  <div>
                    <label>Last Active</label>
                    <span>{rider.last_active_at ? formatDate(rider.last_active_at) : 'Never'}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Financial Summary</h2>
              <div className={styles.statsCard}>
                <div className={styles.stat}>
                  <label>Current Balance</label>
                  <span className={styles.balance}>{formatCurrency(rider.wallet_balance)}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <DataTable 
            columns={[
              { key: 'id', label: 'Ride ID', render: (v) => <code className={styles.code}>{v.slice(0,8)}</code> },
              { key: 'trip_status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              { key: 'pickup_address', label: 'Pickup' },
              { key: 'fare', label: 'Fare', render: (v) => formatCurrency(v) },
              { key: 'created_at', label: 'Date', render: (v) => formatDate(v) }
            ]}
            data={rides}
            emptyMessage="No rides found for this rider."
          />
        )}

        {activeTab === 'wallet' && (
          <DataTable 
            columns={[
              { key: 'type', label: 'Type', render: (v) => <span className={styles.capitalize}>{v.replace('_', ' ')}</span> },
              { key: 'amount', label: 'Amount', render: (v) => (
                <span className={v >= 0 ? styles.positive : styles.negative}>
                  {v >= 0 ? '+' : ''}{formatCurrency(v)}
                </span>
              )},
              { key: 'reason', label: 'Reason' },
              { key: 'created_at', label: 'Timestamp', render: (v) => formatDate(v) }
            ]}
            data={transactions}
            emptyMessage="No transactions recorded."
          />
        )}
      </div>

      <ConfirmModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, action: '' })}
        title={modal.action === 'wallet' ? 'Adjust Wallet Balance' : 'Suspend Account?'}
        message={modal.action === 'wallet' ? 'Enter amount (positive to add, negative to deduct) and a mandatory reason.' : 'This will prevent the rider from booking new rides.'}
        confirmVariant={modal.action === 'wallet' ? 'primary' : 'danger'}
        showInput={modal.action === 'wallet'}
        inputLabel="Amount"
        inputType="number"
        onConfirm={(reason, amount) => {
          if (modal.action === 'wallet') handleWalletAdjustment(amount, reason);
          else handleStatusUpdate('suspended', reason);
        }}
      />
    </div>
  );
}
