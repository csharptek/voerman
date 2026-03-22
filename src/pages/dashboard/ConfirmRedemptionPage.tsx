import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SectionCard, PageHeader } from '../../components/ui'
import styles from './ConfirmRedemption.module.css'

// Assets from Figma node 9:7275
const SUCCESS_IC = 'https://www.figma.com/api/mcp/asset/4ebadece-f387-41c7-bd2c-ce106e06aa51'
const DOWNLOAD_IC = 'https://www.figma.com/api/mcp/asset/066d2b7d-2f10-439a-aedf-5408cb31d217'
const GIFT_IC     = 'https://www.figma.com/api/mcp/asset/d4920cda-4e8b-435c-aa18-2ac78f38eff6'
const GOLD_IC     = 'https://www.figma.com/api/mcp/asset/db2d2ce9-5858-4e1a-9ee1-a3e1fdcffa1d'
const LOCK_IC     = 'https://www.figma.com/api/mcp/asset/657a1181-2377-4b0c-8adb-0895971bb4c1'

const AVAILABLE_PTS = 24580

export default function ConfirmRedemptionPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const reward    = (state as any)?.reward ?? {
    name: '€500 Service Credit', pts: 5000,
    desc: 'Apply €500 credit towards any future international move service.',
    tier: 'Bronze', tierBg: 'rgba(205,127,50,0.1)', tierBorder: 'rgba(205,127,50,0.2)',
  }
  const remaining = AVAILABLE_PTS - (reward.pts ?? 5000)
  const [confirmed, setConfirmed] = useState(false)

  // ── Success modal overlay ──────────────────────────────────────────
  if (confirmed) {
    return (
      <div className={styles.overlayBg}>
        {/* dimmed rewards behind */}
        <div className={styles.overlayCard}>
          <div className={styles.successIconWrap}>
            <img src={SUCCESS_IC} alt="✓" className={styles.successIcon} />
          </div>
          <h2 className={styles.successTitle}>Redemption Successful!</h2>
          <p className={styles.successBody}>Your reward has been redeemed successfully</p>
          <div className={styles.voucherBox}>
            <p className={styles.voucherLabel}>Voucher Code</p>
            <p className={styles.voucherCode}>VGM-VR3OWU3D</p>
            <p className={styles.voucherNote}>A confirmation email has been sent with your voucher details</p>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.downloadBtn} onClick={() => window.print()}>
              <img src={DOWNLOAD_IC} alt="" style={{ width: 16, height: 16 }} />
              Download PDF
            </button>
            <button className={styles.doneBtn} onClick={() => navigate('/redeem')}>
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Confirmation page ─────────────────────────────────────────────
  return (
    <div>
      <div className={styles.backRow}>
        <button className={styles.backBtn} onClick={() => navigate('/redeem')}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      <PageHeader title="Redeem Rewards" subtitle="Browse our exclusive rewards catalog and redeem your Green Miles points" />

      {/* Same points summary banner */}
      <div className={styles.summaryBanner}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryIcon}><img src={GIFT_IC} alt="" style={{ width: 32, height: 32 }} /></div>
          <div>
            <p className={styles.summaryLabel}>Available Points</p>
            <p className={styles.summaryBig}>{AVAILABLE_PTS.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <p className={styles.summaryLabel}>Current Tier</p>
          <div className={styles.goldPill}><img src={GOLD_IC} alt="" style={{ width: 16, height: 16 }} /> Gold Tier</div>
        </div>
      </div>

      {/* Points breakdown & confirmation */}
      <div className={styles.grid}>
        <SectionCard title="Reward Summary">
          <div className={styles.rewardPreview}>
            <div className={styles.previewIcon} style={{ background: reward.tierBg, border: `1.275px solid ${reward.tierBorder}` }}>
              <img src={GIFT_IC} alt="" style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h3 className={styles.previewName}>{reward.name}</h3>
              <p className={styles.previewDesc}>{reward.desc}</p>
            </div>
          </div>

          <div className={styles.ptsBreakdown}>
            <div className={styles.ptsRow}>
              <span>Your current balance</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{AVAILABLE_PTS.toLocaleString()} pts</span>
            </div>
            <div className={styles.ptsRow}>
              <span>Points to deduct</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>–{(reward.pts ?? 5000).toLocaleString()} pts</span>
            </div>
            <div className={`${styles.ptsRow} ${styles.ptsTotal}`}>
              <span>Remaining after redemption</span>
              <span style={{ fontWeight: 700 }}>{remaining.toLocaleString()} pts</span>
            </div>
          </div>
        </SectionCard>

        <div>
          <SectionCard title="Delivery Information">
            <p className={styles.infoText}>
              After confirmation, your reward will be processed within <strong>2–3 business days</strong>.
              Details will be sent to your registered email address.
            </p>
            <div className={styles.noteBox}>
              <strong>Note:</strong> Redemptions cannot be reversed once confirmed.
            </div>
          </SectionCard>
          <div className={styles.btnRow}>
            <button className={styles.cancelBtn} onClick={() => navigate('/redeem')}>Cancel</button>
            <button className={styles.confirmBtn} onClick={() => setConfirmed(true)}>Confirm &amp; Redeem</button>
          </div>
        </div>
      </div>
    </div>
  )
}
