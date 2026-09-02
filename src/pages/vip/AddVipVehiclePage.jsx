import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminApi } from '@/lib/adminApi';
import styles from './AddVipVehiclePage.module.css';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function AddVipVehiclePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    model: '',
    seats: '',
    pricePerDay: '',
  });
  const [exteriorFile, setExteriorFile] = useState(null);
  const [exteriorPreview, setExteriorPreview] = useState(null);
  const [interiorFile, setInteriorFile] = useState(null);
  const [interiorPreview, setInteriorPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'exterior') {
      setExteriorFile(file);
      setExteriorPreview(url);
    } else {
      setInteriorFile(file);
      setInteriorPreview(url);
    }
    e.target.value = '';
  };

  const removeImage = (type) => {
    if (type === 'exterior') {
      setExteriorFile(null);
      setExteriorPreview(null);
    } else {
      setInteriorFile(null);
      setInteriorPreview(null);
    }
  };

  const canSave = form.model.trim() && Number(form.seats) > 0 && Number(form.pricePerDay) >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setError('');
    try {
      const [exteriorImageUrl, interiorImageUrl] = await Promise.all([
        exteriorFile ? adminApi.uploadFile(exteriorFile) : Promise.resolve(''),
        interiorFile ? adminApi.uploadFile(interiorFile) : Promise.resolve(''),
      ]);

      const settings = await adminApi.getSystemSettings();
      const existingModels = Array.isArray(settings.vipVehicleModels) ? settings.vipVehicleModels : [];

      await adminApi.updateSystemSettings({
        vipVehicleModels: [
          ...existingModels,
          {
            model: form.model.trim(),
            seats: Number(form.seats),
            pricePerDay: Number(form.pricePerDay),
            exteriorImageUrl,
            interiorImageUrl,
          },
        ],
      });

      navigate('/vip?tab=fleet');
    } catch (err) {
      setError(err.message || 'Unable to add vehicle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/vip?tab=fleet')}>
          <ArrowLeft size={20} /> Back to Fleet
        </Button>
        <h1 className={styles.title}>Add VIP Vehicle</h1>
      </header>

      {error && <div className={styles.fullWidth} style={{ color: '#EF4444', marginBottom: 16 }}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Input label="Model Name" id="model" name="model" placeholder="e.g. Rolls-Royce" value={form.model} onChange={handleChange} required />
          <Input label="Seats" id="seats" name="seats" type="number" min="1" placeholder="4" value={form.seats} onChange={handleChange} required />
          <Input label="Price Per Day (₦)" id="pricePerDay" name="pricePerDay" type="number" min="0" placeholder="320000" value={form.pricePerDay} onChange={handleChange} required />
        </div>

        <div className={styles.uploadSection}>
          <h3 className={styles.uploadTitle}>Exterior Photo</h3>
          <div className={styles.imagePreviewList}>
            {exteriorPreview ? (
              <div className={styles.imagePreview}>
                <img src={exteriorPreview} alt="" />
                <button type="button" className={styles.removeBtn} onClick={() => removeImage('exterior')}><X size={14} /></button>
              </div>
            ) : (
              <label className={styles.uploadBtn}>
                <Upload size={20} />
                <span>Add Image</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'exterior')} />
              </label>
            )}
          </div>
        </div>

        <div className={styles.uploadSection}>
          <h3 className={styles.uploadTitle}>Interior Photo</h3>
          <div className={styles.imagePreviewList}>
            {interiorPreview ? (
              <div className={styles.imagePreview}>
                <img src={interiorPreview} alt="" />
                <button type="button" className={styles.removeBtn} onClick={() => removeImage('interior')}><X size={14} /></button>
              </div>
            ) : (
              <label className={styles.uploadBtn}>
                <Upload size={20} />
                <span>Add Image</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'interior')} />
              </label>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate('/vip?tab=fleet')} disabled={saving}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={!canSave || saving}>{saving ? 'Adding Vehicle...' : 'Add Vehicle'}</Button>
        </div>
      </form>
    </div>
  );
}
