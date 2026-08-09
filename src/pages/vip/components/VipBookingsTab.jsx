import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVip } from '@/hooks/useVip';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/ActionMenu';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function VipBookingsTab() {
  const { bookings, loading } = useVip();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredBookings = bookings.filter(b => filter === 'all' ? true : b.status === filter);

  const columns = [
    { key: 'id', label: 'Booking ID', render: (_, row) => row.id.slice(0, 8).toUpperCase() },
    { key: 'rider', label: 'Rider Name', render: (_, row) => row.rider?.full_name || '-' },
    { key: 'booking_type', label: 'Type', render: (v) => <StatusBadge status={v === 'instant' ? 'in_progress' : 'scheduled'} label={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} label={v} /> },
    { key: 'pickup_address', label: 'Pickup' },
    { key: 'scheduled_at', label: 'Scheduled At', render: (v) => formatDate(v) },
    { key: 'driver', label: 'Driver', render: (_, row) => row.driver?.full_name || '-' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => row.vehicle?.plate_number || '-' },
    { key: 'actions', label: '', render: (_, row) => (
      <ActionMenu actions={[
        { label: 'View', onClick: () => navigate(`/vip/bookings/${row.id}`) },
      ]} />
    ) }
  ];

  return (
    <DataTable
      data={filteredBookings}
      columns={columns}
      loading={loading}
      emptyMessage="No VIP bookings found."
      filterValue={filter}
      onFilterChange={setFilter}
      filterOptions={FILTER_OPTIONS}
    />
  );
}
