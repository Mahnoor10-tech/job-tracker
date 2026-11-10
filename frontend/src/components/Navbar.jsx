import { BriefcaseBusiness, LayoutDashboard, LogOut, Plus, Rows3 } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="topbar">
      <NavLink className="brand" to="/dashboard">
        <span className="brand-mark"><BriefcaseBusiness size={19} /></span>
        <span>Pathway<span className="brand-dot">.</span></span>
      </NavLink>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/dashboard"><LayoutDashboard size={17} /> Overview</NavLink>
        <NavLink to="/applications"><Rows3 size={17} /> Applications</NavLink>
      </nav>
      <div className="topbar-actions">
        <button className="button button-primary button-small" onClick={() => navigate('/applications/new')}>
          <Plus size={16} /> New application
        </button>
        <div className="user-menu">
          <span className="avatar">{user?.username?.slice(0, 1).toUpperCase() || 'U'}</span>
          <span className="user-name">{user?.username}</span>
          <button className="icon-button" aria-label="Log out" title="Log out" onClick={() => { logout(); navigate('/login') }}>
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
