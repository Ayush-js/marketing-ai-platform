import { useNavigate } from 'react-router-dom'
import { FileText, Map, Zap, ArrowRight, TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import './Dashboard.css'

const STATS = [
  { icon: FileText, label: 'Content Types', value: '5', sub: 'Ad copy, blogs, social & more', color: 'var(--accent2)' },
  { icon: Zap, label: 'LLM Engine', value: 'Groq', sub: 'LLaMA 3.3 70B Versatile', color: 'var(--cyan)' },
  { icon: Map, label: 'Agent Tools', value: '6', sub: 'Budget, channels, ROI & more', color: 'var(--green)' },
  { icon: Target, label: 'Image Gen', value: 'Free', sub: 'Pollinations.ai', color: 'var(--amber)' },
]

const TECH_STACK = [
  { layer: 'Frontend', items: ['React 18 + Vite', 'React Router', 'Axios', 'React Markdown'], color: 'var(--accent)' },
  { layer: 'GenAI', items: ['Groq API', 'LLaMA 3.3 70B', 'Pollinations.ai', 'ChromaDB'], color: 'var(--cyan)' },
  { layer: 'Agentic AI', items: ['LangChain', 'CrewAI', 'Tool Calling', '6 Mock Tools'], color: 'var(--green)' },
  { layer: 'Backend', items: ['FastAPI', 'Uvicorn', 'Pydantic', 'Python 3.11'], color: 'var(--amber)' },
  { layer: 'DevOps', items: ['Docker', 'Docker Compose', 'GitHub Actions', 'Multi-stage build'], color: '#f472b6' },
]

export default function Dashboard() {
  const nav = useNavigate()
  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>Platform Dashboard</h1>
        <p>Overview of the Marketing AI Platform capabilities and tech stack</p>
      </div>

      <div className="stats-grid">
        {STATS.map((s, i) => (
          <div key={i} className="stat-card card">
            <div className="stat-icon" style={{color: s.color, background: s.color + '18'}}>
              <s.icon size={20} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-actions">
        <div className="action-card card" onClick={() => nav('/studio')}>
          <div className="action-content">
            <h3><FileText size={18}/> Content Studio</h3>
            <p>Generate text content and AI images for your marketing campaigns using Groq LLaMA 3.3</p>
          </div>
          <ArrowRight size={18} className="action-arrow"/>
        </div>
        <div className="action-card card" onClick={() => nav('/planner')}>
          <div className="action-content">
            <h3><Map size={18}/> Campaign Planner</h3>
            <p>Use the Agentic AI to build complete marketing execution plans from your content</p>
          </div>
          <ArrowRight size={18} className="action-arrow"/>
        </div>
      </div>

      <div className="tech-section">
        <h2>Tech Stack</h2>
        <div className="tech-grid">
          {TECH_STACK.map((layer, i) => (
            <div key={i} className="tech-layer card card-sm">
              <div className="tech-layer-header" style={{borderColor: layer.color}}>
                <span style={{color: layer.color, fontWeight:700, fontSize:13, fontFamily:'var(--font-display)'}}>{layer.layer}</span>
              </div>
              <ul>
                {layer.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="pipeline-section card">
        <h2>CI/CD Pipeline</h2>
        <div className="pipeline-steps">
          {[
            { label: 'Push Code', sub: 'git push origin main', icon: '📤' },
            { label: 'Lint & Test', sub: 'ESLint + Pytest', icon: '✅' },
            { label: 'Docker Build', sub: 'Multi-stage builds', icon: '🐳' },
            { label: 'Push Image', sub: 'Docker Hub registry', icon: '📦' },
            { label: 'Deploy', sub: 'Docker Compose / K8s', icon: '🚀' },
          ].map((s, i) => (
            <div key={i} className="pipe-step">
              <span className="pipe-icon">{s.icon}</span>
              <strong>{s.label}</strong>
              <span>{s.sub}</span>
              {i < 4 && <span className="pipe-arrow">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
