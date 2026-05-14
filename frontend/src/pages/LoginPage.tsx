import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Loader2, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const count = Math.min(80, Math.floor(w * h / 15000))
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(74, 141, 255, 0.15)'
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(74, 141, 255, ${(1 - dist / 150) * 0.06})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="login-bg-canvas" />
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
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return }
    if (password.length < 1) { setError('Please enter your password.'); return }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      const s = err?.response?.status
      if (s === 401) setError('Invalid email or password.')
      else if (s === 422) setError('Please check your input and try again.')
      else if (s === 403) setError('Account locked. Contact your administrator.')
      else if (s >= 500) setError('Something went wrong. Please try again later.')
      else setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <ParticleCanvas />
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="login-hero">
            <motion.div
              className="badge-pill"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="pill-dot" />
              Security Platform v0.2
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Intent-Aware<br />
              <span className="highlight">Asset Security</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Real-time trust scoring, anomaly detection, and context-aware access control
              for physical security operations.
            </motion.p>
          </div>

          <motion.div
            className="login-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
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
                    autoFocus
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
                      <>Continue <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              </form>
              <div className="form-divider">new here?</div>
              <Link to="/register" className="btn btn-ghost" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
                <UserPlus size={14} /> Create account
              </Link>
              <div className="form-divider">demo credentials</div>
              <div className="login-demo-cred">
                Email: <code>admin@meridian-mfg.com</code><br />
                Pass: <code>ContextShield2025!</code>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
