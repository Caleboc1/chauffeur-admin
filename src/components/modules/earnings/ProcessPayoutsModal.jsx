import { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { adminApi } from '@/lib/adminApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './ProcessPayoutsModal.module.css';

export default function ProcessPayoutsModal({ isOpen, onClose, onSuccess, payouts = [] }) {
  const [selected, setSelected] = useState({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const drivers = payouts.map((payout) => ({
    driver_id: payout.id || payout.driverId,
    driver: payout.driver || payout.user || { full_name: payout.driverName || payout.userName || 'Driver' },
    commission_rate: payout.commissionRate || 0,
    completed_rides: payout.completedRides || payout.rideCount || 0,
    gross_earnings: Number(payout.grossEarnings || payout.amount || 0),
    commission_deducted: Number(payout.commissionDeducted || 0),
    net_payout: Number(payout.netPayout || payout.amount || 0),
  }));

  const totalSelected = Object.values(selected).filter(Boolean).length;

  const totalAmount = drivers.reduce(
    (sum, d) => sum + (selected[d.driver_id] ? d.net_payout : 0), 0
  );

  const allSelected = drivers.every(d => selected[d.driver_id]);

  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      setSelected(Object.fromEntries(drivers.map(d => [d.driver_id, true])));
    }
  };

  const toggleDriver = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    if (totalSelected === 0) return setError('Select at least one driver.');
    if (!note.trim()) return setError('A processing note is required.');

    setLoading(true);
    setError('');

    try {
      const payoutIds = Object.entries(selected).filter(([, value]) => value).map(([id]) => id);
      await adminApi.processManyPayouts({
        ids: payoutIds,
        status: 'approved',
        statusReason: note,
      });
      onSuccess();
      onClose();
      setSelected({});
      setNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Process Payouts</h2>
            <span className={styles.pendingBadge}>
              {formatCurrency(drivers.reduce((s, d) => s + d.net_payout, 0))} pending
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </header>

        <div className={styles.body}>
          <p className={styles.subtitle}>
            Select drivers to release pending payouts below. A processing note is required for audit trail compliance.
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkCol}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className={styles.checkbox}
                    />
                  </th>
                <th>Driver</th>
                <th className={styles.numCol}>Comm.</th>
                <th className={styles.numCol}>Rides</th>
                <th className={styles.numCol}>Gross</th>
                <th className={styles.numCol}>Commission</th>
                <th className={styles.numCol}>Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length > 0 ? drivers.map(d => (
                  <tr
                    key={d.driver_id}
                    className={`${styles.row} ${selected[d.driver_id] ? styles.selectedRow : ''}`}
                    onClick={() => toggleDriver(d.driver_id)}
                  >
                    <td className={styles.checkCol} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!selected[d.driver_id]}
                        onChange={() => toggleDriver(d.driver_id)}
                        className={styles.checkbox}
                      />
                    </td>
                    <td>
                      <div className={styles.driverInfo}>
                        <div>
                          <div className={styles.driverName}>{d.driver.full_name}</div>
                          <div className={styles.driverMeta}>
                            <span className={styles.rating}>&#9733; {d.driver.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.numCol}>{d.commission_rate}%</td>
                    <td className={styles.numCol}>{d.completed_rides}</td>
                    <td className={styles.numCol}>{formatCurrency(d.gross_earnings)}</td>
                    <td className={`${styles.numCol} ${styles.commission}`}>
                      &minus;{formatCurrency(d.commission_deducted)}
                    </td>
                    <td className={`${styles.numCol} ${styles.payout}`}>
                      {formatCurrency(d.net_payout)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7}>No pending payouts.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalSelected > 0 && (
            <div className={styles.summaryBar}>
              <div className={styles.summaryLeft}>
                <span className={styles.summaryCount}>{totalSelected} driver{totalSelected !== 1 ? 's' : ''} selected</span>
              </div>
              <div className={styles.summaryRight}>
                <span className={styles.summaryLabel}>Total Payout</span>
                <span className={styles.summaryAmount}>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          <div className={styles.noteSection}>
            <Input
              label="Processing Note"
              placeholder="e.g. Weekly payout batch for May 12-18"
              value={note}
              onChange={e => setNote(e.target.value)}
              error={error}
              required
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || totalSelected === 0}
          >
            {loading
              ? 'Processing...'
              : totalSelected > 0
                ? `Process ${formatCurrency(totalAmount)}`
                : 'Process Payouts'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
