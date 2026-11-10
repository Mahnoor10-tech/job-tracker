import { useEffect, useState } from 'react'
import { ArrowDownUp, Plus, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api'
import ApplicationTable from '../components/ApplicationTable'

const statuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn']

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('date_applied')
  const [descending, setDescending] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 10

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/applications', {
          params: { search: search || undefined, status: status || undefined, sort_by: sortBy, descending, offset, limit: limit + 1 },
        })
        setHasMore(data.length > limit)
        setApplications(data.slice(0, limit))
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => clearTimeout(timer)
  }, [search, status, sortBy, descending, offset])

  async function removeApplication(id) {
    if (!window.confirm('Delete this application? This cannot be undone.')) return
    await api.delete(`/applications/${id}`)
    setOffset(0)
    const { data } = await api.get('/applications', { params: { limit, search: search || undefined, status: status || undefined, sort_by: sortBy, descending } })
    setApplications(data)
  }

  function changeFilter(setter, value) {
    setter(value)
    setOffset(0)
  }

  return (
    <div className="app-shell"><div className="page-heading"><div><div className="eyebrow">THE OPPORTUNITIES</div><h1>Applications<span className="heading-period">.</span></h1><p>Keep the details close and the next step clear.</p></div><Link className="button button-primary" to="/applications/new"><Plus size={17} /> Add application</Link></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="panel applications-panel"><div className="filter-toolbar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} placeholder="Search companies or roles" aria-label="Search companies or roles" />{search && <button className="icon-button" aria-label="Clear search" onClick={() => changeFilter(setSearch, '')}><X size={15} /></button>}</label><select aria-label="Filter by status" value={status} onChange={(event) => changeFilter(setStatus, event.target.value)}><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Sort applications" value={sortBy} onChange={(event) => changeFilter(setSortBy, event.target.value)}><option value="date_applied">Date applied</option><option value="company">Company</option><option value="position">Role</option><option value="status">Status</option></select><button className="button button-quiet" onClick={() => setDescending(!descending)}><ArrowDownUp size={16} /> {descending ? 'Newest' : 'Oldest'}</button></div>
        {loading ? <div className="page-loading">Loading your applications…</div> : <ApplicationTable applications={applications} onDelete={removeApplication} />}
        <div className="pagination"><span>{applications.length ? `Showing ${offset + 1}–${offset + applications.length}` : 'No results'}{hasMore ? ' and more' : ''}</span><div><button className="button button-quiet" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</button><button className="button button-quiet" disabled={!hasMore} onClick={() => setOffset(offset + limit)}>Next</button></div></div>
      </section>
    </div>
  )
}
