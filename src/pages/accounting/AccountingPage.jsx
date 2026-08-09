import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import { FileDown, PieChart, Filter, ArrowLeftRight } from 'lucide-react';
import { adminApi, mapAdminTransaction } from '@/lib/adminApi';
import styles from './AccountingPage.module.css';

export default function AccountingPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('daily');
  const [error, setError] = useState('');

  const groupKey = (dateStr) => {
    const d = new Date(dateStr);
    if (period === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (period === 'weekly') {
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    }
    return dateStr;
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      let data = (await adminApi.listTransactions({ limit: 500 })).map(mapAdminTransaction);

      if (dateRange.start) {
        data = data.filter(tx => tx.created_at >= dateRange.start);
      }
      if (dateRange.end) {
        data = data.filter(tx => tx.created_at <= dateRange.end + 'T23:59:59Z');
      }

      const grouped = data.reduce((acc, tx) => {
        const date = tx.created_at.split('T')[0];
        const key = groupKey(date);
        if (!acc[key]) acc[key] = { date: key, revenue: 0, commissions: 0, count: 0, refunds: 0 };
        acc[key].count += 1;

        if (tx.type === 'ride_payment') {
          acc[key].revenue += Math.abs(tx.amount);
          acc[key].commissions += Math.abs(tx.amount) * 0.2;
        } else if (tx.type === 'refund') {
          acc[key].refunds += Math.abs(tx.amount);
        }

        return acc;
      }, {});

      setReports(Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const PERIOD_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  useEffect(() => {
    if (reports.length > 0) generateReport();
  }, [period]);

  const exportCSV = () => {
    if (reports.length === 0) return;
    const headers = ['Date', 'Transactions', 'Gross Revenue', 'Est. Commission', 'Refunds'];
    const rows = reports.map(r => [r.date, r.count, r.revenue, r.commissions, r.refunds]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-report-${dateRange.start || 'all'}-${dateRange.end || 'now'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'date', label: 'Period', render: (v) => formatDate(v) },
    { key: 'count', label: 'Transactions' },
    { key: 'revenue', label: 'Gross Revenue', render: (v) => formatCurrency(v) },
    { key: 'commissions', label: 'Est. Commission', render: (v) => formatCurrency(v) },
    { key: 'refunds', label: 'Refunds', render: (v) => formatCurrency(v) },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Accounting & Reporting</h1>
          <p className={styles.subtitle}>Generate financial statements and export auditing data</p>
        </div>
      </header>

      <div className={styles.filterSection}>
        <div className={styles.filterGrid}>
          <Input 
            label="Start Date" 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <Input 
            label="End Date" 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
          <div className={styles.filterActions}>
            <Button variant="primary" icon={Filter} onClick={generateReport} disabled={loading}>
              Generate Report
            </Button>
            <Button variant="secondary" icon={FileDown} onClick={exportCSV} disabled={reports.length === 0}>
              Export CSV
            </Button>
          </div>
        </div>
      </div>

        <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <PieChart size={24} className={styles.summaryIcon} />
          <div className={styles.summaryInfo}>
            <label>Total Period Revenue</label>
            <h3>{formatCurrency(reports.reduce((acc, r) => acc + r.revenue, 0))}</h3>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <ArrowLeftRight size={24} className={styles.summaryIcon} />
          <div className={styles.summaryInfo}>
            <label>Total Refunds</label>
            <h3>{formatCurrency(reports.reduce((acc, r) => acc + r.refunds, 0))}</h3>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>Performance Summary</h2>
        </div>
        {error && <div>{error}</div>}
          <DataTable 
          columns={columns} 
          data={reports} 
          loading={loading}
          searchPlaceholder="Search reports..."
          filterValue={period}
          onFilterChange={setPeriod}
          filterOptions={PERIOD_OPTIONS}
        />
      </div>
    </div>
  );
}
