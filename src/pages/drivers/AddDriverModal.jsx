import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Camera, Car, Check, ChevronLeft, ClipboardCheck, FileText, Upload, User, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import styles from './AddDriverModal.module.css';

const STEPS = [
  { id: 'personal', label: 'Driver Details', icon: User },
  { id: 'vehicle', label: 'Vehicle Details', icon: Car },
  { id: 'documents', label: 'KYC Documents', icon: FileText },
  { id: 'review', label: 'Review & Submit', icon: ClipboardCheck },
];

const DOCUMENT_CONFIG = [
  { key: 'pictureUrl', label: 'Portrait Photograph', required: true, icon: Camera },
  { key: 'idFrontImageUrl', label: 'Government ID (Front)', icon: FileText },
  { key: 'idBackImageUrl', label: 'Government ID (Back)', icon: FileText },
  { key: 'passportImageUrl', label: 'Passport Photograph', icon: FileText },
  { key: 'vehicleFrontImageUrl', label: 'Vehicle (Front)', icon: Car },
  { key: 'vehicleBackImageUrl', label: 'Vehicle (Back)', icon: Car },
  { key: 'vehicleInteriorImageUrl', label: 'Vehicle (Interior)', icon: Car },
  { key: 'vehicleDocumentsImageUrl', label: 'Vehicle Registration', icon: FileText },
  { key: 'vehicleInsuranceCertificateImageUrl', label: 'Insurance Certificate', icon: FileText },
  { key: 'vehicleLicenseImageUrl', label: 'Vehicle Licence', icon: FileText },
  { key: 'proofOfVehicleOwnershipImageUrl', label: 'Proof of Vehicle Ownership', icon: FileText },
  { key: 'roadWorthinessCertificateImageUrl', label: 'Roadworthiness Certificate', icon: FileText },
];

const emptyDocuments = () => Object.fromEntries(DOCUMENT_CONFIG.map(({ key }) => [key, null]));

const emptyForm = () => ({
  phoneNumber: '',
  password: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  driverType: 'regular',
  country: '',
  state: '',
  lga: '',
  city: '',
  idType: '',
  idNumber: '',
  vehicleType: '',
  vehicleBrand: '',
  vehicleModel: '',
  vehiclePlateNumber: '',
  documents: emptyDocuments(),
});

function uploadUrl(result) {
  if (typeof result === 'string') return result;
  const value = result?.url || result?.fileUrl || result?.uploadedFile || result?.location;
  if (!value) throw new Error('The upload service did not return a file URL.');
  return value;
}

export default function AddDriverModal({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const fileInputs = useRef({});

  const update = (field, value) => {
    if (field === 'phoneNumber' && value !== form.phoneNumber) {
      setPhoneVerified(false);
      setVerificationRequested(false);
      setVerificationCode('');
    }
    setForm((previous) => ({ ...previous, [field]: value }));
  };
  const updateDocument = (key, value) => setForm((previous) => ({
    ...previous,
    documents: { ...previous.documents, [key]: value },
  }));

  function validateStep(currentStep) {
    const nextErrors = {};
    const requiredByStep = [
      ['firstName', 'lastName', 'phoneNumber', 'password', 'gender', 'dateOfBirth', 'driverType', 'country', 'state', 'lga', 'city', 'idType', 'idNumber'],
      [],
      ['pictureUrl'],
    ];

    (requiredByStep[currentStep] || []).forEach((field) => {
      const value = field === 'pictureUrl' ? form.documents.pictureUrl : form[field];
      if (!String(value || '').trim()) nextErrors[field] = 'This field is required.';
    });

    if (currentStep === 0 && form.phoneNumber.trim().length < 11) nextErrors.phoneNumber = 'Use an 11 to 15 digit phone number.';
    if (currentStep === 0 && !phoneVerified && !nextErrors.phoneNumber) nextErrors.phoneNumber = 'Verify this phone number before continuing.';
    if (currentStep === 0 && !/(?=.*\d)(?=.*\W).{8,}/.test(form.password)) {
      nextErrors.password = 'Use at least 8 characters with a number and special character.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function requestPhoneVerification() {
    if (form.phoneNumber.trim().length < 11) {
      setErrors((previous) => ({ ...previous, phoneNumber: 'Use an 11 to 15 digit phone number.' }));
      return;
    }

    setVerifyingPhone(true);
    setSubmitError('');
    try {
      await adminApi.requestPhoneVerification({ phoneNumber: form.phoneNumber.trim(), userType: 'driver' });
      setVerificationRequested(true);
      setPhoneVerified(false);
      setVerificationCode('');
      setErrors((previous) => ({ ...previous, phoneNumber: undefined }));
    } catch (error) {
      setSubmitError(error.message || 'Unable to send the verification code.');
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function confirmPhoneVerification() {
    if (!/^\d{4,6}$/.test(verificationCode)) {
      setErrors((previous) => ({ ...previous, verificationCode: 'Enter the 4 to 6 digit verification code.' }));
      return;
    }

    setVerifyingPhone(true);
    setSubmitError('');
    try {
      await adminApi.confirmPhoneVerification({ phoneNumber: form.phoneNumber.trim(), token: verificationCode });
      setPhoneVerified(true);
      setErrors((previous) => ({ ...previous, phoneNumber: undefined, verificationCode: undefined }));
    } catch (error) {
      setSubmitError(error.message || 'Unable to verify the phone number.');
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function handleSubmit() {
    if (![0, 1, 2].every(validateStep)) return;

    setSaving(true);
    setSubmitError('');
    try {
      await adminApi.registerDriver({
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });

      const uploadedDocuments = {};
      for (const document of DOCUMENT_CONFIG) {
        const file = form.documents[document.key];
        if (!file) continue;
        const result = await adminApi.uploadFile(file);
        const url = uploadUrl(result);
        uploadedDocuments[document.key] = document.key === 'pictureUrl' ? url : [url];
      }

      await adminApi.createAssistedUserKyc({
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        driverType: form.driverType,
        country: form.country.trim(),
        state: form.state.trim(),
        lga: form.lga.trim(),
        city: form.city.trim(),
        idType: form.idType.trim(),
        idNumber: form.idNumber.trim(),
        vehicleType: form.vehicleType.trim() || undefined,
        vehicleBrand: form.vehicleBrand.trim() || undefined,
        vehicleModel: form.vehicleModel.trim() || undefined,
        vehiclePlateNumber: form.vehiclePlateNumber.trim() || undefined,
        ...uploadedDocuments,
      });

      setSubmitted(true);
      await onCreated?.();
    } catch (error) {
      setSubmitError(error.message || 'Unable to create the driver.');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setStep(0);
    setSubmitted(false);
    setSubmitError('');
    setVerificationCode('');
    setVerificationRequested(false);
    setPhoneVerified(false);
    setErrors({});
    setForm(emptyForm());
    onClose();
  }

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          <div className={styles.successScreen}>
            <div className={styles.successIcon}><Check size={48} /></div>
            <h2>Driver Onboarding Created</h2>
            <p className={styles.successMsg}><strong>{form.firstName} {form.lastName}</strong> has a driver account and an admin-assisted KYC application.</p>
            <Button variant="primary" onClick={handleClose}>Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Add Driver</h2>
            <p className={styles.modalSubtitle}>Create the driver account and its admin-assisted KYC application.</p>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} disabled={saving} aria-label="Close"><X size={20} /></button>
        </header>

        <div className={styles.stepper}>
          {STEPS.map((item, index) => (
            <div key={item.id} className={`${styles.stepItem} ${index <= step ? styles.stepActive : ''} ${index < step ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{index < step ? <Check size={14} /> : <item.icon size={14} />}</div>
              <span className={styles.stepLabel}>{item.label}</span>
              {index < STEPS.length - 1 && <div className={`${styles.stepLine} ${index < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        <div className={styles.stepContent}>
          {submitError && <div className={styles.submitError}>{submitError}</div>}
          {step === 0 && <DriverDetails form={form} update={update} errors={errors} verificationCode={verificationCode} setVerificationCode={setVerificationCode} verificationRequested={verificationRequested} phoneVerified={phoneVerified} verifyingPhone={verifyingPhone} requestPhoneVerification={requestPhoneVerification} confirmPhoneVerification={confirmPhoneVerification} />}
          {step === 1 && <VehicleDetails form={form} update={update} />}
          {step === 2 && <Documents form={form} errors={errors} updateDocument={updateDocument} fileInputs={fileInputs} />}
          {step === 3 && <Review form={form} setStep={setStep} />}
        </div>

        <footer className={styles.modalFooter}>
          <Button variant="ghost" onClick={handleClose} disabled={saving}>Cancel</Button>
          <div className={styles.footerRight}>
            {step > 0 && <Button variant="ghost" onClick={() => setStep((current) => current - 1)} icon={ChevronLeft} disabled={saving}>Back</Button>}
            {step < STEPS.length - 1 ? <Button variant="primary" onClick={handleNext} disabled={saving}>Next Step</Button> : <Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Creating Driver...' : 'Create Driver'}</Button>}
          </div>
        </footer>
      </div>
    </div>
  );
}

function DriverDetails({ form, update, errors, verificationCode, setVerificationCode, verificationRequested, phoneVerified, verifyingPhone, requestPhoneVerification, confirmPhoneVerification }) {
  return <div className={styles.formSection}>
    <div className={styles.sectionNotice}><User size={18} /><span>These fields are required by the driver signup and admin-assisted KYC endpoints.</span></div>
    <div className={styles.formRow}>
      <Field label="First Name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} error={errors.firstName} required />
      <Field label="Middle Name" value={form.middleName} onChange={(event) => update('middleName', event.target.value)} />
    </div>
    <div className={styles.formRow}>
      <Field label="Last Name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} error={errors.lastName} required />
      <Field label="Phone Number" value={form.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} error={errors.phoneNumber} required />
    </div>
    <div className={styles.verificationRow}>
      {phoneVerified ? <span className={styles.verifiedPhone}><Check size={16} /> Phone number verified</span> : <Button type="button" variant="secondary" onClick={requestPhoneVerification} disabled={verifyingPhone}>{verificationRequested ? 'Resend Code' : 'Send Verification Code'}</Button>}
      {verificationRequested && !phoneVerified && <><Input label="Verification Code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ''))} error={errors.verificationCode} inputMode="numeric" maxLength={6} /><Button type="button" variant="primary" onClick={confirmPhoneVerification} disabled={verifyingPhone}>{verifyingPhone ? 'Verifying...' : 'Verify Code'}</Button></>}
    </div>
    <div className={styles.formRow}>
      <Field label="Temporary Password" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} error={errors.password} required />
      <SelectField label="Gender" value={form.gender} onChange={(event) => update('gender', event.target.value)} error={errors.gender} required options={['Female', 'Male', 'Other']} />
    </div>
    <div className={styles.formRow}>
      <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(event) => update('dateOfBirth', event.target.value)} error={errors.dateOfBirth} required />
      <SelectField label="Driver Type" value={form.driverType} onChange={(event) => update('driverType', event.target.value)} error={errors.driverType} required options={[['regular', 'Regular'], ['vip', 'VIP']]} />
    </div>
    <div className={styles.formRow}>
      <Field label="Country" value={form.country} onChange={(event) => update('country', event.target.value)} error={errors.country} required />
      <Field label="State" value={form.state} onChange={(event) => update('state', event.target.value)} error={errors.state} required />
    </div>
    <div className={styles.formRow}>
      <Field label="LGA" value={form.lga} onChange={(event) => update('lga', event.target.value)} error={errors.lga} required />
      <Field label="City" value={form.city} onChange={(event) => update('city', event.target.value)} error={errors.city} required />
    </div>
    <div className={styles.formRow}>
      <Field label="ID Type" value={form.idType} onChange={(event) => update('idType', event.target.value)} error={errors.idType} required />
      <Field label="ID Number" value={form.idNumber} onChange={(event) => update('idNumber', event.target.value)} error={errors.idNumber} required />
    </div>
  </div>;
}

function VehicleDetails({ form, update }) {
  return <div className={styles.formSection}>
    <div className={styles.sectionNotice}><Car size={18} /><span>Vehicle data is optional in the documented KYC contract and can be left blank when unavailable.</span></div>
    <div className={styles.formRow}><Field label="Vehicle Type" value={form.vehicleType} onChange={(event) => update('vehicleType', event.target.value)} /><Field label="Vehicle Brand" value={form.vehicleBrand} onChange={(event) => update('vehicleBrand', event.target.value)} /></div>
    <div className={styles.formRow}><Field label="Vehicle Model" value={form.vehicleModel} onChange={(event) => update('vehicleModel', event.target.value)} /><Field label="Vehicle Plate Number" value={form.vehiclePlateNumber} onChange={(event) => update('vehiclePlateNumber', event.target.value)} /></div>
  </div>;
}

function Documents({ form, errors, updateDocument, fileInputs }) {
  return <div className={styles.formSection}>
    <div className={styles.sectionNotice}><Camera size={18} /><span>The portrait is required. Other document uploads map directly to the documented KYC fields and are optional.</span></div>
    {DOCUMENT_CONFIG.map((document) => {
      const file = form.documents[document.key];
      return <div className={styles.docRow} key={document.key}>
        <div className={styles.docRowHeader}><document.icon size={18} /><div className={styles.docRowInfo}><strong>{document.label}{document.required ? ' *' : ''}</strong>{errors[document.key] && <p className={styles.fieldError}>{errors[document.key]}</p>}</div></div>
        <div className={styles.docRowActions}>
          <input ref={(element) => { fileInputs.current[document.key] = element; }} type="file" accept="image/*,.pdf" onChange={(event) => updateDocument(document.key, event.target.files?.[0] || null)} hidden />
          {file ? <><span className={styles.docFileName}>{file.name}</span><button type="button" className={styles.docRemoveBtn} onClick={() => { updateDocument(document.key, null); if (fileInputs.current[document.key]) fileInputs.current[document.key].value = ''; }} aria-label={`Remove ${document.label}`}><X size={14} /></button></> : <button type="button" className={styles.docUploadBtn} onClick={() => fileInputs.current[document.key]?.click()}><Upload size={14} />Upload</button>}
        </div>
      </div>;
    })}
  </div>;
}

function Review({ form, setStep }) {
  const uploadedCount = Object.values(form.documents).filter(Boolean).length;
  return <div className={styles.formSection}>
    <div className={styles.sectionNotice}><ClipboardCheck size={18} /><span>Creating the driver will register the account first, upload selected files, then create the admin-assisted KYC record.</span></div>
    <div className={styles.reviewBlock}><div className={styles.reviewBlockHeader}><User size={16} /><span>Driver Details</span><button type="button" className={styles.reviewEditBtn} onClick={() => setStep(0)}>Edit</button></div><div className={styles.reviewGrid}><ReviewItem label="Name" value={`${form.firstName} ${form.middleName} ${form.lastName}`.replace(/\s+/g, ' ').trim()} /><ReviewItem label="Phone" value={form.phoneNumber} /><ReviewItem label="Type" value={form.driverType} /><ReviewItem label="Location" value={[form.city, form.state, form.country].filter(Boolean).join(', ')} /></div></div>
    <div className={styles.reviewBlock}><div className={styles.reviewBlockHeader}><Car size={16} /><span>Vehicle</span><button type="button" className={styles.reviewEditBtn} onClick={() => setStep(1)}>Edit</button></div><div className={styles.reviewGrid}><ReviewItem label="Vehicle" value={[form.vehicleBrand, form.vehicleModel].filter(Boolean).join(' ') || 'Not supplied'} /><ReviewItem label="Plate Number" value={form.vehiclePlateNumber || 'Not supplied'} /></div></div>
    <div className={styles.reviewBlock}><div className={styles.reviewBlockHeader}><FileText size={16} /><span>Documents</span><button type="button" className={styles.reviewEditBtn} onClick={() => setStep(2)}>Edit</button></div><div className={styles.reviewGrid}><ReviewItem label="Uploaded Files" value={`${uploadedCount} selected`} /><ReviewItem label="Portrait" value={form.documents.pictureUrl ? 'Selected' : 'Required'} /></div></div>
  </div>;
}

function Field({ label, error, required, ...props }) { return <div className={styles.formGroup}><Input label={label} required={required} {...props} error={error} />{error && <p className={styles.fieldError}>{error}</p>}</div>; }
function SelectField({ label, value, onChange, error, required, options }) { return <div className={styles.formGroup}><label className={styles.fieldLabel}>{label}{required ? ' *' : ''}</label><select className={styles.select} value={value} onChange={onChange}><option value="">Select...</option>{options.map((option) => { const [valueOption, labelOption] = Array.isArray(option) ? option : [option.toLowerCase(), option]; return <option key={valueOption} value={valueOption}>{labelOption}</option>; })}</select>{error && <p className={styles.fieldError}>{error}</p>}</div>; }
function ReviewItem({ label, value }) { return <div className={styles.reviewItem}><label>{label}</label><span>{value || '—'}</span></div>; }
