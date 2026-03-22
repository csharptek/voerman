import { useState } from 'react'
import styles from './AdminPanel.module.css'

// Assets from Figma node 9:10617
const MOVE_IC   = 'https://www.figma.com/api/mcp/asset/e6a15481-03e8-4c0e-8fca-adcccaced26f'
const FILE_IC   = 'https://www.figma.com/api/mcp/asset/a5be46ed-c412-4896-a354-98c524c50d3c'
const EUR_IC    = 'https://www.figma.com/api/mcp/asset/dcca5815-529b-4814-9514-312853a6cdae'
const CALC_IC   = 'https://www.figma.com/api/mcp/asset/c3248e5a-6869-4b17-bc05-be3cd22a6d57'
const WARN_IC   = 'https://www.figma.com/api/mcp/asset/5310415b-c8ec-4055-9ecc-827f1aaf3c35'
const SUBMIT_IC = 'https://www.figma.com/api/mcp/asset/e7dc8608-0c57-4c7b-a38f-61e909659b69'
const ADD_BK_IC = 'https://www.figma.com/api/mcp/asset/f0ab62e6-a615-4901-a987-e8b426efcbf7'
const MANAGE_IC = 'https://www.figma.com/api/mcp/asset/02042922-4b38-4eda-b372-3eda20170428'

type AdminTab = 'booking' | 'manage'

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('booking')

  const [form, setForm] = useState({
    vendorCode: 'VGM-AMS-001',
    moveRef: 'VM-NL-2026-8472',
    totalRevenue: '12500',
    excludedAmount: '700',
    exclusionReason: '',
    invoicePaid: false,
    claimsFiled: false,
  })

  const eligible = Math.max(0, Number(form.totalRevenue) - Number(form.excludedAmount))
  const estimatedPts = Math.floor(eligible / 10)
  const isReady = form.vendorCode && form.moveRef && form.totalRevenue && form.invoicePaid && !form.claimsFiled

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className={styles.page}>
      {/* Admin sidebar (different layout from main portal) */}
      <div className={styles.adminSidebar}>
        <div className={styles.adminSidebarLogo}>
          <div className={styles.adminLogoIcon}>
            <img src={ADD_BK_IC} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <p className={styles.adminLogoTitle}>Voerman</p>
            <p className={styles.adminLogoSub}>Green Miles</p>
          </div>
        </div>

        <div className={styles.adminNavSection}>
          <p className={styles.adminNavLabel}>ADMIN PANEL</p>
          <button
            className={`${styles.adminNavItem} ${activeTab === 'booking' ? styles.adminNavItemActive : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            <img src={ADD_BK_IC} alt="" style={{ width: 20, height: 20 }} />
            Add Booking
          </button>
          <button
            className={`${styles.adminNavItem} ${activeTab === 'manage' ? styles.adminNavItemActive : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <img src={MANAGE_IC} alt="" style={{ width: 20, height: 20 }} />
            Manage Points
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.adminMain}>
        {activeTab === 'booking' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Add Booking</h1>
              <p className={styles.pageSub}>Register a new move and calculate Green Miles points for vendor partners</p>
            </div>

            {/* Vendor Information */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Vendor Information</h3>
              <div className={styles.formGrid2}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Vendor Green Miles Code</label>
                  <div className={styles.fieldWrap}>
                    <img src={MOVE_IC} alt="" className={styles.fieldIcon} />
                    <input className={styles.fieldInput} value={form.vendorCode} onChange={e => set('vendorCode', e.target.value)} placeholder="VGM-AMS-001" />
                  </div>
                  <p className={styles.fieldHint}>Enter the vendor's unique Green Miles code</p>
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Move Reference Number</label>
                  <div className={styles.fieldWrap}>
                    <img src={FILE_IC} alt="" className={styles.fieldIcon} />
                    <input className={styles.fieldInput} value={form.moveRef} onChange={e => set('moveRef', e.target.value)} placeholder="VM-NL-2026-8472" />
                  </div>
                  <p className={styles.fieldHint}>Internal move reference from CRM</p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Financial Details</h3>
              <div className={styles.formGrid2} style={{ marginBottom: 20 }}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Total Invoice Revenue (€)</label>
                  <div className={styles.fieldWrap}>
                    <img src={EUR_IC} alt="" className={styles.fieldIcon} />
                    <input className={styles.fieldInput} type="number" value={form.totalRevenue} onChange={e => set('totalRevenue', e.target.value)} />
                  </div>
                  <p className={styles.fieldHint}>Total invoice amount</p>
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Excluded Amount (€)</label>
                  <div className={styles.fieldWrap}>
                    <img src={EUR_IC} alt="" className={styles.fieldIcon} />
                    <input className={styles.fieldInput} type="number" value={form.excludedAmount} onChange={e => set('excludedAmount', e.target.value)} />
                  </div>
                  <p className={styles.fieldHint}>Storage, third-party costs, etc.</p>
                </div>
              </div>

              <div className={styles.formField} style={{ marginBottom: 20 }}>
                <label className={styles.fieldLabel}>Exclusion Reason</label>
                <input className={styles.fieldInputFull} value={form.exclusionReason} onChange={e => set('exclusionReason', e.target.value)} placeholder="e.g., Storage fees, third-party costs" />
                <p className={styles.fieldHint}>Reason for excluded amount (if applicable)</p>
              </div>

              {/* Eligible revenue calculator */}
              <div className={styles.calcBox}>
                <div className={styles.calcHeader}>
                  <span className={styles.calcLabel}>Eligible Revenue for Points</span>
                  <img src={CALC_IC} alt="" style={{ width: 20, height: 20 }} />
                </div>
                <div className={styles.fieldWrap}>
                  <img src={EUR_IC} alt="" className={styles.fieldIcon} />
                  <input className={styles.fieldInput} value={eligible} readOnly />
                </div>
                <p className={styles.fieldHint}>Calculation: Total Revenue - Excluded Amount = Eligible Revenue</p>
                {eligible > 0 && (
                  <p className={styles.ptsPreview}>→ Estimated points: <strong>{estimatedPts.toLocaleString()} pts</strong> (€10 = 1 point)</p>
                )}
              </div>
            </div>

            {/* Status & Validation */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Status &amp; Validation</h3>
              <div className={styles.toggleList}>
                {[
                  { key: 'invoicePaid',  label: 'Invoice Paid',   desc: 'Has the customer paid the invoice?'            },
                  { key: 'claimsFiled',  label: 'Claims Filed',   desc: 'Were any major claims filed for this move?'    },
                ].map(t => (
                  <div key={t.key} className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleLabel}>{t.label}</p>
                      <p className={styles.toggleDesc}>{t.desc}</p>
                    </div>
                    <button
                      className={`${styles.toggle} ${(form as any)[t.key] ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => set(t.key, !(form as any)[t.key])}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Status note */}
              <div className={styles.statusNote}>
                <img src={WARN_IC} alt="" style={{ width: 20, height: 20 }} />
                <div>
                  <p className={styles.statusNoteTitle}>Points will be marked as pending</p>
                  <p className={styles.statusNoteDesc}>Points will be confirmed once the invoice is paid</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className={styles.formActions}>
                <button className={styles.clearBtn} onClick={() => setForm({ vendorCode:'', moveRef:'', totalRevenue:'', excludedAmount:'0', exclusionReason:'', invoicePaid:false, claimsFiled:false })}>
                  Clear Form
                </button>
                <button className={`${styles.submitBtn} ${!isReady ? styles.submitBtnDisabled : ''}`} disabled={!isReady}>
                  <img src={SUBMIT_IC} alt="" style={{ width: 16, height: 16 }} />
                  Add Booking &amp; Calculate Points
                </button>
              </div>
            </div>

            {/* Guidelines */}
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Booking Entry Guidelines</h4>
              <ul className={styles.guideList}>
                <li>Points are calculated at €10 = 1 point based on eligible revenue only</li>
                <li>Exclude storage fees, third-party costs, and non-Voerman services</li>
                <li>Points are confirmed only after invoice payment and no major claims</li>
                <li>Major claims may result in point reduction or cancellation</li>
                <li>All actions are logged in the system for audit purposes</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'manage' && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h3 className={styles.cardTitle}>Manage Points</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Point management features — approve, adjust, and review pending points across all partner accounts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
