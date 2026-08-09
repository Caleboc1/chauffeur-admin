import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './VipPage.module.css';
import VipOverview from './components/VipOverview';
import VipBookingsTab from './components/VipBookingsTab';
import VipDriversTab from './components/VipDriversTab';
import VipFleetTab from './components/VipFleetTab';

export default function VipPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'overview' ? {} : { tab });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>VIP Experience</h1>
          <p className={styles.subtitle}>Manage VIP bookings, drivers, and fleet</p>
        </div>

        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => handleTabChange('bookings')}
          >
            All Bookings
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'drivers' ? styles.active : ''}`}
            onClick={() => handleTabChange('drivers')}
          >
            VIP Drivers
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'fleet' ? styles.active : ''}`}
            onClick={() => handleTabChange('fleet')}
          >
            VIP Fleet
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'overview' && <VipOverview />}
        {activeTab === 'bookings' && <VipBookingsTab />}
        {activeTab === 'drivers' && <VipDriversTab />}
        {activeTab === 'fleet' && <VipFleetTab />}
      </main>
    </div>
  );
}
