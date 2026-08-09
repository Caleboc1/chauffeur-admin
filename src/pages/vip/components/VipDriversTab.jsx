import React from 'react';
import { useVip } from '@/hooks/useVip';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/ActionMenu';

export default function VipDriversTab() {
  const { vipDrivers, loading } = useVip();

  const columns = [
    { key: 'id', label: 'Driver ID', render: (_, row) => row.id.slice(0, 8).toUpperCase() },
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} label={v} /> },
    { key: 'actions', label: '', render: () => (
      <ActionMenu actions={[
        { label: 'Manage VIP', onClick: () => {} },
      ]} />
    ) }
  ];

  return (
    <DataTable 
      data={vipDrivers}
      columns={columns}
      loading={loading}
      emptyMessage="No VIP drivers found."
      showSearch={false}
    />
  );
}
