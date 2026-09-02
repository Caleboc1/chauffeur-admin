import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DRIVER_STATUSES } from '@/utils/constants';
import { MOCK_INSPECTIONS } from '@/utils/mockData';
import { adminApi, mapAdminRating, mapAdminRide, mapAdminUser } from '@/lib/adminApi';
import { formatDate, formatRating, formatId, formatCurrency } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DataTable from '@/components/ui/DataTable';
import { 
  User, 
  Car, 
  FileText, 
  DollarSign, 
  Ban, 
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ClipboardCheck,
  Search,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import DetailSkeleton from '@/components/ui/DetailSkeleton';
import styles from './DriverDetailPage.module.css';

const KYC_DOCUMENT_FIELDS = [
  ['passportImageUrl', 'Passport Photo'],
  ['idFrontImageUrl', 'Government ID Front'],
  ['idBackImageUrl', 'Government ID Back'],
  ['vehicleFrontImageUrl', 'Vehicle Front'],
  ['vehicleBackImageUrl', 'Vehicle Back'],
  ['vehicleInteriorImageUrl', 'Vehicle Interior'],
  ['vehicleDocumentsImageUrl', 'Vehicle Documents'],
  ['vehicleInsuranceCertificateImageUrl', 'Insurance Certificate'],
  ['vehicleLicenseImageUrl', 'Vehicle License'],
  ['proofOfVehicleOwnershipImageUrl', 'Proof of Ownership'],
  ['roadWorthinessCertificateImageUrl', 'Road Worthiness Certificate'],
];

function mapDriverVehicles(driver = {}, kyc = {}) {
  if (driver.vehicle) {
    return [driver.vehicle];
  }

  if (!kyc?.vehicleBrand && !kyc?.vehicleModel && !kyc?.vehiclePlateNumber) {
    return [];
  }

  return [
    {
      id: kyc.id,
      make: kyc.vehicleBrand || '—',
      model: kyc.vehicleModel || kyc.vehicleType || '—',
      year: kyc.vehicleYear || '—',
      plate_number: kyc.vehiclePlateNumber || '—',
      compliance_status: kyc.inspectionStatus || kyc.applicationStatus || kyc.userVerificationStatus || 'pending',
    },
  ];
}

function mapDriverDocuments(kyc = {}) {
  if (!kyc) return [];

  const status = kyc.userVerificationStatus || kyc.status || 'pending';

  return KYC_DOCUMENT_FIELDS.flatMap(([field, label]) => {
    const urls = Array.isArray(kyc[field]) ? kyc[field] : kyc[field] ? [kyc[field]] : [];

    return urls.map((url, index) => ({
      id: `${field}-${index}`,
      document_type: label,
      storage_url: url,
      status,
    }));
  });
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'rides', label: 'Ride History', icon: Calendar },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

export default function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [rides, setRides] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, action: '' });

  useEffect(() => {
    async function fetchDriverData() {
      setLoading(true);
      setError('');
      try {
        const [profile, rideRows, earningsData, kycRows, reviewRows] = await Promise.all([
          adminApi.getUserProfile(id),
          adminApi.listRides({ driverId: id, limit: 100 }).catch(() => []),
          apiSafeDriverEarnings(id),
          adminApi.listUserKyc({ userId: id, limit: 20 }).catch(() => []),
          adminApi.listRatings({ participantId: id, limit: 100 }).catch(() => []),
        ]);
        const driverData = mapAdminUser(profile);
        const kyc = kycRows[0] || null;
        
        setDriver(driverData);
        const vehicleData = mapDriverVehicles(driverData, kyc);

        setVehicles(vehicleData || []);
        setRides(rideRows.map(mapAdminRide));
        setReviews(reviewRows.map(mapAdminRating));
        setDocuments(mapDriverDocuments(kyc));
        setEarnings(earningsData || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDriverData();
  }, [id]);

  async function apiSafeDriverEarnings(driverId) {
    try {
      return await adminApi.getUserDriverEarnings?.(driverId);
    } catch {
      return null;
    }
  }

  const handleReviewAction = async (reviewId, newStatus) => {
    try {
      await adminApi.updateRating(reviewId, { isPublished: newStatus === 'approved' });
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, status: newStatus, reviewed_at: new Date().toISOString() } : r
      ));
    } catch (err) {
      alert('Review update failed: ' + err.message);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const handleStatusUpdate = async (newStatus, reason) => {
    try {
      await adminApi.toggleBlockUser(id, { status: newStatus, statusReason: reason });
      setDriver(prev => ({ ...prev, status: newStatus }));
      setModal({ open: false, action: '' });
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  if (loading) return <DetailSkeleton cards={3} />;
  if (!driver) return <div>{error || 'Driver not found.'}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {driver.selfie_url ? (
              <img src={driver.selfie_url} alt={driver.full_name} className={styles.selfie} />
            ) : (
              <User size={48} />
            )}
          </div>
          <div className={styles.mainInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{driver.full_name}</h1>
              <StatusBadge status={driver.status} />
            </div>
            <div className={styles.meta}>
              <span className={styles.driverId}>ID: {formatId(driver.id, 'driver')}</span>
              <span className={styles.divider}>•</span>
              <span className={styles.rating}>⭐ {formatRating(driver.rating)}</span>
              <span className={styles.divider}>•</span>
              <span className={styles.joined}>Joined {formatDate(driver.created_at)}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {driver.status === DRIVER_STATUSES.ACTIVE ? (
            <Button 
              variant="danger" 
              icon={Ban}
              onClick={() => setModal({ open: true, action: 'suspend' })}
            >
              Suspend Driver
            </Button>
          ) : (
            <Button 
              variant="primary" 
              icon={CheckCircle}
              onClick={() => handleStatusUpdate(DRIVER_STATUSES.ACTIVE, 'Re-activated by admin')}
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
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <span>{driver.email}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Phone size={16} />
                  <div>
                    <label>Phone</label>
                    <span>{driver.phone}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <MapPin size={16} />
                  <div>
                    <label>Residential Address</label>
                    <span>{driver.residential_address || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Compliance & ID</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <FileText size={16} />
                  <div>
                    <label>Driver ID</label>
                    <span>{formatId(driver.id, 'driver')}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <FileText size={16} />
                  <div>
                    <label>Government ID Number</label>
                    <span>{driver.government_id_number || 'Not provided'}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <User size={16} />
                  <div>
                    <label>Face Match Status</label>
                    <StatusBadge status={driver.face_match_status || 'pending'} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <DataTable 
            columns={[
              { key: 'make', label: 'Make' },
              { key: 'model', label: 'Model' },
              { key: 'year', label: 'Year' },
              { key: 'plate_number', label: 'Plate Number' },
              { key: 'compliance_status', label: 'Compliance', render: (v) => <StatusBadge status={v} /> }
            ]}
            data={vehicles}
            emptyMessage="No vehicles registered."
          />
        )}

        {activeTab === 'rides' && (
          <DataTable 
            columns={[
              { key: 'id', label: 'Ride ID', render: (v) => <code className={styles.code}>{v.slice(0,8)}</code> },
              { key: 'trip_status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              { key: 'service_tier', label: 'Tier' },
              { key: 'fare', label: 'Fare', render: (v) => `$${v?.toFixed(2)}` },
              { key: 'created_at', label: 'Date', render: (v) => formatDate(v) }
            ]}
            data={rides}
            emptyMessage="No ride history found."
          />
        )}

        {activeTab === 'earnings' && (
          <div className={styles.tabSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Earnings Overview</h2>
            </div>
            {earnings ? (
              <div className={styles.earningsGrid}>
                <div className={styles.earningsCard}>
                  <label>Completed Rides</label>
                  <span className={styles.earningsValue}>{earnings.completed_rides}</span>
                </div>
                <div className={styles.earningsCard}>
                  <label>Gross Earnings</label>
                  <span className={styles.earningsValue}>{formatCurrency(earnings.gross_earnings)}</span>
                </div>
                <div className={styles.earningsCard}>
                  <label>Commission ({earnings.commission_rate}%)</label>
                  <span className={styles.earningsValueCommission}>-{formatCurrency(earnings.commission_deducted)}</span>
                </div>
                <div className={styles.earningsCard}>
                  <label>Net Payout</label>
                  <span className={styles.earningsValueNet}>{formatCurrency(earnings.net_payout)}</span>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>No earnings data available for this driver.</div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={styles.documentsGrid}>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className={styles.documentCard}>
                  <div className={styles.docInfo}>
                    <FileText size={24} />
                    <div>
                      <h3 className={styles.docType}>{doc.document_type}</h3>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                  <div className={styles.docActions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.storage_url, '_blank', 'noopener,noreferrer')}
                    >
                      View Doc
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No documents uploaded for this driver.</div>
            )}
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className={styles.tabSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Physical Inspections</h2>
              <Button variant="primary" size="sm" icon={Search}>Schedule Inspection</Button>
            </div>
            <DataTable 
              columns={[
                { key: 'scheduled_at', label: 'Date', render: (v) => formatDate(v) },
                { key: 'location', label: 'Location' },
                { key: 'result', label: 'Outcome', render: (v) => <StatusBadge status={v} /> },
                { key: 'inspector_notes', label: 'Notes' }
              ]}
              data={MOCK_INSPECTIONS.filter(i => i.driver_id === id)} // Render mock inspections
              emptyMessage="No inspections scheduled yet."
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.tabSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Driver Reviews</h2>
              <div className={styles.reviewStats}>
                <span className={styles.reviewStat}><strong>{reviews.length}</strong> Total</span>
                <span className={styles.reviewStat}><strong>{reviews.filter(r => r.status === 'pending').length}</strong> Pending</span>
                <span className={styles.reviewStatApproved}><strong>{reviews.filter(r => r.status === 'approved').length}</strong> Published</span>
                <span className={styles.reviewStatRejected}><strong>{reviews.filter(r => r.status === 'rejected').length}</strong> Rejected</span>
              </div>
            </div>
            {reviews.length === 0 ? (
              <div className={styles.emptyState}>No reviews yet for this driver.</div>
            ) : (
              <div className={styles.reviewsList}>
                {[...reviews]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map(review => (
                    <div key={review.id} className={`${styles.reviewCard} ${styles[`review${review.status.charAt(0).toUpperCase() + review.status.slice(1)}`]}`}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewRider}>
                          <div className={styles.reviewAvatar}>{review.rider_name.charAt(0)}</div>
                          <div>
                            <span className={styles.reviewRiderName}>{review.rider_name}</span>
                            <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
                          </div>
                        </div>
                        <div className={styles.reviewMeta}>
                          <StatusBadge status={review.status === 'approved' ? 'active' : review.status === 'rejected' ? 'rejected' : 'pending'} label={review.status === 'approved' ? 'Published' : review.status === 'rejected' ? 'Rejected' : 'Pending Review'} />
                          <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                      <p className={styles.reviewComment}>"{review.comment}"</p>
                      {review.status === 'pending' && (
                        <div className={styles.reviewActions}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={ThumbsUp}
                            onClick={() => handleReviewAction(review.id, 'approved')}
                          >
                            Approve & Publish
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={ThumbsDown}
                            onClick={() => handleReviewAction(review.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, action: '' })}
        title="Suspend Driver Account?"
        message="This will prevent the driver from accepting new rides. A reason is required."
        confirmVariant="danger"
        onConfirm={(reason) => handleStatusUpdate(DRIVER_STATUSES.SUSPENDED, reason)}
      />
    </div>
  );
}
