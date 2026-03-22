import React from 'react'
import styles from './ui.module.css'

// ── Badge ──────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'gray' | 'red' | 'blue' | 'navy'
export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>
}

export function statusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    Credited: 'green', Approved: 'amber', Pending: 'gray',
    Rejected: 'red', Active: 'green', Observer: 'amber', Paid: 'green',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>
}

// ── Button ─────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}
export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Input ──────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helper?: string
  icon?: React.ReactNode
  rightEl?: React.ReactNode
}
export function Input({ label, helper, icon, rightEl, className = '', ...props }: InputProps) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${className}`} {...props} />
        {rightEl && <span className={styles.inputRight}>{rightEl}</span>}
      </div>
      {helper && <p className={styles.helper}>{helper}</p>}
    </div>
  )
}

// ── Card ───────────────────────────────────────────────
export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.card} ${className}`} {...props}>{children}</div>
}

// ── KPI Card ───────────────────────────────────────────
export function KpiCard({ label, value, delta, deltaPositive, icon, glowColor }:
  { label: string; value: string; delta?: string; deltaPositive?: boolean; icon?: React.ReactNode; glowColor?: string }) {
  return (
    <div className={styles.kpiCard}>
      {glowColor && <div className={styles.kpiGlow} style={{ background: glowColor }} />}
      {icon && <div className={styles.kpiIcon}>{icon}</div>}
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {delta && (
        <p className={`${styles.kpiDelta} ${deltaPositive ? styles.kpiDeltaPos : deltaPositive === false ? styles.kpiDeltaNeg : styles.kpiDeltaNeutral}`}>
          {delta}
        </p>
      )}
    </div>
  )
}

// ── Table ──────────────────────────────────────────────
export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`${styles.tableWrap} ${className}`}>
      <table className={styles.table}>{children}</table>
    </div>
  )
}

// ── Section Card ───────────────────────────────────────
export function SectionCard({ title, subtitle, action, children, className = '' }:
  { title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`${styles.sectionCard} ${className}`}>
      {(title || action) && (
        <div className={styles.sectionHeader}>
          <div>
            {title && <h2 className={styles.sectionTitle}>{title}</h2>}
            {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Page Header ────────────────────────────────────────
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
    </div>
  )
}

// ── Tier Progress ──────────────────────────────────────
export function TierProgress() {
  const pct = 98.3
  return (
    <div>
      <div className={styles.progressLabels}>
        <span>24,580 / 25,000 points</span>
        <span className={styles.progressPct}>{pct}%</span>
      </div>
      <div className={styles.progressBg}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Tier Milestones ────────────────────────────────────
export function TierMilestones() {
  const tiers = [
    { name: 'Bronze', range: '0 – 5,000 pts', status: '✓ Completed', active: false, labelStyle: { background: '#cd7f32', color: '#fff', border: '1.275px solid #e2e8f0' }, wrapStyle: { background: 'rgba(205,127,50,0.05)', borderColor: 'rgba(205,127,50,0.2)' }, statusColor: '#cd7f32' },
    { name: 'Silver', range: '5,000 – 15,000 pts', status: '✓ Completed', active: false, labelStyle: { background: '#94a3b8', color: '#fff', border: '1.275px solid #e2e8f0' }, wrapStyle: { background: 'rgba(148,163,184,0.05)', borderColor: 'rgba(148,163,184,0.3)' }, statusColor: '#94a3b8' },
    { name: 'Gold', range: '15,000 – 25,000 pts', status: '← You are here', active: true, labelStyle: { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1.275px solid rgba(245,158,11,0.2)' }, wrapStyle: { background: 'rgba(251,191,36,0.1)', borderColor: '#fbbf24' }, statusColor: '#fbbf24' },
    { name: 'Platinum', range: '25,000+ pts', status: '420 pts to unlock', active: false, labelStyle: { background: '#1e293b', color: '#fff', border: '1.275px solid #e2e8f0' }, wrapStyle: { background: '#f1f5f9', borderColor: '#e2e8f0' }, statusColor: '#64748b' },
  ]
  return (
    <div className={styles.tierGrid}>
      {tiers.map(t => (
        <div key={t.name} className={styles.tierTile} style={{ ...t.wrapStyle, border: `1.275px solid ${t.wrapStyle.borderColor}` }}>
          <span className={styles.tierLabel} style={t.labelStyle}>{t.name}</span>
          <p className={styles.tierRange}>{t.range}</p>
          <p className={styles.tierStatus} style={{ color: t.statusColor, fontWeight: t.active ? 600 : 400 }}>{t.status}</p>
        </div>
      ))}
    </div>
  )
}

// ── Gold Pill ──────────────────────────────────────────
export function GoldPill() {
  return (
    <div className={styles.goldPill}>
      <span className={styles.goldDot} />
      <span>Gold Tier</span>
    </div>
  )
}

// ── Move ID cell ───────────────────────────────────────
export function MoveId({ id, sub }: { id: string; sub?: string }) {
  return (
    <div>
      <div className={styles.moveId}>{id}</div>
      {sub && <div className={styles.moveSub}>{sub}</div>}
    </div>
  )
}

// ── Route cell ─────────────────────────────────────────
export function RouteCell({ from, to, stacked = false }: { from: string; to: string; stacked?: boolean }) {
  if (stacked) {
    return (
      <div className={styles.routeStacked}>
        <span>{from}</span>
        <span className={styles.routeArrow}>↓</span>
        <span>{to}</span>
      </div>
    )
  }
  return <span className={styles.routeInline}>{from} → {to}</span>
}
