const statusClass = {
  Applied: 'status-applied',
  Interview: 'status-interview',
  Offer: 'status-offer',
  Rejected: 'status-rejected',
  Withdrawn: 'status-withdrawn',
}

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${statusClass[status] || ''}`}>{status}</span>
}
