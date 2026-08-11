import { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { vipStates } from './vipAdminData';
import styles from './VipModulePages.module.css';

export default function VipStatesPage() {
  const [states, setStates] = useState(vipStates);

  const toggleState = (stateId) => {
    setStates((current) => current.map((item) => (
      item.id === stateId
        ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
        : item
    )));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VIP State Management</h1>
          <p className={styles.subtitle}>Manage VIP service coverage across Nigerian states</p>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <Metric label="Total States" value={states.length} />
        <Metric label="Active" value={states.filter((item) => item.status === 'active').length} />
        <Metric label="Inactive" value={states.filter((item) => item.status === 'inactive').length} />
        <Metric label="Total Drivers" value={states.reduce((sum, item) => sum + item.drivers, 0)} />
      </div>

      <section className={styles.panel}>
        <div className={styles.filters}>
          <input className={styles.search} placeholder="Search by rider, driver, address..." />
          <select className={styles.select} defaultValue="all">
            <option value="all">All Categories</option>
          </select>
          <select className={styles.select} defaultValue="all">
            <option value="all">All Statuses</option>
          </select>
        </div>
        <div className={styles.stateGrid}>
          {states.map((state) => (
            <article className={styles.stateCard} key={state.id}>
              <div className={styles.stateHeader}>
                <div className={styles.stateName}>{state.name}</div>
                <StatusBadge status={state.status} />
              </div>
              <div className={styles.chips}>
                <span className={styles.chip}>{state.code}</span>
                <span className={styles.chip}>{state.region}</span>
              </div>
              <div className={styles.stateStats}>
                <span><strong>{state.coverage}%</strong>Coverage</span>
                <span><strong>{state.drivers}</strong>Drivers</span>
                <span><strong>{state.routes}</strong>Routes</span>
              </div>
              <button className={styles.linkButton} onClick={() => toggleState(state.id)}>
                {state.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  );
}
