import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APPLICATION_STATES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './ApplicationsPage.module.css';

import { MOCK_APPLICATIONS } from '@/utils/mockData';

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

  useEffect(() => {
    setLoading(true);
    const filtered = filterValue === 'all' 
      ? MOCK_APPLICATIONS 
      : MOCK_APPLICATIONS.filter(app => app.state === filterValue);
    
    setApplications(filtered);
    setLoading(false);
  }, [filterValue]);

  const columns = [
    { 
      key: 'drivers', 
      label: 'Applicant',
      render: (drivers) => (
        <div className={styles.applicantCell}>
          <span className={styles.name}>{drivers?.full_name}</span>
          <span className={styles.email}>{drivers?.email}</span>
        </div>
      )
    },
    { 
      key: 'state', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    { 
      key: 'submitted_at', 
      label: 'Submitted',
      render: (val) => formatDateTime(val)
    },
    { 
      key: 'updated_at', 
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
