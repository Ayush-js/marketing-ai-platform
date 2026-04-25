import { NavLink } from 'react-router-dom'
import { Zap, FileText, Map, LayoutDashboard } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        <Zap size={20} className="logo-icon" />
        <span>MarketMind<em>AI</em></span>
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/studio" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={15} />
          Content Studio
        </NavLink>
        <NavLink to="/planner" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Map size={15} />
          Campaign Planner
        </NavLink>
        <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={15} />
          Dashboard
        </NavLink>
      </div>
    </nav>
  )
}
