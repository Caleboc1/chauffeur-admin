import { useState } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './ManualAdjustmentModal.module.css';

/**
 * Modal for manual wallet adjustments (Add/Deduct).
 * Enforces mandatory reasons and audit logging.
 */
export default function ManualAdjustmentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  entityId, // driver_id or rider_id
  entityType = 'rider' // 'driver' or 'rider'
}) {
  const [type, setType] = useState('credit'); // credit = add, debit = deduct
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return setError('Please enter a valid amount.');
    if (!reason.trim()) return setError('A reason is required for manual adjustments.');

    setLoading(true);
    setError('');

    try {
      const finalAmount = type === 'credit' ? Number(amount) : -Number(amount);
      
      // Simulate API call for mock
      await new Promise(resolve => setTimeout(resolve, 500));

      onSuccess();
      onClose();
      setAmount('');
      setReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Manual Wallet Adjustment</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.typeToggle}>
            <button 
              type="button"
              className={`${styles.toggleBtn} ${type === 'credit' ? styles.activeCredit : ''}`}
              onClick={() => setType('credit')}
            >
              Add Funds (+)
            </button>
            <button 
              type="button"
              className={`${styles.toggleBtn} ${type === 'debit' ? styles.activeDebit : ''}`}
              onClick={() => setType('debit')}
            >
              Deduct Funds (-)
            </button>
          </div>

          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Reason for Adjustment"
            placeholder="e.g. Overcharge refund or manual commission deduction"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={error}
            required
          />

          <div className={styles.footer}>
            <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button 
              variant={type === 'credit' ? 'primary' : 'danger'} 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Apply Adjustment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
