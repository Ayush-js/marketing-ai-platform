import { useNavigate } from 'react-router-dom'
import { Zap, FileText, Map, ArrowRight, Sparkles, Bot, Cpu } from 'lucide-react'
import './Home.css'

export default function Home() {
  const nav = useNavigate()
  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-badge badge badge-accent">
          <Sparkles size={12} /> Powered by Groq + Pollinations.ai
        </div>
        <h1 className="hero-title">
          Marketing Intelligence<br />
          <span className="hero-accent">Amplified by AI</span>
        </h1>
        <p className="hero-sub">
          Generate world-class marketing content with GenAI, then let your Agentic
          AI planner orchestrate the entire campaign — automatically.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => nav('/studio')}>
            Start Creating <ArrowRight size={16} />
          </button>
          <button className="btn btn-ghost" onClick={() => nav('/dashboard')}>
            View Dashboard
          </button>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card card" onClick={() => nav('/studio')}>
          <div className="feature-icon" style={{background:'rgba(124,106,247,0.15)', color:'var(--accent2)'}}>
            <FileText size={22} />
          </div>
          <h3>Content Studio</h3>
          <p>Generate ad copy, taglines, blog posts, social posts & emails — with AI images — in seconds.</p>
          <span className="feature-tag">GenAI · Groq LLaMA 3.3</span>
        </div>
        <div className="feature-card card" onClick={() => nav('/planner')}>
          <div className="feature-icon" style={{background:'rgba(6,182,212,0.15)', color:'var(--cyan)'}}>
            <Bot size={22} />
          </div>
          <h3>Campaign Planner</h3>
          <p>Your AI agent autonomously decomposes goals, checks channels & budgets, then builds a full execution plan.</p>
          <span className="feature-tag">Agentic AI · CrewAI + LangChain</span>
        </div>
        <div className="feature-card card">
          <div className="feature-icon" style={{background:'rgba(34,197,94,0.15)', color:'var(--green)'}}>
            <Cpu size={22} />
          </div>
          <h3>DevOps Ready</h3>
          <p>Fully Dockerized with multi-stage builds, Docker Compose orchestration, and GitHub Actions CI/CD.</p>
          <span className="feature-tag">Docker · GitHub Actions</span>
        </div>
      </div>

      <div className="home-flow card">
        <h2>How It Works</h2>
        <div className="flow-steps">
          {[
            { n:'01', title:'Enter Topic', desc:'Give a product, idea, or marketing goal' },
            { n:'02', title:'Generate Content', desc:'GenAI creates text + images using Groq LLaMA 3.3' },
            { n:'03', title:'Plan Campaign', desc:'Agentic AI builds a full execution schedule' },
            { n:'04', title:'Launch', desc:'Follow the structured plan across all channels' },
          ].map((s, i) => (
            <div key={i} className="flow-step">
              <span className="step-num">{s.n}</span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.desc}</p>
              </div>
              {i < 3 && <ArrowRight size={16} className="step-arrow" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
