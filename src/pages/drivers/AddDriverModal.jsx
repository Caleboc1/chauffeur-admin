import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Upload, ChevronLeft, Check, X, Camera, FileText, Car, User, ClipboardCheck } from 'lucide-react';
import styles from './AddDriverModal.module.css';

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'vehicle', label: 'Vehicle Details', icon: Car },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'review', label: 'Review & Submit', icon: ClipboardCheck },
];

const INLINE_HELP = {
  full_name: "Enter the driver's full name exactly as it appears on their government ID.",
  email: "If the driver doesn't have an email, you can use a placeholder or help them create one.",
  phone: "Include country code. This will be used for SMS notifications about inspections and approvals.",
  date_of_birth: "Required for background checks. Ask the driver for their ID if unsure.",
  residential_address: "Full residential address. Needed for emergency contact and region assignment.",
  government_id_number: "The number from their government-issued ID (National ID, passport, etc.).",
  vehicle_skip: "Select this if the driver hasn't secured a vehicle yet. They can add vehicle details later.",
  plate_number: "The license plate number as shown on the vehicle registration document.",
  docs_helper: "If the driver can't upload documents themselves, you can take photos of their physical documents using your device camera or scanner.",
};

const DOCUMENT_CONFIG = [
  {
    key: 'government_id',
    label: 'Government ID',
    icon: FileText,
    help: 'National ID card, passport, or driver\'s license used for identity verification. Take a clear photo showing all 4 corners.',
  },
  {
    key: 'drivers_licence',
    label: 'Driver\'s Licence',
    icon: FileText,
    help: 'Front and back of the valid driver\'s licence. Must not be expired.',
  },
  {
    key: 'vehicle_insurance',
    label: 'Vehicle Insurance',
    icon: FileText,
    help: 'Valid insurance certificate for the vehicle they will drive. Must cover ride-hailing/commercial use.',
  },
  {
    key: 'vehicle_registration',
    label: 'Vehicle Registration',
    icon: FileText,
    help: 'Vehicle registration document (proof of ownership). If not the owner, a letter of authorization is needed.',
  },
  {
    key: 'selfie',
    label: 'Selfie / Portrait',
    icon: Camera,
    help: 'A clear, well-lit face photo. Ask the driver to remove sunglasses, hats, or face coverings.',
  },
];

export default function AddDriverModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const fileInputs = useRef({});

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    residential_address: '',
    government_id_number: '',
    has_vehicle: true,
    make: '',
    model: '',
    year: '',
    colour: '',
    plate_number: '',
    documents: {
      government_id: { file: null, name: '', will_provide_later: false },
      drivers_licence: { file: null, name: '', will_provide_later: false },
      vehicle_insurance: { file: null, name: '', will_provide_later: false },
      vehicle_registration: { file: null, name: '', will_provide_later: false },
      selfie: { file: null, name: '', will_provide_later: false },
    },
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateDoc = (key, field, value) => setForm(prev => ({
    ...prev,
    documents: {
      ...prev.documents,
      [key]: { ...prev.documents[key], [field]: value },
    },
  }));

  const handleFileUpload = (key, file) => {
    updateDoc(key, 'file', file);
    updateDoc(key, 'name', file.name);
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.full_name.trim()) errs.full_name = 'Full name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
    }
    if (s === 1 && form.has_vehicle) {
      if (!form.make.trim()) errs.make = 'Vehicle make is required';
      if (!form.model.trim()) errs.model = 'Vehicle model is required';
      if (!form.year.trim()) errs.year = 'Year is required';
      if (!form.plate_number.trim()) errs.plate_number = 'Plate number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canSubmit = form.full_name.trim() && form.email.trim() && form.phone.trim();

  const handleNext = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleClose = () => {
    setStep(0);
    setSubmitted(false);
    setForm({
      full_name: '', email: '', phone: '', date_of_birth: '', residential_address: '', government_id_number: '',
      has_vehicle: true, make: '', model: '', year: '', colour: '', plate_number: '',
      documents: {
        government_id: { file: null, name: '', will_provide_later: false },
        drivers_licence: { file: null, name: '', will_provide_later: false },
        vehicle_insurance: { file: null, name: '', will_provide_later: false },
        vehicle_registration: { file: null, name: '', will_provide_later: false },
        selfie: { file: null, name: '', will_provide_later: false },
      },
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successScreen}>
            <div className={styles.successIcon}><Check size={48} /></div>
            <h2>Driver Onboarding Submitted</h2>
            <p className={styles.successMsg}>
              <strong>{form.full_name}</strong> has been submitted for review.
              {form.has_vehicle
                ? ` Their ${form.year} ${form.make} ${form.model} (${form.plate_number}) has been registered.`
                : ' Vehicle details can be added later.'}
            </p>
            <p className={styles.successHint}>
              The driver will receive a notification to complete any remaining steps.
              You can track their application status from the Applications tab.
            </p>
            <Button variant="primary" onClick={handleClose}>Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Add Driver</h2>
            <p className={styles.modalSubtitle}>Admin-assisted onboarding for drivers who need help registering</p>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}><X size={20} /></button>
        </header>

        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s.id} className={`${styles.stepItem} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>
                {i < step ? <Check size={14} /> : <s.icon size={14} />}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        <div className={styles.stepContent}>
          {step === 0 && (
            <div className={styles.formSection}>
              <div className={styles.sectionNotice}>
                <User size={18} />
                <span>Enter the driver's personal details. You can fill these in while speaking with the driver over the phone or in person.</span>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Input label="Full Name" placeholder="Full Name" required value={form.full_name} onChange={e => update('full_name', e.target.value)} error={errors.full_name} />
                  <p className={styles.helperText}>{INLINE_HELP.full_name}</p>
                </div>
                <div className={styles.formGroup}>
                  <Input label="Email" placeholder="Email" required type="email" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} />
                  <p className={styles.helperText}>{INLINE_HELP.email}</p>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Input label="Phone" placeholder="Phone" required value={form.phone} onChange={e => update('phone', e.target.value)} error={errors.phone} />
                  <p className={styles.helperText}>{INLINE_HELP.phone}</p>
                </div>
                <div className={styles.formGroup}>
                  <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} />
                  <p className={styles.helperText}>{INLINE_HELP.date_of_birth}</p>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Residential Address</label>
                  <textarea className={styles.textarea} value={form.residential_address} onChange={e => update('residential_address', e.target.value)} placeholder="Full street address, city, state/province" rows={2} />
                  <p className={styles.helperText}>{INLINE_HELP.residential_address}</p>
                </div>
                <div className={styles.formGroup}>
                  <Input label="Government ID Number" placeholder="Government ID Number" value={form.government_id_number} onChange={e => update('government_id_number', e.target.value)} />
                  <p className={styles.helperText}>{INLINE_HELP.government_id_number}</p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.formSection}>
              <div className={styles.sectionNotice}>
                <Car size={18} />
                <span>Register the vehicle the driver will use. If they haven't secured a vehicle yet, you can skip this step.</span>
              </div>
              <label className={styles.checkboxRow}>
                <input type="checkbox" checked={!form.has_vehicle} onChange={e => update('has_vehicle', !e.target.checked)} />
                <span>Driver doesn't have a vehicle yet — skip vehicle details</span>
              </label>
              <p className={styles.helperText} style={{ marginTop: 4 }}>{INLINE_HELP.vehicle_skip}</p>

              {form.has_vehicle && (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <Input label="Make" placeholder="Make" required value={form.make} onChange={e => update('make', e.target.value)} error={errors.make} />
                    </div>
                    <div className={styles.formGroup}>
                      <Input label="Model" placeholder="Model" required value={form.model} onChange={e => update('model', e.target.value)} error={errors.model} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <Input label="Year" placeholder="Year" required type="number" value={form.year} onChange={e => update('year', e.target.value)} error={errors.year} />
                    </div>
                    <div className={styles.formGroup}>
                      <Input label="Colour" placeholder="Colour" value={form.colour} onChange={e => update('colour', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <Input label="Plate Number" placeholder="Plate Number" required value={form.plate_number} onChange={e => update('plate_number', e.target.value)} error={errors.plate_number} />
                      <p className={styles.helperText}>{INLINE_HELP.plate_number}</p>
                    </div>
                    <div className={styles.formGroup} />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={styles.formSection}>
              <div className={styles.sectionNotice}>
                <Camera size={18} />
                <span>{INLINE_HELP.docs_helper}</span>
              </div>
              {DOCUMENT_CONFIG.map(doc => {
                const docState = form.documents[doc.key];
                return (
                  <div key={doc.key} className={styles.docRow}>
                    <div className={styles.docRowHeader}>
                      <doc.icon size={18} />
                      <div className={styles.docRowInfo}>
                        <strong>{doc.label}</strong>
                        <p className={styles.helperText}>{doc.help}</p>
                      </div>
                    </div>
                    <div className={styles.docRowActions}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        ref={el => fileInputs.current[doc.key] = el}
                        onChange={e => {
                          if (e.target.files[0]) handleFileUpload(doc.key, e.target.files[0]);
                        }}
                        style={{ display: 'none' }}
                      />
                      {docState.file ? (
                        <div className={styles.docUploaded}>
                          <span className={styles.docFileName}>{docState.name}</span>
                          <button className={styles.docRemoveBtn} onClick={() => { updateDoc(doc.key, 'file', null); updateDoc(doc.key, 'name', ''); if (fileInputs.current[doc.key]) fileInputs.current[doc.key].value = ''; }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button className={styles.docUploadBtn} onClick={() => fileInputs.current[doc.key]?.click()}>
                          <Upload size={14} />
                          Upload
                        </button>
                      )}
                      <label className={styles.docCheckbox}>
                        <input
                          type="checkbox"
                          checked={docState.will_provide_later}
                          onChange={e => updateDoc(doc.key, 'will_provide_later', e.target.checked)}
                        />
                        <span>Provide later</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className={styles.formSection}>
              <div className={styles.sectionNotice}>
                <ClipboardCheck size={18} />
                <span>Review all information before submitting. You can go back to edit any section.</span>
              </div>
              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHeader}>
                  <User size={16} />
                  <span>Personal Information</span>
                  <button className={styles.reviewEditBtn} onClick={() => setStep(0)}>Edit</button>
                </div>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}><label>Name</label><span>{form.full_name || '—'}</span></div>
                  <div className={styles.reviewItem}><label>Email</label><span>{form.email || '—'}</span></div>
                  <div className={styles.reviewItem}><label>Phone</label><span>{form.phone || '—'}</span></div>
                  <div className={styles.reviewItem}><label>DOB</label><span>{form.date_of_birth || '—'}</span></div>
                  <div className={styles.reviewItem}><label>Address</label><span>{form.residential_address || '—'}</span></div>
                  <div className={styles.reviewItem}><label>Govt ID</label><span>{form.government_id_number || '—'}</span></div>
                </div>
              </div>
              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHeader}>
                  <Car size={16} />
                  <span>Vehicle Details</span>
                  <button className={styles.reviewEditBtn} onClick={() => setStep(1)}>Edit</button>
                </div>
                {form.has_vehicle ? (
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}><label>Make</label><span>{form.make || '—'}</span></div>
                    <div className={styles.reviewItem}><label>Model</label><span>{form.model || '—'}</span></div>
                    <div className={styles.reviewItem}><label>Year</label><span>{form.year || '—'}</span></div>
                    <div className={styles.reviewItem}><label>Colour</label><span>{form.colour || '—'}</span></div>
                    <div className={styles.reviewItem}><label>Plate No.</label><span>{form.plate_number || '—'}</span></div>
                  </div>
                ) : (
                  <p className={styles.reviewSkipped}>No vehicle registered — driver will add later.</p>
                )}
              </div>
              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHeader}>
                  <FileText size={16} />
                  <span>Documents</span>
                  <button className={styles.reviewEditBtn} onClick={() => setStep(2)}>Edit</button>
                </div>
                <div className={styles.reviewGrid}>
                  {DOCUMENT_CONFIG.map(doc => {
                    const ds = form.documents[doc.key];
                    const status = ds.file ? 'Uploaded' : ds.will_provide_later ? 'Will provide later' : 'Not provided';
                    return (
                      <div key={doc.key} className={styles.reviewItem}>
                        <label>{doc.label}</label>
                        <span className={ds.file ? styles.reviewStatusOk : styles.reviewStatusPending}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <div className={styles.footerRight}>
            {step > 0 && (
              <Button variant="ghost" onClick={handleBack} icon={ChevronLeft}>Back</Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={handleNext}>Next Step</Button>
            ) : (
              <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>Submit Driver</Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
