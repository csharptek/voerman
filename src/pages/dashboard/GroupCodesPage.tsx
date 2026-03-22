import { PageHeader, Table, statusBadge } from '../../components/ui'
import styles from './GroupCodes.module.css'

// Assets from Figma node 9:8409
const NETWORK_IC  = 'https://www.figma.com/api/mcp/asset/7f295230-6ad4-4b93-8232-b228eb0c8ea9'
const EXPORT_IC   = 'https://www.figma.com/api/mcp/asset/8bd1f610-7a62-49f1-aa74-da1dd92d24b9'
const ADD_IC      = 'https://www.figma.com/api/mcp/asset/8105e3be-689a-4982-a44c-6925d16a7c83'
const MEMBERS_IC  = 'https://www.figma.com/api/mcp/asset/c105297a-9701-4e5b-8d90-80b696adaf05'
const POINTS_IC   = 'https://www.figma.com/api/mcp/asset/657a1181-2377-4b0c-8adb-0895971bb4c1'
const TIER_IC     = 'https://www.figma.com/api/mcp/asset/db2d2ce9-5858-4e1a-9ee1-a3e1fdcffa1d'
const MOVES_IC    = 'https://www.figma.com/api/mcp/asset/bd2d220d-7f74-48ba-bc42-749c3f45dbd2'
const BENEFITS_IC = 'https://www.figma.com/api/mcp/asset/e7e7714c-2ee5-477f-b189-2364bfbcfadd'
const LOC_IC      = 'https://www.figma.com/api/mcp/asset/924d14fa-b00a-4a9b-8aac-ef50a0311db2'
const ADD_CO_IC   = 'https://www.figma.com/api/mcp/asset/2e29d0ed-a816-424b-a234-01dd0bf34ae1'
const REPORT_IC   = 'https://www.figma.com/api/mcp/asset/5563cecf-e759-421b-b369-ba5ad1634841'
const BRONZE_IC   = 'https://www.figma.com/api/mcp/asset/657a1181-2377-4b0c-8adb-0895971bb4c1'
const SILVER_IC   = 'https://www.figma.com/api/mcp/asset/0c9993e1-6e9a-40dc-bd3e-00fc11bb0587'
const GOLD_IC_T   = 'https://www.figma.com/api/mcp/asset/f3b04958-b695-4f6d-bfc7-5c9beac41dbc'
const PLAT_IC     = 'https://www.figma.com/api/mcp/asset/a1612a2e-6c47-42f3-8b97-0660343e0f5d'

const MEMBERS = [
  { name: 'Acme Moving Netherlands', city: 'Amsterdam, Netherlands', moves: 156, points: '24,580', tier: 'Gold',   tColor: '#f59e0b', tBg: 'rgba(245,158,11,0.1)',   tBorder: 'rgba(245,158,11,0.2)',   last: '20 Feb 2026', status: 'Active' },
  { name: 'Acme Moving Germany',     city: 'Berlin, Germany',        moves: 98,  points: '18,200', tier: 'Silver', tColor: '#1a1d29', tBg: '#f1f5f9',                 tBorder: '#e2e8f0',               last: '18 Feb 2026', status: 'Active' },
  { name: 'Acme Moving France',      city: 'Paris, France',          moves: 124, points: '15,670', tier: 'Gold',   tColor: '#f59e0b', tBg: 'rgba(245,158,11,0.1)',   tBorder: 'rgba(245,158,11,0.2)',   last: '15 Feb 2026', status: 'Active' },
  { name: 'Acme Moving UK',          city: 'London, United Kingdom', moves: 89,  points: '12,400', tier: 'Silver', tColor: '#1a1d29', tBg: '#f1f5f9',                 tBorder: '#e2e8f0',               last: '10 Feb 2026', status: 'Active' },
  { name: 'Acme Moving Spain',       city: 'Madrid, Spain',          moves: 67,  points: '9,800',  tier: 'Silver', tColor: '#1a1d29', tBg: '#f1f5f9',                 tBorder: '#e2e8f0',               last: '08 Feb 2026', status: 'Active' },
  { name: 'Acme Moving Italy',       city: 'Rome, Italy',            moves: 45,  points: '6,800',  tier: 'Bronze', tColor: '#cd7f32', tBg: 'rgba(205,127,50,0.1)',   tBorder: 'rgba(205,127,50,0.2)',   last: '05 Feb 2026', status: 'Active' },
]

const TIER_DIST = [
  { name: 'Bronze',   count: 1, pct: 17, color: '#cd7f32', bg: 'rgba(205,127,50,0.1)',   border: 'rgba(205,127,50,0.2)',   icon: BRONZE_IC },
  { name: 'Silver',   count: 3, pct: 50, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)',  icon: SILVER_IC },
  { name: 'Gold',     count: 2, pct: 33, color: '#d97706', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.2)',   icon: GOLD_IC_T },
  { name: 'Platinum', count: 0, pct: 0,  color: '#1e293b', bg: 'rgba(30,41,59,0.1)',    border: 'rgba(30,41,59,0.2)',    icon: PLAT_IC },
]

export default function GroupCodesPage() {
  return (
    <div>
      <PageHeader title="Group Code Management" subtitle="Manage your international network and track consolidated group performance" />

      {/* Group code hero */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIconWrap}>
            <img src={NETWORK_IC} alt="" className={styles.heroIcon} />
          </div>
          <div>
            <p className={styles.heroLabel}>Group Code</p>
            <p className={styles.heroCode}>VGM-GLOBAL-01</p>
            <p className={styles.heroName}>Global Moving Alliance</p>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <p className={styles.heroStatLabel}>Total Members</p>
            <p className={styles.heroStatValue}>6</p>
          </div>
          <div className={styles.heroDivider} />
          <div className={styles.heroStat}>
            <p className={styles.heroStatLabel}>Combined Points</p>
            <p className={styles.heroStatValueGreen}>87,450</p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        {[
          { icon: MEMBERS_IC, bg: 'rgba(0,102,204,0.1)',  label: 'Member Companies', value: '6',      sub: 'Across 6 countries',  vc: '#1a1d29' },
          { icon: POINTS_IC,  bg: 'rgba(16,185,129,0.1)', label: 'Combined Points',  value: '87,450', sub: 'Rolling 12 months',   vc: '#10b981' },
          { icon: TIER_IC,    bg: 'rgba(245,158,11,0.1)', label: 'Average Tier',     value: 'Gold',   sub: 'Group average',       vc: '#1a1d29' },
          { icon: MOVES_IC,   bg: '#e2e8f0',              label: 'Total Moves',      value: '579',    sub: 'This year',           vc: '#1a1d29' },
        ].map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: k.bg }}>
              <img src={k.icon} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </div>
            <p className={styles.kpiLabel}>{k.label}</p>
            <p className={styles.kpiValue} style={{ color: k.vc }}>{k.value}</p>
            <p className={styles.kpiSub}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Benefits note */}
      <div className={styles.benefitsCard}>
        <div className={styles.benefitsIconWrap}>
          <img src={BENEFITS_IC} alt="" style={{ width: 24, height: 24 }} />
        </div>
        <div>
          <h3 className={styles.benefitsTitle}>Group Code Benefits</h3>
          <ul className={styles.benefitsList}>
            <li>All member companies share the same group code for consolidated tracking</li>
            <li>Each member earns and redeems points individually</li>
            <li>Group-level reporting available for network performance analysis</li>
            <li>Points are non-transferable between members unless explicitly authorized</li>
          </ul>
        </div>
      </div>

      {/* Member companies table */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Member Companies</h3>
            <p className={styles.sectionSub}>All companies linked to group code VGM-GLOBAL-01</p>
          </div>
          <div className={styles.btnRow}>
            <button className={styles.outlineBtn}>
              <img src={EXPORT_IC} alt="" style={{ width: 16, height: 16 }} />
              Export Group Report
            </button>
            <button className={styles.primaryBtn}>
              <img src={ADD_IC} alt="" style={{ width: 16, height: 16 }} />
              Request Add Company
            </button>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Total Moves</th>
              <th>Points</th>
              <th>Tier</th>
              <th>Last Move</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map(m => (
              <tr key={m.name}>
                <td>
                  <p className={styles.memberName}>{m.name}</p>
                  <div className={styles.memberCity}>
                    <img src={LOC_IC} alt="" style={{ width: 12, height: 12 }} />
                    <span>{m.city}</span>
                  </div>
                </td>
                <td>{m.moves}</td>
                <td><strong style={{ color: '#171630' }}>{m.points}</strong></td>
                <td>
                  <span className={styles.tierBadge} style={{ background: m.tBg, border: `1.275px solid ${m.tBorder}`, color: m.tColor }}>
                    {m.tier}
                  </span>
                </td>
                <td className={styles.muted}>{m.last}</td>
                <td>{statusBadge(m.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Tier distribution */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 20 }}>Group Tier Distribution</h3>
        <div className={styles.tierDistGrid}>
          {TIER_DIST.map(t => (
            <div key={t.name} className={styles.tierDistCard} style={{ background: t.bg, border: `1.275px solid ${t.border}` }}>
              <div className={styles.tierDistHeader}>
                <span style={{ color: t.color, fontWeight: 600, fontSize: 14 }}>{t.name}</span>
                <img src={t.icon} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              </div>
              <div className={styles.tierDistCount}>
                <span className={styles.tierDistNum}>{t.count}</span>
                <span className={styles.tierDistLabel}>members</span>
              </div>
              <div className={styles.tierDistBar}>
                <div className={styles.tierDistFill} style={{ width: `${t.pct}%`, background: t.color }} />
              </div>
              <p className={styles.tierDistPct}>{t.pct}% of group</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action cards */}
      <div className={styles.actionRow}>
        <div className={styles.actionCard}>
          <div className={styles.actionIconWrap} style={{ background: 'rgba(0,102,204,0.1)', borderRadius: 12 }}>
            <img src={ADD_CO_IC} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h4 className={styles.actionTitle}>Add New Member Company</h4>
            <p className={styles.actionDesc}>Request to add a new company to your group code network</p>
            <button className={styles.outlineBtn} style={{ marginTop: 12 }}>Request Addition</button>
          </div>
        </div>
        <div className={styles.actionCard}>
          <div className={styles.actionIconWrap} style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 12 }}>
            <img src={REPORT_IC} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h4 className={styles.actionTitle}>Group Performance Report</h4>
            <p className={styles.actionDesc}>Download consolidated performance metrics for all members</p>
            <button className={styles.outlineBtn} style={{ marginTop: 12 }}>Download Report</button>
          </div>
        </div>
      </div>
    </div>
  )
}
