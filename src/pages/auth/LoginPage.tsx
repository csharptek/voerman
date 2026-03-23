import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import styles from './Auth.module.css'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email)    { setError('Please enter your email address.'); return }
    if (!password) { setError('Please enter your password.'); return }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className={styles.heading}>Green Miles Partner Portal</h1>
      <p className={styles.subheading}>Sign in to access your loyalty dashboard</p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="partner@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPwd ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.forgotWrap}>
            <Link to="#" className={styles.forgotLink}>Forgot Password?</Link>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />Signing in...</>
              : 'Log In'
            }
          </button>

          <div className={styles.divider}><span>NEW PARTNER?</span></div>

          <Link to="/register" className={styles.btnSecondary}>Request Access</Link>
        </form>
      </div>

      <p className={styles.terms}>
        By signing in, you agree to our{' '}
        <Link to="#" className={styles.termsLink}>Terms of Service</Link> and{' '}
        <Link to="#" className={styles.termsLink}>Privacy Policy</Link>
      </p>

      <div className={styles.demoBox}>
        <strong>Seed credentials:</strong> john@acmemoving.com / Admin@123
      </div>

      {/* deploy-check: v1.0.2 */}
      <span style={{ opacity: 0, fontSize: 1, position: 'absolute' }}>deploy-ok-v2</span>
    </AuthLayout>
  )
}
