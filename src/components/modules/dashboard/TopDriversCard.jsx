import styles from './TopDriversCard.module.css';

export default function TopDriversCard({ drivers = [] }) {
  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '\u2605';
    if (half) stars += '\u00BD';
    return stars;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Top Drivers</span>
      </div>
      <ul className={styles.list}>
        {drivers.map((d) => (
          <li key={d.rank} className={styles.item}>
            <span className={styles.rank}>{d.rank}</span>
            <img
              src={d.avatar}
              alt={d.name}
              className={styles.avatar}
            />
            <div className={styles.info}>
              <div className={styles.name}>{d.name}</div>
              <div className={styles.rating}>
                <span className={styles.stars}>{renderStars(d.rating)}</span>
                <span className={styles.ratingValue}>{d.rating}</span>
              </div>
            </div>
            <span className={styles.rideBadge}>Rides: {d.rides}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
