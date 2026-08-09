import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import styles from './ConfirmModal.module.css';

/**
 * Modal for confirming actions.
 * Supports a mandatory reason and an optional extra input (e.g. amount).
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message, 
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  requireReason = true,
  showInput = false,
  inputLabel = "Amount",
  inputType = "text"
}) {
  const [reason, setReason] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('A reason is required to proceed.');
      return;
    }
    if (showInput && !inputValue) {
      setError('A value is required.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason, inputValue);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
      setReason('');
      setInputValue('');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
          
          {showInput && (
            <Input
              label={inputLabel}
              type={inputType}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              required
              className={styles.extraInput}
            />
          )}

          {requireReason && (
            <Input
              label="Reason for this action"
              placeholder="e.g. Documentation incomplete"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              error={error}
              required
              className={styles.reasonInput}
            />
          )}
        </div>

        <div className={styles.footer}>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={handleConfirm} 
            disabled={loading || (requireReason && !reason.trim()) || (showInput && !inputValue)}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

