import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api'
import StatusBadge from '../components/StatusBadge'

export default function ApplicationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [history, setHistory] = useState([])
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [details, timeline, noteList] = await Promise.all([
        api.get(`/applications/${id}`),
        api.get(`/applications/${id}/history`),
        api.get(`/applications/${id}/notes`),
      ])
      setApplication(details.data)
      setHistory(timeline.data)
      setNotes(noteList.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [id])
  useEffect(() => { load() }, [load])

  async function addNote(event) {
    event.preventDefault()
    setError('')
    try {
      await api.post(`/applications/${id}/notes`, { content })
      setContent('')
      load()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  async function deleteNote(noteId) {
    await api.delete(`/notes/${noteId}`)
    load()
  }

  async function changeStatus(event) {
    try {
      await api.put(`/applications/${id}`, { status: event.target.value })
      load()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  if (error && !application) return <div className="app-shell"><div className="alert alert-error">{error}</div><Link to="/applications">Back to applications</Link></div>
  if (!application) return <div className="page-loading">Loading application…</div>
  return (
    <div className="app-shell"><Link className="back-link" to="/applications"><ArrowLeft size={16} /> All applications</Link>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="detail-hero"><div className="detail-company-avatar">{application.company.slice(0, 1).toUpperCase()}</div><div className="detail-title"><div className="eyebrow">APPLICATION DETAILS</div><h1>{application.position}</h1><p>{application.company}{application.job_url && <> · <a href={application.job_url} target="_blank" rel="noreferrer">Job listing <ArrowUpRight size={13} /></a></>}</p></div><div className="detail-actions"><Link className="button button-quiet" to={`/applications/${id}/edit`}><Pencil size={16} /> Edit</Link><button className="button button-danger-quiet" onClick={async () => { if (window.confirm('Delete this application?')) { await api.delete(`/applications/${id}`); navigate('/applications') } }}><Trash2 size={16} /> Delete</button></div></section>
      <section className="detail-meta panel"><div><span>Current status</span><div className="status-control"><StatusBadge status={application.status} /><select aria-label="Change application status" value={application.status} onChange={changeStatus}>{['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map((status) => <option key={status}>{status}</option>)}</select></div></div><div><span>Date applied</span><strong>{new Date(`${application.date_applied}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div><div><span>Salary range</span><strong>{application.salary_min == null && application.salary_max == null ? 'Not specified' : `${application.salary_min?.toLocaleString() || '—'} – ${application.salary_max?.toLocaleString() || '—'}`}</strong></div></section>
      <div className="detail-grid"><section className="panel detail-section"><div className="panel-heading"><div><h2>Status history</h2><p>Every step of this application.</p></div></div><div className="timeline">{history.map((item) => <div className="timeline-item" key={item.id}><span className="timeline-dot" /><div><strong>{item.old_status ? `${item.old_status} → ${item.new_status}` : `Application ${item.new_status.toLowerCase()}`}</strong><small>{new Date(item.changed_at).toLocaleString()}</small></div></div>)}</div></section>
        <section className="panel detail-section"><div className="panel-heading"><div><h2>Notes</h2><p>Keep the little details from getting away.</p></div><span className="note-count">{notes.length}</span></div><form className="note-form" onSubmit={addNote}><textarea value={content} maxLength={10000} required onChange={(event) => setContent(event.target.value)} placeholder="Write a note about this opportunity…" rows={3} /><button className="button button-primary button-small" disabled={!content.trim()}><Plus size={15} /> Add note</button></form><div className="notes-list">{notes.map((note) => <article className="note-card" key={note.id}><div className="note-card-top"><span><FileText size={14} /> {new Date(note.created_at).toLocaleDateString()}</span><button className="icon-button" aria-label="Delete note" onClick={() => deleteNote(note.id)}><Trash2 size={15} /></button></div><p>{note.content}</p></article>)}{!notes.length && <div className="notes-empty">No notes yet. Add one above.</div>}</div></section>
      </div>
    </div>
  )
}
