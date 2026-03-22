import { useNavigate } from 'react-router-dom'
import { TrendingUp, MapPin, Gift, Star, ArrowRight, BarChart2 } from 'lucide-react'
import { KpiCard, SectionCard, Table, PageHeader, TierProgress, TierMilestones, GoldPill, statusBadge, Button } from '../../components/ui'
import { MOVES } from '../../data/mockData'
import styles from './Dashboard.module.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const recent = MOVES.slice(0, 4)

  return (
    <div>
      <PageHeader title="Welcome back, John! 👋" subtitle="Here's an overview of your Voerman Green Miles rewards activity" />

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        <KpiCard label="Total Points" value="24,580" delta="↑ +12.5% vs last month" deltaPositive glowColor="rgba(0,102,204,0.05)"
          icon={<div className={styles.kpiIconBox} style={{ background: 'rgba(0,102,204,0.1)' }}><Star size={20} color="#0066cc" /></div>} />
        <KpiCard label="Total Moves" value="156" delta="↑ +8 this month" deltaPositive glowColor="rgba(16,185,129,0.05)"
          icon={<div className={styles.kpiIconBox} style={{ background: 'rgba(16,185,129,0.1)' }}><MapPin size={20} color="#10b981" /></div>} />
        <KpiCard label="Rewards Redeemed" value="12" delta="⏳ 3 pending" glowColor="rgba(245,158,11,0.05)"
          icon={<div className={styles.kpiIconBox} style={{ background: 'rgba(245,158,11,0.1)' }}><Gift size={20} color="#f59e0b" /></div>} />
        <KpiCard label="Current Tier" value="Gold" delta="420 pts to Platinum" glowColor="rgba(251,191,36,0.1)"
          icon={<div className={styles.kpiIconBox} style={{ background: 'rgba(251,191,36,0.2)' }}><TrendingUp size={20} color="#d97706" /></div>} />
      </div>

      {/* Tier Progress */}
      <SectionCard title="Tier Progress" subtitle="You're just 420 points away from reaching Platinum tier" action={<GoldPill />}>
        <TierProgress />
        <TierMilestones />
      </SectionCard>

      {/* Recent Moves */}
      <SectionCard
        title="Recent Moves"
        subtitle="Latest international moves and point accruals"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/moves')}>
            View All Moves <ArrowRight size={14} />
          </Button>
        }
      >
        <Table>
          <thead>
            <tr>
              <th>Move ID</th><th>Date</th><th>Customer</th><th>Route</th>
              <th>Volume</th><th>Points</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(m => (
              <tr key={m.id} onClick={() => navigate(`/moves/${m.id}`)}>
                <td><code className={styles.mono}>{m.id}</code></td>
                <td className={styles.muted}>{m.date}</td>
                <td>{m.customer}</td>
                <td className={styles.muted}>{m.from} → {m.to}</td>
                <td className={styles.muted}>{m.volume}</td>
                <td><strong className={styles.pts}>+{m.points.toLocaleString()}</strong></td>
                <td>{statusBadge(m.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      {/* Action Cards */}
      <div className={styles.actionGrid}>
        <div className={styles.actionCard} style={{ background: 'linear-gradient(161deg,rgba(0,102,204,.05) 0%,transparent 100%),white', borderColor: 'rgba(0,102,204,.2)' }}>
          <div className={styles.actionIconWrap} style={{ background: 'rgba(0,102,204,.1)', border: '1.275px solid rgba(0,102,204,.2)' }}>
            <Gift size={28} color="#0066cc" />
          </div>
          <div className={styles.actionBody}>
            <h3 className={styles.actionTitle}>Redeem Your Rewards</h3>
            <p className={styles.actionDesc}>Browse our exclusive rewards catalog and redeem your hard-earned points for valuable benefits</p>
            <Button onClick={() => navigate('/redeem')}>Browse Rewards Catalog</Button>
          </div>
        </div>

        <div className={styles.actionCard} style={{ background: 'linear-gradient(161deg,rgba(16,185,129,.05) 0%,transparent 100%),white', borderColor: 'rgba(16,185,129,.2)' }}>
          <div className={styles.actionIconWrap} style={{ background: 'rgba(16,185,129,.1)', border: '1.275px solid rgba(16,185,129,.2)' }}>
            <BarChart2 size={28} color="#10b981" />
          </div>
          <div className={styles.actionBody}>
            <h3 className={styles.actionTitle}>View Performance Analytics</h3>
            <p className={styles.actionDesc}>Track your move volume, earnings trends, and performance metrics with detailed reports</p>
            <Button variant="outline" onClick={() => navigate('/reports')}>View Reports &amp; Analytics</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
