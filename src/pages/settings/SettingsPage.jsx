import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ADMIN_ROLES } from '@/utils/constants';
import { ROLE_PERMISSIONS } from '@/lib/rbac';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Settings, Users, Shield, Save, UserPlus, UserMinus, CheckCircle, Edit3, CreditCard, MessageSquare, Globe, MapPin, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi, mapAdminUser } from '@/lib/adminApi';
import styles from './SettingsPage.module.css';

const TABS = [
  { id: 'global', label: 'Global Settings', icon: Settings },
  { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
  { id: 'sms', label: 'SMS Gateways', icon: MessageSquare },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'regions', label: 'Regions', icon: MapPin },
  { id: 'admins', label: 'Admin Management', icon: Users },
  { id: 'roles', label: 'Role Permissions', icon: Shield },
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  ops_admin: 'Operations Admin',
  finance_admin: 'Finance Admin',
  support_agent: 'Support Agent',
  inspection_officer: 'Inspection Officer',
};

const PERMISSION_LABELS = {
  dashboard: 'Dashboard',
  drivers: 'Driver Management',
  applications: 'Applications',
  inspections: 'Inspections',
  rides: 'Ride Monitoring',
  complaints: 'Complaints',
  earnings: 'Earnings',
  accounting: 'Accounting',
  vehicles: 'Vehicles',
  'riders:read': 'Rider Directory',
  'riders:wallet': 'Rider Wallet',
  'rides:read': 'Ride Read-Only',
  notifications: 'Notifications',
  settings: 'Settings',
  'audit-logs': 'Audit Logs',
};

const MOCK_PAYMENT_GATEWAYS = [
  { id: 'g1', name: 'Stripe', enabled: true, public_key: 'pk_live_abc123', secret_key: '••••••••', webhook_secret: 'whsec_••••••', currency: 'USD' },
  { id: 'g2', name: 'Paystack', enabled: true, public_key: 'pk_live_def456', secret_key: '••••••••', webhook_secret: 'whsec_••••••', currency: 'NGN' },
  { id: 'g3', name: 'Flutterwave', enabled: false, public_key: '', secret_key: '', webhook_secret: '', currency: 'NGN' },
];

const MOCK_SMS_GATEWAYS = [
  { id: 's1', name: 'Twilio', enabled: true, account_sid: 'AC••••••••', auth_token: '••••••••', from_number: '+15551234567' },
  { id: 's2', name: 'Africa\'s Talking', enabled: true, api_key: 'atsk_••••••••', username: 'chauffeur', from_number: 'CHAFFEUR' },
  { id: 's3', name: 'Vonage', enabled: false, api_key: '', api_secret: '', from_number: '' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState({ open: false, admin: null });
  const [editRoleModal, setEditRoleModal] = useState({ open: false, admin: null });
  const [editRole, setEditRole] = useState('');

  const [paymentGateways, setPaymentGateways] = useState(MOCK_PAYMENT_GATEWAYS);
  const [smsGateways, setSmsGateways] = useState(MOCK_SMS_GATEWAYS);

  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English', native: 'English', enabled: true, is_default: true },
    { code: 'fr', name: 'French', native: 'Français', enabled: true, is_default: false },
    { code: 'es', name: 'Spanish', native: 'Español', enabled: true, is_default: false },
    { code: 'ar', name: 'Arabic', native: 'العربية', enabled: false, is_default: false },
    { code: 'pt', name: 'Portuguese', native: 'Português', enabled: false, is_default: false },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili', enabled: false, is_default: false },
  ]);

  const [regions, setRegions] = useState([
    { id: 'r1', name: 'Lagos', country: 'Nigeria', currency: 'NGN', timezone: 'Africa/Lagos', active: true },
    { id: 'r2', name: 'Nairobi', country: 'Kenya', currency: 'KES', timezone: 'Africa/Nairobi', active: true },
    { id: 'r3', name: 'Accra', country: 'Ghana', currency: 'GHS', timezone: 'Africa/Accra', active: false },
    { id: 'r4', name: 'Cape Town', country: 'South Africa', currency: 'ZAR', timezone: 'Africa/Johannesburg', active: true },
  ]);

  const [showAddRegion, setShowAddRegion] = useState(false);
  const [newRegion, setNewRegion] = useState({ name: '', country: '', currency: '', timezone: '' });

  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '', native: '' });

  useEffect(() => {
    let cancelled = false;

    async function fetchAdmins() {
      setLoading(true);
      try {
        const [adminRows, supportRows] = await Promise.all([
          adminApi.listUsers({ userType: 'admin', limit: 100 }).catch(() => []),
          adminApi.listUsers({ userType: 'support', limit: 100 }).catch(() => []),
        ]);
        const mapped = [...adminRows, ...supportRows].map(mapAdminUser).map((user) => ({
          id: user.id,
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.userType === 'support' ? 'support_agent' : 'ops_admin',
          status: user.status,
        }));
        if (!cancelled) setAdmins(mapped);
      } catch {
        if (!cancelled) setAdmins([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAdmins();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInvite = async (_, inputValue) => {
    const [name, email, role, phone] = inputValue.split('|');
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    await adminApi.inviteAdmin({
      firstName,
      lastName,
      email: email.trim(),
      phoneNumber: phone.trim(),
      userType: role.trim() === 'support_agent' ? 'support' : 'admin',
    });
    const newAdmin = {
      id: `pending-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      status: 'active',
    };
    setAdmins(prev => [...prev, newAdmin]);
    setInviteModal(false);
  };

  const handleSuspend = async (reason) => {
    const { admin } = suspendModal;
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
    setSuspendModal({ open: false, admin: null });
  };

  const handleRoleChange = async (reason) => {
    const { admin } = editRoleModal;
    setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, role: editRole } : a));
    setEditRoleModal({ open: false, admin: null });
    setEditRole('');
  };

  const toggleGateway = (id, type) => {
    const setter = type === 'payment' ? setPaymentGateways : setSmsGateways;
    const list = type === 'payment' ? paymentGateways : smsGateways;
    setter(prev => prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
  };

  const updateGatewayField = (id, field, value, type) => {
    const setter = type === 'payment' ? setPaymentGateways : setSmsGateways;
    setter(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const toggleLanguage = (code) => {
    setLanguages(prev => prev.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l));
  };

  const setDefaultLanguage = (code) => {
    setLanguages(prev => prev.map(l => ({ ...l, is_default: l.code === code })));
  };

  const addLanguage = () => {
    if (!newLanguage.code || !newLanguage.name) return;
    setLanguages(prev => [...prev, { ...newLanguage, enabled: true, is_default: false }]);
    setNewLanguage({ code: '', name: '', native: '' });
    setShowAddLanguage(false);
  };

  const removeLanguage = (code) => {
    setLanguages(prev => prev.filter(l => l.code !== code));
  };

  const toggleRegion = (id) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const addRegion = () => {
    if (!newRegion.name || !newRegion.country) return;
    setRegions(prev => [...prev, { id: `r${Date.now()}`, ...newRegion, active: true }]);
    setNewRegion({ name: '', country: '', currency: '', timezone: '' });
    setShowAddRegion(false);
  };

  const removeRegion = (id) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  const adminColumns = [
    { key: 'name', label: 'Name', render: (val, row) => (
      <div className={styles.adminCell}>
        <div className={styles.adminAvatar}>{val.charAt(0)}</div>
        <div className={styles.adminInfo}>
          <span className={styles.adminName}>{val}</span>
          <span className={styles.adminEmail}>{row.email}</span>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v) => <StatusBadge status="info" label={ROLE_LABELS[v] || v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className={styles.rowActions}>
        <button className={styles.iconBtn} title="Change role" onClick={(e) => { e.stopPropagation(); setEditRole(row.role); setEditRoleModal({ open: true, admin: row }); }}>
          <Edit3 size={16} />
        </button>
        <button className={`${styles.iconBtn} ${row.status === 'active' ? styles.iconDanger : styles.iconSuccess}`} title={row.status === 'active' ? 'Suspend' : 'Reactivate'} onClick={(e) => { e.stopPropagation(); setSuspendModal({ open: true, admin: row }); }}>
          {row.status === 'active' ? <UserMinus size={16} /> : <CheckCircle size={16} />}
        </button>
      </div>
    )},
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>System Settings</h1>
          <p className={styles.subtitle}>Configure platform-wide parameters and manage administrative access</p>
        </div>
      </header>

      <nav className={styles.tabs}>
        {TABS.map(tab => (
          <button key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {activeTab === 'global' && (
          <div className={styles.globalGrid}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Financial Configurations</h2>
              <div className={styles.form}>
                <Input label="Global Commission Rate (%)" placeholder="Global Commission Rate (%)" defaultValue="20" />
                <Input label="Minimum Payout Threshold ($)" placeholder="Minimum Payout Threshold ($)" defaultValue="50" />
                <Button variant="primary" icon={Save}>Save Financials</Button>
              </div>
            </section>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Support & Contact</h2>
              <div className={styles.form}>
                <Input label="Support Email" placeholder="Support Email" defaultValue="support@chauffeur.com" />
                <Input label="Emergency Contact Phone" placeholder="Emergency Contact Phone" defaultValue="+1 (555) 911-000" />
                <Button variant="primary" icon={Save}>Save Contact Info</Button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'gateways' && (
          <div className={styles.gatewaysSection}>
            <h2 className={styles.sectionTitle}>Payment Gateways</h2>
            <p className={styles.sectionSubtitle}>Configure payment processing providers for rider transactions.</p>
            <div className={styles.gatewayList}>
              {paymentGateways.map(gw => (
                <div key={gw.id} className={`${styles.gatewayCard} ${!gw.enabled ? styles.gatewayDisabled : ''}`}>
                  <div className={styles.gatewayHeader}>
                    <h3 className={styles.gatewayName}>{gw.name}</h3>
                    <button className={styles.toggleBtn} onClick={() => toggleGateway(gw.id, 'payment')}>
                      {gw.enabled ? <ToggleRight size={24} className={styles.toggleOn} /> : <ToggleLeft size={24} className={styles.toggleOff} />}
                    </button>
                  </div>
                  <div className={styles.gatewayForm}>
                    <div className={styles.gatewayRow}>
                      <Input label="Public Key" placeholder="Public Key" value={gw.public_key} onChange={(e) => updateGatewayField(gw.id, 'public_key', e.target.value, 'payment')} disabled={!gw.enabled} />
                      <Input label="Secret Key" placeholder="Secret Key" type="password" value={gw.secret_key} onChange={(e) => updateGatewayField(gw.id, 'secret_key', e.target.value, 'payment')} disabled={!gw.enabled} />
                      <Input label="Webhook Secret" placeholder="Webhook Secret" type="password" value={gw.webhook_secret} onChange={(e) => updateGatewayField(gw.id, 'webhook_secret', e.target.value, 'payment')} disabled={!gw.enabled} />
                      <div className={styles.gatewayField}>
                        <label className={styles.fieldLabel}>Currency</label>
                        <select className={styles.select} value={gw.currency} onChange={(e) => updateGatewayField(gw.id, 'currency', e.target.value, 'payment')} disabled={!gw.enabled}>
                          <option value="USD">USD</option>
                          <option value="NGN">NGN</option>
                          <option value="KES">KES</option>
                          <option value="GHS">GHS</option>
                          <option value="ZAR">ZAR</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.gatewayActions}>
                      <Button variant="primary" size="sm" icon={Save} disabled={!gw.enabled}>Save {gw.name}</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className={styles.gatewaysSection}>
            <h2 className={styles.sectionTitle}>SMS Gateways</h2>
            <p className={styles.sectionSubtitle}>Configure SMS providers for driver and rider notifications.</p>
            <div className={styles.gatewayList}>
              {smsGateways.map(gw => (
                <div key={gw.id} className={`${styles.gatewayCard} ${!gw.enabled ? styles.gatewayDisabled : ''}`}>
                  <div className={styles.gatewayHeader}>
                    <h3 className={styles.gatewayName}>{gw.name}</h3>
                    <button className={styles.toggleBtn} onClick={() => toggleGateway(gw.id, 'sms')}>
                      {gw.enabled ? <ToggleRight size={24} className={styles.toggleOn} /> : <ToggleLeft size={24} className={styles.toggleOff} />}
                    </button>
                  </div>
                  <div className={styles.gatewayForm}>
                    {gw.name === 'Twilio' && (
                      <div className={styles.gatewayRow}>
                        <Input label="Account SID" placeholder="Account SID" value={gw.account_sid} onChange={(e) => updateGatewayField(gw.id, 'account_sid', e.target.value, 'sms')} disabled={!gw.enabled} />
                        <Input label="Auth Token" placeholder="Auth Token" type="password" value={gw.auth_token} onChange={(e) => updateGatewayField(gw.id, 'auth_token', e.target.value, 'sms')} disabled={!gw.enabled} />
                      </div>
                    )}
                    {gw.name === "Africa's Talking" && (
                      <div className={styles.gatewayRow}>
                        <Input label="API Key" placeholder="API Key" value={gw.api_key} onChange={(e) => updateGatewayField(gw.id, 'api_key', e.target.value, 'sms')} disabled={!gw.enabled} />
                        <Input label="Username" placeholder="Username" value={gw.username} onChange={(e) => updateGatewayField(gw.id, 'username', e.target.value, 'sms')} disabled={!gw.enabled} />
                      </div>
                    )}
                    {gw.name === 'Vonage' && (
                      <div className={styles.gatewayRow}>
                        <Input label="API Key" placeholder="API Key" value={gw.api_key} onChange={(e) => updateGatewayField(gw.id, 'api_key', e.target.value, 'sms')} disabled={!gw.enabled} />
                        <Input label="API Secret" placeholder="API Secret" type="password" value={gw.api_secret} onChange={(e) => updateGatewayField(gw.id, 'api_secret', e.target.value, 'sms')} disabled={!gw.enabled} />
                      </div>
                    )}
                    <div className={styles.gatewayRow}>
                      <Input label="From Number / Sender ID" placeholder="From Number / Sender ID" value={gw.from_number} onChange={(e) => updateGatewayField(gw.id, 'from_number', e.target.value, 'sms')} disabled={!gw.enabled} />
                    </div>
                    <div className={styles.gatewayActions}>
                      <Button variant="primary" size="sm" icon={Save} disabled={!gw.enabled}>Save {gw.name}</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'language' && (
          <div className={styles.languageSection}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>Language & Localization</h2>
                <p className={styles.sectionSubtitle}>Manage supported languages for the platform. Choose a default language.</p>
              </div>
              <Button variant="primary" icon={Plus} onClick={() => setShowAddLanguage(true)}>Add Language</Button>
            </div>
            <div className={styles.languageGrid}>
              {languages.map(lang => (
                <div key={lang.code} className={`${styles.languageCard} ${!lang.enabled ? styles.langDisabled : ''} ${lang.is_default ? styles.langDefault : ''}`}>
                  <div className={styles.languageHeader}>
                    <div className={styles.languageInfo}>
                      <span className={styles.langName}>{lang.native || lang.name}</span>
                      <span className={styles.langCode}>{lang.code.toUpperCase()}</span>
                    </div>
                    {lang.is_default && <StatusBadge status="info" label="Default" />}
                  </div>
                  <span className={styles.langEnglish}>{lang.name}</span>
                  <div className={styles.languageActions}>
                    <button className={styles.toggleBtn} onClick={() => toggleLanguage(lang.code)}>
                      {lang.enabled ? <ToggleRight size={22} className={styles.toggleOn} /> : <ToggleLeft size={22} className={styles.toggleOff} />}
                    </button>
                    {!lang.is_default && (
                      <div className={styles.langActionBtns}>
                        <Button variant="ghost" size="sm" onClick={() => setDefaultLanguage(lang.code)}>Set as Default</Button>
                        <button className={styles.iconBtnDanger} onClick={() => removeLanguage(lang.code)} title="Remove language">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {showAddLanguage && (
              <div className={styles.inlineForm}>
                <div className={styles.inlineFormRow}>
                  <Input label="Language Code" placeholder="Language Code" value={newLanguage.code} onChange={(e) => setNewLanguage(prev => ({ ...prev, code: e.target.value }))} />
                  <Input label="Language Name" placeholder="Language Name" value={newLanguage.name} onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))} />
                  <Input label="Native Name" placeholder="Native Name" value={newLanguage.native} onChange={(e) => setNewLanguage(prev => ({ ...prev, native: e.target.value }))} />
                </div>
                <div className={styles.inlineFormActions}>
                  <Button variant="secondary" onClick={() => { setShowAddLanguage(false); setNewLanguage({ code: '', name: '', native: '' }); }}>Cancel</Button>
                  <Button variant="primary" onClick={addLanguage}>Add Language</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'regions' && (
          <div className={styles.regionsSection}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>Operational Regions</h2>
                <p className={styles.sectionSubtitle}>Manage cities and regions served by the platform.</p>
              </div>
              <Button variant="primary" icon={Plus} onClick={() => setShowAddRegion(true)}>Add Region</Button>
            </div>
            <div className={styles.regionsGrid}>
              {regions.map(region => (
                <div key={region.id} className={`${styles.regionCard} ${!region.active ? styles.regionInactive : ''}`}>
                  <div className={styles.regionHeader}>
                    <div className={styles.regionTitleRow}>
                      <MapPin size={18} className={styles.regionIcon} />
                      <h3 className={styles.regionName}>{region.name}</h3>
                    </div>
                    <button className={styles.toggleBtn} onClick={() => toggleRegion(region.id)}>
                      {region.active ? <ToggleRight size={22} className={styles.toggleOn} /> : <ToggleLeft size={22} className={styles.toggleOff} />}
                    </button>
                  </div>
                  <div className={styles.regionMeta}>
                    <span className={styles.regionMetaItem}>{region.country}</span>
                    <span className={styles.regionMetaItem}>{region.currency}</span>
                    <span className={styles.regionMetaItem}>{region.timezone}</span>
                  </div>
                  <div className={styles.regionActions}>
                    <button className={styles.iconBtnDanger} onClick={() => removeRegion(region.id)} title="Remove region">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {activeTab === 'admins' && (
          <div className={styles.adminSection}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>Administrative Users</h2>
              <Button variant="primary" icon={UserPlus} onClick={() => setInviteModal(true)}>Invite Admin</Button>
            </div>
            <DataTable columns={adminColumns} data={admins} loading={loading} searchPlaceholder="Search by name, email or role..." />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className={styles.rolesSection}>
            <h2 className={styles.sectionTitle}>Role Permissions Matrix</h2>
            <p className={styles.rolesSubtitle}>Each role's access is enforced at both the UI and database (RLS) layer.</p>
            <div className={styles.matrixWrapper}>
              <table className={styles.matrix}>
                <thead>
                  <tr>
                    <th className={styles.matrixHeader}>Module / Permission</th>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <th key={key} className={styles.matrixHeader}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PERMISSION_LABELS).map(([perm, label]) => (
                    <tr key={perm}>
                      <td className={styles.matrixCell}>{label}</td>
                      {Object.keys(ROLE_LABELS).map(role => {
                        const hasAccess = ROLE_PERMISSIONS[role]?.includes('*') || ROLE_PERMISSIONS[role]?.includes(perm);
                        return (
                          <td key={role} className={styles.matrixCell}>
                            <span className={hasAccess ? styles.accessYes : styles.accessNo}>
                              {hasAccess ? '✓' : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {inviteModal && (
        <div className={styles.overlay} onClick={() => setInviteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Invite New Admin</h2>
              <button className={styles.closeBtn} onClick={() => setInviteModal(false)}><X size={20} /></button>
            </div>
            <form className={styles.inviteForm} onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const name = fd.get('name');
              const email = fd.get('email');
              const role = fd.get('role');
              const phone = fd.get('phone');
              if (!name || !email || !role || !phone) return;
              handleInvite(null, `${name}|${email}|${role}|${phone}`);
            }}>
              <Input label="Full Name" name="name" placeholder="Full Name" required />
              <Input label="Email Address" name="email" type="email" placeholder="Email Address" required />
              <Input label="Phone Number" name="phone" placeholder="Phone Number" required />
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Role <span className={styles.required}>*</span></label>
                <select name="role" className={styles.select} required>
                  <option value="">Select a role...</option>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalNote}>
                An email invitation will be sent with setup instructions.
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setInviteModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Send Invitation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={suspendModal.open}
        onClose={() => setSuspendModal({ open: false, admin: null })}
        title={suspendModal.admin?.status === 'active' ? 'Suspend Admin Account?' : 'Reactivate Admin Account?'}
        message={suspendModal.admin?.status === 'active' ? `This will prevent ${suspendModal.admin?.name} from accessing the dashboard.` : `This will restore ${suspendModal.admin?.name}'s access.`}
        confirmVariant={suspendModal.admin?.status === 'active' ? 'danger' : 'primary'}
        confirmLabel={suspendModal.admin?.status === 'active' ? 'Suspend' : 'Reactivate'}
        requireReason={suspendModal.admin?.status === 'active'}
        onConfirm={handleSuspend}
      />

      {editRoleModal.open && (
        <div className={styles.overlay} onClick={() => setEditRoleModal({ open: false, admin: null })}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Change Role: {editRoleModal.admin?.name}</h2>
              <button className={styles.closeBtn} onClick={() => setEditRoleModal({ open: false, admin: null })}>X</button>
            </div>
            <div className={styles.inviteForm}>
              <p className={styles.modalMessage}>Select a new role for this admin.</p>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>New Role</label>
                <select className={styles.select} value={editRole} onChange={e => setEditRole(e.target.value)}>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setEditRoleModal({ open: false, admin: null })}>Cancel</Button>
                <Button variant="primary" onClick={handleRoleChange}>Update Role</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddRegion && (
        <div className={styles.overlay} onClick={() => { setShowAddRegion(false); setNewRegion({ name: '', country: '', currency: '', timezone: '' }); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Operational Region</h2>
              <button className={styles.closeBtn} onClick={() => { setShowAddRegion(false); setNewRegion({ name: '', country: '', currency: '', timezone: '' }); }}><X size={20} /></button>
            </div>
            <form className={styles.inviteForm} onSubmit={(e) => { e.preventDefault(); addRegion(); }}>
              <Input label="City Name" placeholder="e.g. Lagos" value={newRegion.name} onChange={(e) => setNewRegion(prev => ({ ...prev, name: e.target.value }))} required />
              <Input label="Country" placeholder="e.g. Nigeria" value={newRegion.country} onChange={(e) => setNewRegion(prev => ({ ...prev, country: e.target.value }))} required />
              <Input label="Currency Code" placeholder="e.g. NGN" value={newRegion.currency} onChange={(e) => setNewRegion(prev => ({ ...prev, currency: e.target.value }))} required />
              <Input label="Timezone" placeholder="e.g. Africa/Lagos" value={newRegion.timezone} onChange={(e) => setNewRegion(prev => ({ ...prev, timezone: e.target.value }))} required />
              
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => { setShowAddRegion(false); setNewRegion({ name: '', country: '', currency: '', timezone: '' }); }}>Cancel</Button>
                <Button type="submit" variant="primary">Add Region</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
