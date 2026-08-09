import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Truck, 
  UserCircle, 
  Bell, 
  Settings, 
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  UserCheck,
  Search,
  AlertTriangle,
  Star,
  FileEdit,
  LogOut,
  BadgePercent
} from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useSosBadge } from '@/hooks/useSosBadge';
import { useAuth } from '@/hooks/useAuth';
import logoSvg from '@/assets/logo.svg';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { can } = useRole();
  const { activeCount } = useSosBadge();
  const { signOut } = useAuth();
  const [driversExpanded, setDriversExpanded] = useState(true);

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'dashboard' },
      ]
    },
    {
      title: 'FLEET & USERS',
      items: [
        { 
          icon: Users, 
          label: 'Drivers', 
          permission: 'drivers',
          children: [
            { icon: UserCheck, label: 'Registered Drivers', path: '/drivers', permission: 'drivers', end: true },
            { icon: ClipboardCheck, label: 'Applications', path: '/drivers/applications', permission: 'applications' },
            { icon: Search, label: 'Inspections', path: '/drivers/inspections', permission: 'inspections' },
          ],
          expanded: driversExpanded,
          setExpanded: setDriversExpanded
        },
        { icon: Car, label: 'Rides', path: '/rides', permission: 'rides' },
        { icon: Star, label: 'VIP Experience', path: '/vip', permission: 'vip' },
        { icon: UserCircle, label: 'Riders', path: '/riders', permission: 'riders:read' },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { icon: DollarSign, label: 'Earnings', path: '/earnings', permission: 'earnings' },
        { icon: BadgePercent, label: 'Discounts', path: '/discounts', permission: 'discounts' },
        { icon: Truck, label: 'Vehicles', path: '/vehicles', permission: 'vehicles' },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { 
          icon: AlertTriangle, 
          label: 'SOS', 
          path: '/sos', 
          permission: 'sos',
          className: styles.sosLink,
          badge: activeCount > 0 ? (activeCount > 99 ? '99+' : activeCount) : null
        },
        { icon: MessageSquare, label: 'Complaints', path: '/complaints', permission: 'complaints' },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { icon: FileText, label: 'Accounting', path: '/accounting', permission: 'accounting' },
        { icon: Bell, label: 'Notifications', path: '/notifications', permission: 'notifications' },
        { icon: FileEdit, label: 'Content', path: '/content', permission: 'content' },
        { icon: ClipboardList, label: 'Audit Logs', path: '/audit-logs', permission: 'audit-logs' },
        { icon: Settings, label: 'Settings', path: '/settings', permission: 'settings' },
      ]
    }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLayout}>
        <div className={styles.logo}>
          <img src={logoSvg} alt="Chauffeur Logo" className={styles.logoImage} />
        </div>

        <nav className={styles.sidebarNav}>
          {navGroups.map((group) => {
            const hasVisibleItems = group.items.some(item => can(item.permission));
            if (!hasVisibleItems) return null;

            return (
              <div key={group.title} className={styles.navSection}>
                <div className={styles.groupTitle}>{group.title}</div>
                <div className={styles.groupItems}>
                  {group.items.map((item) => {
                    if (!can(item.permission)) return null;

                    const hasChildren = item.children && item.children.length > 0;

                    return (
                      <div key={item.label} className={styles.navGroup}>
                        {hasChildren ? (
                          <>
                            <button 
                              className={`${styles.navLink} ${item.expanded ? styles.expanded : ''}`}
                              onClick={() => item.setExpanded(!item.expanded)}
                            >
                              <item.icon size={20} />
                              <span className={styles.label}>{item.label}</span>
                              {item.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            {item.expanded && (
                              <div className={styles.children}>
                                {item.children.map((child) => {
                                  if (!can(child.permission)) return null;
                                  return (
                                    <NavLink 
                                      key={child.label} 
                                      to={child.path}
                                      end={child.end}
                                      className={({ isActive }) => `${styles.childLink} ${isActive ? styles.active : ''}`}
                                    >
                                      <child.icon size={20} />
                                      <span>{child.label}</span>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <NavLink 
                            to={item.path}
                            className={({ isActive }) => `${styles.navLink} ${item.className || ''} ${isActive ? styles.active : ''}`}
                          >
                            <item.icon size={20} />
                            <span className={styles.label}>{item.label}</span>
                            {item.badge && <span className={styles.badge}>{item.badge}</span>}
                          </NavLink>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.sidebarSignOutButton} onClick={signOut}>
            <LogOut size={18} className={styles.sidebarSignOutIcon} />
            <span className={styles.sidebarSignOutLabel}>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
