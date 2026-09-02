import { useState, useEffect } from 'react';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/ActionMenu';
import Button from '@/components/ui/Button';
import { adminApi, mapAdminComplaint } from '@/lib/adminApi';
import styles from './ComplaintsPage.module.css';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [investigateModal, setInvestigateModal] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [investigateNotes, setInvestigateNotes] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    setError('');
    try {
      const [data, driverRows, riderRows] = await Promise.all([
        adminApi.listComplaints({ limit: 100 }),
        adminApi.listUsers({ userType: 'driver', limit: 100 }).catch(() => []),
        adminApi.listUsers({ userType: 'user', limit: 100 }).catch(() => []),
      ]);
      const usersById = new Map([...driverRows, ...riderRows].map((u) => [u.id || u._id, u]));
      setComplaints(data.map((c) => mapAdminComplaint({ ...c, user: usersById.get(c.userId) })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredComplaints = complaints.filter(c => filter === 'all' ? true : c.state === filter);

  const handleInvestigate = async () => {
    if (!investigateModal) return;
    await adminApi.processComplaint(investigateModal.id, {
      status: 'under_investigation',
      statusReason: investigateNotes,
    });
    await loadComplaints();
    setInvestigateModal(null);
    setInvestigateNotes('');
  };

  const handleResolve = async () => {
    if (!resolveModal) return;
    await adminApi.processComplaint(resolveModal.id, {
      status: 'resolved',
      statusReason: resolveNotes,
    });
    await loadComplaints();
    setResolveModal(null);
    setResolveNotes('');
  };

  const openInvestigate = (complaint) => {
    setInvestigateModal(complaint);
    setInvestigateNotes(complaint.investigation_notes || '');
  };

  const openResolve = (complaint) => {
    setResolveModal(complaint);
    setResolveNotes('');
  };

  const columns = [
    {
      key: 'complainant',
      label: 'Complainant',
      render: (_, row) => row.complainant_type === 'rider' ? row.riders?.full_name : row.drivers?.full_name
    },
    {
      key: 'complainant_type',
      label: 'User Type',
      render: (val) => val === 'rider' ? 'Rider' : 'Driver'
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <span>{val.replace(/_/g, ' ')}</span>
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'state',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => <span className={styles.descriptionTruncate}>{val}</span>
    },
    {
      key: 'created_at',
      label: 'Reported',
      render: (val) => formatDateTime(val)
    },
      {
        key: 'actions',
        label: '',
        render: (_, row) => (
          <ActionMenu actions={[
            { label: 'Investigate', onClick: () => openInvestigate(row) },
            { label: 'Resolve', onClick: () => openResolve(row) },
          ]} />
        )
      }
  ];

  const FILTER_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'under_investigation', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'escalated', label: 'Escalated' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Complaints & Disputes</h1>
          <p className={styles.subtitle}>Resolve rider and driver issues, safety reports, and payment disputes</p>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        {error && <div>{error}</div>}
        <DataTable
          columns={columns}
          data={filteredComplaints}
          loading={loading}
          searchPlaceholder="Search descriptions or categories..."
          filterValue={filter}
          onFilterChange={setFilter}
          filterOptions={FILTER_OPTIONS}
        />
      </div>

      {investigateModal && (
        <div className={styles.modalOverlay} onClick={() => { setInvestigateModal(null); setInvestigateNotes(''); }}>
          <div className={styles.resolveModal} onClick={e => e.stopPropagation()}>
            <h3>Investigate Complaint</h3>
            <div className={styles.investigateDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{investigateModal.category.replace(/_/g, ' ')}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>From</span>
                <span className={styles.detailValue}>{investigateModal.complainant_type}: {investigateModal.complainant_type === 'rider' ? investigateModal.riders?.full_name : investigateModal.drivers?.full_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Severity</span>
                <span className={styles.detailValue}><StatusBadge status={investigateModal.severity} /></span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Description</span>
                <span className={styles.detailValue}>{investigateModal.description}</span>
              </div>
            </div>
            <textarea
              className={styles.resolveTextarea}
              placeholder="Investigation notes..."
              value={investigateNotes}
              onChange={e => setInvestigateNotes(e.target.value)}
              rows={4}
            />
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => { setInvestigateModal(null); setInvestigateNotes(''); }}>Cancel</Button>
              <Button variant="primary" onClick={handleInvestigate}>Start Investigation</Button>
            </div>
          </div>
        </div>
      )}

      {resolveModal && (
        <div className={styles.modalOverlay} onClick={() => { setResolveModal(null); setResolveNotes(''); }}>
          <div className={styles.resolveModal} onClick={e => e.stopPropagation()}>
            <h3>Resolve Complaint</h3>
            <p className={styles.modalSubtext}>
              Resolving: <strong>{resolveModal.category.replace(/_/g, ' ')}</strong> from {resolveModal.complainant_type}
            </p>
            <textarea
              className={styles.resolveTextarea}
              placeholder="Resolution notes..."
              value={resolveNotes}
              onChange={e => setResolveNotes(e.target.value)}
              rows={4}
            />
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => { setResolveModal(null); setResolveNotes(''); }}>Cancel</Button>
              <Button variant="primary" onClick={handleResolve} disabled={!resolveNotes.trim()}>Mark Resolved</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
