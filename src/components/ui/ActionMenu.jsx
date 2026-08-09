import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import styles from './ActionMenu.module.css';

export default function ActionMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.dropdown} ref={menuRef}>
            {actions.map((action, i) => (
              <button
                key={i}
                className={`${styles.action} ${action.danger ? styles.danger : ''}`}
                onClick={(e) => { e.stopPropagation(); action.onClick(); setOpen(false); }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
