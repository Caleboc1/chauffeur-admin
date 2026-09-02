import { useEffect, useMemo, useState } from 'react';
import {
  BadgePercent,
  Check,
  Edit2,
  Info,
  Percent,
  Wallet,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { formatCurrency } from '@/utils/formatters';
import Skeleton from '@/components/ui/Skeleton';
import styles from './DiscountsPage.module.css';

const EXAMPLE_FARE = 25000;

function clampPercentage(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function buildForm(settings = {}) {
  return {
    discountPercentage: clampPercentage(settings.discountPercentage),
    walletPaymentMethodDiscountPercentage: clampPercentage(settings.walletPaymentMethodDiscountPercentage),
  };
}

export default function DiscountsPage() {
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
      setError(err.message || 'Unable to load discount settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const stats = useMemo(() => {
    const discountPercentage = Number(settings?.discountPercentage || 0);
    const walletDiscountPercentage = Number(settings?.walletPaymentMethodDiscountPercentage || 0);
    const platformSaving = EXAMPLE_FARE * (discountPercentage / 100);
    const walletSaving = EXAMPLE_FARE * (walletDiscountPercentage / 100);

    return {
      discountPercentage,
      walletDiscountPercentage,
      platformSaving,
      walletSaving,
      exampleTotal: EXAMPLE_FARE - platformSaving - walletSaving,
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

  function canSave() {
    return form.discountPercentage >= 0 && form.walletPaymentMethodDiscountPercentage >= 0;
  }

  async function saveConfiguration() {
    if (!canSave()) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await adminApi.updateSystemSettings({
        discountPercentage: form.discountPercentage,
        walletPaymentMethodDiscountPercentage: form.walletPaymentMethodDiscountPercentage,
      });
      const nextSettings = await adminApi.getSystemSettings();
      setSettings(nextSettings);
      setForm(buildForm(nextSettings));
      setSuccessMessage('Discount settings updated successfully.');
      setModalOpen(false);
      setModalStep(1);
    } catch (err) {
      setError(err.message || 'Unable to update discount settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Discounts</h1>
          <p className={styles.subtitle}>Configure the platform-wide fare discount and the extra discount for wallet payments.</p>
        </div>
        <button className={styles.primaryButton} onClick={openEditModal} disabled={loading}>
          <Edit2 size={18} />
          Edit Settings
        </button>
      </header>

      {error && <div className={styles.infoBox}><Info size={18} /><span>{error}</span></div>}
      {successMessage && <div className={styles.infoBox}><Check size={18} /><span>{successMessage}</span></div>}

      <section className={styles.statsGrid}>
        <StatCard icon={Percent} label="Platform Discount" value={loading ? '—' : `${stats.discountPercentage}%`} variant="green" />
        <StatCard icon={Wallet} label="Wallet Payment Discount" value={loading ? '—' : `${stats.walletDiscountPercentage}%`} variant="teal" />
      </section>

      <section className={styles.featureCard}>
        <div className={styles.featureMain}>
          <div className={styles.livePill}>
            <span />
            Backend Live
          </div>
          <div className={styles.activeBadge}>System Setting</div>

          <div className={styles.bigNumber}>
            {loading ? <Skeleton width="60px" height="1em" /> : `${stats.discountPercentage}%`}
          </div>
          <h2 className={styles.featureTitle}>off every fare, platform-wide</h2>
          <div className={styles.dateLine}>
            <Wallet size={16} />
            {loading ? <Skeleton width="180px" height="14px" /> : `+ ${stats.walletDiscountPercentage}% extra when paid via wallet`}
          </div>

          <div className={styles.progressPanel}>
            <div className={styles.progressTop}>
              <span>Backend Contract</span>
              <strong>System Settings</strong>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${stats.discountPercentage}%` }} />
            </div>
            <div className={styles.progressBottom}>
              <span>0%</span>
              <strong>{stats.discountPercentage}% of fare</strong>
              <span>100%</span>
            </div>
          </div>

          <p className={styles.noteLine}>
            The current API only supports two global discount percentages - it does not support named campaigns, promo codes, date windows, ride-type targeting, or redemption limits. Per the backend team, only what's listed here is live.
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
          <span className={styles.passengerCaption}>Passenger Checkout</span>
          <div className={styles.phoneMock}>
            <div className={styles.phoneNotch} />
            <h3>Ride Summary</h3>
            <p>Fare</p>
            <div className={styles.escortChoices}>
              <span className={styles.choiceActive}>{formatCurrency(EXAMPLE_FARE)}</span>
            </div>
            <button>{loading ? '—' : `Pay ${formatCurrency(stats.exampleTotal)}`}</button>
          </div>
          <p className={styles.phoneHelp}>
            Example on a {formatCurrency(EXAMPLE_FARE)} fare: {stats.discountPercentage}% platform discount
            {stats.walletDiscountPercentage > 0 ? ` + ${stats.walletDiscountPercentage}% wallet discount` : ''} applied.
          </p>
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
                <td>discountPercentage</td>
                <td>{loading ? '—' : `${stats.discountPercentage}%`}</td>
                <td>GET /api/v1/system_settings/full</td>
                <td><span className={`${styles.statusPill} ${styles.active}`}>yes</span></td>
              </tr>
              <tr>
                <td>walletPaymentMethodDiscountPercentage</td>
                <td>{loading ? '—' : `${stats.walletDiscountPercentage}%`}</td>
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
              <div className={styles.modalIcon}><BadgePercent size={20} /></div>
              <div>
                <h2>Edit Discount Settings</h2>
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
                <label className={styles.notesField}>
                  <span>Platform Discount (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercentage}
                    onChange={(event) => setForm((current) => ({ ...current, discountPercentage: clampPercentage(event.target.value) }))}
                    placeholder="0"
                  />
                </label>
                <p className={styles.helpText}>Applied to every fare, platform-wide.</p>

                <label className={styles.notesField}>
                  <span>Wallet Payment Discount (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.walletPaymentMethodDiscountPercentage}
                    onChange={(event) => setForm((current) => ({ ...current, walletPaymentMethodDiscountPercentage: clampPercentage(event.target.value) }))}
                    placeholder="0"
                  />
                </label>
                <p className={styles.helpText}>Extra discount applied only when the passenger pays with their in-app wallet.</p>

                <div className={styles.infoBox}>
                  <Info size={18} />
                  <span>The current backend does not support promo codes, campaign dates, or per-ride-type discounts - only these two global percentages.</span>
                </div>
              </div>
            ) : (
              <div className={styles.reviewBody}>
                <div className={styles.reviewValue}>{form.discountPercentage}%</div>
                <h3>platform discount</h3>
                <p>+ {form.walletPaymentMethodDiscountPercentage}% extra for wallet payments</p>
                <div className={styles.reviewPanel}>
                  <span>Example on {formatCurrency(EXAMPLE_FARE)} fare</span>
                  <strong>
                    {formatCurrency(
                      EXAMPLE_FARE
                        - EXAMPLE_FARE * (form.discountPercentage / 100)
                        - EXAMPLE_FARE * (form.walletPaymentMethodDiscountPercentage / 100),
                    )}
                  </strong>
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
