import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APPLICATION_STATES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { adminApi, mapAdminKyc } from '@/lib/adminApi';
import styles from './ApplicationsPage.module.css';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: APPLICATION_STATES.NEW, label: 'New' },
  { value: APPLICATION_STATES.UNDER_REVIEW, label: 'Under Review' },
  { value: APPLICATION_STATES.INSPECTION_SCHEDULED, label: 'Scheduled' },
  { value: APPLICATION_STATES.APPROVED, label: 'Approved' },
  { value: APPLICATION_STATES.REJECTED, label: 'Rejected' },
];

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    
    async function fetchApplications() {
      setLoading(true);
      setError('');
      try {
        const [rows, driverRows] = await Promise.all([
          adminApi.listUserKyc({ limit: 100 }),
          adminApi.listUsers({ userType: 'driver', limit: 100 }).catch(() => []),
        ]);
        const driversById = new Map(driverRows.map((d) => [d.id || d._id, d]));
        const mapped = rows.map((kyc) => mapAdminKyc({ ...kyc, user: driversById.get(kyc.userId) }));
        const filtered = filterValue === 'all'
          ? mapped
          : mapped.filter((item) => item.state === filterValue || item.applicationStatus === filterValue);
        if (!cancelled) setApplications(filtered);
      } catch (err) {
        if (!cancelled) {
          setApplications([]);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [filterValue]);

  const columns = [
    { 
      key: 'drivers', 
      label: 'Applicant',
      render: (_, row) => (
        <div className={styles.applicantCell}>
          <span className={styles.name}>{row.driverName}</span>
          <span className={styles.email}>{row.driverEmail}</span>
        </div>
      )
    },
    { 
      key: 'state', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'applicationDate',
      label: 'Submitted',
      render: (val) => formatDateTime(val)
    },
    {
      key: 'updatedAt',
      label: 'Last Update',
      render: (val) => formatDateTime(val)
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Onboarding Applications</h1>
        <p className={styles.subtitle}>Review and manage driver onboarding requests</p>
      </header>

      <div className={styles.tableWrapper}>
        {error && <div>{error}</div>}
        <DataTable 
          columns={columns} 
          data={applications} 
          loading={loading}
          onRowClick={(app) => navigate(`/drivers/applications/${app.id}`)}
          searchPlaceholder="Search applicants..."
          filterOptions={FILTER_OPTIONS}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
        />
      </div>
    </div>
  );
}
