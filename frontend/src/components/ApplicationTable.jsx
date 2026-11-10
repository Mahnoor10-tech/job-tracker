import { ArrowUpRight, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function ApplicationTable({ applications, onDelete }) {
  if (!applications.length) {
    return <div className="empty-state"><div className="empty-icon">✳</div><h3>No applications yet</h3><p>Add your first opportunity to start tracking your search.</p><Link className="button button-primary" to="/applications/new">Add an application</Link></div>
  }
  return (
    <div className="table-scroll">
      <table className="application-table">
        <thead><tr><th>Company / Role</th><th>Status</th><th>Date applied</th><th>Salary range</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td><Link className="company-cell" to={`/applications/${application.id}`}><span className="company-avatar">{application.company.slice(0, 1).toUpperCase()}</span><span><strong>{application.company}</strong><small>{application.position}</small></span></Link></td>
              <td><StatusBadge status={application.status} /></td>
              <td>{new Date(`${application.date_applied}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              <td>{application.salary_min == null && application.salary_max == null ? '—' : `${application.salary_min?.toLocaleString() || '—'} – ${application.salary_max?.toLocaleString() || '—'}`}</td>
              <td><div className="row-actions"><Link className="icon-button" aria-label={`View ${application.company}`} to={`/applications/${application.id}`}><ArrowUpRight size={17} /></Link><button className="icon-button" aria-label={`Delete ${application.company}`} onClick={() => onDelete(application.id)}><MoreHorizontal size={17} /></button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
