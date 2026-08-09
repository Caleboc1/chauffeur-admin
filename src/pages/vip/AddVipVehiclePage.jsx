import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './AddVipVehiclePage.module.css';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function AddVipVehiclePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    plate_number: '',
    colour: '',
    capacity: '',
    description: '',
    amenities: '',
  });
  const [exteriorImages, setExteriorImages] = useState([]);
  const [interiorImages, setInteriorImages] = useState([]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e, type) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    if (type === 'exterior') {
      setExteriorImages(prev => [...prev, ...urls]);
    } else {
      setInteriorImages(prev => [...prev, ...urls]);
    }
    e.target.value = '';
  };

  const removeImage = (index, type) => {
    if (type === 'exterior') {
      setExteriorImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setInteriorImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: upload images to Supabase Storage, then submit vehicle data
    navigate('/vip?tab=fleet');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/vip?tab=fleet')}>
          <ArrowLeft size={20} /> Back to Fleet
        </Button>
        <h1 className={styles.title}>Add VIP Vehicle</h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Input label="Make" id="make" name="make" placeholder="Make" value={form.make} onChange={handleChange} required />
          <Input label="Model" id="model" name="model" placeholder="Model" value={form.model} onChange={handleChange} required />
          <Input label="Year" id="year" name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} required />
          <Input label="Plate Number" id="plate_number" name="plate_number" placeholder="Plate Number" value={form.plate_number} onChange={handleChange} required />
          <Input label="Colour" id="colour" name="colour" placeholder="Colour" value={form.colour} onChange={handleChange} required />
          <Input label="Capacity" id="capacity" name="capacity" type="number" placeholder="Capacity (passengers)" value={form.capacity} onChange={handleChange} required />
          <div className={styles.fullWidth}>
            <Input label="Description" id="description" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          </div>
          <div className={styles.fullWidth}>
            <Input label="Amenities" id="amenities" name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.uploadSection}>
          <h3 className={styles.uploadTitle}>Exterior Photos</h3>
          <div className={styles.imagePreviewList}>
            {exteriorImages.map((url, i) => (
              <div key={i} className={styles.imagePreview}>
                <img src={url} alt="" />
                <button type="button" className={styles.removeBtn} onClick={() => removeImage(i, 'exterior')}><X size={14} /></button>
              </div>
            ))}
            <label className={styles.uploadBtn}>
              <Upload size={20} />
              <span>Add Images</span>
              <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'exterior')} />
            </label>
          </div>
        </div>

        <div className={styles.uploadSection}>
          <h3 className={styles.uploadTitle}>Interior Photos</h3>
          <div className={styles.imagePreviewList}>
            {interiorImages.map((url, i) => (
              <div key={i} className={styles.imagePreview}>
                <img src={url} alt="" />
                <button type="button" className={styles.removeBtn} onClick={() => removeImage(i, 'interior')}><X size={14} /></button>
              </div>
            ))}
            <label className={styles.uploadBtn}>
              <Upload size={20} />
              <span>Add Images</span>
              <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'interior')} />
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate('/vip?tab=fleet')}>Cancel</Button>
          <Button variant="primary" type="submit">Add Vehicle</Button>
        </div>
      </form>
    </div>
  );
}
