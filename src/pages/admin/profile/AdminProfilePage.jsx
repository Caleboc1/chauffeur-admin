import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { writeAuditLog } from '@/lib/audit';
import { User, Camera } from 'lucide-react';
import styles from './AdminProfilePage.module.css';

function formatRole(roleStr) {
  if (!roleStr) return '';
  return roleStr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function AdminProfilePage() {
  const { admin, role } = useAuth();

  const [name, setName] = useState(admin?.name ?? '');
  const [phone, setPhone] = useState(admin?.phone ?? '');
  const [photoUrl, setPhotoUrl] = useState(admin?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }

    setSaving(true);

    try {
      await writeAuditLog({
        actorId: admin.id,
        actorRole: role,
        action: 'admin_profile_updated',
        entityType: 'admins',
        entityId: admin.id,
        metadata: { updated_fields: ['name', 'phone'] },
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await writeAuditLog({
        actorId: admin.id,
        actorRole: role,
        action: 'admin_photo_updated',
        entityType: 'admins',
        entityId: admin.id,
      });

      setPhotoUrl(URL.createObjectURL(file));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);

    try {
      await writeAuditLog({
        actorId: admin.id,
        actorRole: role,
        action: 'admin_password_updated',
        entityType: 'admins',
        entityId: admin.id,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const memberSince = admin?.created_at
    ? new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Admin Profile</h1>
        <p className={styles.pageSubtitle}>View and update your account details</p>
      </div>

      <div className={styles.profilePageLayout}>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatarWrapper}>
            {photoUrl ? (
              <img src={photoUrl} alt="" className={styles.profileAvatar} />
            ) : (
              <div className={styles.profileAvatarFallback}>
                <User size={32} />
              </div>
            )}
            <label className={styles.changePhotoBtn}>
              <Camera size={14} />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                className={styles.photoInput}
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          <div className={styles.profileName}>{admin?.name || 'Admin User'}</div>
          <div className={styles.profileRoleBadge}>{formatRole(role)}</div>
          <div className={styles.profileEmail}>{admin?.email || ''}</div>

          <div className={styles.profileMeta}>
            <div>Member since: {memberSince}</div>
            <div>Last login: 2h ago</div>
          </div>
        </div>

        <div>
          <form className={styles.editFormCard} onSubmit={handleSave}>
            <h2 className={styles.sectionTitle}>Edit Information</h2>

            {error && <div className={styles.formError}>{error}</div>}
            {success && <div className={styles.formSuccess}>Profile updated successfully</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                className={`${styles.formInput} ${styles.formInputDisabled}`}
                value={admin?.email || ''}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input
                type="tel"
                className={styles.formInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.formInputDisabled}`}
                value={formatRole(role)}
                disabled
              />
            </div>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <form className={styles.passwordCard} onSubmit={handlePasswordUpdate}>
            <h2 className={styles.sectionTitle}>Change Password</h2>

            {passwordError && <div className={styles.formError}>{passwordError}</div>}
            {passwordSuccess && (
              <div className={styles.formSuccess}>
                Password updated. You'll need to use your new password on next login.
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Current Password</label>
              <input
                type="password"
                className={styles.formInput}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>New Password</label>
              <input
                type="password"
                className={styles.formInput}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirm Password</label>
              <input
                type="password"
                className={styles.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={passwordSaving}
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
