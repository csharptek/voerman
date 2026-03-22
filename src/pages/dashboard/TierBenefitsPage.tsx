import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui'
import styles from './TierBenefits.module.css'

// Assets from Figma node 9:7736
const TROPHY_IC   = 'https://www.figma.com/api/mcp/asset/bfaed72b-39ba-4988-bbcc-817308abce60'
const LOGO        = 'https://www.figma.com/api/mcp/asset/c0a2f3d7-fbf7-477a-8909-952f0d959cb4'
const PROGRESS_BG = 'https://www.figma.com/api/mcp/asset/bfaed72b-39ba-4988-bbcc-817308abce60' // progress bar image
const BRONZE_IC   = 'https://www.figma.com/api/mcp/asset/d074a21b-7837-42ff-88d3-752590702134'
const SILVER_IC   = 'https://www.figma.com/api/mcp/asset/a4134a6a-0b0c-4edf-a02e-b88d0ad5d83e'
const GOLD_IC     = 'https://www.figma.com/api/mcp/asset/7a3ddd3b-9ffa-4841-b238-0f6af51160f3'
const PLAT_IC     = 'https://www.figma.com/api/mcp/asset/81113ffc-481a-433e-a3a1-bbc98acc6acf'
const CHECK_IC    = 'https://www.figma.com/api/mcp/asset/ee6f0095-8c3c-40d8-9798-c9bcb15ceb76'  // green check
const LOCK_IC     = 'https://www.figma.com/api/mcp/asset/9afcf5b7-573b-49bb-8013-a486e965b743'
const PERKS_IC    = 'https://www.figma.com/api/mcp/asset/f2d10c47-6049-4434-8631-5724aa903bc5'
const REWARD_IC   = 'https://www.figma.com/api/mcp/asset/8299fd4b-5176-4f57-bdc6-92d73798f7db'
const EARN_IC     = 'https://www.figma.com/api/mcp/asset/9a91d803-59cc-4fb6-be0a-686ec916d7b9'
const PROGRESS_IC = 'https://www.figma.com/api/mcp/asset/db690066-a683-40b8-b179-d0fdc141929f'
const UNLOCK_IC   = 'https://www.figma.com/api/mcp/asset/29c37210-f543-46dc-9a70-6b6b579594bc'

interface TierData {
  name: string; range: string; icon: string; color: string; bg: string; border: string;
  redemptionCap: string; pointExpiry: string; isCurrent?: boolean; isLocked?: boolean;
  perks: string[]; rewards: { name: string; available: boolean }[];
}

const TIERS: TierData[] = [
  {
    name: 'Bronze', range: '0 - 5,000 points', icon: BRONZE_IC, color: '#cd7f32',
    bg: 'rgba(205,127,50,0.05)', border: '#e2e8f0',
    redemptionCap: 'Up to 20% per booking', pointExpiry: '12 months',
    perks: ['Access to basic rewards catalog', 'Standard point earning rate: €10 = 1 point', 'Quarterly account statements', 'Email support within 48 hours'],
    rewards: [{ name: '€500 Service Credit', available: true }, { name: '5 Days Free Storage', available: true }, { name: '€1,000 Service Credit', available: false }, { name: 'Priority Move Service', available: false }],
  },
  {
    name: 'Silver', range: '5,000 - 15,000 points', icon: SILVER_IC, color: '#94a3b8',
    bg: 'rgba(148,163,184,0.05)', border: '#e2e8f0',
    redemptionCap: 'Up to 25% per booking', pointExpiry: '15 months',
    perks: ['Access to extended rewards catalog', 'Enhanced point earning: €10 = 1.1 points', 'Monthly account statements', 'Priority email support within 24 hours', 'Quarterly business reviews', 'Access to seasonal promotions'],
    rewards: [{ name: '€500 Service Credit', available: true }, { name: '5 Days Free Storage', available: true }, { name: '€1,000 Service Credit', available: true }, { name: 'Priority Move Service', available: true }],
  },
  {
    name: 'Gold', range: '15,000 - 25,000 points', icon: GOLD_IC, color: '#d97706',
    bg: 'rgba(251,191,36,0.05)', border: '#fbbf24', isCurrent: true,
    redemptionCap: 'Up to 30% per booking', pointExpiry: '18 months',
    perks: ['Access to premium rewards catalog', 'Premium point earning: €10 = 1.25 points', 'Real-time points tracking', 'Dedicated account manager', '24/7 priority support', 'Exclusive partner events', 'Early access to new services', 'Flexible redemption options'],
    rewards: [{ name: '€500 Service Credit', available: true }, { name: '5 Days Free Storage', available: true }, { name: '€1,000 Service Credit', available: true }, { name: 'Priority Move Service', available: true }],
  },
  {
    name: 'Platinum', range: '25,000+ points', icon: PLAT_IC, color: '#1a1d29',
    bg: 'rgba(30,41,59,0.03)', border: '#e2e8f0', isLocked: true,
    redemptionCap: 'Up to 35% per booking', pointExpiry: '24 months',
    perks: ['Access to all rewards including exclusive offers', 'Elite point earning: €10 = 1.5 points', 'Real-time dashboard & analytics', 'Senior relationship manager', 'White-glove 24/7 support', 'VIP partner events & networking', 'Beta access to innovations', 'Lifetime achievement recognition', 'Customized reward packages', 'Annual partnership review with executives'],
    rewards: [{ name: '€500 Service Credit', available: false }, { name: '5 Days Free Storage', available: false }, { name: '€1,000 Service Credit', available: false }, { name: 'Priority Move Service', available: false }],
  },
]

const MILESTONES = [
  { label: 'Bronze', range: '0 - 5,000 pts',      icon: BRONZE_IC, color: '#cd7f32', bgColor: 'rgba(205,127,50,0.1)',  border: '#e2e8f0',  status: 'checkmark',  done: true    },
  { label: 'Silver', range: '5,000 - 15,000 pts',  icon: SILVER_IC, color: '#94a3b8', bgColor: 'rgba(148,163,184,0.1)',border: '#e2e8f0',  status: 'checkmark',  done: true    },
  { label: 'Gold',   range: '15,000 - 25,000 pts', icon: GOLD_IC,   color: '#fbbf24', bgColor: 'rgba(251,191,36,0.2)', border: '#fbbf24',  status: 'current',    done: false   },
  { label: 'Platinum',range: '25,000+ pts',        icon: PLAT_IC,   color: '#64748b', bgColor: '#f1f5f9',              border: '#e2e8f0',  status: 'locked',     done: false   },
]

export default function TierBenefitsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Tier Benefits" subtitle="Unlock exclusive rewards and benefits as you progress through our loyalty tiers" />

      {/* Current tier hero */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIconWrap}>
            <img src={GOLD_IC} alt="" className={styles.heroIcon} />
          </div>
          <div>
            <p className={styles.heroLabel}>Your Current Tier</p>
            <p className={styles.heroTierName}>gold</p>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div>
            <p className={styles.heroStatLabel}>Current Points</p>
            <p className={styles.heroStatValue}>24,580</p>
          </div>
          <div className={styles.heroDivider} />
          <div>
            <p className={styles.heroStatLabel}>Points to Platinum</p>
            <p className={styles.heroStatValue}>420</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressCard}>
        <h3 className={styles.cardTitle}>Your Progress</h3>
        {/* Progress bar */}
        <div className={styles.progressBg}>
          <div className={styles.progressFill} style={{ width: '98.3%' }} />
        </div>
        {/* Milestones */}
        <div className={styles.milestones}>
          {MILESTONES.map(m => (
            <div key={m.label} className={styles.milestone}>
              <div className={styles.milestoneIconWrap} style={{ background: m.bgColor, borderColor: m.border }}>
                <img src={m.icon} alt={m.label} className={styles.milestoneIcon} />
              </div>
              <p className={styles.milestoneName} style={{ color: m.status === 'current' ? '#1a1d29' : '#64748b' }}>{m.label}</p>
              <p className={styles.milestoneRange}>{m.range}</p>
              {m.status === 'checkmark' && <img src={CHECK_IC} alt="✓" className={styles.milestoneStatus} />}
              {m.status === 'current' && <span className={styles.currentBadge}>Current</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tier detail cards — 2×2 grid */}
      <div className={styles.tierGrid}>
        {TIERS.map(t => (
          <div key={t.name} className={styles.tierCard} style={{ background: t.bg, borderColor: t.border, borderWidth: t.isCurrent ? 2 : 1.275 }}>
            {/* Header */}
            <div className={styles.tierCardHeader}>
              <div className={styles.tierCardLeft}>
                <div className={styles.tierIconBox} style={{ background: `rgba(0,0,0,0.06)`, border: `1.275px solid rgba(0,0,0,0.1)` }}>
                  <img src={t.icon} alt={t.name} className={styles.tierIcon} />
                </div>
                <div>
                  <p className={styles.tierCardName}>{t.name}</p>
                  <p className={styles.tierCardRange}>{t.range}</p>
                </div>
              </div>
              {t.isCurrent && <span className={styles.currentTag}>Current Tier</span>}
              {t.isLocked && <img src={LOCK_IC} alt="🔒" style={{ width: 20, height: 20 }} />}
            </div>

            {/* Meta row */}
            <div className={styles.tierMeta}>
              <div>
                <p className={styles.metaLabel}>Redemption Cap</p>
                <p className={styles.metaValue}>{t.redemptionCap}</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Point Expiry</p>
                <p className={styles.metaValue}>{t.pointExpiry}</p>
              </div>
            </div>

            {/* Tier Perks */}
            <div className={styles.tierSection}>
              <div className={styles.tierSectionHead}>
                <img src={PERKS_IC} alt="" style={{ width: 16, height: 16 }} />
                <span>Tier Perks</span>
              </div>
              <ul className={styles.perksList}>
                {t.perks.map((p, i) => (
                  <li key={i} className={styles.perkItem}>
                    <img src={t.isLocked ? LOCK_IC : CHECK_IC} alt="" style={{ width: 16, height: 16, opacity: t.isLocked ? 0.4 : 1 }} />
                    <span style={{ color: t.isLocked ? '#64748b' : '#1a1d29' }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reward Access */}
            <div className={styles.tierSection}>
              <div className={styles.tierSectionHead}>
                <img src={REWARD_IC} alt="" style={{ width: 16, height: 16 }} />
                <span>Reward Access</span>
              </div>
              <ul className={styles.rewardList}>
                {t.rewards.map((r, i) => (
                  <li key={i} className={styles.rewardItem}>
                    <span style={{ color: r.available ? '#1a1d29' : '#64748b' }}>{r.name}</span>
                    {r.available
                      ? <img src={CHECK_IC} alt="✓" style={{ width: 16, height: 16 }} />
                      : <span className={styles.higherTier}>Higher tier</span>
                    }
                  </li>
                ))}
              </ul>
            </div>

            {t.isCurrent && (
              <button className={styles.earnMoreBtn} onClick={() => navigate('/moves')}>
                View Ways to Earn More
              </button>
            )}
            {t.isLocked && (
              <div className={styles.lockedNote}>Earn 25,000+ points to unlock this tier</div>
            )}
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className={styles.howCard}>
        <h3 className={styles.cardTitle}>How Tier Benefits Work</h3>
        <div className={styles.howGrid}>
          {[
            { icon: EARN_IC,     color: 'rgba(0,102,204,0.1)',  title: 'Earn Points',    desc: 'Complete international moves to earn Green Miles points based on eligible revenue' },
            { icon: PROGRESS_IC, color: 'rgba(16,185,129,0.1)', title: 'Progress Tiers', desc: 'Your tier is calculated based on points earned in the last 12 months' },
            { icon: UNLOCK_IC,   color: 'rgba(245,158,11,0.1)', title: 'Unlock Rewards', desc: 'Higher tiers unlock exclusive rewards and enhanced benefits' },
          ].map(h => (
            <div key={h.title} className={styles.howItem}>
              <div className={styles.howIconWrap} style={{ background: h.color }}>
                <img src={h.icon} alt="" style={{ width: 24, height: 24 }} />
              </div>
              <h4 className={styles.howTitle}>{h.title}</h4>
              <p className={styles.howDesc}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
