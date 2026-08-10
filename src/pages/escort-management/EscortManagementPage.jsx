import { useMemo, useState } from 'react';
import {
  CalendarClock,
  CalendarX,
  Check,
  ChevronDown,
  Edit2,
  Info,
  Layers,
  MoreVertical,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import styles from './EscortManagementPage.module.css';

const INITIAL_CONFIGS = [
  {
    id: 'esc-1',
    escorts: 6,
    startDate: '2026-09-07',
    endDate: '2026-10-11',
    notes: 'Election-period surge cover. Additional protocol officers available.',
  },
  {
    id: 'esc-2',
    escorts: 3,
    startDate: '2026-07-08',
    endDate: '2026-09-06',
    notes: 'Standing coverage for Lagos and Abuja corridors.',
  },
  {
    id: 'esc-3',
    escorts: 2,
    startDate: '2026-04-29',
    endDate: '2026-07-07',
    notes: 'Q2 baseline coverage.',
  },
  {
    id: 'esc-4',
    escorts: 4,
    startDate: '2026-03-10',
    endDate: '2026-04-28',
    notes: 'Dignitary visit window — temporary uplift.',
  },
];

const TODAY = new Date('2026-07-28T12:00:00');

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseDate(value));
}

function formatInputDate(value) {
  if (!value) return '';
  return value;
}

function daysBetween(start, end) {
  return Math.max(1, Math.round((parseDate(end) - parseDate(start)) / 86400000) + 1);
}

function getStatus(config) {
  const start = parseDate(config.startDate);
  const end = parseDate(config.endDate);
  if (TODAY < start) return 'upcoming';
  if (TODAY > end) return 'expired';
  return 'active';
}

function daysUntil(config) {
  const start = parseDate(config.startDate);
  if (TODAY >= start) return null;
  return Math.max(1, Math.ceil((start - TODAY) / 86400000));
}

function buildEmptyForm() {
  return {
    escorts: 0,
    startDate: '',
    endDate: '',
    notes: '',
  };
}

export default function EscortManagementPage() {
  const [configs, setConfigs] = useState(INITIAL_CONFIGS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalMode, setModalMode] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const enrichedConfigs = useMemo(() => {
    return configs.map((config) => ({
      ...config,
      status: getStatus(config),
      duration: daysBetween(config.startDate, config.endDate),
      startsIn: daysUntil(config),
    }));
  }, [configs]);

  const activeConfig = enrichedConfigs.find((config) => config.status === 'active') || enrichedConfigs[0];

  const stats = {
    available: activeConfig?.status === 'active' ? activeConfig.escorts : 0,
    upcoming: enrichedConfigs.filter((config) => config.status === 'upcoming').length,
    expired: enrichedConfigs.filter((config) => config.status === 'expired').length,
    total: enrichedConfigs.length,
  };

  const filteredConfigs = enrichedConfigs.filter((config) => {
    if (statusFilter === 'all') return true;
    return config.status === statusFilter;
  });

  const progress = activeConfig ? Math.min(100, Math.max(0, Math.round(((TODAY - parseDate(activeConfig.startDate)) / (parseDate(activeConfig.endDate) - parseDate(activeConfig.startDate))) * 100))) : 0;
  const activeTotalDays = activeConfig ? daysBetween(activeConfig.startDate, activeConfig.endDate) : 0;
  const activeDay = activeConfig ? Math.min(activeTotalDays, Math.max(1, daysBetween(activeConfig.startDate, TODAY.toISOString().slice(0, 10)))) : 0;
  const daysRemaining = activeConfig ? Math.max(0, Math.ceil((parseDate(activeConfig.endDate) - TODAY) / 86400000)) : 0;

  function openAddModal() {
    setModalMode('add');
    setModalStep(1);
    setEditingId(null);
    setForm(buildEmptyForm());
  }

  function openEditModal(config) {
    setModalMode('edit');
    setModalStep(1);
    setEditingId(config.id);
    setForm({
      escorts: config.escorts,
      startDate: config.startDate,
      endDate: config.endDate,
      notes: config.notes,
    });
  }

  function closeModal() {
    setModalMode(null);
    setModalStep(1);
    setEditingId(null);
    setForm(buildEmptyForm());
  }

  function updateEscorts(delta) {
    setForm((prev) => ({
      ...prev,
      escorts: Math.min(20, Math.max(0, prev.escorts + delta)),
    }));
  }

  function canContinue() {
    return form.escorts >= 0 && form.startDate && form.endDate && parseDate(form.endDate) >= parseDate(form.startDate);
  }

  function saveConfiguration() {
    const payload = {
      escorts: form.escorts,
      startDate: form.startDate,
      endDate: form.endDate,
      notes: form.notes.trim() || '—',
    };

    if (modalMode === 'edit') {
      setConfigs((prev) => prev.map((config) => config.id === editingId ? { ...config, ...payload } : config));
    } else {
      setConfigs((prev) => [
        {
          id: `esc-${Date.now()}`,
          ...payload,
        },
        ...prev,
      ]);
    }

    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget || !deleteReason.trim()) return;
    setConfigs((prev) => prev.filter((config) => config.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteReason('');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Escort Management</h1>
          <p className={styles.subtitle}>Configure how many security escorts VIP passengers can request, and when</p>
        </div>
        <button className={styles.primaryButton} onClick={openAddModal}>
          <Plus size={18} />
          Add Escort
        </button>
      </header>

      <section className={styles.statsGrid}>
        <StatCard icon={ShieldCheck} label="Escorts Available Today" value={stats.available} variant="green" />
        <StatCard icon={CalendarClock} label="Upcoming Windows" value={stats.upcoming} variant="teal" />
        <StatCard icon={CalendarX} label="Expired Windows" value={stats.expired} variant="orange" />
        <StatCard icon={Layers} label="Total Configurations" value={stats.total} variant="gray" />
      </section>

      {activeConfig && (
        <section className={styles.featureCard}>
          <div className={styles.featureMain}>
            <div className={styles.livePill}>
              <span />
              Live Now
            </div>
            <div className={styles.activeBadge}>Active</div>

            <div className={styles.bigNumber}>{activeConfig.escorts}</div>
            <h2 className={styles.featureTitle}>escorts available to VIP passengers</h2>
            <div className={styles.dateLine}>
              <CalendarClock size={16} />
              {formatDate(activeConfig.startDate)} &rarr; {formatDate(activeConfig.endDate)}
            </div>

            <div className={styles.progressPanel}>
              <div className={styles.progressTop}>
                <span>Window Progress</span>
                <strong>Day {activeDay} of {activeTotalDays}</strong>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.progressBottom}>
                <span>{formatDate(activeConfig.startDate)}</span>
                <strong>{daysRemaining} days remaining</strong>
                <span>{formatDate(activeConfig.endDate)}</span>
              </div>
            </div>

            <p className={styles.noteLine}>{activeConfig.notes}</p>

            <div className={styles.actionRow}>
              <button className={styles.secondaryButton} onClick={() => openEditModal(activeConfig)}>
                <Edit2 size={18} />
                Edit Configuration
              </button>
              <button className={styles.deleteButton} onClick={() => setDeleteTarget(activeConfig)}>
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>

          <aside className={styles.phonePanel}>
            <span className={styles.passengerCaption}>Passenger View · 28 Jul 2026</span>
            <div className={styles.phoneMock}>
              <div className={styles.phoneNotch} />
              <h3>VIP Ride Booking</h3>
              <p>Security escorts</p>
              <div className={styles.escortChoices}>
                {[0, 1, 2, 3].map((count) => (
                  <span key={count} className={count === 0 ? styles.choiceActive : ''}>{count}</span>
                ))}
              </div>
              <button>Continue</button>
            </div>
            <p className={styles.phoneHelp}>Capped at {activeConfig.escorts}. Requests above the cap are rejected server-side, so a stale app cannot over-book.</p>
          </aside>
        </section>
      )}

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>
            <h2>All Configurations</h2>
            <span>{enrichedConfigs.length}</span>
          </div>
          <div className={styles.selectWrap}>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Escorts</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((config) => (
                <tr key={config.id}>
                  <td>
                    <span className={styles.escortCount}>
                      <ShieldCheck size={16} />
                      {config.escorts}
                    </span>
                  </td>
                  <td>{formatDate(config.startDate)}</td>
                  <td>{formatDate(config.endDate)}</td>
                  <td>{config.duration} days</td>
                  <td>
                    <span className={`${styles.statusPill} ${styles[config.status]}`}>
                      {config.status}
                    </span>
                    {config.startsIn && <span className={styles.startsIn}>in {config.startsIn}d</span>}
                  </td>
                  <td><span className={styles.notesText}>{config.notes}</span></td>
                  <td className={styles.menuCell}>
                    <button className={styles.iconButton} onClick={() => setOpenMenu(openMenu === config.id ? null : config.id)}>
                      <MoreVertical size={18} />
                    </button>
                    {openMenu === config.id && (
                      <div className={styles.rowMenu}>
                        <button onClick={() => { openEditModal(config); setOpenMenu(null); }}>Edit</button>
                        <button className={styles.dangerMenuItem} onClick={() => { setDeleteTarget(config); setOpenMenu(null); }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredConfigs.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>No configurations match this status.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalMode && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <header className={styles.modalHeader}>
              {modalMode === 'edit' && (
                <div className={styles.modalIcon}><ShieldCheck size={20} /></div>
              )}
              <div>
                <h2>{modalMode === 'edit' ? 'Edit Escort Configuration' : 'Add Escort Availability'}</h2>
                <p>Set how many escorts passengers can request, and for how long.</p>
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
                  <button onClick={() => updateEscorts(-1)} disabled={form.escorts === 0}>−</button>
                  <input
                    value={form.escorts}
                    onChange={(event) => setForm((prev) => ({ ...prev, escorts: Math.min(20, Math.max(0, Number(event.target.value) || 0)) }))}
                  />
                  <button onClick={() => updateEscorts(1)} disabled={form.escorts === 20}>+</button>
                </div>
                <p className={styles.helpText}>Passengers can select up to this many escorts per VIP ride. Maximum 20.</p>

                <div className={styles.dateGrid}>
                  <label>
                    <span>Start Date</span>
                    <input type="date" value={formatInputDate(form.startDate)} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
                  </label>
                  <label>
                    <span>End Date</span>
                    <input type="date" value={formatInputDate(form.endDate)} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
                  </label>
                </div>

                <label className={styles.notesField}>
                  <span>Internal Notes <em>(optional)</em></span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="e.g. Additional protocol officers contracted for the election period."
                  />
                </label>

                <div className={styles.infoBox}>
                  <Info size={18} />
                  <span>Windows cannot overlap, so exactly one configuration is in force on any given day.</span>
                </div>
              </div>
            ) : (
              <div className={styles.reviewBody}>
                <div className={styles.reviewValue}>{form.escorts}</div>
                <h3>escorts available</h3>
                <p>{formatDate(form.startDate)} &rarr; {formatDate(form.endDate)}</p>
                <div className={styles.reviewPanel}>
                  <span>Duration</span>
                  <strong>{daysBetween(form.startDate, form.endDate)} days</strong>
                </div>
                <div className={styles.reviewPanel}>
                  <span>Internal Notes</span>
                  <strong>{form.notes.trim() || 'No notes added'}</strong>
                </div>
              </div>
            )}

            <footer className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={modalStep === 1 ? closeModal : () => setModalStep(1)}>
                {modalStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button className={styles.modalPrimaryButton} disabled={!canContinue()} onClick={modalStep === 1 ? () => setModalStep(2) : saveConfiguration}>
                {modalStep === 1 ? 'Continue' : modalMode === 'edit' ? 'Save Changes' : 'Add Escort'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.overlay} onClick={() => { setDeleteTarget(null); setDeleteReason(''); }}>
          <div className={styles.deleteModal} onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Delete escort configuration?</h2>
              <button className={styles.closeButton} onClick={() => { setDeleteTarget(null); setDeleteReason(''); }}><X size={20} /></button>
            </header>
            <div className={styles.deleteBody}>
              <p>Deleting the window for {deleteTarget.escorts} escorts, {formatDate(deleteTarget.startDate)} &rarr; {formatDate(deleteTarget.endDate)}.</p>
              <label>
                <span>Reason for this action <strong>*</strong></span>
                <input
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  placeholder="e.g. Documentation incomplete"
                />
              </label>
            </div>
            <footer>
              <button className={styles.cancelButton} onClick={() => { setDeleteTarget(null); setDeleteReason(''); }}>Cancel</button>
              <button className={styles.deleteConfirmButton} disabled={!deleteReason.trim()} onClick={confirmDelete}>Delete Configuration</button>
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
