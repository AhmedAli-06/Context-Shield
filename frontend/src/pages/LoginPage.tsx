import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, ArrowRight, Loader2, UserPlus, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Enter a valid email address'); return }
    if (password.length < 1) { setError('Enter your password'); return }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) setError('Invalid email or password')
      else if (status === 422) setError('Check your input and try again')
      else if (status === 403) setError('Account locked. Contact your administrator')
      else if (status >= 500) setError('Server error. Please try again later')
      else setError('Login failed. Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-noise" />

      <motion.nav
        className="login-nav"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="logo">
          <div className="logo-mark">CS</div>
          <span className="brand-name">ContextShield</span>
        </div>
        <span className="brand-badge">Intent-Aware Security</span>
      </motion.nav>

      <div className="login-body">
        <motion.div
          className="login-container"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <div className="login-hero">
            <motion.div className="login-hero-badge" variants={fadeUp}>
              <Shield size={12} />
              <span>AI-Powered Security Platform</span>
            </motion.div>

            <motion.h1 variants={fadeUp}>
              Verify <em>Intent</em>,
              <br />
              Not Just <span className="word-highlight">Identity</span>
            </motion.h1>

            <motion.p className="login-hero-desc" variants={fadeUp}>
              Real-time trust scoring, anomaly detection, and context-aware access control for physical security operations.
            </motion.p>

            <motion.div className="login-hero-stats" variants={fadeUp}>
              <div className="stat-item">
                <span className="stat-value">99.7%</span>
                <span className="stat-label">Threat Detection</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">&lt;50ms</span>
                <span className="stat-label">Response Time</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">5D</span>
                <span className="stat-label">Trust Dimensions</span>
              </div>
            </motion.div>
          </div>

          <motion.div className="login-card" variants={fadeIn}>
            <div className="login-card-inner">
              <div className="login-card-header">
                <h3>Welcome back</h3>
                <p>Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <motion.p
                    className="form-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                  {loading ? <Loader2 size={15} className="spinning" /> : <><span>Sign in</span> <ArrowRight size={14} /></>}
                </button>
              </form>

              <div className="login-divider-row">
                <span className="login-divider-line" />
                <span className="login-divider-text">or continue with</span>
                <span className="login-divider-line" />
              </div>

              <Link to="/register" className="btn btn-ghost" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
                <UserPlus size={14} /> Create account
              </Link>

              <div className="login-demo-cred">
                <div className="demo-label">Demo credentials</div>
                <div className="demo-row">
                  <span>Email:</span>
                  <code>admin@meridian-mfg.com</code>
                </div>
                <div className="demo-row">
                  <span>Pass:</span>
                  <code>ContextShield2025!</code>
                </div>
              </div>

              <div className="login-security-note">
                <Lock size={11} />
                Secured with JWT + Supabase
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
