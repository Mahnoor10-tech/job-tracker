import { useState } from 'react'
import { BriefcaseBusiness } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api'
import { useAuth } from '../context/useAuth'

export default function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
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
        <div className="auth-content"><div className="eyebrow">START YOUR SEARCH</div><h1>Good things<br />are in motion.</h1><p className="auth-subtitle">Create your account and keep every opportunity in reach.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <label>Your name<input autoComplete="name" required maxLength={80} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Alex Morgan" /></label>
            <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label>
            <button className="button button-primary button-wide" disabled={saving}>{saving ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
        <div className="auth-footer">A little more focus. A lot less overwhelm.</div>
      </section>
      <aside className="auth-aside"><div className="aside-orb orb-one" /><div className="aside-orb orb-two" /><div className="aside-copy"><span className="aside-kicker">A BETTER WAY FORWARD</span><h2>Small steps.<br /><em>Big possibilities.</em></h2><p>Track progress, remember the details, and make your next move with confidence.</p><div className="aside-proof"><div className="proof-avatars"><span>J</span><span>M</span><span>A</span><span>+</span></div><span>Your career, thoughtfully organized</span></div></div><div className="aside-pattern">✳</div></aside>
    </main>
  )
}
