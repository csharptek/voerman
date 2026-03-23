import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, Mail, Clock, ArrowRight } from 'lucide-react'
import styles from './Auth.module.css'

const LOGO = 'https://www.figma.com/api/mcp/asset/d91b8433-e07a-4178-8b0e-4451d2785e3a'

export default function RegistrationSuccessPage() {
  const { state } = useLocation()
  const company = (state as any)?.company ?? 'Your company'
  const email   = (state as any)?.email   ?? 'your email address'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>

      <div style={{ marginBottom: 24 }}>
        <img src={LOGO} alt="Voerman" style={{ height: 64, objectFit: 'contain' }} />
      </div>

      <div className={styles.card} style={{ maxWidth: 540, textAlign: 'center' }}>

        {/* Success icon */}
        <div style={{ width: 72, height: 72, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={36} color="#10b981" />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1d29', marginBottom: 8 }}>
          Registration Submitted!
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', marginBottom: 32 }}>
          Thank you for applying to the Voerman Green Miles partner program.
        </p>

        {/* What happens next */}
        <div style={{ background: '#f8f9fb', border: '1.275px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'left' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1d29', marginBottom: 16 }}>What happens next:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(0,102,204,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={14} color="#0066cc" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1d29', marginBottom: 2 }}>Confirmation email sent</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>We've sent a confirmation to <strong>{email}</strong></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(245,158,11,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={14} color="#f59e0b" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1d29', marginBottom: 2 }}>Review in 2–3 business days</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Our partnership team will review <strong>{company}</strong>'s application</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowRight size={14} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1d29', marginBottom: 2 }}>Access granted</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Once approved you can log in and start earning Green Miles points</p>
              </div>
            </div>
          </div>
        </div>

        <Link to="/login" style={{ display: 'block', width: '100%', height: 44, background: '#171630', color: '#fff', borderRadius: 8, fontSize: 14, fontFamily: 'Segoe UI, sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Back to Login
        </Link>
      </div>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
        © 2026 Voerman Green Miles. All rights reserved.
      </p>
    </div>
  )
}
