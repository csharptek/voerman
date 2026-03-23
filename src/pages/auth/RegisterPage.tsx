import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Globe, Hash, User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthLayout from '../../layouts/AuthLayout'
import styles from './Auth.module.css'

const LOGO_REG = 'https://www.figma.com/api/mcp/asset/d91b8433-e07a-4178-8b0e-4451d2785e3a'
const API = import.meta.env.VITE_API_URL ?? ''

export default function RegisterPage() {
  const [form, setForm] = useState({
    company: '', billing: '', network: '', groupCode: '',
    contactName: '', email: '', phone: '',
    country: '', city: '',
    password: '', confirmPassword: '',
  })
  const [showPwd, setShowPwd]   = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [agreed, setAgreed]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.company)                       { setError('Company name is required.');              return }
    if (!form.contactName)                   { setError('Contact person is required.');            return }
    if (!form.email)                         { setError('Business email is required.');            return }
    if (!form.country)                       { setError('Country is required.');                   return }
    if (!form.city)                          { setError('City is required.');                      return }
    if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirmPassword)     { setError('Passwords do not match.');         return }
    if (!agreed)                             { setError('Please agree to the Terms of Service.');  return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName:        form.company,
          contactPerson:      form.contactName,
          email:              form.email,
          phone:              form.phone,
          country:            form.country,
          city:               form.city,
          billingEntity:      form.billing,
          networkAffiliation: form.network,
          password:           form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Registration failed. Please try again.')
        return
      }

      // Success — pass company name to success page via state
      navigate('/register/success', { state: { company: form.company, email: form.email } })

    } catch {
      setError('Unable to connect to the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <img src={LOGO_REG} alt="Voerman" style={{ height: 64, objectFit: 'contain' }} />
      </div>
      <h1 className={styles.heading}>Request Partner Access</h1>
      <p className={styles.subheading}>Join the Voerman Green Miles loyalty program</p>

      <div className={`${styles.card} ${styles.wide}`} style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Company Information */}
          <div className={styles.sectionHead}>Company Information</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Company Name *</label>
            <div className={styles.inputWrap}>
              <Building2 size={16} className={styles.inputIcon} />
              <input className={styles.input} type="text" placeholder="Acme International Moving" value={form.company} onChange={set('company')} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Country *</label>
              <div className={styles.inputWrap}>
                <Globe size={16} className={styles.inputIcon} />
                <input className={styles.input} type="text" placeholder="Netherlands" value={form.country} onChange={set('country')} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>City *</label>
              <div className={styles.inputWrap}>
                <Globe size={16} className={styles.inputIcon} />
                <input className={styles.input} type="text" placeholder="Amsterdam" value={form.city} onChange={set('city')} />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Billing Entity</label>
              <div className={styles.inputWrap}>
                <Building2 size={16} className={styles.inputIcon} />
                <input className={styles.input} type="text" placeholder="Legal entity name" value={form.billing} onChange={set('billing')} />
              </div>
              <p className={styles.helperText}>Legal name for invoicing</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Network Affiliation</label>
              <div className={styles.inputWrap}>
                <Globe size={16} className={styles.inputIcon} />
                <input className={styles.input} type="text" placeholder="e.g., IAM, FIDI, OMNI" value={form.network} onChange={set('network')} />
              </div>
              <p className={styles.helperText}>Industry association</p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Group Code (Optional)</label>
            <div className={styles.inputWrap}>
              <Hash size={16} className={styles.inputIcon} />
              <input className={styles.input} type="text" placeholder="Enter if provided by Voerman" value={form.groupCode} onChange={set('groupCode')} />
            </div>
            <p className={styles.helperText}>Leave blank if not applicable</p>
          </div>

          {/* Primary Contact */}
          <div className={styles.sectionHead}>Primary Contact</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contact Person *</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input className={styles.input} type="text" placeholder="Full name" value={form.contactName} onChange={set('contactName')} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Business Email *</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input className={styles.input} type="email" placeholder="contact@company.com" value={form.email} onChange={set('email')} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <div className={styles.inputWrap}>
                <Phone size={16} className={styles.inputIcon} />
                <input className={styles.input} type="tel" placeholder="+31 20 123 4567" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className={styles.sectionHead}>Account Security</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password *</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input className={styles.input} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className={styles.helperText}>Minimum 8 characters, must include a number and uppercase letter</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password *</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input className={styles.input} type={showPwd2 ? 'text' : 'password'} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd2(v => !v)}>
                {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.checkRow}>
            <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <label htmlFor="terms">
              I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
            </label>
          </div>

          <div className={styles.noteBox}>
            <b>Note:</b> Your registration will be reviewed by our partnership team. You'll receive an email confirmation once approved (typically within 2–3 business days).
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
              : 'Submit Registration Request'
            }
          </button>
        </form>
      </div>

      <p className={styles.footerLink}>Already have an account? <Link to="/login">Sign in here</Link></p>
      <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#94a3b8' }}>© 2026 Voerman Green Miles. All rights reserved.</p>
    </div>
  )
}
