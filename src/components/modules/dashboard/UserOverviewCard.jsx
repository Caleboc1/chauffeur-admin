import { useState } from 'react';
import styles from './UserOverviewCard.module.css';

export default function UserOverviewCard({ data }) {
  const [activeTab, setActiveTab] = useState('riders');

  const chartData = data.chartData[activeTab] || data.chartData.riders;
  const chartLabels = chartData.labels;
  const chartValues = chartData.data;
  const maxVal = Math.max(...chartValues, 1);

  return (
    <div className={styles.card}>
      <div className={styles.userOverviewHero}>
        <div className={styles.userOverviewHeroLabel}>Total Users</div>
        <div className={styles.userOverviewHeroCount}>{data.totalUsers}</div>
      </div>

      <div className={styles.split}>
        <div
          className={`${styles.userOverviewSplitItem} ${activeTab === 'riders' ? styles.active : ''}`}
          onClick={() => setActiveTab('riders')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('riders'); }}
        >
          <div className={styles.userOverviewSplitCount}>{data.riders}</div>
          <div className={styles.userOverviewSplitLabel}>Rider</div>
        </div>
        <div
          className={`${styles.userOverviewSplitItem} ${activeTab === 'drivers' ? styles.active : ''}`}
          onClick={() => setActiveTab('drivers')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('drivers'); }}
        >
          <div className={styles.userOverviewSplitCount}>{data.drivers}</div>
          <div className={styles.userOverviewSplitLabel}>Driver</div>
        </div>
      </div>

      <div className={styles.userOverviewChartContainer}>
        <div className={styles.userOverviewChartInner}>
          <div className={styles.chartBars}>
            {chartValues.map((val, idx) => (
              <div key={idx} className={styles.chartBarCol}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${(val / maxVal) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className={styles.chartTimeLabels}>
            {chartLabels.map((label, idx) => (
              <span key={idx} className={styles.chartBarLabel}>{label}</span>
            ))}
          </div>
        </div>
        <div className={styles.chartFooter}>
          <span className={styles.chartLabel}>Realtime Users</span>
          <span className={styles.chartTrend}>{data.trend}</span>
          <span className={styles.chartValue}>{data.realtimeNow}</span>
        </div>
      </div>
    </div>
  );
}
