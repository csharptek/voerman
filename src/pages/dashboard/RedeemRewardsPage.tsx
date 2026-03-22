import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui'
import styles from './RedeemRewards.module.css'

// Assets from Figma node 9:6335
const REDEEM_IC  = 'https://www.figma.com/api/mcp/asset/2c4d5c67-34f8-4c75-ad03-65231ce7ff6d'
const GIFT_IC    = 'https://www.figma.com/api/mcp/asset/d4920cda-4e8b-435c-aa18-2ac78f38eff6'
const LOCK_IC    = 'https://www.figma.com/api/mcp/asset/657a1181-2377-4b0c-8adb-0895971bb4c1'
const GOLD_IC    = 'https://www.figma.com/api/mcp/asset/db2d2ce9-5858-4e1a-9ee1-a3e1fdcffa1d'

// Exact reward data from Figma
const REWARDS = [
  { id: 1, name: '€500 Service Credit',         desc: 'Apply €500 credit towards any future international move service',                                   pts: 5000,  tier: 'Bronze',   tierColor: '#cd7f32', tierBg: 'rgba(205,127,50,0.1)',   tierBorder: 'rgba(205,127,50,0.2)',   canAfford: true  },
  { id: 2, name: '€1,000 Service Credit',        desc: 'Apply €1,000 credit towards any future international move service',                                pts: 9500,  tier: 'Silver',   tierColor: '#94a3b8', tierBg: 'rgba(148,163,184,0.1)', tierBorder: 'rgba(148,163,184,0.2)', canAfford: true  },
  { id: 3, name: '€2,500 Service Credit',        desc: 'Apply €2,500 credit towards any future international move service',                                pts: 22000, tier: 'Gold',     tierColor: '#fbbf24', tierBg: 'rgba(251,191,36,0.1)',   tierBorder: 'rgba(251,191,36,0.2)',   canAfford: true  },
  { id: 4, name: '5 Days Free Storage',          desc: 'Complimentary 5-day storage at any Voerman facility worldwide',                                    pts: 2000,  tier: 'Bronze',   tierColor: '#cd7f32', tierBg: 'rgba(205,127,50,0.1)',   tierBorder: 'rgba(205,127,50,0.2)',   canAfford: true  },
  { id: 5, name: 'Free Origin Services',         desc: 'Complimentary packing and loading services up to €5,000 value',                                   pts: 10000, tier: 'Gold',     tierColor: '#fbbf24', tierBg: 'rgba(251,191,36,0.1)',   tierBorder: 'rgba(251,191,36,0.2)',   canAfford: true  },
  { id: 6, name: 'Priority Move Service',        desc: 'Guaranteed 48-hour pickup and priority loading on next available vessel',                          pts: 8000,  tier: 'Silver',   tierColor: '#94a3b8', tierBg: 'rgba(148,163,184,0.1)', tierBorder: 'rgba(148,163,184,0.2)', canAfford: true  },
  { id: 7, name: 'Premium Insurance Upgrade',    desc: 'Upgrade to full-value insurance coverage at no additional cost',                                   pts: 3500,  tier: 'Silver',   tierColor: '#94a3b8', tierBg: 'rgba(148,163,184,0.1)', tierBorder: 'rgba(148,163,184,0.2)', canAfford: true  },
  { id: 8, name: 'Platinum Concierge Package',   desc: 'Full-service concierge including visa assistance, housing search, and settling-in services',       pts: 25000, tier: 'Platinum', tierColor: '#1e293b', tierBg: 'rgba(30,41,59,0.1)',    tierBorder: 'rgba(30,41,59,0.2)',    canAfford: false },
]

const AVAILABLE_PTS = 24580
const TABS = ['All Rewards', 'Service Credits', 'Premium Services', 'Insurance', 'Premium Packages']

export default function RedeemRewardsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selected, setSelected] = useState<typeof REWARDS[0] | null>(null)
  const navigate = useNavigate()

  const handleRedeem = (r: typeof REWARDS[0]) => {
    if (!r.canAfford) return
    setSelected(r)
  }

  const handleConfirm = () => {
    navigate('/redeem/confirm', { state: { reward: selected } })
  }

  return (
    <div style={{ paddingBottom: selected ? 90 : 0 }}>
      <PageHeader title="Redeem Rewards" subtitle="Browse our exclusive rewards catalog and redeem your Green Miles points" />

      {/* Points summary card */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryIconWrap}>
            <img src={GIFT_IC} alt="" className={styles.summaryIcon} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Available Points</p>
            <p className={styles.summaryValue}>{AVAILABLE_PTS.toLocaleString()}</p>
          </div>
        </div>
        <div className={styles.summaryRight}>
          <p className={styles.summaryLabel}>Current Tier</p>
          <div className={styles.goldPill}>
            <img src={GOLD_IC} alt="" className={styles.goldPillIcon} />
            Gold Tier
          </div>
        </div>
      </div>

      {/* Tab filters */}
      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className={styles.grid}>
        {REWARDS.map(r => (
          <div
            key={r.id}
            className={`${styles.rewardCard} ${selected?.id === r.id ? styles.rewardCardSelected : ''} ${!r.canAfford ? styles.rewardCardLocked : ''}`}
          >
            {/* Icon + tier badge row */}
            <div className={styles.rewardHeader}>
              <div className={styles.rewardIconBox} style={{ background: r.tierBg, border: `1.275px solid ${r.tierBorder}` }}>
                <img src={GIFT_IC} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              </div>
              <span className={styles.tierBadge} style={{ background: r.tierBg, border: `1.275px solid ${r.tierBorder}`, color: r.tierColor }}>
                {r.tier}
              </span>
            </div>

            <h3 className={styles.rewardName}>{r.name}</h3>
            <p className={styles.rewardDesc}>{r.desc}</p>

            <div className={styles.rewardFooter}>
              <div>
                <p className={styles.rewardPtsLabel}>Points Required</p>
                <p className={styles.rewardPtsValue}>{r.pts.toLocaleString()}</p>
              </div>
              {r.canAfford ? (
                <img src={REDEEM_IC} alt="✓" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#ef4444' }}>Need {(r.pts - AVAILABLE_PTS).toLocaleString()} more</span>
                  <img src={LOCK_IC} alt="🔒" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                </div>
              )}
            </div>

            {r.canAfford ? (
              <button className={styles.redeemBtn} onClick={() => handleRedeem(r)}>
                <img src={GIFT_IC} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                Redeem Now
              </button>
            ) : (
              <button className={styles.redeemBtnLocked} disabled>
                <img src={LOCK_IC} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                Tier Locked
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Confirm bar */}
      {selected && (
        <div className={styles.confirmBar}>
          <div className={styles.confirmInfo}>
            <div className={styles.confirmIconBox} style={{ background: selected.tierBg }}>
              <img src={GIFT_IC} alt="" style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p className={styles.confirmName}>{selected.name}</p>
              <p className={styles.confirmPts}>{selected.pts.toLocaleString()} points required</p>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <button className={styles.cancelBtn} onClick={() => setSelected(null)}>Cancel</button>
            <button className={styles.confirmBtn} onClick={handleConfirm}>Confirm Redemption →</button>
          </div>
        </div>
      )}
    </div>
  )
}
