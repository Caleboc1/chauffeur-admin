import styles from './Button.module.css';

/**
 * Reusable Button component.
 * Variants: primary, secondary, danger, ghost
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  disabled = false, 
  className = '',
  icon: Icon,
  fullWidth = false,
  ...props 
}) {
  const buttonClasses = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    className
  ].join(' ');

  return (
    <button 
      type={type} 
      className={buttonClasses} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} className={styles.icon} />}
      {children}
    </button>
  );
}
