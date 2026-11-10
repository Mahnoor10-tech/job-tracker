import { useEffect, useState } from 'react'
import { ArrowLeft, FileUp, Save } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api'

const initialForm = { company: '', position: '', job_url: '', salary_min: '', salary_max: '', status: 'Applied', date_applied: new Date().toISOString().slice(0, 10) }

export default function ApplicationForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploads, setUploads] = useState({ resume: '', 'cover-letter': '' })

  useEffect(() => {
    if (!editing) return
    api.get(`/applications/${id}`).then(({ data }) => setForm({
      company: data.company,
      position: data.position,
      job_url: data.job_url || '',
      salary_min: data.salary_min ?? '',
      salary_max: data.salary_max ?? '',
      status: data.status,
      date_applied: data.date_applied,
    })).catch((requestError) => setError(getErrorMessage(requestError)))
  }, [id, editing])

  function setField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function uploadFile(kind, file) {
    if (!file) return
    setError('')
    const body = new FormData()
    body.append('file', file)
    try {
      const { data } = await api.post(`/uploads/${kind}`, body)
      setUploads({ ...uploads, [kind]: data.filename })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      salary_min: form.salary_min === '' ? null : Number(form.salary_min),
      salary_max: form.salary_max === '' ? null : Number(form.salary_max),
      job_url: form.job_url || null,
    }
    try {
      const response = editing
        ? await api.put(`/applications/${id}`, payload)
        : await api.post('/applications', payload)
      navigate(`/applications/${response.data.id}`)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-shell form-page"><Link className="back-link" to={editing ? `/applications/${id}` : '/applications'}><ArrowLeft size={16} /> {editing ? 'Back to details' : 'All applications'}</Link><div className="page-heading"><div><div className="eyebrow">{editing ? 'UPDATE YOUR DETAILS' : 'A NEW POSSIBILITY'}</div><h1>{editing ? 'Edit application' : 'Add an application'}<span className="heading-period">.</span></h1><p>Save the important details while they’re fresh.</p></div></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form className="panel application-form" onSubmit={handleSubmit}><div className="form-section-title"><span>01</span><div><h2>The opportunity</h2><p>A few details to help you keep track.</p></div></div><div className="form-grid"><label>Company name <span className="required">*</span><input name="company" required maxLength={200} value={form.company} onChange={setField} placeholder="e.g. Acme Studio" /></label><label>Job title <span className="required">*</span><input name="position" required maxLength={200} value={form.position} onChange={setField} placeholder="e.g. Product Designer" /></label><label className="form-full">Job listing URL<input type="url" name="job_url" maxLength={2048} value={form.job_url} onChange={setField} placeholder="https://company.com/careers/role" /></label></div>
        <div className="form-section-title section-spaced"><span>02</span><div><h2>Timing & compensation</h2><p>Details are optional — add them when you have them.</p></div></div><div className="form-grid"><label>Date applied<input type="date" name="date_applied" required value={form.date_applied} onChange={setField} /></label><label>Status<select name="status" value={form.status} onChange={setField}>{['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map((status) => <option key={status}>{status}</option>)}</select></label><label>Minimum salary<input type="number" name="salary_min" min="0" step="1000" value={form.salary_min} onChange={setField} placeholder="e.g. 80000" /></label><label>Maximum salary<input type="number" name="salary_max" min="0" step="1000" value={form.salary_max} onChange={setField} placeholder="e.g. 110000" /></label></div>
        <div className="form-section-title section-spaced"><span>03</span><div><h2>Documents</h2><p>Keep your resume or cover letter close. PDF files up to 5 MB.</p></div></div><div className="upload-grid">{[['resume', 'Resume'], ['cover-letter', 'Cover letter']].map(([kind, label]) => <label className="upload-box" key={kind}><span className="upload-icon"><FileUp size={19} /></span><span><strong>{uploads[kind] ? `${label} uploaded` : `Upload ${label.toLowerCase()}`}</strong><small>{uploads[kind] || 'PDF only · Up to 5 MB'}</small></span><input type="file" accept="application/pdf,.pdf" onChange={(event) => uploadFile(kind, event.target.files?.[0])} /></label>)}</div><p className="upload-note">Documents are saved securely for your account. They are not attached to an individual application.</p>
        <div className="form-actions"><Link className="button button-quiet" to={editing ? `/applications/${id}` : '/applications'}>Cancel</Link><button className="button button-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : editing ? 'Save changes' : 'Save application'}</button></div>
      </form>
    </div>
  )
}
