import { useState } from 'react'
import { PageHeader } from '../../components/ui'
import styles from './Settings.module.css'

// Assets from Figma nodes 9:9547, 9:9848, 9:10105, 9:10363
// Tab icons
const ACCT_IC   = 'https://www.figma.com/api/mcp/asset/f326f429-bfe0-4798-821d-92afc8d5476c'
const SEC_IC    = 'https://www.figma.com/api/mcp/asset/30014239-9368-4943-a28b-3eb8b1f3c7e9'
const USERS_IC  = 'https://www.figma.com/api/mcp/asset/ec9c15d7-a3d5-4cdc-be58-9b836a437286'
const NOTIF_IC  = 'https://www.figma.com/api/mcp/asset/dcd32abd-f055-4b79-9dfa-54d3293559f0'
// Form icons
const COMPANY_IC = 'https://www.figma.com/api/mcp/asset/9ad5e8ae-065c-4eb7-b9a5-cf655d5b75d8'
const PERSON_IC  = 'https://www.figma.com/api/mcp/asset/c5308880-7471-4999-ab09-55d723612deb'
const EMAIL_IC   = 'https://www.figma.com/api/mcp/asset/054ec47a-a4cd-4846-8e57-98594c8a9139'
const PHONE_IC   = 'https://www.figma.com/api/mcp/asset/cf5c78aa-7335-4102-a804-ad8885b22bf5'
const GLOBE_IC   = 'https://www.figma.com/api/mcp/asset/8f991c11-9e13-42a4-9e45-f78652ca33f4'
const LOC_IC     = 'https://www.figma.com/api/mcp/asset/e6d1aecf-20cd-4650-b3fd-5a5e2545aeeb'
const NETWORK_IC = 'https://www.figma.com/api/mcp/asset/2ab73098-3567-4f46-93ad-9351b75bd903'
const SHIELD_IC  = 'https://www.figma.com/api/mcp/asset/7af28d19-a39b-4dd8-a42d-7523fc9e55c1'
const LOCK_IC    = 'https://www.figma.com/api/mcp/asset/be1c1d68-fce7-4321-905e-8f01d7de27f2'
const SAVE_IC    = 'https://www.figma.com/api/mcp/asset/a4ff2741-5581-4865-abf1-9cd99b3cb097'
const ADD_IC     = 'https://www.figma.com/api/mcp/asset/868c698c-d82c-4fbb-aef4-5b4e97b1508b'
const USER_AV    = 'https://www.figma.com/api/mcp/asset/40fdca91-f7c0-4c1e-af4c-4bc02097c7c1'
const NOTIF_SAVE = 'https://www.figma.com/api/mcp/asset/88d35837-5045-4c05-889a-d81336dac06e'

type Tab = 'account' | 'security' | 'users' | 'notifications'

// Notification toggle data from Figma
const NOTIF_ITEMS = [
  { key: 'points',     label: 'Points Earned',      desc: 'Get notified when new points are credited to your account',   on: true  },
  { key: 'move',       label: 'Move Confirmed',      desc: 'Receive confirmation when a move is registered',              on: true  },
  { key: 'tier',       label: 'Tier Progress',       desc: 'Updates on your progress towards the next tier',              on: true  },
  { key: 'redemption', label: 'Redemption Success',  desc: 'Confirmation when rewards are successfully redeemed',         on: true  },
  { key: 'statement',  label: 'Monthly Statement',   desc: 'Receive monthly account statements via email',                on: false },
  { key: 'marketing',  label: 'Marketing & Promotions', desc: 'Special offers and program updates',                       on: false },
  { key: 'system',     label: 'System Updates',      desc: 'Important platform updates and maintenance notifications',    on: true  },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account')
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_ITEMS.map(n => [n.key, n.on]))
  )

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'account',      icon: ACCT_IC,  label: 'Account Info'  },
    { key: 'security',     icon: SEC_IC,   label: 'Security'      },
    { key: 'users',        icon: USERS_IC, label: 'Users'         },
    { key: 'notifications',icon: NOTIF_IC, label: 'Notifications' },
  ]

  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Manage your account information, security, and preferences" />

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            <img src={t.icon} alt="" className={styles.tabIcon} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Account Info ─────────────────────────────────────────── */}
      {tab === 'account' && (
        <div className={styles.tabContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Company Information</h3>
                <p className={styles.cardSub}>Your registered company details and contact information</p>
              </div>
              <button className={styles.outlineBtn}>Edit Information</button>
            </div>
            <div className={styles.formGrid}>
              {[
                { label: 'Company Name',       icon: COMPANY_IC,  value: 'Acme Moving Netherlands' },
                { label: 'Contact Person',      icon: PERSON_IC,   value: 'John Doe' },
                { label: 'Email Address',       icon: EMAIL_IC,    value: 'john@acmemoving.com' },
                { label: 'Phone Number',        icon: PHONE_IC,    value: '+31 20 123 4567' },
                { label: 'Country',             icon: GLOBE_IC,    value: 'Netherlands' },
                { label: 'City',                icon: LOC_IC,      value: 'Amsterdam' },
                { label: 'Billing Entity',      icon: COMPANY_IC,  value: 'Acme Moving BV' },
                { label: 'Network Affiliation', icon: NETWORK_IC,  value: 'Global Moving Alliance' },
              ].map(f => (
                <div key={f.label} className={styles.formField}>
                  <label className={styles.fieldLabel}>{f.label}</label>
                  <div className={styles.fieldInputWrap}>
                    <img src={f.icon} alt="" className={styles.fieldIcon} />
                    <input className={styles.fieldInput} value={f.value} readOnly />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group code */}
          <div className={styles.card}>
            <div className={styles.codeRow}>
              <img src={SHIELD_IC} alt="" className={styles.codeIcon} />
              <div>
                <h4 className={styles.codeTitle}>Group Code</h4>
                <div className={styles.codeValueRow}>
                  <span className={styles.codeValue}>VGM-GLOBAL-01</span>
                  <span className={styles.activeBadge}>Active</span>
                </div>
                <p className={styles.codeSub}>Your group code links you to the Global Moving Alliance network</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Security ─────────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className={styles.tabContent}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Change Password</h3>
            <p className={styles.cardSub}>Update your password to keep your account secure</p>
            <div className={styles.pwForm}>
              {[
                { label: 'Current Password',     placeholder: 'Enter current password' },
                { label: 'New Password',          placeholder: 'Enter new password', hint: 'Minimum 8 characters with letters and numbers' },
                { label: 'Confirm New Password',  placeholder: 'Confirm new password' },
              ].map(f => (
                <div key={f.label} className={styles.pwField}>
                  <label className={styles.fieldLabel}>{f.label}</label>
                  <div className={styles.fieldInputWrap}>
                    <img src={LOCK_IC} alt="" className={styles.fieldIcon} />
                    <input type="password" className={styles.fieldInput} placeholder={f.placeholder} />
                  </div>
                  {f.hint && <p className={styles.fieldHint}>{f.hint}</p>}
                </div>
              ))}
              <button className={styles.primaryBtn}>
                <img src={SAVE_IC} alt="" style={{ width: 16, height: 16 }} /> Update Password
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.codeRow}>
              <img src={SHIELD_IC} alt="" className={styles.codeIcon} />
              <div>
                <h4 className={styles.codeTitle}>Security Recommendations</h4>
                <ul className={styles.secList}>
                  <li>Use a strong password with at least 8 characters</li>
                  <li>Include uppercase, lowercase, numbers, and special characters</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Change your password regularly (every 90 days recommended)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Users ────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className={styles.tabContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Team Members</h3>
                <p className={styles.cardSub}>Manage user access and permissions for your account</p>
              </div>
              <button className={styles.primaryBtn}>
                <img src={ADD_IC} alt="" style={{ width: 16, height: 16 }} /> Add User
              </button>
            </div>
            <div className={styles.userList}>
              {[
                { name: 'Jane Smith',   email: 'jane@acmemoving.com',  role: 'Admin',  lastLogin: '25/02/2026', roleBg: 'rgba(245,158,11,0.1)', roleBorder: 'rgba(245,158,11,0.2)', roleColor: '#f59e0b' },
                { name: 'Mike Johnson', email: 'mike@acmemoving.com',   role: 'Viewer', lastLogin: '20/02/2026', roleBg: '#f1f5f9', roleBorder: '#e2e8f0', roleColor: '#1a1d29' },
              ].map(u => (
                <div key={u.email} className={styles.userRow}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}><img src={USER_AV} alt="" style={{ width: 20, height: 20 }} /></div>
                    <div>
                      <p className={styles.userName}>{u.name}</p>
                      <p className={styles.userEmail}>{u.email}</p>
                    </div>
                  </div>
                  <div className={styles.userMeta}>
                    <span className={styles.roleBadge} style={{ background: u.roleBg, border: `1.275px solid ${u.roleBorder}`, color: u.roleColor }}>{u.role}</span>
                    <span className={styles.lastLogin}>Last login: {u.lastLogin}</span>
                    <button className={styles.editBtn}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h4 className={styles.cardTitle}>User Roles &amp; Permissions</h4>
            <div className={styles.roleGrid}>
              <div className={styles.roleCard}>
                <div className={styles.roleHeader}>
                  <span className={styles.roleName}>Admin</span>
                  <span className={styles.roleBadge} style={{ background: 'rgba(245,158,11,0.1)', border: '1.275px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>Full Access</span>
                </div>
                <p className={styles.roleDesc}>Can view, edit settings, manage users, redeem rewards, and download reports</p>
              </div>
              <div className={styles.roleCard}>
                <div className={styles.roleHeader}>
                  <span className={styles.roleName}>Viewer</span>
                  <span className={styles.roleBadge} style={{ background: '#f1f5f9', border: '1.275px solid #e2e8f0', color: '#1a1d29' }}>Read Only</span>
                </div>
                <p className={styles.roleDesc}>Can view dashboard, moves, and points but cannot make changes or redeem rewards</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications ────────────────────────────────────────── */}
      {tab === 'notifications' && (
        <div className={styles.tabContent}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Email Notifications</h3>
            <p className={styles.cardSub}>Choose which notifications you want to receive</p>
            <div className={styles.notifList}>
              {NOTIF_ITEMS.map(n => (
                <div key={n.key} className={styles.notifRow}>
                  <div>
                    <p className={styles.notifLabel}>{n.label}</p>
                    <p className={styles.notifDesc}>{n.desc}</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${notifs[n.key] ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                    aria-label={notifs[n.key] ? 'Disable' : 'Enable'}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.savePrefRow}>
              <button className={styles.primaryBtn}>
                <img src={NOTIF_SAVE} alt="" style={{ width: 16, height: 16 }} /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
