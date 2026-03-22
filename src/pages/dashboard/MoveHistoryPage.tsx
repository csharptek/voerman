import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Download, MapPin, TrendingUp, Clock } from 'lucide-react'
import { KpiCard, SectionCard, Table, PageHeader, statusBadge } from '../../components/ui'
import { MOVES } from '../../data/mockData'
import styles from './MoveHistory.module.css'

export default function MoveHistoryPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = MOVES.filter(m =>
    [m.id, m.ref, m.customer, m.from, m.to].some(v => v.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div>
      <PageHeader title="Move History" subtitle="Complete transparency of all your international moves and point accruals" />

      <div className={styles.kpiRow}>
        <KpiCard label="Total Moves" value="8"
          icon={<div className={styles.ki} style={{ background: 'rgba(0,102,204,.1)' }}><MapPin size={20} color="#0066cc" /></div>} />
        <KpiCard label="Points Credited" value="21,450"
          icon={<div className={styles.ki} style={{ background: 'rgba(16,185,129,.1)' }}><TrendingUp size={20} color="#10b981" /></div>} />
        <KpiCard label="Points Pending" value="17,100"
          icon={<div className={styles.ki} style={{ background: 'rgba(245,158,11,.1)' }}><Clock size={20} color="#f59e0b" /></div>} />
      </div>

      {/* Search bar */}
      <SectionCard>
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by move reference, customer, origin, or destination..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className={styles.exportBtn}>
            <Download size={14} /> Export
          </button>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard title={`All Moves (${filtered.length})`} subtitle="Click any row to view detailed move information">
        <Table>
          <thead>
            <tr>
              <th>Move Reference</th>
              <th>Booking Date</th>
              <th>Route</th>
              <th style={{ textAlign: 'right' }}>Eligible Revenue</th>
              <th style={{ textAlign: 'right' }}>Points</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} onClick={() => navigate(`/moves/${m.id}`)}>
                <td>
                  <div className={styles.moveRef}>{m.ref}</div>
                  <div className={styles.moveSub}>{m.id}</div>
                </td>
                <td className={styles.muted}>📅 {m.date}</td>
                <td>
                  <div className={styles.routeCell}>
                    <MapPin size={13} className={styles.routeIcon} />
                    <div className={styles.routeStack}>
                      <span>{m.from}</span>
                      <span className={styles.routeArrow}>↓</span>
                      <span>{m.to}</span>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}><strong>{m.revenue}</strong></td>
                <td style={{ textAlign: 'right' }}><strong className={styles.pts}>+{m.points.toLocaleString()}</strong></td>
                <td>{statusBadge(m.status)}</td>
                <td>{statusBadge(m.invoice)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>No moves match your search.</td></tr>
            )}
          </tbody>
        </Table>
      </SectionCard>
    </div>
  )
}
