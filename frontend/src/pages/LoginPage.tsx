import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, ArrowRight, Loader2, UserPlus, Shield, Activity, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const particles: { x: number; y: number; vx: number; vy: number; s: number; a: number }[] = []
    const count = Math.min(60, Math.floor((w * h) / 20000))

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        s: Math.random() * 1.5 + 0.5, a: Math.random() * 0.4 + 0.1,
      })
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h }
    }
    window.addEventListener('mousemove', onMouseMove)

    let animId: number
    const draw = () => {
      ctx!.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx + (mouseRef.current.x - 0.5) * 0.15
        p.y += p.vy + (mouseRef.current.y - 0.5) * 0.15
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(124, 111, 240, ${p.a})`
        ctx!.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(124, 111, 240, ${0.06 * (1 - dist / 120)})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => { w = window.innerWidth; h = window.innerHeight; canvas!.width = w; canvas!.height = h }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="login-canvas" />
}

function FloatingCard() {
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(10px)`
  }

  const onMouseLeave = () => {
    const card = cardRef.current
    if (card) card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }

  return (
    <motion.div
      className="login-hero-glow-card"
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      variants={itemVariants}
    >
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Shield size={14} color="#7c6ff0" />
          <span style={{ fontSize: 11, color: 'rgba(237,238,243,0.6)' }}>Real-time Protection</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Activity size={14} color="#34d399" />
            <span style={{ fontSize: 10, color: 'rgba(237,238,243,0.4)' }}>12k events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AlertTriangle size={14} color="#fbbf24" />
            <span style={{ fontSize: 10, color: 'rgba(237,238,243,0.4)' }}>3 alerts</span>
          </div>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, rgba(124,111,240,0.4), rgba(75,139,255,0.1))', borderRadius: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(237,238,243,0.3)' }}>
          <span>Trust Score: 94%</span>
          <span>Active: 20</span>
        </div>
      </div>
    </motion.div>
  )
}

function TypeWriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[index]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && display === current) {
      timeout = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && display === '') {
      setDeleting(false)
      setIndex(i => (i + 1) % words.length)
    } else {
      timeout = setTimeout(() => {
        setDisplay(deleting ? current.slice(0, display.length - 1) : current.slice(0, display.length + 1))
      }, deleting ? 30 : 60)
    }

    return () => clearTimeout(timeout)
  }, [display, deleting, index, words])

  return (
    <span>
      {display}
      <span style={{ opacity: 0.7, fontWeight: 300 }}>|</span>
    </span>
  )
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
      const status = err?.response?.status
      if (status === 401) setError('Invalid email or password.')
      else if (status === 422) setError('Please check your input and try again.')
      else if (status === 403) setError('Account locked. Please contact your administrator.')
      else if (status >= 500) setError('Something went wrong. Please try again later.')
      else setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <ParticleCanvas />
      <div className="login-bg-gradient" />
      <div className="login-bg-gradient-2" />
      <div className="login-grid" />

      <nav className="login-nav" style={{ position: 'relative', zIndex: 1 }}>
        <div className="logo">
          <div className="logo-mark">CS</div>
          <span className="brand-name">ContextShield</span>
        </div>
        <span className="brand-badge">v0.2 · Intent-Aware Security</span>
      </nav>

      <div className="login-body">
        <motion.div
          className="login-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="login-hero">
            <FloatingCard />

            <motion.div className="badge-pill" variants={itemVariants}>
              <span className="pill-dot" />
              AI-Powered Security Platform
            </motion.div>

            <motion.h1 variants={itemVariants}>
              Verify <em>Intent</em>,<br />
              Not Just <span className="word-highlight">Identity</span>
            </motion.h1>

            <motion.p variants={itemVariants}>
              Real-time trust scoring, anomaly detection, and context-aware access control for physical security operations.
            </motion.p>

            <motion.p variants={itemVariants} style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.7, maxWidth: 420, marginTop: 12 }}>
              <TypeWriter words={['Machine learning anomaly detection', 'Real-time trust score engine', 'Insider threat identification', 'Context-aware access control', '5-dimensional risk analysis']} />
            </motion.p>

            <motion.div className="login-hero-stats" variants={itemVariants}>
              <div className="login-hero-stat">
                <span className="login-hero-stat-value">99.7%</span>
                <span className="login-hero-stat-label">Threat Detection Rate</span>
              </div>
              <div className="login-hero-stat">
                <span className="login-hero-stat-value">&lt;50ms</span>
                <span className="login-hero-stat-label">Avg. Response Time</span>
              </div>
              <div className="login-hero-stat">
                <span className="login-hero-stat-value">5D</span>
                <span className="login-hero-stat-label">Trust Dimensions</span>
              </div>
            </motion.div>
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
                  <motion.p className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    {error}
                  </motion.p>
                )}

                <div className="form-footer">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <Loader2 size={14} className="spinning" /> : <><span>Continue</span> <ArrowRight size={14} /></>}
                  </button>
                </div>
              </form>

              <div className="form-divider">new here?</div>

              <Link to="/register" className="btn btn-ghost" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
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
