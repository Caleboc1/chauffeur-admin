import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVip } from '@/hooks/useVip';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import styles from './VipFleetDetailPage.module.css';
import { ArrowLeft, Wifi, Sofa, Droplets, Shield, Smartphone, Baby, Tv, Box } from 'lucide-react';

const amenityIcons = {
  'Wi-Fi': Wifi,
  'Leather Seats': Sofa,
  'Chilled Water': Droplets,
  'Privacy Screen': Shield,
  'Phone Charger': Smartphone,
  'Child Seat Available': Baby,
  'TV Screen': Tv,
  'Tinted Windows': Shield,
  'Sunroof': Box,
  'Tissue Box': Box,
};

export default function VipFleetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, loading } = useVip();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    if (!loading && vehicles.length > 0) {
      const found = vehicles.find(v => v.id === id);
      setVehicle(found || null);
    }
  }, [id, vehicles, loading]);

  if (loading) return <div>Loading vehicle details...</div>;
  if (!vehicle) return <div>Vehicle not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/vip?tab=fleet')}>
          <ArrowLeft size={20} /> Back to Fleet
        </Button>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{vehicle.make} {vehicle.model}</h1>
          <StatusBadge status={vehicle.status} label={vehicle.status} />
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vehicle Details</h2>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Plate Number</span>
              <span className={styles.value}>{vehicle.plate_number}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Year</span>
              <span className={styles.value}>{vehicle.year}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Colour</span>
              <span className={styles.value}>{vehicle.colour}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Capacity</span>
              <span className={styles.value}>{vehicle.capacity} passengers</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.description}>{vehicle.description}</p>
        </section>

        <section className={`${styles.section} ${styles.amenitiesSection}`}>
          <h2 className={styles.sectionTitle}>Amenities</h2>
          <div className={styles.amenitiesGrid}>
            {vehicle.amenities?.map((amenity) => {
              const Icon = amenityIcons[amenity] || Box;
              return (
                <div key={amenity} className={styles.amenityChip}>
                  <Icon size={16} />
                  {amenity}
                </div>
              );
            })}
          </div>
        </section>

        {vehicle.exterior_image_urls?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Photos</h2>
            <div className={styles.imageGrid}>
              {vehicle.exterior_image_urls.map((url, i) => (
                <img key={i} src={url} alt={`${vehicle.make} ${vehicle.model}`} className={styles.vehicleImage} />
              ))}
              {vehicle.interior_image_urls?.map((url, i) => (
                <img key={`int-${i}`} src={url} alt="Interior" className={styles.vehicleImage} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
