import { useState } from 'react'
import { PageHeader, SectionCard } from '../../components/ui'
import styles from './Reports.module.css'

// Assets from Figma node 9:8955
const FILE_IC     = 'https://www.figma.com/api/mcp/asset/c5d28efb-934b-4a77-85b2-4871b6ecaa12'
const MOVES_IC    = 'https://www.figma.com/api/mcp/asset/690e5d21-41ff-42ae-b91d-de553f46f9b5'
const POINTS_IC   = 'https://www.figma.com/api/mcp/asset/6d0e0292-912b-4553-9b7b-7a50f4fe69df'
const DOWNLOAD_IC = 'https://www.figma.com/api/mcp/asset/dfeebfd7-8733-4d48-97df-adf66a3957c9'
const CAL_IC      = 'https://www.figma.com/api/mcp/asset/69aa41e6-6218-4263-a5f3-449c5f132f59'
const SIZE_IC     = 'https://www.figma.com/api/mcp/asset/70d01c2f-5f9d-4879-9be6-bb6710b800d7'
const FILTER_IC   = 'https://www.figma.com/api/mcp/asset/e7dc8608-0c57-4c7b-a38f-61e909659b69'
const REQ_IC      = 'https://www.figma.com/api/mcp/asset/fbe217f7-0c39-4f0b-80c0-c2f7fa32a4fd'
const BULK_IC     = 'https://www.figma.com/api/mcp/asset/aa59738a-0011-486d-af50-488faa194274'

interface ReportDef {
  icon: string; iconBg: string; iconBorder: string;
  name: string; desc: string; tag: string; tagColor: string; tagBg: string; tagBorder: string;
  lastDate: string; size: string;
}

const STANDARD: ReportDef[] = [
  {
    icon: FILE_IC, iconBg: 'rgba(0,102,204,0.1)', iconBorder: 'rgba(0,102,204,0.2)',
    name: 'Yearly Statement', desc: 'Comprehensive annual overview of all moves, points earned, redeemed, and tier progression',
    tag: 'Yearly', tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)', tagBorder: 'rgba(245,158,11,0.2)',
    lastDate: '15 Jan 2026', size: '2.4 MB',
  },
  {
    icon: POINTS_IC, iconBg: 'rgba(0,102,204,0.1)', iconBorder: 'rgba(0,102,204,0.2)',
    name: 'Quarterly Summary', desc: 'Detailed quarterly breakdown of move activity, revenue, and points accumulation',
    tag: 'Quarterly', tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.2)',
    lastDate: '01 Feb 2026', size: '1.1 MB',
  },
  {
    icon: FILE_IC, iconBg: 'rgba(0,102,204,0.1)', iconBorder: 'rgba(0,102,204,0.2)',
    name: 'Points Credit Statement', desc: 'Tax-compliant statement of points earned and their monetary equivalent value',
    tag: 'Monthly', tagColor: '#1a1d29', tagBg: '#f1f5f9', tagBorder: '#e2e8f0',
    lastDate: '20 Feb 2026', size: '845 KB',
  },
]

const CUSTOM: ReportDef[] = [
  {
    icon: FILE_IC, iconBg: 'rgba(16,185,129,0.1)', iconBorder: 'rgba(16,185,129,0.2)',
    name: 'Redemption History Report', desc: 'Complete history of all rewards redeemed with voucher codes and expiry dates',
    tag: 'Custom', tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.2)',
    lastDate: '25 Feb 2026', size: '523 KB',
  },
  {
    icon: MOVES_IC, iconBg: 'rgba(16,185,129,0.1)', iconBorder: 'rgba(16,185,129,0.2)',
    name: 'Move Analytics Report', desc: 'Statistical analysis of move patterns, destinations, volumes, and revenue trends',
    tag: 'Custom', tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.2)',
    lastDate: '20 Feb 2026', size: '1.8 MB',
  },
  {
    icon: MOVES_IC, iconBg: 'rgba(16,185,129,0.1)', iconBorder: 'rgba(16,185,129,0.2)',
    name: 'Group Performance Report', desc: 'Consolidated group code performance across all member companies',
    tag: 'Custom', tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.2)',
    lastDate: '18 Feb 2026', size: '1.5 MB',
  },
]

function ReportCard({ r }: { r: ReportDef }) {
  return (
    <div className={styles.reportCard}>
      <div className={styles.reportCardInner}>
        <div className={styles.reportIcon} style={{ background: r.iconBg, border: `1.275px solid ${r.iconBorder}` }}>
          <img src={r.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        </div>
        <div className={styles.reportBody}>
          <div className={styles.reportNameRow}>
            <span className={styles.reportName}>{r.name}</span>
            <span className={styles.reportTag} style={{ background: r.tagBg, border: `1.275px solid ${r.tagBorder}`, color: r.tagColor }}>{r.tag}</span>
          </div>
          <p className={styles.reportDesc}>{r.desc}</p>
          <div className={styles.reportMeta}>
            <span className={styles.reportMetaItem}><img src={CAL_IC} alt="" className={styles.metaIcon} />Last: {r.lastDate}</span>
            <span className={styles.reportMetaItem}><img src={SIZE_IC} alt="" className={styles.metaIcon} />{r.size}</span>
          </div>
          <div className={styles.reportBtns}>
            <button className={styles.dlBtn} onClick={() => window.print()}>
              <img src={DOWNLOAD_IC} alt="" className={styles.dlBtnIcon} /> PDF
            </button>
            <button className={styles.dlBtn}>
              <img src={DOWNLOAD_IC} alt="" className={styles.dlBtnIcon} /> Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [year, setYear] = useState('2026')
  const [quarter, setQuarter] = useState('')

  return (
    <div>
      <PageHeader title="Reporting" subtitle="Download professional reports for accounting, analysis, and documentation" />

      {/* KPIs */}
      <div className={styles.kpiRow}>
        {[
          { icon: FILE_IC,    bg: 'rgba(0,102,204,0.1)',  label: 'Available Reports', value: '6',      vc: '#1a1d29' },
          { icon: MOVES_IC,   bg: 'rgba(16,185,129,0.1)', label: 'YTD Moves',         value: '156',    vc: '#10b981' },
          { icon: POINTS_IC,  bg: 'rgba(245,158,11,0.1)', label: 'YTD Points',        value: '24,580', vc: '#f59e0b' },
          { icon: DOWNLOAD_IC,bg: '#e2e8f0',              label: 'Last Download',     value: 'Feb 25', vc: '#1a1d29', valueSize: 16 },
        ].map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: k.bg }}><img src={k.icon} alt="" style={{ width: 20, height: 20 }} /></div>
            <p className={styles.kpiLabel}>{k.label}</p>
            <p className={styles.kpiValue} style={{ color: k.vc, fontSize: (k as any).valueSize ?? 24 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <SectionCard>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}><img src={CAL_IC} alt="" style={{ width: 16, height: 16 }} /> Select Year</label>
            <select className={styles.filterSelect} value={year} onChange={e => setYear(e.target.value)}>
              {['2026','2025','2024'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}><img src={FILTER_IC} alt="" style={{ width: 16, height: 16 }} /> Select Quarter</label>
            <select className={styles.filterSelect} value={quarter} onChange={e => setQuarter(e.target.value)}>
              <option value="">All Quarters</option>
              {['Q1','Q2','Q3','Q4'].map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div className={styles.filterApply}>
            <button className={styles.applyBtn}><img src={FILTER_IC} alt="" style={{ width: 16, height: 16 }} /> Apply Filters</button>
          </div>
        </div>
      </SectionCard>

      {/* Standard Reports */}
      <h2 className={styles.sectionHeading}>Standard Reports</h2>
      <div className={styles.reportGrid}>
        {STANDARD.map(r => <ReportCard key={r.name} r={r} />)}
      </div>

      {/* Custom Reports */}
      <h2 className={styles.sectionHeading}>Custom Reports</h2>
      <div className={styles.reportGrid}>
        {CUSTOM.map(r => <ReportCard key={r.name} r={r} />)}
      </div>

      {/* Report information */}
      <SectionCard title="Report Information">
        <ul className={styles.infoList}>
          <li>All reports are generated in real-time based on your current account data</li>
          <li>PDF reports are formatted for professional documentation and printing</li>
          <li>Excel reports include raw data for further analysis and integration</li>
          <li>Tax-compliant credit statements include all required documentation for accounting purposes</li>
          <li>Reports are available for download for up to 24 months of historical data</li>
        </ul>
      </SectionCard>

      {/* Action cards */}
      <div className={styles.actionRow}>
        <div className={styles.actionCard} style={{ background: 'linear-gradient(161deg, rgba(0,102,204,0.05) 0%, transparent 100%), #fff' }}>
          <div className={styles.actionIcon} style={{ background: 'rgba(0,102,204,0.1)' }}>
            <img src={REQ_IC} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h4 className={styles.actionTitle}>Custom Report Request</h4>
            <p className={styles.actionDesc}>Need a specific report format or data analysis? Request a custom report from your account manager.</p>
            <button className={styles.outlineBtn}>Request Custom Report</button>
          </div>
        </div>
        <div className={styles.actionCard} style={{ background: 'linear-gradient(161deg, rgba(16,185,129,0.05) 0%, transparent 100%), #fff' }}>
          <div className={styles.actionIcon} style={{ background: 'rgba(16,185,129,0.1)' }}>
            <img src={BULK_IC} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h4 className={styles.actionTitle}>Bulk Download</h4>
            <p className={styles.actionDesc}>Download all available reports for the selected period in a single ZIP file.</p>
            <button className={styles.outlineBtn}><img src={DOWNLOAD_IC} alt="" style={{ width: 14, height: 14, marginRight: 6 }} />Download All Reports</button>
          </div>
        </div>
      </div>
    </div>
  )
}
