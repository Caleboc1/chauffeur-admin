import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVip } from '@/hooks/useVip';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ActionMenu from '@/components/ui/ActionMenu';

export default function VipFleetTab() {
  const { vehicles, loading } = useVip();
  const navigate = useNavigate();

  const columns = [
    { key: 'id', label: 'Vehicle ID', render: (_, row) => row.id.slice(0, 8).toUpperCase() },
    { key: 'model', label: 'Make & Model', render: (_, row) => `${row.make} ${row.model}` },
    { key: 'year', label: 'Year' },
    { key: 'plate_number', label: 'Plate' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} label={v} /> },
    { key: 'colour', label: 'Colour' },
    { key: 'actions', label: '', render: (_, row) => (
      <ActionMenu actions={[
        { label: 'View Details', onClick: () => navigate(`/vip/fleet/${row.id}`) },
      ]} />
    ) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={() => navigate('/vip/fleet/new')}>Add VIP Vehicle</Button>
      </div>
      <DataTable 
        data={vehicles}
        columns={columns}
        loading={loading}
        emptyMessage="No VIP vehicles found."
        showSearch={false}
      />
    </div>
  );
}
