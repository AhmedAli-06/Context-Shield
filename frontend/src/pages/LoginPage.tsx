import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Loader2, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

function ShieldLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff1a1a" />
          <stop offset="100%" stopColor="#cc1100" />
        </linearGradient>
        <filter id="shieldGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M15 2L4 7v6c0 7.5 4.5 14.5 11 17 6.5-2.5 11-9.5 11-17V7L15 2z" fill="url(#shieldGrad)" opacity="0.9" />
      <path d="M15 2L4 7v6c0 7.5 4.5 14.5 11 17 6.5-2.5 11-9.5 11-17V7L15 2z" stroke="#ff1a1a" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M11 15l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  )
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

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

    const count = Math.min(100, Math.floor(w * h / 12000))
    const particles: { x: number; y: number; vx: number; vy: number; r: number; baseR: number }[] = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 0.5,
        baseR: Math.random() * 2 + 0.5,
      })
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const handleLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('mouseleave', handleLeave)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Repel from cursor
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120
          p.vx += (dx / dist) * force * 0.4
          p.vy += (dy / dist) * force * 0.4
          p.r = p.baseR + force * 2
        } else {
          p.r = p.baseR + (p.baseR - 0.5) * 0.3 * Math.sin(Date.now() / 2000 + i)
        }

        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, ${Math.max(26, 80 - dist * 0.4)}, ${Math.max(0, 40 - dist * 0.3)}, ${Math.min(0.3, 0.08 + (120 - Math.min(dist, 120)) / 120 * 0.2)})`
        ctx.fill()

        // Connection lines near cursor
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          const nearCursor = dist < 150 || Math.sqrt((p2.x - mx) ** 2 + (p2.y - my) ** 2) < 150
          const maxDist = nearCursor ? 180 : 120
          if (dist2 < maxDist) {
            const alpha = (1 - dist2 / maxDist) * (nearCursor ? 0.1 : 0.04)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255, 50, 0, ${alpha})`
            ctx.lineWidth = nearCursor ? 0.8 : 0.4
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h }
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mouseleave', handleLeave)
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
    } finally { setLoading(false) }
  }

  return (
    <div className="login-root">
      <ParticleCanvas />
      <div className="login-bg-glow" />

      <nav className="login-nav">
        <div className="logo">
          <ShieldLogo size={28} />
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
                  <input className="form-input" type="email" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input className="form-input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && <motion.p className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>}
                <div className="form-footer">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <Loader2 size={14} className="spinning" /> : <><ArrowRight size={14} /> Continue</>}
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
