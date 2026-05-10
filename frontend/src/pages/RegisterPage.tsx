import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

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

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register(email, password, name)
      toast.success('Account created! Please log in.')
      navigate('/login', { replace: true })
    } catch (err: any) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail

      // Parse field-level validation errors from 422
      if (status === 422 && detail) {
        if (Array.isArray(detail)) {
          setError(detail.map((e: any) => e.msg || e.loc?.join('.')).join(', '))
        } else {
          setError(
            typeof detail === 'string' ? detail : 'Validation failed. Please check your input.'
          )
        }
      } else if (status === 409) {
        setError('An account with this email already exists.')
      } else if (status === 400) {
        setError(detail || 'Invalid registration details. Please check your input.')
      } else if (status >= 500) {
        setError('Something went wrong. Please try again later.')
      } else {
        setError('Registration failed. Please try again.')
      }
      toast.error('Registration failed.')
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
              Register — v0.2
            </motion.div>
            <motion.h1 variants={itemVariants}>
              Create Your
              <br />
              <em>Security Account</em>
            </motion.h1>
            <motion.p variants={itemVariants}>
              Join ContextShield to monitor, analyze, and protect your physical assets with
              AI-powered intent verification.
            </motion.p>
          </div>

          <motion.div className="login-card" variants={itemVariants}>
            <div className="login-card-inner">
              <h3>Create account</h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@company.com"
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
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                        Create account <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="form-divider">already registered?</div>

              <Link
                to="/login"
                className="btn btn-ghost"
                style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
              >
                Sign in instead
              </Link>

              <div className="login-security-note">
                <Lock size={12} />
                Secured with Supabase + JWT
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
