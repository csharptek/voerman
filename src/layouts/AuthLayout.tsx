import React from 'react'
import styles from './AuthLayout.module.css'

const LOGO = 'https://www.figma.com/api/mcp/asset/9dbc7f28-eebe-4050-a249-f566b240f1e9'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.logoWrap}>
        <img src={LOGO} alt="Voerman – A Worldwide Welcome" className={styles.logo} />
      </div>
      {children}
      <p className={styles.copyright}>© 2026 Voerman Green Miles. All rights reserved.</p>
    </div>
  )
}
