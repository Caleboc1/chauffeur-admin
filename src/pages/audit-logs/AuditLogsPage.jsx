import { useState, useEffect } from 'react';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Shield, Info, User } from 'lucide-react';
import { adminApi, mapAdminAuditLog } from '@/lib/adminApi';
import styles from './AuditLogsPage.module.css';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [rows, driverRows, riderRows, adminRows, supportRows] = await Promise.all([
          adminApi.listAuditTrail({ limit: 100 }),
          adminApi.listUsers({ userType: 'driver', limit: 100 }).catch(() => []),
          adminApi.listUsers({ userType: 'user', limit: 100 }).catch(() => []),
          adminApi.listUsers({ userType: 'admin', limit: 100 }).catch(() => []),
          adminApi.listUsers({ userType: 'support', limit: 100 }).catch(() => []),
        ]);
        const usersById = new Map(
          [...driverRows, ...riderRows, ...adminRows, ...supportRows].map((u) => [u.id || u._id, u]),
        );
        if (!cancelled) {
          setLogs(rows.map((log) => mapAdminAuditLog({ ...log, user: usersById.get(log.userId) })));
        }
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
  }, []);

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (v) => <span className={styles.timestamp}>{formatDateTime(v)}</span>
    },
    {
      key: 'actor_name',
      label: 'Actor',
      render: (v, row) => (
        <div className={styles.actorCell}>
          <User size={14} />
          <span>{v}</span>
          <span className={styles.roleLabel}>({row.actor_role})</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (v) => <code className={styles.actionCode}>{v}</code>
    },
    {
      key: 'entity_type',
      label: 'Entity'
    },
    {
      key: 'to',
      label: 'Change',
      render: (v, row) => (row.from || row.to) ? <span className={styles.ipText}>{row.from || '—'} → {row.to || '—'}</span> : '—'
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (v) => <span className={styles.ipText}>{v}</span>
    },
    {
      key: 'metadata',
      label: 'Details',
      render: (v) => v && Object.keys(v).length ? (
        <button className={styles.metaBtn} title={JSON.stringify(v, null, 2)}>
          <Info size={16} />
        </button>
      ) : '—'
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>System Audit Logs</h1>
          <p className={styles.subtitle}>Record of administrative and system actions</p>
        </div>
        <StatusBadge status="danger" label="Read-Only Trail" />
      </header>

      <div className={styles.tableWrapper}>
        <div className={styles.tableToolbar}>
          <Shield size={20} className={styles.securityIcon} />
          <span>Data in this view comes directly from the backend audit trail.</span>
        </div>
        {error && <div>{error}</div>}
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          searchPlaceholder="Search by action, actor, or entity..."
        />
      </div>
    </div>
  );
}
