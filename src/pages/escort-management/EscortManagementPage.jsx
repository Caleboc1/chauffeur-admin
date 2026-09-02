import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit2,
  Info,
  Layers,
  ShieldCheck,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { formatCurrency } from '@/utils/formatters';
import Skeleton from '@/components/ui/Skeleton';
import styles from './EscortManagementPage.module.css';

const MAX_ESCORTS = 20;

function clampEscortCount(value) {
  return Math.min(MAX_ESCORTS, Math.max(0, Number(value) || 0));
}

function buildForm(settings = {}) {
  return {
    availableEscortCount: clampEscortCount(settings.availableEscortCount),
    costPerEscort: Number(settings.costPerEscort || 0),
  };
}

export default function EscortManagementPage() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(buildForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  async function loadSettings() {
    setLoading(true);
    setError('');

    try {
      const data = await adminApi.getSystemSettings();
      setSettings(data);
      setForm(buildForm(data));
    } catch (err) {
      setError(err.message || 'Unable to load escort settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const stats = useMemo(() => {
    const availableEscortCount = Number(settings?.availableEscortCount || 0);
    const costPerEscort = Number(settings?.costPerEscort || 0);

    return {
      availableEscortCount,
      costPerEscort,
      maxSelectable: availableEscortCount,
      projectedFullEscortCost: availableEscortCount * costPerEscort,
    };
  }, [settings]);

  function openEditModal() {
    setForm(buildForm(settings));
    setModalStep(1);
    setSuccessMessage('');
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setModalStep(1);
    setForm(buildForm(settings));
  }

  function updateEscorts(delta) {
    setForm((current) => ({
      ...current,
      availableEscortCount: clampEscortCount(current.availableEscortCount + delta),
    }));
  }

  function canSave() {
    return form.availableEscortCount >= 0 && form.costPerEscort >= 0;
  }

  async function saveConfiguration() {
    if (!canSave()) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await adminApi.updateSystemSettings({
        availableEscortCount: form.availableEscortCount,
        costPerEscort: form.costPerEscort,
      });
      const nextSettings = await adminApi.getSystemSettings();
      setSettings(nextSettings);
      setForm(buildForm(nextSettings));
      setSuccessMessage('Escort settings updated successfully.');
      setModalOpen(false);
      setModalStep(1);
    } catch (err) {
      setError(err.message || 'Unable to update escort settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Escort Management</h1>
          <p className={styles.subtitle}>Configure how many security escorts VIP passengers can request, and the backend cost per escort.</p>
        </div>
        <button className={styles.primaryButton} onClick={openEditModal} disabled={loading}>
          <Edit2 size={18} />
          Edit Settings
        </button>
      </header>

      {error && <div className={styles.infoBox}><Info size={18} /><span>{error}</span></div>}
      {successMessage && <div className={styles.infoBox}><Check size={18} /><span>{successMessage}</span></div>}

      <section className={styles.statsGrid}>
        <StatCard icon={ShieldCheck} label="Escorts Available" value={loading ? '—' : stats.availableEscortCount} variant="green" />
        <StatCard icon={Layers} label="Cost Per Escort" value={loading ? '—' : formatCurrency(stats.costPerEscort)} variant="teal" />
        <StatCard icon={ShieldCheck} label="Max Passenger Selection" value={loading ? '—' : stats.maxSelectable} variant="gray" />
        <StatCard icon={Layers} label="Full Escort Cost" value={loading ? '—' : formatCurrency(stats.projectedFullEscortCost)} variant="orange" />
      </section>

      <section className={styles.featureCard}>
        <div className={styles.featureMain}>
          <div className={styles.livePill}>
            <span />
            Backend Live
          </div>
          <div className={styles.activeBadge}>System Setting</div>

          <div className={styles.bigNumber}>
            {loading ? <Skeleton width="60px" height="1em" /> : stats.availableEscortCount}
          </div>
          <h2 className={styles.featureTitle}>escorts available to VIP passengers</h2>
          <div className={styles.dateLine}>
            <ShieldCheck size={16} />
            {loading ? <Skeleton width="140px" height="14px" /> : `${formatCurrency(stats.costPerEscort)} per escort`}
          </div>

          <div className={styles.progressPanel}>
            <div className={styles.progressTop}>
              <span>Backend Contract</span>
              <strong>System Settings</strong>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${Math.min(100, (stats.availableEscortCount / MAX_ESCORTS) * 100)}%` }} />
            </div>
            <div className={styles.progressBottom}>
              <span>0 escorts</span>
              <strong>{stats.availableEscortCount} of {MAX_ESCORTS}</strong>
              <span>{MAX_ESCORTS} max</span>
            </div>
          </div>

          <p className={styles.noteLine}>
            The current API supports a global escort count and global escort price. Date windows, history, and per-state escort availability need a dedicated backend contract before they can be restored.
          </p>

          <div className={styles.actionRow}>
            <button className={styles.secondaryButton} onClick={openEditModal} disabled={loading}>
              <Edit2 size={18} />
              Edit Backend Settings
            </button>
            <button className={styles.secondaryButton} onClick={loadSettings} disabled={loading || saving}>
              Refresh
            </button>
          </div>
        </div>

        <aside className={styles.phonePanel}>
          <span className={styles.passengerCaption}>Passenger VIP Booking</span>
          <div className={styles.phoneMock}>
            <div className={styles.phoneNotch} />
            <h3>VIP Ride Booking</h3>
            <p>Security escorts</p>
            <div className={styles.escortChoices}>
              {Array.from({ length: Math.min(4, stats.availableEscortCount + 1) }, (_, count) => (
                <span key={count} className={count === 0 ? styles.choiceActive : ''}>{count}</span>
              ))}
            </div>
            <button>Continue</button>
          </div>
          <p className={styles.phoneHelp}>Passenger escort selection is capped by the backend value: {stats.availableEscortCount}.</p>
        </aside>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>
            <h2>Backend Fields</h2>
            <span>2</span>
          </div>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Field</th>
                <th>Current Value</th>
                <th>Source</th>
                <th>Editable</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>availableEscortCount</td>
                <td>{loading ? '—' : stats.availableEscortCount}</td>
                <td>GET /api/v1/system_settings/full</td>
                <td><span className={`${styles.statusPill} ${styles.active}`}>yes</span></td>
              </tr>
              <tr>
                <td>costPerEscort</td>
                <td>{loading ? '—' : formatCurrency(stats.costPerEscort)}</td>
                <td>GET /api/v1/system_settings/full</td>
                <td><span className={`${styles.statusPill} ${styles.active}`}>yes</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div className={styles.modalIcon}><ShieldCheck size={20} /></div>
              <div>
                <h2>Edit Escort Settings</h2>
                <p>These values save directly to system settings.</p>
              </div>
              <button className={styles.closeButton} onClick={closeModal}><X size={20} /></button>
            </header>

            <div className={styles.stepper}>
              <span className={modalStep === 1 ? styles.stepActive : ''}>1</span>
              <strong>Details</strong>
              <div />
              <span className={modalStep === 2 ? styles.stepActive : ''}>2</span>
              <strong className={modalStep === 2 ? styles.stepTextActive : ''}>Review</strong>
            </div>

            {modalStep === 1 ? (
              <div className={styles.formBody}>
                <label className={styles.fieldLabel}>Number of Available Escorts</label>
                <div className={styles.stepperInput}>
                  <button type="button" onClick={() => updateEscorts(-1)} disabled={form.availableEscortCount === 0}>−</button>
                  <input
                    value={form.availableEscortCount}
                    onChange={(event) => setForm((current) => ({ ...current, availableEscortCount: clampEscortCount(event.target.value) }))}
                  />
                  <button type="button" onClick={() => updateEscorts(1)} disabled={form.availableEscortCount === MAX_ESCORTS}>+</button>
                </div>
                <p className={styles.helpText}>Passengers can request up to this many escorts per VIP ride. Maximum {MAX_ESCORTS}.</p>

                <label className={styles.notesField}>
                  <span>Cost Per Escort</span>
                  <input
                    type="number"
                    min="0"
                    value={form.costPerEscort}
                    onChange={(event) => setForm((current) => ({ ...current, costPerEscort: Math.max(0, Number(event.target.value) || 0) }))}
                    placeholder="50000"
                  />
                </label>

                <div className={styles.infoBox}>
                  <Info size={18} />
                  <span>The current backend does not support escort date windows, only global availability and cost.</span>
                </div>
              </div>
            ) : (
              <div className={styles.reviewBody}>
                <div className={styles.reviewValue}>{form.availableEscortCount}</div>
                <h3>escorts available</h3>
                <p>{formatCurrency(form.costPerEscort)} per escort</p>
                <div className={styles.reviewPanel}>
                  <span>Full escort cost</span>
                  <strong>{formatCurrency(form.availableEscortCount * form.costPerEscort)}</strong>
                </div>
                <div className={styles.reviewPanel}>
                  <span>Endpoint</span>
                  <strong>PATCH /api/v1/system_settings</strong>
                </div>
              </div>
            )}

            <footer className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={modalStep === 1 ? closeModal : () => setModalStep(1)} disabled={saving}>
                {modalStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button className={styles.modalPrimaryButton} disabled={!canSave() || saving} onClick={modalStep === 1 ? () => setModalStep(2) : saveConfiguration}>
                {modalStep === 1 ? 'Continue' : saving ? 'Saving...' : 'Save Changes'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, variant }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[variant]}`}>
        <Icon size={22} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
