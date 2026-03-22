import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, MapPin, Gift, Star, Users, BarChart2,
  Settings, LogOut, Bell, Search, Shield,
} from 'lucide-react'
import styles from './DashboardLayout.module.css'

const LOGO = 'https://www.figma.com/api/mcp/asset/fcf927f8-e2af-4502-967e-a89f6652dd4f'
const NOTIF_ICON = 'https://www.figma.com/api/mcp/asset/28dea78e-1143-45c0-8e39-75bd35e06024'

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/moves',         label: 'Move History',   Icon: MapPin },
  { to: '/redeem',        label: 'Redeem Rewards', Icon: Gift },
  { to: '/tier-benefits', label: 'Tier Benefits',  Icon: Star },
  { to: '/group-codes',   label: 'Group Codes',    Icon: Users },
  { to: '/reports',       label: 'Reports',        Icon: BarChart2 },
  { to: '/settings',      label: 'Settings',       Icon: Settings },
  { to: '/admin',         label: 'Admin Panel',    Icon: Shield },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name?.split(' ').map(n => n[0]).join('') ?? 'JD'

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src={LOGO} alt="Voerman" className={styles.logoImg} />
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name ?? 'John Doe'}</p>
              <p className={styles.userCompany}>{user?.company ?? 'Acme Moving Co.'}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search moves, rewards, reports..." className={styles.searchInput} />
            <kbd className={styles.searchKbd}>⌘K</kbd>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.tierPill}>
              <span className={styles.tierDot} />
              <span>Gold Tier</span>
            </div>

            <button className={styles.notifBtn}>
              <Bell size={18} />
              <span className={styles.notifDot} />
            </button>

            <div className={styles.topbarUser}>
              <div className={styles.topbarUserInfo}>
                <p className={styles.topbarName}>{user?.name ?? 'John Doe'}</p>
                <p className={styles.topbarRole}>Partner</p>
              </div>
              <div className={styles.topbarAvatar}>{initials}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
