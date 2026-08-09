import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User, Bell, Check, Info, AlertTriangle, DollarSign, X } from 'lucide-react';
import { adminApi, mapNotification } from '@/lib/adminApi';
import styles from './Header.module.css';

export default function Header() {
  const { admin, role } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      try {
        const data = await adminApi.listNotifications({ limit: 20 });
        if (!cancelled) {
          setNotifications(data.map(mapNotification).map((item) => ({
            ...item,
            type: item.notificationType || item.channel,
            message: item.description || item.subject,
            read: Boolean(item.isRead),
            link: '/notifications',
          })));
        }
      } catch {
        if (!cancelled) setNotifications([]);
      }
    }
    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setShowDropdown(false);
    navigate(notif.link);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'fund_request': return <DollarSign size={16} className={styles.iconBlue} />;
      case 'complaint': return <AlertTriangle size={16} className={styles.iconRed} />;
      case 'application': return <User size={16} className={styles.iconGreen} />;
      default: return <Info size={16} className={styles.iconGray} />;
    }
  };

  const formatRole = (roleStr) => {
    return roleStr?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className={styles.header}>
      <div className={styles.breadcrumb}>
        {/* Placeholder for dynamic breadcrumbs */}
      </div>

      <div className={styles.actions}>
        <div className={styles.notificationWrapper} ref={dropdownRef}>
          <button 
            className={styles.bellButton} 
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className={styles.badgeCount}>{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className={styles.markAllRead} onClick={markAllRead}>
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyState}>No notifications.</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={styles.notifIconWrapper}>
                        {getIconForType(notif.type)}
                      </div>
                      <div className={styles.notifContent}>
                        <p className={styles.notifMessage}>{notif.message}</p>
                        <span className={styles.notifTime}>{notif.sent_at ? new Date(notif.sent_at).toLocaleString() : ''}</span>
                      </div>
                      {!notif.read && <div className={styles.unreadIndicator} />}
                    </div>
                  ))
                )}
              </div>
              
              <button className={styles.viewAllBtn} onClick={() => { setShowDropdown(false); setShowAllModal(true); }}>
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className={styles.onlineBadge}>
          <div className={styles.onlineDot} />
          <span>ADMIN ONLINE</span>
        </div>

        <Link to="/admin/profile" className={styles.adminLink}>
          <div className={styles.avatar}>
            {admin?.avatar_url ? (
              <img src={admin.avatar_url} alt="" className={styles.avatarImg} />
            ) : (
              <User size={20} className={styles.avatarIcon} />
            )}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>{admin?.name || 'Admin User'}</span>
            <span className={styles.role}>{formatRole(role)}</span>
          </div>
        </Link>
      </div>

      {showAllModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAllModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>All Notifications</h2>
              <div className={styles.modalActions}>
                {unreadCount > 0 && (
                  <button className={styles.modalMarkAllRead} onClick={markAllRead}>
                    <Check size={16} /> Mark all read
                  </button>
                )}
                <button className={styles.closeBtn} onClick={() => setShowAllModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className={styles.modalScrollArea}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>No notifications to display.</div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`${styles.modalNotifItem} ${!notif.read ? styles.unread : ''}`}
                    onClick={() => { setShowAllModal(false); handleNotificationClick(notif); }}
                  >
                    <div className={styles.notifIconWrapper}>
                      {getIconForType(notif.type)}
                    </div>
                    <div className={styles.notifContent}>
                      <p className={styles.notifMessage}>{notif.message}</p>
                      <span className={styles.notifTime}>{notif.sent_at ? new Date(notif.sent_at).toLocaleString() : ''}</span>
                    </div>
                    {!notif.read && <div className={styles.unreadIndicator} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
