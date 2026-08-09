import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgePercent,
  Ban,
  CalendarClock,
  ChevronDown,
  CircleEllipsis,
  Plus,
  TicketPercent,
} from 'lucide-react';
import styles from './DiscountsPage.module.css';

const INITIAL_DISCOUNTS = [
  {
    id: 'airport-flash',
    name: 'Airport Transfer Flash Sale',
    description: 'Short campaign for airport pickup and dropoff demand.',
    valueType: 'fixed',
    value: 500,
    redemption: 'Promo code',
    appliesTo: 'All rides',
    audience: 'All passengers',
    startDate: '2026-07-23',
    endDate: '2026-08-12',
    status: 'depleted',
    maxSaving: null,
    perPassengerLimit: '1 redemption',
    totalLimit: '500 redemptions',
    redemptions: 500,
  },
  {
    id: 'independence-weekend',
    name: 'Independence Day Weekend',
    description: 'Public holiday promo across upper-tier rides.',
    valueType: 'percentage',
    value: 20,
    redemption: 'Automatic at checkout',
    appliesTo: 'Executive, Premium',
    audience: 'All passengers',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    status: 'scheduled',
    maxSaving: 10000,
    perPassengerLimit: '2 redemptions',
    totalLimit: '1,500 redemptions',
    redemptions: 0,
  },
  {
    id: 'premium-weekday',
    name: 'Premium Weekday Trial',
    description: 'Paused pending finance review of margin impact.',
    valueType: 'percentage',
    value: 25,
    redemption: 'Automatic at checkout',
    appliesTo: 'Premium',
    audience: 'All passengers',
    startDate: '2026-07-20',
    endDate: '2026-09-11',
    status: 'disabled',
    maxSaving: 8000,
    perPassengerLimit: '4 redemptions',
    totalLimit: '800 redemptions',
    redemptions: 212,
  },
  {
    id: 'vip-executive',
    name: 'VIP Executive Launch',
    description: 'Launch support for VIP executive riders.',
    valueType: 'fixed',
    value: 2000,
    redemption: 'Automatic at checkout',
    appliesTo: 'VIP rides only',
    audience: 'All passengers',
    startDate: '2026-07-18',
    endDate: '2026-10-17',
    status: 'active',
    maxSaving: null,
    perPassengerLimit: 'Unlimited',
    totalLimit: 'Unlimited',
    redemptions: 408,
  },
  {
    id: 'new-rider',
    name: 'New Rider Welcome',
    description: 'First ride promotion for new passenger activation.',
    valueType: 'percentage',
    value: 15,
    redemption: 'Automatic at checkout',
    appliesTo: 'All rides',
    audience: 'New passengers only',
    startDate: '2026-06-28',
    endDate: '2026-09-26',
    status: 'active',
    maxSaving: 5000,
    perPassengerLimit: '1 redemption',
    totalLimit: 'Unlimited',
    redemptions: 1940,
  },
  {
    id: 'corporate-rebate',
    name: 'Corporate Account Rebate',
    description: 'Contracted rebate for selected corporate accounts.',
    valueType: 'percentage',
    value: 10,
    redemption: 'Automatic at checkout',
    appliesTo: 'All rides',
    audience: '2 passengers',
    startDate: '2026-05-29',
    endDate: '2026-11-25',
    status: 'active',
    maxSaving: null,
    perPassengerLimit: 'Unlimited',
    totalLimit: 'Unlimited',
    redemptions: 421,
  },
  {
    id: 'late-night',
    name: 'Late Night Saver',
    description: 'Demand shaping test for quiet late-night periods.',
    valueType: 'percentage',
    value: 12,
    redemption: 'Promo code',
    appliesTo: 'Standard',
    audience: 'All passengers',
    startDate: '2026-08-01',
    endDate: '2026-09-01',
    status: 'expired',
    maxSaving: 3500,
    perPassengerLimit: '3 redemptions',
    totalLimit: '900 redemptions',
    redemptions: 0,
  },
];

const BLANK_FORM = {
  name: '',
  description: '',
  redemption: 'automatic',
  discountType: 'percentage',
  percentageOff: '15',
  fixedAmount: '',
  maxSaving: '',
  scope: 'All rides',
  audience: 'All passengers',
  startDate: '',
  endDate: '',
  perPassengerLimit: '',
  totalLimit: '',
  status: 'active',
};

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(value) {
  if (!value && value !== 0) {
    return null;
  }

  return `₦${Number(value).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function discountValue(discount) {
  if (discount.valueType === 'fixed') {
    return {
      primary: formatMoney(discount.value),
      secondary: null,
    };
  }

  return {
    primary: `${discount.value}%`,
    secondary: discount.maxSaving ? `max ₦${discount.maxSaving.toLocaleString('en-NG')}.00` : 'No cap',
  };
}

function statusLabel(status) {
  const labels = {
    active: 'Active',
    scheduled: 'Scheduled',
    disabled: 'Disabled',
    depleted: 'Depleted',
    expired: 'Expired',
    paused: 'Paused',
  };

  return labels[status] ?? status;
}

function getDurationDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '-';
  }

  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  return `${days} days`;
}

function createDiscountFromForm(form) {
  const isPercentage = form.discountType === 'percentage';

  return {
    id: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-discount',
    name: form.name || 'Untitled Discount',
    description: form.description,
    valueType: isPercentage ? 'percentage' : 'fixed',
    value: Number(isPercentage ? form.percentageOff : form.fixedAmount) || 0,
    redemption: form.redemption === 'automatic' ? 'Automatic at checkout' : 'Promo code',
    appliesTo: form.scope,
    audience: form.audience,
    startDate: form.startDate,
    endDate: form.endDate,
    status: form.status,
    maxSaving: Number(form.maxSaving) || null,
    perPassengerLimit: form.perPassengerLimit || 'Unlimited',
    totalLimit: form.totalLimit || 'Unlimited',
    redemptions: 0,
  };
}

function createFormFromDiscount(discount) {
  if (!discount) {
    return BLANK_FORM;
  }

  return {
    name: discount.name,
    description: discount.description,
    redemption: discount.redemption === 'Promo code' ? 'promo' : 'automatic',
    discountType: discount.valueType === 'fixed' ? 'fixed' : 'percentage',
    percentageOff: discount.valueType === 'percentage' ? String(discount.value) : '15',
    fixedAmount: discount.valueType === 'fixed' ? String(discount.value) : '',
    maxSaving: discount.maxSaving ? String(discount.maxSaving) : '',
    scope: discount.appliesTo,
    audience: discount.audience,
    startDate: discount.startDate,
    endDate: discount.endDate,
    perPassengerLimit: discount.perPassengerLimit === 'Unlimited' ? '' : discount.perPassengerLimit.replace(/\D/g, ''),
    totalLimit: discount.totalLimit === 'Unlimited' ? '' : discount.totalLimit.replace(/\D/g, ''),
    status: discount.status,
  };
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[tone]}`}>
        <Icon size={22} />
      </div>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`${styles.statusPill} ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}

function OptionCard({ selected, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.optionCard} ${selected ? styles.optionSelected : ''}`}
      onClick={onClick}
    >
      <span className={styles.radioDot} />
      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <Field label={label}>
      <div className={styles.selectWrap}>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown size={18} />
      </div>
    </Field>
  );
}

function Stepper({ step }) {
  return (
    <div className={styles.stepper}>
      <span className={`${styles.stepCircle} ${step >= 1 ? styles.stepActive : ''}`}>1</span>
      <span className={`${styles.stepLabel} ${step === 1 ? styles.stepLabelActive : ''}`}>Details</span>
      <span className={styles.stepLine} />
      <span className={`${styles.stepCircle} ${step >= 2 ? styles.stepActive : ''}`}>2</span>
      <span className={`${styles.stepLabel} ${step === 2 ? styles.stepLabelActive : ''}`}>Review</span>
    </div>
  );
}

function DiscountsList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rideTypeFilter, setRideTypeFilter] = useState('all');

  const filteredDiscounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return INITIAL_DISCOUNTS.filter((discount) => {
      const matchesQuery = normalizedQuery
        ? `${discount.name} ${discount.description} ${discount.appliesTo}`.toLowerCase().includes(normalizedQuery)
        : true;
      const matchesStatus = statusFilter === 'all' ? true : discount.status === statusFilter;
      const matchesRideType = rideTypeFilter === 'all'
        ? true
        : discount.appliesTo.toLowerCase().includes(rideTypeFilter);

      return matchesQuery && matchesStatus && matchesRideType;
    });
  }, [query, rideTypeFilter, statusFilter]);

  const activeCount = INITIAL_DISCOUNTS.filter((discount) => discount.status === 'active').length;
  const scheduledCount = INITIAL_DISCOUNTS.filter((discount) => discount.status === 'scheduled').length;
  const inactiveCount = INITIAL_DISCOUNTS.filter((discount) => ['expired', 'depleted', 'disabled', 'paused'].includes(discount.status)).length;
  const redemptions = INITIAL_DISCOUNTS.reduce((sum, discount) => sum + discount.redemptions, 0);

  return (
    <div className={styles.page}>
      <header className={styles.listHeader}>
        <div>
          <h1>Passenger Discounts</h1>
          <p>Create and manage promotions shown to passengers in the mobile app</p>
        </div>
        <button className={styles.primaryButton} onClick={() => navigate('/discounts/new')}>
          <Plus size={18} />
          Create Discount
        </button>
      </header>

      <section className={styles.statsGrid}>
        <StatCard icon={TicketPercent} label="Active" value={activeCount} tone="greenTone" />
        <StatCard icon={CalendarClock} label="Scheduled" value={scheduledCount} tone="greenTone" />
        <StatCard icon={Ban} label="Expired / Paused" value={inactiveCount} tone="orangeTone" />
        <StatCard icon={BadgePercent} label="Total Redemptions" value={redemptions.toLocaleString('en-NG')} tone="grayTone" />
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableTopbar}>
          <div className={styles.tableTitle}>
            <strong>All Discounts</strong>
            <span>{INITIAL_DISCOUNTS.length}</span>
          </div>
          <div className={styles.filters}>
            <div className={styles.selectWrap}>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="disabled">Disabled</option>
                <option value="depleted">Depleted</option>
                <option value="expired">Expired</option>
              </select>
              <ChevronDown size={18} />
            </div>
            <div className={styles.selectWrap}>
              <select value={rideTypeFilter} onChange={(event) => setRideTypeFilter(event.target.value)}>
                <option value="all">All Ride Types</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="executive">Executive</option>
                <option value="vip">VIP</option>
              </select>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        <div className={styles.searchRow}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, code or description..."
          />
        </div>

        <div className={styles.discountTableWrap}>
          <table className={styles.discountTable}>
            <thead>
              <tr>
                <th>Discount</th>
                <th>Value</th>
                <th>Applies to</th>
                <th>Audience</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((discount) => {
                const value = discountValue(discount);

                return (
                  <tr key={discount.id}>
                    <td>
                      <button className={styles.nameButton} onClick={() => navigate(`/discounts/${discount.id}/edit`)}>
                        {discount.name}
                      </button>
                    </td>
                    <td>
                      <strong>{value.primary}</strong>
                      {value.secondary ? <small>{value.secondary}</small> : null}
                    </td>
                    <td>{discount.appliesTo}</td>
                    <td>{discount.audience}</td>
                    <td>{formatDate(discount.startDate)}</td>
                    <td>{formatDate(discount.endDate)}</td>
                    <td><StatusPill status={discount.status} /></td>
                    <td>
                      <button className={styles.iconButton} aria-label={`Actions for ${discount.name}`}>
                        <CircleEllipsis size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DiscountDetailsForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const sourceDiscount = INITIAL_DISCOUNTS.find((discount) => discount.id === id);
  const [form, setForm] = useState(() => createFormFromDiscount(mode === 'edit' ? sourceDiscount : null));
  const discount = useMemo(() => createDiscountFromForm(form), [form]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className={styles.formPage}>
      <button className={styles.backLink} onClick={() => navigate('/discounts')}>
        <ArrowLeft size={18} />
        Back to Discounts
      </button>

      <header className={styles.formHeader}>
        <h1>{mode === 'edit' ? 'Edit Discount' : 'Create Discount'}</h1>
        <p>{mode === 'edit' ? 'Update the promotion passengers will see in the mobile app' : 'Configure the promotion passengers will see in the mobile app'}</p>
      </header>

      <Stepper step={1} />

      <form
        className={styles.formStack}
        onSubmit={(event) => {
          event.preventDefault();
          navigate(mode === 'edit' ? `/discounts/${id}/review` : '/discounts/new/review', { state: { discount, mode } });
        }}
      >
        <section className={styles.formCard}>
          <h2>Details</h2>
          <div className={styles.cardRule} />
          <Field label="Discount Name">
            <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. New Rider Welcome" />
          </Field>
          <Field label="Internal Description" hint="Admin-only. Passengers never see this.">
            <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Why this promotion exists, who approved it, which campaign it belongs to." />
          </Field>
          <div className={styles.optionGroupLabel}>How Passengers Receive It</div>
          <div className={styles.optionGrid}>
            <OptionCard
              selected={form.redemption === 'automatic'}
              title="Automatic at checkout"
              subtitle="Applied for eligible passengers with no code needed."
              onClick={() => updateForm('redemption', 'automatic')}
            />
            <OptionCard
              selected={form.redemption === 'promo'}
              title="Promo code"
              subtitle="Passenger enters a code at checkout."
              onClick={() => updateForm('redemption', 'promo')}
            />
          </div>
        </section>

        <section className={styles.formCard}>
          <h2>Discount Value</h2>
          <div className={styles.cardRule} />
          <div className={styles.optionGroupLabel}>Discount Type</div>
          <div className={styles.optionGrid}>
            <OptionCard
              selected={form.discountType === 'percentage'}
              title="Percentage off"
              subtitle="e.g. 15% off the fare"
              onClick={() => updateForm('discountType', 'percentage')}
            />
            <OptionCard
              selected={form.discountType === 'fixed'}
              title="Fixed amount off"
              subtitle="e.g. ₦2,000 off the fare"
              onClick={() => updateForm('discountType', 'fixed')}
            />
          </div>
          <div className={styles.twoColumn}>
            {form.discountType === 'percentage' ? (
              <Field label="Percentage Off">
                <input value={form.percentageOff} onChange={(event) => updateForm('percentageOff', event.target.value)} placeholder="15" />
              </Field>
            ) : (
              <Field label="Fixed Amount Off">
                <input value={form.fixedAmount} onChange={(event) => updateForm('fixedAmount', event.target.value)} placeholder="2000" />
              </Field>
            )}
            <Field label="Maximum Saving (₦, optional)" hint="Caps the saving on high-value fares.">
              <input value={form.maxSaving} onChange={(event) => updateForm('maxSaving', event.target.value)} placeholder="No cap" />
            </Field>
          </div>
        </section>

        <section className={styles.formCard}>
          <h2>Applicable Rides</h2>
          <div className={styles.cardRule} />
          <SelectField label="Scope" value={form.scope} onChange={(value) => updateForm('scope', value)}>
            <option>All rides</option>
            <option>Standard</option>
            <option>Premium</option>
            <option>Executive, Premium</option>
            <option>VIP rides only</option>
          </SelectField>
        </section>

        <section className={styles.formCard}>
          <h2>Target Audience</h2>
          <div className={styles.cardRule} />
          <SelectField label="Audience" value={form.audience} onChange={(value) => updateForm('audience', value)}>
            <option>All passengers</option>
            <option>New passengers only</option>
            <option>Selected passengers</option>
            <option>Corporate accounts</option>
          </SelectField>
        </section>

        <section className={styles.formCard}>
          <h2>Validity Period</h2>
          <div className={styles.cardRule} />
          <div className={styles.twoColumn}>
            <Field label="Start Date">
              <input type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} />
            </Field>
            <Field label="End Date">
              <input type="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} />
            </Field>
          </div>
        </section>

        <section className={styles.formCard}>
          <h2>Usage Limits</h2>
          <p className={styles.cardHint}>Leave blank for no limit. Once the total cap is reached the discount stops applying on its own.</p>
          <div className={styles.cardRule} />
          <div className={styles.twoColumn}>
            <Field label="Max Redemptions per Passenger">
              <input value={form.perPassengerLimit} onChange={(event) => updateForm('perPassengerLimit', event.target.value)} placeholder="Unlimited" />
            </Field>
            <Field label="Max Total Redemptions">
              <input value={form.totalLimit} onChange={(event) => updateForm('totalLimit', event.target.value)} placeholder="Unlimited" />
            </Field>
          </div>
        </section>

        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate('/discounts')}>Cancel</button>
          <button type="submit" className={styles.primaryButton}>Review</button>
        </div>
      </form>
    </div>
  );
}

function DiscountReview({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const fallbackDiscount = INITIAL_DISCOUNTS.find((discount) => discount.id === id) ?? INITIAL_DISCOUNTS[2];
  const locationState = window.history.state?.usr;
  const discount = locationState?.discount ?? fallbackDiscount;
  const value = discountValue(discount);
  const originalFare = 25000;
  const saving = discount.valueType === 'percentage'
    ? Math.min(originalFare * (discount.value / 100), discount.maxSaving || Infinity)
    : discount.value;
  const total = originalFare - saving;

  return (
    <div className={styles.formPage}>
      <button className={styles.backLink} onClick={() => navigate('/discounts')}>
        <ArrowLeft size={18} />
        Back to Discounts
      </button>

      <header className={styles.formHeader}>
        <h1>{mode === 'edit' ? 'Edit Discount' : 'Create Discount'}</h1>
        <p>Review the discount before saving</p>
      </header>

      <Stepper step={2} />

      <section className={styles.formCard}>
        <h2>Summary</h2>
        <div className={styles.cardRule} />
        <div className={styles.summaryHero}>
          <strong>{value.primary}</strong>
          <span>off specific ride types</span>
          <StatusPill status={discount.status} />
        </div>
        <div className={styles.summaryRows}>
          <SummaryRow label="Name" value={discount.name} />
          <SummaryRow label="Redemption" value={discount.redemption} />
          <SummaryRow label="Applies to" value={discount.appliesTo} />
          <SummaryRow label="Audience" value={discount.audience} />
          <SummaryRow label="Starts" value={formatDate(discount.startDate)} />
          <SummaryRow label="Ends" value={formatDate(discount.endDate)} />
          <SummaryRow label="Duration" value={getDurationDays(discount.startDate, discount.endDate)} />
          <SummaryRow label="Per-passenger limit" value={discount.perPassengerLimit} />
          <SummaryRow label="Total limit" value={discount.totalLimit} />
          <SummaryRow label="Maximum saving" value={discount.maxSaving ? formatMoney(discount.maxSaving) : 'No cap'} />
          <SummaryRow label="Description" value={discount.description || '-'} />
        </div>
      </section>

      <section className={styles.formCard}>
        <h2>Passenger Sees</h2>
        <p className={styles.cardHint}>Example checkout on a ₦25,000.00 fare.</p>
        <div className={styles.cardRule} />
        <div className={styles.checkoutCard}>
          <div><span>Fare</span><strong>{formatMoney(originalFare)}</strong></div>
          <div className={styles.savingLine}><span>{discount.name}</span><strong>-{formatMoney(saving)}</strong></div>
          <div className={styles.totalLine}><span>Total</span><strong>{formatMoney(total)}</strong></div>
          <div className={styles.savingsBanner}>Passenger saves {formatMoney(saving)}</div>
        </div>
        <div className={styles.infoBanner}>
          <BadgePercent size={18} />
          <span>Only one discount applies per ride. When several automatic discounts are eligible, the passenger gets the one that saves them the most.</span>
        </div>
      </section>

      <div className={styles.formActions}>
        <button className={styles.secondaryButton} onClick={() => navigate(mode === 'edit' ? `/discounts/${id}/edit` : '/discounts/new')}>Back</button>
        <button className={styles.primaryButton} onClick={() => navigate('/discounts')}>{mode === 'edit' ? 'Save Changes' : 'Create Discount'}</button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function DiscountsPage({ mode = 'list' }) {
  if (mode === 'new') {
    return <DiscountDetailsForm mode="new" />;
  }

  if (mode === 'edit') {
    return <DiscountDetailsForm mode="edit" />;
  }

  if (mode === 'review' || mode === 'new-review') {
    return <DiscountReview mode={mode === 'review' ? 'edit' : 'new'} />;
  }

  return <DiscountsList />;
}
