import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ActionMenu from '@/components/ui/ActionMenu';
import styles from './ContentPage.module.css';

export default function ContentPage() {
  const { contentItems, loading } = useContent();
  const navigate = useNavigate();

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const columns = [
    { key: 'id', label: 'ID', render: (_, row) => row.id.slice(0, 8).toUpperCase() },
    { key: 'title', label: 'Title' },
    { key: 'content_type', label: 'Type', render: (v) => v.replace('_', ' ').toUpperCase() },
    { key: 'audience', label: 'Audience', render: (v) => v.toUpperCase() },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v === 'published' ? 'active' : 'pending'} label={v} /> },
    { key: 'updated_at', label: 'Last Updated', render: (v) => formatDate(v) },
    { key: 'actions', label: '', render: (_, row) => (
      <ActionMenu actions={[
        { label: 'Edit', onClick: () => navigate(`/content/edit/${row.id}`) },
      ]} />
    ) }
  ];

  const totalPublished = contentItems.filter(c => c.status === 'published').length;
  const totalDrafts = contentItems.filter(c => c.status === 'draft').length;
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Platform Content</h1>
        <Button variant="primary" onClick={() => navigate('/content/new')}>Create New</Button>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Published Pages</span>
          <span className={styles.metricValue}>{totalPublished}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Drafts</span>
          <span className={styles.metricValue}>{totalDrafts}</span>
        </div>
      </div>

      <main className={styles.content}>
        <DataTable 
          data={contentItems}
          columns={columns}
          loading={loading}
          emptyMessage="No content items found."
        />
      </main>
    </div>
  );
}
