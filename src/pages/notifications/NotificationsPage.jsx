import { useEffect, useState } from 'react';
import { Send, History, FileText, Bell, Smartphone, Mail, Users as UsersIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import { formatDateTime } from '@/utils/formatters';
import { adminApi, mapNotification } from '@/lib/adminApi';
import styles from './NotificationsPage.module.css';

const MOCK_TEMPLATES = [
  { id: 't1', name: 'Welcome Message', channel: 'push', subject: 'Welcome to Chauffeur!', body: 'Welcome to the platform. Complete your profile to start riding.' },
  { id: 't2', name: 'Document Reminder', channel: 'email', subject: 'Document Expiry Notice', body: 'Your document {doc_type} is expiring on {expiry_date}. Please upload a new copy.' },
  { id: 't3', name: 'Promo Alert', channel: 'sms', subject: 'Promotional Offer', body: 'Get {discount}% off your next ride. Use code {promo_code}. Valid until {valid_until}.' },
];

const CHANNELS = [
  { id: 'push', label: 'Push Notification', icon: Bell },
  { id: 'sms', label: 'SMS', icon: Smartphone },
  { id: 'email', label: 'Email', icon: Mail },
];

const AUDIENCE_OPTIONS = [
  { id: 'all_drivers', label: 'All Drivers' },
  { id: 'all_riders', label: 'All Riders' },
  { id: 'specific_driver', label: 'Specific Driver' },
  { id: 'specific_rider', label: 'Specific Rider' },
  { id: 'custom', label: 'Custom Filter' },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('compose');
  const [channel, setChannel] = useState('push');
  const [audience, setAudience] = useState('all_drivers');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [templates] = useState(MOCK_TEMPLATES);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    setError('');
    try {
      const data = await adminApi.listNotifications({ limit: 100 });
      setHistory(data.map(mapNotification));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }

  const historyColumns = [
    { key: 'sent_at', label: 'Sent', render: (v) => formatDateTime(v) },
    { key: 'channel', label: 'Channel', render: (v) => (
      <span className={styles.channelCell}>
        {v === 'push' ? <Bell size={14} /> : v === 'sms' ? <Smartphone size={14} /> : <Mail size={14} />}
        <span>{v.toUpperCase()}</span>
      </span>
    )},
    { key: 'audience', label: 'Audience' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ];

  const templateColumns = [
    { key: 'name', label: 'Template Name' },
    { key: 'channel', label: 'Channel', render: (v) => v.toUpperCase() },
    { key: 'subject', label: 'Subject' },
    { key: 'body', label: 'Body Preview', render: (v) => <span className={styles.bodyPreview}>{v}</span> },
    { key: 'actions', label: '', render: (_, row) => (
      <Button variant="ghost" size="sm" onClick={() => { setSubject(row.subject); setBody(row.body); setChannel(row.channel); setActiveTab('compose'); }}>
        Use Template
      </Button>
    )},
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    if ((audience === 'specific_driver' || audience === 'specific_rider') && !recipientId.trim()) return;
    setSending(true);
    setError('');
    try {
      await adminApi.broadcastNotification({
        recipientId: recipientId.trim() || audience,
        title: subject.trim(),
        description: body.trim(),
        notificationType: 'simple',
        metaData: { channel, audience },
      });
      await loadHistory();
      setSubject('');
      setBody('');
      setRecipientId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Notification Center</h1>
          <p className={styles.subtitle}>Broadcast push notifications, SMS, and emails to drivers and riders</p>
        </div>
      </header>

      <nav className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'compose' ? styles.activeTab : ''}`} onClick={() => setActiveTab('compose')}>
          <Send size={18} /> Compose
        </button>
        <button className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`} onClick={() => setActiveTab('history')}>
          <History size={18} /> History
        </button>
        <button className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`} onClick={() => setActiveTab('templates')}>
          <FileText size={18} /> Templates
        </button>
      </nav>

      <div className={styles.content}>
        {error && <div>{error}</div>}
        {activeTab === 'compose' && (
          <form className={styles.composeForm} onSubmit={handleSend}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>1. Select Channel</h2>
              <div className={styles.channelGrid}>
                {CHANNELS.map(ch => (
                  <button key={ch.id} type="button" className={`${styles.channelOption} ${channel === ch.id ? styles.channelActive : ''}`} onClick={() => setChannel(ch.id)}>
                    <ch.icon size={24} />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>2. Choose Audience</h2>
              <div className={styles.audienceGrid}>
                {AUDIENCE_OPTIONS.map(opt => (
                  <button key={opt.id} type="button" className={`${styles.audienceOption} ${audience === opt.id ? styles.audienceActive : ''}`} onClick={() => setAudience(opt.id)}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {(audience === 'specific_driver' || audience === 'specific_rider') && (
                <Input
                  label={audience === 'specific_driver' ? 'Driver ID' : 'Rider ID'}
                  placeholder={audience === 'specific_driver' ? 'Driver ID' : 'Rider ID'}
                  value={recipientId}
                  onChange={(event) => setRecipientId(event.target.value)}
                  className={styles.userIdInput}
                />
              )}
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>3. Compose Message</h2>
              <div className={styles.composeFields}>
                <Input label="Subject / Title" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject / Title" required />
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Message Body <span className={styles.required}>*</span></label>
                  <textarea className={styles.textarea} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={6} required />
                </div>
              </div>
            </section>

            <div className={styles.sendRow}>
              <div className={styles.sendInfo}>
                <UsersIcon size={16} />
                <span>Will be sent to {audience.replace('_', ' ')} via {channel.toUpperCase()}</span>
              </div>
              <Button type="submit" variant="primary" icon={Send} disabled={sending || !subject.trim() || !body.trim() || ((audience === 'specific_driver' || audience === 'specific_rider') && !recipientId.trim())}>
                {sending ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'history' && (
          <div className={styles.card}>
            <DataTable columns={historyColumns} data={history} loading={loadingHistory} searchPlaceholder="Search notification history..." emptyMessage="No notifications sent yet." />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className={styles.card}>
            <DataTable columns={templateColumns} data={templates} showSearch={false} emptyMessage="No templates available." />
          </div>
        )}
      </div>
    </div>
  );
}
