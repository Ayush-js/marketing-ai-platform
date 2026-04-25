import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Loader2, Bot, Wrench, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { createCampaignPlan } from '../utils/api'
import './CampaignPlanner.css'

const EXAMPLE_GOALS = [
  'Launch a new product campaign targeting Gen Z on social media',
  'Analyze competitor ads and create a counter-campaign strategy',
  'Build a 30-day email nurture sequence for new leads',
  'Create a viral social media campaign with influencer partnerships',
  'Plan a seasonal sale campaign across all digital channels',
]

const TOOL_ICONS = {
  check_budget_availability: '💰',
  get_channel_availability: '📡',
  schedule_campaign_task: '📅',
  analyze_competitor_ads: '🔍',
  get_audience_insights: '👥',
  estimate_campaign_roi: '📈',
}

export default function CampaignPlanner() {
  const [goal, setGoal] = useState('')
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('ad_copy')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('lastContent')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setContent(parsed.text_content || '')
        setContentType(parsed.content_type || 'ad_copy')
        if (parsed.topic) setGoal(`Launch campaign for: ${parsed.topic}`)
      } catch {}
    }
  }, [])

  const handlePlan = async () => {
    if (!goal.trim() || !content.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await createCampaignPlan({
        goal, generated_content: content, content_type: contentType
      })
      setResult(data)
    } catch(e) {
      setError(e.response?.data?.detail || e.message || 'Planning failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="planner-page">
      <div className="planner-container">
        <div className="planner-header">
          <div className="planner-title-row">
            <div className="planner-icon"><Bot size={24} /></div>
            <div>
              <h1>Campaign Planner</h1>
              <p>Your Agentic AI uses CrewAI + LangChain to autonomously plan your entire campaign</p>
            </div>
          </div>
        </div>

        <div className="planner-grid">
          <div className="planner-inputs">
            <div className="card">
              <h2>Campaign Goal</h2>
              <div className="form-group" style={{marginTop:14}}>
                <label>What do you want to achieve?</label>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Launch a social media campaign for wireless headphones targeting Gen Z"
                  rows={3}
                />
                <div className="examples-row" style={{marginTop:8}}>
                  {EXAMPLE_GOALS.slice(0,2).map(g => (
                    <button key={g} className="example-chip" onClick={() => setGoal(g)}>
                      {g.slice(0,45)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{marginTop:16}}>
                <label>Generated Content (from Content Studio)</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste your generated marketing content here, or use the Content Studio first..."
                  rows={6}
                />
              </div>

              <div className="form-group" style={{marginTop:12}}>
                <label>Content Type</label>
                <select value={contentType} onChange={e => setContentType(e.target.value)}>
                  <option value="ad_copy">Ad Copy</option>
                  <option value="social_post">Social Post</option>
                  <option value="blog_post">Blog Post</option>
                  <option value="email_campaign">Email Campaign</option>
                  <option value="tagline">Tagline</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{width:'100%', justifyContent:'center', marginTop:16, padding:'12px'}}
                onClick={handlePlan}
                disabled={loading || !goal.trim() || !content.trim()}
              >
                {loading
                  ? <><Loader2 size={16} className="spin" /> Agent is planning...</>
                  : <><Sparkles size={16} /> Run Planner Agent</>
                }
              </button>
              {error && <div className="error-box" style={{marginTop:12}}>{error}</div>}
            </div>
          </div>

          <div className="planner-output">
            {!result && !loading && (
              <div className="empty-state card">
                <Bot size={40} style={{color:'var(--text3)'}} />
                <h3>Agent ready</h3>
                <p>Set your goal and content, then run the planner agent</p>
                <div className="agent-features">
                  {['Checks budget & channels','Analyzes competitors','Schedules tasks','Estimates ROI'].map(f => (
                    <span key={f} className="badge badge-accent" style={{margin:'3px'}}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="agent-loading card">
                <div className="agent-pulse"><Bot size={28} /></div>
                <h3>Agent is working...</h3>
                <p>The agent is using tools to build your campaign plan</p>
                <div className="loading-tools">
                  {Object.entries(TOOL_ICONS).map(([k,v]) => (
                    <div key={k} className="loading-tool">
                      <span>{v}</span>
                      <span>{k.replace(/_/g,' ')}</span>
                    </div>
                  ))}
                </div>
                <p className="loading-note">This may take 30–60 seconds</p>
              </div>
            )}

            {result && (
              <div className="result-area slide-up">
                {result.steps?.length > 0 && (
                  <div className="card agent-steps">
                    <h3><Wrench size={15}/> Agent Tool Usage ({result.steps.length} steps)</h3>
                    <div className="steps-list">
                      {result.steps.map((step, i) => (
                        <div key={i} className="step-item">
                          <div
                            className="step-header"
                            onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                          >
                            <span className="step-icon">{TOOL_ICONS[step.tool] || '🔧'}</span>
                            <span className="step-name">{step.tool.replace(/_/g,' ')}</span>
                            <CheckCircle size={13} style={{color:'var(--green)', marginLeft:'auto'}} />
                            {expandedStep === i ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                          </div>
                          {expandedStep === i && (
                            <div className="step-detail">
                              <div className="step-io">
                                <strong>Input:</strong>
                                <pre>{step.input}</pre>
                              </div>
                              <div className="step-io">
                                <strong>Output:</strong>
                                <pre>{step.output}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card plan-output">
                  <div className="plan-output-header">
                    <Bot size={18} style={{color:'var(--accent2)'}} />
                    <h3>Execution Plan</h3>
                    <span className="badge badge-green">Complete</span>
                  </div>
                  <hr className="divider" />
                  <div className="prose">
                    <ReactMarkdown>{result.plan}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
