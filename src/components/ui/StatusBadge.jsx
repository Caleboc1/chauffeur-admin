import styles from './StatusBadge.module.css';

export default function StatusBadge({ status, label }) {
  const getVariant = (s) => {
    const statusLower = s?.toLowerCase();

    const variants = {
      success: ['active', 'approved', 'compliant', 'pass', 'paid', 'verified', 'completed', 'resolved', 'top_up'],
      warning: ['pending', 'submitted', 'in_review', 'correction_requested', 'correction', 'requested', 'maintenance', 'medium', 'refund'],
      danger: ['rejected', 'banned', 'suspended', 'fail', 'sos_active', 'critical', 'escalated', 'high'],
      info: ['new', 'inspection_scheduled', 'document_review', 'scheduled', 'available', 'low', 'ride_payment'],
      orange: ['in_progress', 'progress', 'in_use', 'open', 'manual_adjustment'],
      neutral: ['offline', 'inactive', 'closed', 'unpaid', 'unverified']
    };

    if (variants.success.includes(statusLower)) return 'success';
    if (variants.warning.includes(statusLower)) return 'warning';
    if (variants.danger.includes(statusLower)) return 'danger';
    if (variants.info.includes(statusLower)) return 'info';
    if (variants.orange.includes(statusLower)) return 'orange';
    if (variants.neutral.includes(statusLower)) return 'neutral';
    return 'neutral';
  };

  const getDriverVariant = (s) => {
    const statusLower = s?.toLowerCase();
    if (statusLower === 'active') return 'driverActive';
    if (statusLower === 'inactive') return 'driverInactive';
    if (statusLower === 'suspended') return 'driverSuspended';
    if (statusLower === 'under_review') return 'driverReview';
    return null;
  };

  const driverVariant = getDriverVariant(status);
  const variant = getVariant(status);
  const displayLabel = label || status?.replace(/_/g, ' ');

  if (driverVariant) {
    return (
      <span className={`${styles.driverStatusBadge} ${styles[driverVariant]}`}>
        {displayLabel}
      </span>
    );
  }

  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {displayLabel}
    </span>
  );
}
