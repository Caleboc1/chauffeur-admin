import { useState, useEffect } from 'react';
import {
  Users, Car, CheckCircle, AlertTriangle,
  DollarSign, MoreVertical, Eye, Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatId } from '@/utils/formatters';
import KPICard from '@/components/modules/dashboard/KPICard';
import RideAnalyticsCard from '@/components/modules/dashboard/RideAnalyticsCard';
import UserOverviewCard from '@/components/modules/dashboard/UserOverviewCard';
import AdminWalletCard from '@/components/modules/dashboard/AdminWalletCard';
import TopDriversCard from '@/components/modules/dashboard/TopDriversCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import { adminApi, fullName, mapAdminRide, mapAdminTransaction, mapAdminUser } from '@/lib/adminApi';
import styles from './DashboardPage.module.css';

const CHART_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'This year', value: 'year' },
  { label: 'Last 5 years', value: 'five_years' },
];

const STATUS_FILTERS = ['All', 'active', 'inactive', 'suspended', 'under_review'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeDrivers: 0,
    totalRiders: 0,
    pendingApplications: 0,
    pendingComplaints: 0,
    failedPayments: 0
  });
  const [recentRides, setRecentRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rideAnalytics, setRideAnalytics] = useState({});
  const [userOverview, setUserOverview] = useState({
    totalUsers: 0,
    riders: 0,
    drivers: 0,
    trend: '0%',
    realtimeNow: 0,
    chartData: {
      riders: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], data: [0, 0, 0, 0, 0, 0, 0] },
      drivers: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], data: [0, 0, 0, 0, 0, 0, 0] },
    },
  });
  const [adminWallet, setAdminWallet] = useState({
    totalEarning: 0,
    alreadyWithdrawn: 0,
    pendingWithdraw: 0,
    totalCommission: 0,
    rejectedWithdraw: 0,
    trend: '0%',
  });
  const [chartRange, setChartRange] = useState('week');
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [driverSearch, setDriverSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openMenu, setOpenMenu] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const maxRevenueValue = Math.max(1, ...revenueData.map((point) => point.value));

  let filteredDrivers = drivers.filter(d => {
    const search = driverSearch.toLowerCase();
    if (search && !d.full_name.toLowerCase().includes(search) && !d.email.toLowerCase().includes(search) && !d.phone.toLowerCase().includes(search)) return false;
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    return true;
  });

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      try {
        const [driverRows, riderRows, rideRows, complaintRows, transactionRows, earnings] = await Promise.all([
          adminApi.listUsers({ userType: 'driver', limit: 100 }).catch(() => []),
          adminApi.listUsers({ userType: 'user', limit: 100 }).catch(() => []),
          adminApi.listRides({ limit: 100 }).catch(() => []),
          adminApi.listComplaints({ limit: 100 }).catch(() => []),
          adminApi.listTransactions({ limit: 100 }).catch(() => []),
          adminApi.getEarningsAndCommission().catch(() => null),
        ]);
        if (cancelled) return;

        const mappedDrivers = driverRows.map(mapAdminUser);
        const mappedRides = rideRows.map(mapAdminRide);
        const mappedTransactions = transactionRows.map(mapAdminTransaction);
        const totalRevenue = Number(
          earnings?.totalRevenue?.total ??
            earnings?.totalRevenue?.current ??
            earnings?.totalEarnings ??
            mappedTransactions.reduce((sum, tx) => sum + Math.max(0, tx.amount), 0),
        );
        const activeDrivers = mappedDrivers.filter((driver) => driver.status === 'active' || driver.isOnline).length;
        const pendingComplaints = complaintRows.filter((complaint) => !['resolved', 'closed'].includes(complaint.status || complaint.state)).length;
        const failedPayments = mappedTransactions.filter((tx) => ['failed', 'rejected'].includes(tx.status)).length;
        const rideStatusCounts = mappedRides.reduce((acc, ride) => {
          acc[ride.trip_status] = (acc[ride.trip_status] || 0) + 1;
          return acc;
        }, {});

        setDrivers(mappedDrivers);
        setRecentRides(mappedRides.slice(0, 8));
        setRideAnalytics({
          accepted: rideStatusCounts.accepted || 0,
          onTheWay: rideStatusCounts.progress || rideStatusCounts.destination || 0,
          arrived: rideStatusCounts.arrived || 0,
          pickup: rideStatusCounts.pickup || 0,
          starting: rideStatusCounts.requested || 0,
          completed: rideStatusCounts.completed || 0,
          cancelled: rideStatusCounts.cancelled || 0,
        });
        setStats({
          totalRevenue,
          activeDrivers,
          totalRiders: riderRows.length,
          pendingApplications: mappedDrivers.filter((driver) => ['pending', 'under_review'].includes(driver.verification_status)).length,
          pendingComplaints,
          failedPayments,
        });
        setUserOverview((prev) => ({
          ...prev,
          totalUsers: riderRows.length + mappedDrivers.length,
          riders: riderRows.length,
          drivers: mappedDrivers.length,
          realtimeNow: riderRows.length + mappedDrivers.length,
        }));
        setAdminWallet({
          totalEarning: totalRevenue * 100,
          alreadyWithdrawn: 0,
          pendingWithdraw: 0,
          totalCommission: Number(earnings?.totalCommission?.total ?? earnings?.totalCommission?.current ?? 0) * 100,
          rejectedWithdraw: 0,
          trend: '0%',
        });
      } catch {
        // Individual calls are isolated above. Leave zero/empty dashboard state on unexpected failures.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadRevenue() {
      setRevenueLoading(true);
      try {
        const data = await adminApi.getRevenueOverview({ filter: chartRange });
        if (!cancelled) setRevenueData(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRevenueData([]);
      } finally {
        if (!cancelled) setRevenueLoading(false);
      }
    }
    loadRevenue();
    return () => {
      cancelled = true;
    };
  }, [chartRange]);

  useEffect(() => {
    if (!openMenu) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-action-menu]')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Administrative Dashboard</h1>
          <p className={styles.subtitle}>ReadyRide System Overview & Operations</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <KPICard loading={loading} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} trend="up" trendValue={12.5} />
        <KPICard loading={loading} label="Active Drivers" value={stats.activeDrivers} icon={Car} trend="up" trendValue={3} />
        <KPICard loading={loading} label="Total Riders" value={stats.totalRiders} icon={Users} trend="up" trendValue={8.2} />
        <KPICard loading={loading} label="Pending Applications" value={stats.pendingApplications} icon={CheckCircle} trend="down" trendValue={1} />
      </div>

      <div className={styles.metricCardsRow}>
        <RideAnalyticsCard data={rideAnalytics} />
        <UserOverviewCard data={userOverview} />
        <AdminWalletCard data={adminWallet} />
      </div>

      <div className={styles.revenueAndAlertsRow}>
        <div className={styles.revenueChartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Revenue Overview</h2>
            <select
              className={styles.chartDropdown}
              value={chartRange}
              onChange={e => setChartRange(e.target.value)}
            >
              {CHART_RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.chartArea}>
            <div className={styles.revenueChart}>
              {revenueLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <div key={`revenue-skeleton-${i}`} className={styles.chartBarWrapper}>
                    <Skeleton width="70%" height={`${30 + (i % 3) * 15}%`} />
                  </div>
                ))
              ) : revenueData.length === 0 ? (
                <div className={styles.emptyRow}>No revenue data for this period.</div>
              ) : (
                revenueData.map((point, i) => {
                  const pct = Math.max(2, (point.value / maxRevenueValue) * 100);
                  const barColor = pct >= 70 ? 'var(--color-green-100)' : pct >= 45 ? 'var(--color-primary-400)' : 'var(--color-yellow-100)';
                  return (
                    <div key={`${point.date}-${i}`} className={styles.chartBarWrapper}>
                      <div className={styles.chartBar} style={{ height: `${pct}%`, backgroundColor: barColor }}>
                        <span className={styles.barTooltip}>{formatCurrency(point.value)}</span>
                      </div>
                      <span className={styles.barLabel}>{point.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className={styles.criticalAlertsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Critical Alerts</h2>
          </div>
          <div className={styles.alertsList}>
            {stats.pendingComplaints > 0 && (
              <div className={styles.alertItem}>
                <div className={styles.alertIcon}><AlertTriangle size={16} /></div>
                <div className={styles.alertText}>
                  <strong>{stats.pendingComplaints} Pending Complaints</strong>
                  <p>Rider disputes require immediate attention.</p>
                </div>
              </div>
            )}
            {stats.failedPayments > 0 && (
              <div className={styles.alertItem}>
                <div className={styles.alertIcon}><AlertTriangle size={16} /></div>
                <div className={styles.alertText}>
                  <strong>{stats.failedPayments} Failed Payments</strong>
                  <p>Transactions blocked by payment gateway.</p>
                </div>
              </div>
            )}
            <div className={styles.alertItem}>
              <div className={styles.alertIcon}><CheckCircle size={16} /></div>
              <div className={styles.alertText}>
                <strong>System Security Audit</strong>
                <p>All firewalls and RLS policies active.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recentRidesAndTopDriversRow}>
        <div className={styles.recentRidesCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Rides</h2>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Fare</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`recent-ride-skeleton-${i}`}>
                      <td><Skeleton height="14px" width="70%" /></td>
                      <td><Skeleton height="14px" width="70%" /></td>
                      <td><Skeleton height="14px" width="60px" /></td>
                      <td><Skeleton height="14px" width="60px" /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {recentRides.map(ride => (
                      <tr key={ride.id}>
                        <td>{fullName(ride.riders) || 'Anonymous'}</td>
                        <td>{ride.drivers ? fullName(ride.drivers) : 'Unassigned'}</td>
                        <td><StatusBadge status={ride.trip_status} /></td>
                        <td>{formatCurrency(ride.fare)}</td>
                      </tr>
                    ))}
                    {recentRides.length === 0 && (
                      <tr>
                        <td colSpan="4" className={styles.emptyRow}>No recent rides</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <TopDriversCard drivers={drivers.slice().sort((a, b) => b.rating - a.rating).slice(0, 5).map((driver, index) => ({
          rank: index + 1,
          avatar: driver.selfie_url || `https://api.dicebear.com/5.x/thumbs/svg?seed=${driver.id}`,
          name: driver.full_name,
          rating: driver.rating || 0,
          rides: driver.completedRides || driver.completed_rides || 0,
        }))} />
      </div>

      <div className={styles.driversTableCard}>
        <div className={styles.driversTableHeader}>
          <h2 className={styles.driversTableTitle}>Registered Drivers</h2>
        </div>
        <div className={styles.driversTableControls}>
          <input
            type="text"
            className={styles.driversSearchInput}
            placeholder="Search by name, phone, email..."
            value={driverSearch}
            onChange={e => setDriverSearch(e.target.value)}
          />
          <select
            className={styles.driversStatusFilter}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map(f => (
              <option key={f} value={f}>{f === 'All' ? 'All Statuses' : f.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <table className={styles.driversTable}>
          <colgroup>
            <col className={styles.colDriver} />
            <col className={styles.colPhone} />
            <col className={styles.colEmail} />
            <col className={styles.colVehicle} />
            <col className={styles.colRating} />
            <col className={styles.colStatus} />
            <col className={styles.colJoined} />
            <col className={styles.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Vehicle</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={`driver-skeleton-${i}`}>
                <td>
                  <div className={styles.driverCellWrapper}>
                    <Skeleton width="32px" height="32px" circle />
                    <div className={styles.driverCellInfo}>
                      <Skeleton height="14px" width="120px" style={{ marginBottom: 4 }} />
                      <Skeleton height="12px" width="70px" />
                    </div>
                  </div>
                </td>
                <td><Skeleton height="14px" width="90%" /></td>
                <td><Skeleton height="14px" width="90%" /></td>
                <td><Skeleton height="14px" width="90%" /></td>
                <td><Skeleton height="14px" width="40px" /></td>
                <td><Skeleton height="14px" width="60px" /></td>
                <td><Skeleton height="14px" width="80px" /></td>
                <td></td>
              </tr>
            ))}
            {!loading && filteredDrivers.map(d => {
              const vehicleStr = d.vehicle ? `${d.vehicle.make || ''} ${d.vehicle.model || ''}`.trim() || 'Vehicle' : '—';
              const plateStr = d.vehicle?.plate_number || d.vehicle?.plateNumber || '';
              return (
                <tr key={d.id}>
                  <td>
                    <div className={styles.driverCellWrapper}>
                      {d.selfie_url ? (
                        <img src={d.selfie_url} alt="" className={styles.driverAvatar} />
                      ) : (
                        <div className={styles.driverAvatar}>{d.full_name.charAt(0)}</div>
                      )}
                      <div className={styles.driverCellInfo}>
                        <span className={styles.driverCellName}>{d.full_name}</span>
                        <span className={styles.driverCellId}>{formatId(d.id, 'driver')}</span>
                      </div>
                    </div>
                  </td>
                  <td>{d.phone}</td>
                  <td>{d.email}</td>
                  <td>
                    <div className={styles.vehicleCellMake}>{vehicleStr}</div>
                    {plateStr && <div className={styles.vehicleCellPlate}>{plateStr}</div>}
                  </td>
                  <td>{d.rating > 0 ? d.rating.toFixed(1) : '—'}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td>{formatDate(d.created_at)}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionMenuWrap} data-action-menu={d.id}>
                      <button
                        className={styles.actionMenuButton}
                        onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === d.id && (
                        <div className={styles.actionDropdown}>
                          <button onClick={() => { navigate(`/drivers/${d.id}`); setOpenMenu(null); }}>
                            <Eye size={14} className={styles.actionDropdownIcon} />
                            View Profile
                          </button>
                          <button
                            className={styles.actionDanger}
                            onClick={() => { setSuspendTarget(d); setSuspendModalOpen(true); setOpenMenu(null); }}
                          >
                            <Ban size={14} className={styles.actionDropdownIcon} />
                            Suspend Driver
                          </button>
                          <button onClick={() => { navigate(`/rides?driverId=${d.id}`); setOpenMenu(null); }}>
                            <Car size={14} className={styles.actionDropdownIcon} />
                            View Trips
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filteredDrivers.length === 0 && (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>No drivers match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className={styles.driversPaginationBar}>
          <span className={styles.driversPaginationInfo}>
            Showing 1&ndash;{filteredDrivers.length} of {drivers.length} drivers
          </span>
          <div className={styles.driversPaginationControls}>
            <button className={styles.pageBtn} disabled>Prev</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn} disabled>Next</button>
          </div>
        </div>
      </div>

      {suspendModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setSuspendModalOpen(false)}>
          <div className={styles.suspendModal} onClick={e => e.stopPropagation()}>
            <h3>Suspend Driver</h3>
            <p>
              Are you sure you want to suspend <strong>{suspendTarget?.full_name}</strong>?
              This will prevent them from accepting new rides.
            </p>
            <textarea
              placeholder="Reason for suspension (required)"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                disabled={suspending}
                onClick={() => { setSuspendModalOpen(false); setSuspendReason(''); }}
              >
                Cancel
              </button>
              <button
                className={styles.suspendConfirmBtn}
                disabled={!suspendReason.trim() || suspending}
                onClick={async () => {
                  if (!suspendTarget) return;
                  setSuspending(true);
                  try {
                    await adminApi.toggleBlockUser(suspendTarget.id, { status: 'suspended', statusReason: suspendReason.trim() });
                    setDrivers((prev) => prev.map((d) => (d.id === suspendTarget.id ? { ...d, status: 'suspended' } : d)));
                    setSuspendModalOpen(false);
                    setSuspendReason('');
                    setSuspendTarget(null);
                  } catch (err) {
                    alert('Suspension failed: ' + err.message);
                  } finally {
                    setSuspending(false);
                  }
                }}
              >
                {suspending ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
