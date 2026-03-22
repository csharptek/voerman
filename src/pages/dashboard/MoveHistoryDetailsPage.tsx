import { useParams, useNavigate } from 'react-router-dom'
import { MOVES } from '../../data/mockData'
import styles from './MoveHistoryDetails.module.css'
import { statusBadge } from '../../components/ui'

// Assets from Figma node 9:5890
const LOGO        = 'https://www.figma.com/api/mcp/asset/3aa84697-2cbe-49bb-8de5-68a05b0e409c'
const BACK_ICON   = 'https://www.figma.com/api/mcp/asset/a8ab2006-02d3-4ead-b73b-08537806bb44'
const CREDITED_IC = 'https://www.figma.com/api/mcp/asset/9c162137-3be0-4b94-9f8c-454e5008ec13'
const MOVE_ICON   = 'https://www.figma.com/api/mcp/asset/150b59ed-bfc8-42bf-856a-64601f42077d'
const ORIGIN_IC   = 'https://www.figma.com/api/mcp/asset/777ec8a1-2d05-44ef-b895-008f5340a64a'
const DEST_IC     = 'https://www.figma.com/api/mcp/asset/bd326f85-e6e6-4141-a71f-6b172b94d1a2'
const REVENUE_IC  = 'https://www.figma.com/api/mcp/asset/507d849f-d6be-407e-8857-e6c4c65cadbd'
const EXCL_IC     = 'https://www.figma.com/api/mcp/asset/0bf7fb52-3235-4011-96ba-f7f3294cdded'
const ELIGIBLE_IC = 'https://www.figma.com/api/mcp/asset/8c8a20ab-c031-4050-adae-e3b6ed4367d7'
const CALC_IC     = 'https://www.figma.com/api/mcp/asset/f01971bf-f38a-4109-8709-6fba39285ec8'
const INV_IC      = 'https://www.figma.com/api/mcp/asset/b291e043-5d2e-47f4-8933-289d3cae3750'
const DATE_IC     = 'https://www.figma.com/api/mcp/asset/6cae50ab-c899-4821-88b8-6a2d99795ab2'
const PAID_IC     = 'https://www.figma.com/api/mcp/asset/682b6518-f310-4892-8a5b-7c354a9f6256'
const CHECK_IC    = 'https://www.figma.com/api/mcp/asset/3eb011e1-82ed-45de-8f26-93e7fadaeff1'
const CLOCK_IC    = 'https://www.figma.com/api/mcp/asset/3e1dd11f-88a9-4028-bc83-26635b261057'
const EXPIRY_IC   = 'https://www.figma.com/api/mcp/asset/0bf7fb52-3235-4011-96ba-f7f3294cdded'

export default function MoveHistoryDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const move = MOVES.find(m => m.id === id) ?? MOVES[0]

  const totalRevenue = move.revenue
  const excluded = '—'
  const eligible = move.revenue

  const timeline = [
    { label: 'Booking Confirmed',  desc: 'Move booking created and confirmed',             date: move.date + ' at 14:32', done: true  },
    { label: 'Invoice Generated',  desc: `Invoice INV-2026-8472 generated`,                date: move.date + ' at 09:15', done: true  },
    { label: 'Invoice Paid',       desc: 'Payment received and confirmed',                  date: move.date + ' at 11:47', done: move.invoice === 'Paid' },
    { label: 'Points Confirmed',   desc: `${move.points.toLocaleString()} Green Miles points credited to account`, date: move.date + ' at 12:01', done: move.status === 'Credited' },
  ]

  return (
    <div className={styles.page}>
      {/* Back button */}
      <button className={styles.backBtn} onClick={() => navigate('/moves')}>
        <img src={BACK_ICON} alt="" className={styles.backIcon} />
        Back to Move History
      </button>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Move Detail</h1>
          <p className={styles.subtitle}>Complete transparency of calculation and status</p>
        </div>
        <div className={styles.badges}>
          {statusBadge(move.status)}
          {statusBadge(move.invoice === 'Paid' ? 'Invoice paid' : 'Invoice pending')}
        </div>
      </div>

      {/* Move reference hero card */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIconWrap}>
            <img src={MOVE_ICON} alt="" className={styles.heroIcon} />
          </div>
          <div>
            <p className={styles.heroLabel}>Move Reference</p>
            <p className={styles.heroRef}>{move.ref}</p>
            <p className={styles.heroSub}>VGM ID: {move.id}</p>
          </div>
        </div>
        <div className={styles.heroRight}>
          <p className={styles.heroPointsLabel}>Points Earned</p>
          <p className={styles.heroPoints}>+{move.points.toLocaleString()}</p>
          <span className={styles.tierPill}>Gold Tier</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className={styles.twoCol}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Route Information */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Route Information</h3>
            <div className={styles.routeItem}>
              <div className={styles.routeIconWrap} style={{ background: 'rgba(0,102,204,0.1)' }}>
                <img src={ORIGIN_IC} alt="" className={styles.routeIcon} />
              </div>
              <div>
                <p className={styles.routeFieldLabel}>Origin</p>
                <p className={styles.routeValue}>{move.from.split(',')[0]}, {move.from.split(',')[1]?.trim()}</p>
                <p className={styles.routeAddr}>Prinsengracht 263, 1016 GV Amsterdam</p>
              </div>
            </div>
            <div className={styles.routeDivider} />
            <div className={styles.routeItem}>
              <div className={styles.routeIconWrap} style={{ background: 'rgba(16,185,129,0.1)' }}>
                <img src={DEST_IC} alt="" className={styles.routeIcon} />
              </div>
              <div>
                <p className={styles.routeFieldLabel}>Destination</p>
                <p className={styles.routeValue}>{move.to}</p>
                <p className={styles.routeAddr}>Marina Bay Sands, 10 Bayfront Avenue</p>
              </div>
            </div>
            <div className={styles.routeMeta}>
              <div><p className={styles.metaLabel}>Volume</p><p className={styles.metaValue}>{move.volume}</p></div>
              <div><p className={styles.metaLabel}>Weight</p><p className={styles.metaValue}>3,850 kg</p></div>
              <div><p className={styles.metaLabel}>Container</p><p className={styles.metaValue}>20ft Standard</p></div>
              <div><p className={styles.metaLabel}>Service Type</p><p className={styles.metaValue}>Full International Move</p></div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Financial Breakdown</h3>
            <div className={styles.financeRow} style={{ background: '#f1f5f9', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
              <div className={styles.financeLabel}>
                <img src={REVENUE_IC} alt="" className={styles.finIcon} />
                <div><p className={styles.finName}>Total Revenue</p><p className={styles.finSub}>Invoice amount</p></div>
              </div>
              <p className={styles.finValue}>€12,500</p>
            </div>
            <div className={styles.financeRow} style={{ background: 'rgba(245,158,11,0.05)', border: '1.275px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
              <div className={styles.financeLabel}>
                <img src={EXCL_IC} alt="" className={styles.finIcon} />
                <div><p className={styles.finName}>Excluded Amount</p><p className={styles.finSub}>Storage fees excluded per program rules</p></div>
              </div>
              <p className={styles.finValueAmber}>-€700</p>
            </div>
            <div className={styles.financeRow} style={{ background: 'rgba(0,102,204,0.05)', border: '1.275px solid rgba(0,102,204,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <div className={styles.financeLabel}>
                <img src={ELIGIBLE_IC} alt="" className={styles.finIcon} />
                <div><p className={styles.finName}>Eligible Revenue</p><p className={styles.finSub}>Qualifies for Green Miles</p></div>
              </div>
              <p className={styles.finValueNavy}>{move.revenue}</p>
            </div>
            <div className={styles.calcBox}>
              <div className={styles.calcHeader}>
                <div>
                  <p className={styles.calcTitle}>Points Calculation</p>
                  <p className={styles.calcSub}>Rate: €10 = 1 point</p>
                </div>
                <img src={CALC_IC} alt="" className={styles.calcIcon} />
              </div>
              <div className={styles.calcResult}>
                <span className={styles.calcFormula}>{move.revenue} ÷ 10 =</span>
                <span className={styles.calcPoints}>{move.points.toLocaleString()} points</span>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Invoice Information</h3>
            <div className={styles.invoiceGrid}>
              <div className={styles.invoiceCell}>
                <div className={styles.invHeader}><img src={INV_IC} alt="" className={styles.finIcon} /><p className={styles.metaLabel}>Invoice Number</p></div>
                <p className={styles.invoiceCode}>INV-2026-8472</p>
              </div>
              <div className={styles.invoiceCell}>
                <div className={styles.invHeader}><img src={DATE_IC} alt="" className={styles.finIcon} /><p className={styles.metaLabel}>Invoice Date</p></div>
                <p className={styles.metaValue}>21 February 2026</p>
              </div>
              <div className={styles.invoiceCell} style={{ background: 'rgba(16,185,129,0.05)', border: '1.275px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
                <div className={styles.invHeader}><img src={PAID_IC} alt="" className={styles.finIcon} /><p className={styles.metaLabel}>Payment Date</p></div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>24 February 2026</p>
              </div>
              <div className={styles.invoiceCell} style={{ background: 'rgba(16,185,129,0.05)', border: '1.275px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
                <div className={styles.invHeader}><img src={PAID_IC} alt="" className={styles.finIcon} /><p className={styles.metaLabel}>Claims Status</p></div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>No claims filed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Status Timeline */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status Timeline</h3>
            <div className={styles.timeline}>
              {timeline.map((t, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineLeft}>
                    <div className={`${styles.timelineDot} ${t.done ? styles.timelineDotDone : ''}`}>
                      {t.done && <img src={CHECK_IC} alt="" className={styles.checkIcon} />}
                    </div>
                    {i < timeline.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineLabel}>{t.label}</p>
                    <p className={styles.timelineDesc}>{t.desc}</p>
                    <div className={styles.timelineDate}>
                      <img src={CLOCK_IC} alt="" className={styles.clockIcon} />
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Points expiry */}
            <div className={styles.expiryBox}>
              <img src={EXPIRY_IC} alt="" className={styles.finIcon} />
              <div>
                <p className={styles.expiryTitle}>Points Expiry</p>
                <p className={styles.expirySub}>
                  These points will expire on <strong>24 Feb 2027</strong> (12 months from credit date)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
