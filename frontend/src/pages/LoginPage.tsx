import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, ArrowRight, Loader2, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
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
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch {
      setError('Invalid credentials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg-glow" />

      <nav className="login-nav">
        <div className="logo">
          <div className="logo-mark">CS</div>
          <span className="brand-name">ContextShield</span>
        </div>
      </nav>

      <div className="login-body">
        <motion.div
          className="login-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="login-hero">
            <motion.div className="badge-pill" variants={itemVariants}>
              <span className="pill-dot" />
              Security Platform v0.2
            </motion.div>

            <motion.h1 variants={itemVariants}>
              Intent-Aware
              <br />
              <em>Asset Security</em>
            </motion.h1>

            <motion.p variants={itemVariants}>
              Real-time trust scoring, anomaly detection, and context-aware access control for
              physical security operations.
            </motion.p>
          </div>

          <motion.div className="login-card" variants={itemVariants}>
            <div className="login-card-inner">
              <h3>Sign in</h3>

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

                <div className="form-footer">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 size={14} className="spinning" />
                    ) : (
                      <>
                        Continue <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="form-divider">new here?</div>

              <Link
                to="/register"
                className="btn btn-ghost"
                style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
              >
                <UserPlus size={14} /> Create account
              </Link>

              <div className="form-divider">demo credentials</div>

              <div className="login-demo-cred">
                Email: <code>admin@meridian-mfg.com</code>
                <br />
                Pass: <code>ContextShield2025!</code>
              </div>

              <div className="login-security-note">
                <Lock size={12} />
                Secured with JWT + Supabase
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
