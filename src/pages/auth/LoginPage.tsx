import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import styles from './Auth.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@voerman.com')
  const [password, setPassword] = useState('demo123')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    const ok = login(email, password)
    if (ok) navigate('/dashboard')
    else setError('Invalid credentials.')
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
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.forgotWrap}>
            <Link to="#" className={styles.forgotLink}>Forgot Password?</Link>
          </div>

          <button type="submit" className={styles.btnPrimary}>Log In</button>

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
        <strong>Demo Credentials:</strong> demo@voerman.com / demo123
      </div>
    </AuthLayout>
  )
}
