import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APPLICATION_STATES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Car, 
  User, 
  ShieldCheck,
  Calendar,
  AlertCircle,
  Eye,
  ArrowLeft
} from 'lucide-react';
import styles from './ApplicationDetailPage.module.css';

import { MOCK_APPLICATIONS, MOCK_VEHICLES, MOCK_DOCUMENTS, MOCK_INSPECTIONS, MOCK_DRIVERS } from '@/utils/mockData';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', data: null });

  useEffect(() => {
    setLoading(true);
    const app = MOCK_APPLICATIONS.find(a => a.id === id) || MOCK_APPLICATIONS[0];
    setApplication(app);

    const v = MOCK_VEHICLES.find(v => v.driver_id === app.driver_id) || MOCK_VEHICLES[0];
    setVehicle(v);

    const driverDocs = MOCK_DOCUMENTS
      .filter(d => d.driver_id === app.driver_id)
      .map(d => ({
        ...d,
        status: app.state === 'new' || app.state === 'under_review' ? 'pending' : d.status,
      }));
    setDocuments(driverDocs);

    const existingIns = app.state === APPLICATION_STATES.INSPECTION_SCHEDULED
      ? MOCK_INSPECTIONS.find(i => i.driver_id === app.driver_id)
      : null;
    setInspection(existingIns || null);

    setLoading(false);
  }, [id]);

  const handleUpdateStatus = async (newState, reason = '') => {
    try {
      setApplication(prev => ({ ...prev, state: newState, rejection_reason: reason }));
    } catch (err) {
      alert('Operation failed: ' + err.message);
    }
  };

  const handleDocumentAction = async (docId, status) => {
    try {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d));
    } catch (err) {
      alert('Failed to update document: ' + err.message);
    }
  };

  const handleScheduleInspection = async (formData) => {
    try {
      const driver = MOCK_DRIVERS.find(d => d.id === application.driver_id);
      const newInsp = {
        id: `ins-mock-${Date.now()}`,
        driver_id: application.driver_id,
        vehicle_id: vehicle?.id,
        scheduled_at: new Date(formData.date + 'T' + formData.time).toISOString(),
        location: formData.location,
        notes_for_driver: formData.notes,
        result: 'pending',
        drivers: driver ? { full_name: driver.full_name } : { full_name: 'Unknown' },
        vehicles: vehicle ? { plate_number: vehicle.plate_number } : { plate_number: '—' },
        admins: { name: 'Current Admin' }
      };

      MOCK_INSPECTIONS.push(newInsp);
      setInspection(newInsp);
      handleUpdateStatus(APPLICATION_STATES.INSPECTION_SCHEDULED);
    } catch (err) {
      alert('Failed to schedule inspection: ' + err.message);
    }
  };

  const handleRecordInspection = async (results) => {
    try {
      const pass = results.vehicle_condition === 'pass' && results.document_verification === 'pass' && results.identity_match === 'pass';
      const updated = { ...inspection, ...results, result: pass ? 'pass' : 'fail' };
      setInspection(updated);
      const idx = MOCK_INSPECTIONS.findIndex(i => i.id === updated.id);
      if (idx >= 0) MOCK_INSPECTIONS[idx] = updated;
    } catch (err) {
      alert('Failed to record results: ' + err.message);
    }
  };

  const openScheduleModal = () => {
    if (application.state === APPLICATION_STATES.NEW) {
      handleUpdateStatus(APPLICATION_STATES.UNDER_REVIEW);
    }
    setModal({ open: true, type: 'SCHEDULE_INSPECTION' });
  };

  const cannotBeDecided = application?.state === APPLICATION_STATES.APPROVED || application?.state === APPLICATION_STATES.REJECTED;
  const canScheduleInspection = application?.state === APPLICATION_STATES.NEW || application?.state === APPLICATION_STATES.UNDER_REVIEW;
  const canDecide = application?.state === APPLICATION_STATES.NEW || application?.state === APPLICATION_STATES.UNDER_REVIEW || application?.state === APPLICATION_STATES.INSPECTION_SCHEDULED;

  if (loading) return <div className={styles.loading}>Loading application details...</div>;
  if (!application) return <div className={styles.error}>Application not found.</div>;

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
              <span className={styles.date}>Submitted {formatDateTime(application.submitted_at)}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="primary"
              disabled={!canDecide || cannotBeDecided}
              onClick={() => setModal({ open: true, type: APPLICATION_STATES.APPROVED })}
            >
              Approve Driver
            </Button>
            <Button
              variant="danger"
              disabled={!canDecide || cannotBeDecided}
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
                <span>{application.drivers?.full_name}</span>
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <span>{application.drivers?.email}</span>
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <span>{application.drivers?.phone}</span>
              </div>
              <div className={styles.field}>
                <label>Date of Birth</label>
                <span>{application.drivers?.date_of_birth || 'Not provided'}</span>
              </div>
              <div className={styles.field}>
                <label>Gov ID Number</label>
                <span>{application.drivers?.government_id_number || 'Not provided'}</span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}><ShieldCheck size={18} /> Face Verification</h3>
            <div className={styles.faceVerification}>
              <div className={styles.selfieContainer}>
                {application.drivers?.selfie_url ? (
                  <img src={application.drivers.selfie_url} alt="Selfie" className={styles.selfie} />
                ) : (
                  <div className={styles.selfiePlaceholder}>No Selfie</div>
                )}
              </div>
              <div className={styles.faceMeta}>
                <div className={styles.score}>
                  <label>Confidence Score</label>
                  <div className={styles.scoreValue}>
                    <span className={styles.percentage}>{application.drivers?.face_match_score || 0}%</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: `${application.drivers?.face_match_score || 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className={styles.matchStatus}>
                  <label>Status</label>
                  <StatusBadge status={application.drivers?.face_match_status || 'pending'} />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}><Car size={18} /> Vehicle Information</h3>
            {vehicle ? (
              <>
                <div className={styles.infoGrid}>
                  <div className={styles.field}>
                    <label>Make & Model</label>
                    <span>{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className={styles.field}>
                    <label>Plate Number</label>
                    <span>{vehicle.plate_number}</span>
                  </div>
                  <div className={styles.field}>
                    <label>Year</label>
                    <span>{vehicle.year}</span>
                  </div>
                  <div className={styles.field}>
                    <label>Colour</label>
                    <span>{vehicle.colour}</span>
                  </div>
                  <div className={styles.field}>
                    <label>Status</label>
                    <StatusBadge status={
                      application.state === 'new' || application.state === 'under_review'
                        ? 'under_review'
                        : application.state === 'approved'
                          ? 'approved'
                          : vehicle.compliance_status
                    } />
                  </div>
                </div>
                <div className={styles.scheduleInspectionSection}>
                  {inspection ? (
                    <div className={styles.inlineInspection}>
                      <div className={styles.inlineInspRow}>
                        <Calendar size={14} />
                        <span>Scheduled: {formatDateTime(inspection.scheduled_at)}</span>
                      </div>
                      <div className={styles.inlineInspRow}>
                        <span className={styles.inspLabel}>Result:</span>
                        <StatusBadge status={inspection.result} />
                      </div>
                      {inspection.result === 'pending' && (
                        <Button variant="secondary" size="sm" onClick={() => setModal({ open: true, type: 'RECORD_INSPECTION' })}>
                          Record Outcome
                        </Button>
                      )}
                    </div>
                  ) : canScheduleInspection && (
                    <Button variant="primary" onClick={openScheduleModal}>
                      Schedule Inspection
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className={styles.empty}>No vehicle information provided.</p>
            )}
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}><FileText size={18} /> Document Review</h3>
            <div className={styles.docList}>
              {documents.length === 0 ? (
                <p className={styles.empty}>No documents uploaded yet.</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className={styles.docItem}>
                    <div className={styles.docMain}>
                      <FileText size={20} className={styles.docIcon} />
                      <div className={styles.docInfo}>
                        <span className={styles.docName}>{doc.document_type.replace(/_/g, ' ')}</span>
                        <span className={styles.docBadge}><StatusBadge status={doc.status} /></span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button className={styles.docActionBtn} onClick={() => window.open(doc.storage_url, '_blank')} title="View document">
                        <Eye size={14} /> View
                      </button>
                      {doc.status === 'pending' && (
                        <>
                          <button className={styles.docActionBtnApprove} onClick={() => handleDocumentAction(doc.id, 'approved')}>
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button className={styles.docActionBtnReject} onClick={() => handleDocumentAction(doc.id, 'rejected')}>
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
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

      {modal.open && modal.type === 'SCHEDULE_INSPECTION' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Schedule Physical Inspection</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleScheduleInspection(Object.fromEntries(formData));
              setModal({ open: false, type: '' });
            }}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" required />
              </div>
              <div className={styles.formGroup}>
                <label>Time</label>
                <input type="time" name="time" required />
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input type="text" name="location" placeholder="Inspection center address" required />
              </div>
              <div className={styles.formGroup}>
                <label>Notes for Driver</label>
                <textarea name="notes" placeholder="e.g. Bring original documents" />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setModal({ open: false, type: '' })}>Cancel</Button>
                <Button type="submit" variant="primary">Confirm Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.open && modal.type === 'RECORD_INSPECTION' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Record Inspection Outcome</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleRecordInspection(Object.fromEntries(formData));
              setModal({ open: false, type: '' });
            }}>
              <div className={styles.formGroup}>
                <label>Vehicle Condition</label>
                <select name="vehicle_condition" required>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Document Verification</label>
                <select name="document_verification" required>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Identity Match</label>
                <select name="identity_match" required>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Inspector Notes</label>
                <textarea name="inspector_notes" />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setModal({ open: false, type: '' })}>Cancel</Button>
                <Button type="submit" variant="primary">Submit Results</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
