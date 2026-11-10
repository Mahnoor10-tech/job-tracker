import { useState } from 'react'
import { BriefcaseBusiness } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api'
import { useAuth } from '../context/useAuth'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <Link className="brand auth-brand" to="/"><span className="brand-mark"><BriefcaseBusiness size={19} /></span><span>Pathway<span className="brand-dot">.</span></span></Link>
        <div className="auth-content"><div className="eyebrow">WELCOME BACK</div><h1>Your next chapter<br />starts here.</h1><p className="auth-subtitle">Sign in to pick up where you left off.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /></label>
            <button className="button button-primary button-wide" disabled={saving}>{saving ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">New to Pathway? <Link to="/register">Create an account</Link></p>
        </div>
        <div className="auth-footer">A little more focus. A lot less overwhelm.</div>
      </section>
      <aside className="auth-aside"><div className="aside-orb orb-one" /><div className="aside-orb orb-two" /><div className="aside-copy"><span className="aside-kicker">YOUR SEARCH, IN GOOD COMPANY</span><h2>Make room for<br /><em>the right opportunity.</em></h2><p>Bring every application, conversation, and next step together in one calm workspace.</p><div className="aside-proof"><div className="proof-avatars"><span>J</span><span>M</span><span>A</span><span>+</span></div><span>One organized job search at a time</span></div></div><div className="aside-pattern">✳</div></aside>
    </main>
  )
}
