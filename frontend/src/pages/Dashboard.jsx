import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, Plus, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api, { getErrorMessage } from '../api'
import ApplicationTable from '../components/ApplicationTable'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [summary, chart, recent] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/applications-per-week'),
        api.get('/applications?limit=5&sort_by=date_applied'),
      ])
      setStats(summary.data)
      setWeekly(chart.data.map((item) => ({ ...item, week: new Date(`${item.week_start}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })))
      setApplications(recent.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [])
  useEffect(() => { load() }, [load])

  async function removeApplication(id) {
    if (!window.confirm('Delete this application? This cannot be undone.')) return
    await api.delete(`/applications/${id}`)
    load()
  }

  return (
    <div className="app-shell">
      <div className="page-heading"><div><div className="eyebrow">YOUR JOB SEARCH</div><h1>Good morning<span className="heading-period">.</span></h1><p>Here’s a little clarity on where things stand.</p></div><Link className="button button-primary" to="/applications/new"><Plus size={17} /> Add application</Link></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="stats-grid">
        <StatCard label="Applications" value={stats?.total_applications ?? '—'} caption="Opportunities in your pipeline" icon={BriefcaseBusiness} tone="blue" />
        <StatCard label="Interviews" value={stats?.interviews ?? '—'} caption="Conversations in progress" icon={CalendarDays} tone="amber" />
        <StatCard label="Offers" value={stats?.offers ?? '—'} caption="Reasons to celebrate" icon={Trophy} tone="green" />
        <StatCard label="Responses" value={stats ? stats.interviews + stats.offers + stats.rejected : '—'} caption="Companies have responded" icon={CheckCircle2} tone="violet" />
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel"><div className="panel-heading"><div><h2>Application activity</h2><p>A steady search is a strong search.</p></div><span className="period-label"><Clock3 size={14} /> Last 12 weeks</span></div>
          {weekly.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={weekly} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}><CartesianGrid stroke="#edf0f2" vertical={false} /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8a939e', fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8a939e', fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8ebee', boxShadow: '0 8px 24px #17243312' }} /><Line type="monotone" dataKey="count" name="Applications" stroke="#2867e8" strokeWidth={3} dot={{ r: 4, fill: '#2867e8', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div> : <div className="chart-empty">Add an application to see your weekly progress.</div>}
        </article>
        <article className="panel momentum-panel"><div className="panel-heading"><div><h2>Keep your momentum</h2><p>One thoughtful step at a time.</p></div></div><div className="momentum-art"><div className="momentum-ring ring-a" /><div className="momentum-ring ring-b" /><div className="momentum-star">✳</div><div className="momentum-note"><span>YOUR NEXT MOVE</span><strong>Follow up with a little confidence.</strong><Link to="/applications"><span>Review your list</span><ArrowRight size={15} /></Link></div></div><div className="momentum-foot"><span className="pulse-dot" /> Your search is moving forward</div></article>
      </section>
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recently added</h2><p>Your latest opportunities, all in one place.</p></div><Link className="text-link" to="/applications">View all <ArrowRight size={15} /></Link></div><ApplicationTable applications={applications} onDelete={removeApplication} /></section>
    </div>
  )
}
