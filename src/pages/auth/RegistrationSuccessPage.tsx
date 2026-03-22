import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import styles from './Auth.module.css'

export default function RegistrationSuccessPage() {
  const { registrationData } = useAuth()
  const company = registrationData?.company ?? 'Your Company'
  const email = registrationData?.email ?? 'your@email.com'

  return (
    <AuthLayout>
      <div className={styles.card} style={{ maxWidth: 560, padding: '48px 48px 40px' }}>
        <div className={styles.successIconWrap}>
          <CheckCircle size={40} color="#41ab35" strokeWidth={2} />
        </div>

        <h1 className={styles.successTitle}>Registration Request Submitted</h1>
        <p className={styles.successBody}>
          Thank you for your interest in the Voerman Green Miles Partner Program. Your registration request has been received and is currently under review.
        </p>

        <div className={styles.nextSteps}>
          <h4>What happens next?</h4>
          <ul>
            <li><span className={styles.dot} /><span>Our partner team will review your application within 2-3 business days</span></li>
            <li><span className={styles.dot} /><span>You will receive an email notification at <strong>{email.toUpperCase()}</strong> once approved</span></li>
            <li><span className={styles.dot} /><span>Upon approval, you can log in and start tracking your international moves</span></li>
          </ul>
        </div>

        <div className={styles.refBox}>
          <strong>Company:</strong> {company}<br />
          <strong>Reference Email:</strong> {email.toUpperCase()}
        </div>

        <Link to="/login" className={styles.btnPrimary} style={{ display: 'block', lineHeight: '40px', textDecoration: 'none', textAlign: 'center' }}>
          Return to Login
        </Link>

        <div className={styles.helpLine}>
          Need help? Contact us at <a href="mailto:partners@voerman.com">partners@voerman.com</a>
        </div>
      </div>
    </AuthLayout>
  )
}
