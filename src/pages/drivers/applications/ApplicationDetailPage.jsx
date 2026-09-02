import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APPLICATION_STATES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  FileText,
  Car,
  User,
  ArrowLeft,
  Eye
} from 'lucide-react';
import DetailSkeleton from '@/components/ui/DetailSkeleton';
import styles from './ApplicationDetailPage.module.css';

import { adminApi, mapAdminKyc } from '@/lib/adminApi';

const DOCUMENT_FIELDS = [
  { key: 'idFrontImageUrl', label: 'Government ID (Front)' },
  { key: 'idBackImageUrl', label: 'Government ID (Back)' },
  { key: 'passportImageUrl', label: 'Passport Photograph' },
  { key: 'vehicleFrontImageUrl', label: 'Vehicle (Front)' },
  { key: 'vehicleBackImageUrl', label: 'Vehicle (Back)' },
  { key: 'vehicleInteriorImageUrl', label: 'Vehicle (Interior)' },
  { key: 'vehicleDocumentsImageUrl', label: 'Vehicle Documents' },
  { key: 'vehicleInsuranceCertificateImageUrl', label: 'Insurance Certificate' },
  { key: 'vehicleLicenseImageUrl', label: 'Vehicle License' },
  { key: 'proofOfVehicleOwnershipImageUrl', label: 'Proof of Vehicle Ownership' },
  { key: 'roadWorthinessCertificateImageUrl', label: 'Roadworthiness Certificate' },
];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', data: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const kyc = await adminApi.getUserKyc(id);
        const profile = await adminApi.getUserProfile(kyc.userId).catch(() => null);
        if (cancelled) return;
        setApplication(mapAdminKyc({ ...kyc, user: profile }));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleUpdateStatus = async (newState, reason = '') => {
    const status = newState === APPLICATION_STATES.APPROVED ? 'approved' : 'rejected';

    const updated = await adminApi.processUserKyc(id, {
      status,
      userVerificationStatus: status,
      reason,
      userVerificationStatusReason: reason,
    });

    const profile = await adminApi.getUserProfile(application.userId).catch(() => null);
    const confirmedStatus = profile?.userVerificationStatus || updated?.userVerificationStatus || updated?.status;

    if (confirmedStatus !== status) {
      throw new Error(
        'The backend did not confirm this status change. Nothing was saved - please check with the backend team before retrying.',
      );
    }

    setApplication((prev) => ({ ...prev, state: status, applicationStatus: status, rejection_reason: reason }));
  };

  const cannotBeDecided = application?.state === APPLICATION_STATES.APPROVED || application?.state === APPLICATION_STATES.REJECTED;
  const canDecide = !cannotBeDecided;

  if (loading) return <DetailSkeleton cards={2} />;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!application) return <div className={styles.error}>Application not found.</div>;

  const documents = DOCUMENT_FIELDS
    .map((doc) => ({ ...doc, url: Array.isArray(application[doc.key]) ? application[doc.key][0] : application[doc.key] }))
    .filter((doc) => doc.url);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/drivers/applications')}>
          <ArrowLeft size={18} />
          <span>Back to Applications</span>
        </button>
        <div className={styles.headerMain}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Application Review</h1>
              <StatusBadge status={application.state} />
            </div>
            <div className={styles.meta}>
              <span className={styles.appId}>ID: {id.slice(0, 8)}</span>
              <span className={styles.dot}>&bull;</span>
              <span className={styles.date}>Submitted {formatDateTime(application.applicationDate)}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="primary"
              disabled={!canDecide}
              onClick={() => setModal({ open: true, type: APPLICATION_STATES.APPROVED })}
            >
              Approve Driver
            </Button>
            <Button
              variant="danger"
              disabled={!canDecide}
              onClick={() => setModal({ open: true, type: APPLICATION_STATES.REJECTED })}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}><User size={18} /> Personal Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.field}>
                <label>Full Name</label>
                <span>{application.driverName}</span>
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <span>{application.driverEmail}</span>
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <span>{application.driverPhone}</span>
              </div>
              <div className={styles.field}>
                <label>ID Type</label>
                <span>{application.idType || 'Not provided'}</span>
              </div>
              <div className={styles.field}>
                <label>ID Number</label>
                <span>{application.idNumber || 'Not provided'}</span>
              </div>
              <div className={styles.field}>
                <label>Location</label>
                <span>{[application.city, application.lga, application.country].filter(Boolean).join(', ') || 'Not provided'}</span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}><Car size={18} /> Vehicle Information</h3>
            {application.vehiclePlateNumber && application.vehiclePlateNumber !== '—' ? (
              <div className={styles.infoGrid}>
                <div className={styles.field}>
                  <label>Type</label>
                  <span>{application.vehicleType}</span>
                </div>
                <div className={styles.field}>
                  <label>Make & Model</label>
                  <span>{application.vehicleBrand} {application.vehicleModel}</span>
                </div>
                <div className={styles.field}>
                  <label>Plate Number</label>
                  <span>{application.vehiclePlateNumber}</span>
                </div>
              </div>
            ) : (
              <p className={styles.empty}>No vehicle information provided.</p>
            )}
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}><FileText size={18} /> Submitted Documents</h3>
            <div className={styles.docList}>
              {documents.length === 0 ? (
                <p className={styles.empty}>No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.key} className={styles.docItem}>
                    <div className={styles.docMain}>
                      <FileText size={20} className={styles.docIcon} />
                      <div className={styles.docInfo}>
                        <span className={styles.docName}>{doc.label}</span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button className={styles.docActionBtn} onClick={() => window.open(doc.url, '_blank')} title="View document">
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.open && (modal.type === APPLICATION_STATES.APPROVED || modal.type === APPLICATION_STATES.REJECTED)}
        onClose={() => setModal({ open: false, type: '', data: null })}
        title={modal.type === APPLICATION_STATES.APPROVED ? 'Approve Driver?' : 'Reject Driver?'}
        message={modal.type === APPLICATION_STATES.APPROVED ? 'This will activate the driver account and notify them.' : 'Provide a mandatory reason for rejection.'}
        requireReason={modal.type === APPLICATION_STATES.REJECTED}
        onConfirm={(reason) => handleUpdateStatus(modal.type, reason)}
      />
    </div>
  );
}
