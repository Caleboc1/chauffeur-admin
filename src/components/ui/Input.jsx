import styles from './Input.module.css';

/**
 * Reusable Input component with label and error support.
 */
export default function Input({ 
  label, 
  error, 
  id, 
  type = 'text', 
  required = false, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        required={required}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
