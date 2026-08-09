import { useState, useEffect } from 'react';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Shield, Info, Terminal, User } from 'lucide-react';
import styles from './AuditLogsPage.module.css';

import { MOCK_AUDIT_LOGS } from '@/utils/mockData';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Demo mode: use mock data
    setLoading(false);
  }, []);

  const columns = [
    { 
      key: 'created_at', 
      label: 'Timestamp',
      render: (v) => <span className={styles.timestamp}>{formatDateTime(v)}</span>
    },
    { 
      key: 'admins', 
      label: 'Admin',
      render: (v, row) => (
        <div className={styles.actorCell}>
          <User size={14} />
          <span>{v?.name || 'System'}</span>
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
      label: 'Entity',
      render: (v) => <span className={styles.entityLabel}>{v}</span>
    },
    { 
      key: 'ip_address', 
      label: 'IP Address',
      render: (v) => <span className={styles.ipText}>{v || '—'}</span>
    },
    { 
      key: 'metadata', 
      label: 'Details',
      render: (v) => v ? (
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
          <p className={styles.subtitle}>Immutable record of every administrative action for security and accountability</p>
        </div>
        <StatusBadge status="danger" label="Read-Only Trail" />
      </header>

      <div className={styles.tableWrapper}>
        <div className={styles.tableToolbar}>
          <Shield size={20} className={styles.securityIcon} />
          <span>Data in this view is cryptographically protected and non-deletable.</span>
        </div>
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
