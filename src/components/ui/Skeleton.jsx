import styles from './Skeleton.module.css';

export default function Skeleton({ width = '100%', height = '1em', radius, circle = false, className = '', style = {} }) {
  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : radius ?? '4px',
        ...style,
      }}
    />
  );
}
