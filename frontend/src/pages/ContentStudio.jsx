import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Loader2, Sparkles, Image, Copy, Check, ArrowRight, RefreshCw } from 'lucide-react'
import { generateContent, getContentTypes, getTones } from '../utils/api'
import './ContentStudio.css'

const TONES = ['energetic','professional','playful','luxury','urgent','inspirational','friendly','authoritative']
const CONTENT_LABELS = {
  ad_copy: 'Ad Copy', tagline: 'Taglines', blog_post: 'Blog Post',
  social_post: 'Social Posts', email_campaign: 'Email Campaign'
}
const EXAMPLES = [
  'Wireless noise-cancelling headphones for students',
  'Organic skincare line for working professionals',
  'AI productivity app for remote teams',
  'Premium coffee subscription service',
  'Sustainable running shoes for Gen Z',
]

export default function ContentStudio() {
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState('ad_copy')
  const [tone, setTone] = useState('energetic')
  const [includeImage, setIncludeImage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const nav = useNavigate()

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true); setError(null); setResult(null); setImgLoaded(false)
    try {
      const data = await generateContent({ topic, content_type: contentType, tone, include_image: includeImage })
      setResult(data)
      // Save to session for planner
      sessionStorage.setItem('lastContent', JSON.stringify(data))
    } catch(e) {
      setError(e.response?.data?.detail || e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.text_content)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handlePlanCampaign = () => {
    nav('/planner')
  }

  return (
    <div className="studio">
      <div className="studio-left">
        <div className="studio-header">
          <h1>Content Studio</h1>
          <p>Generate professional marketing content powered by Groq LLaMA 3.3</p>
        </div>

        <div className="studio-form card">
          <div className="form-group">
            <label>Topic / Product</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Wireless headphones for Gen Z students"
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
            <div className="examples-row">
              {EXAMPLES.slice(0,3).map(ex => (
                <button key={ex} className="example-chip" onClick={() => setTopic(ex)}>{ex}</button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Content Type</label>
              <select value={contentType} onChange={e => setContentType(e.target.value)}>
                {Object.entries(CONTENT_LABELS).map(([k,v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)}>
                {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="toggle-row">
            <label htmlFor="img-toggle" style={{textTransform:'none', fontSize:'14px', color:'var(--text2)', cursor:'pointer'}}>
              Include AI image (via Pollinations.ai)
            </label>
            <div className="toggle-wrap">
              <input
                type="checkbox" id="img-toggle"
                checked={includeImage}
                onChange={e => setIncludeImage(e.target.checked)}
              />
              <span className="toggle-track"></span>
            </div>
          </div>

          <button
            className="btn btn-primary generate-btn"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
          >
            {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Sparkles size={16} /> Generate Content</>}
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>
      </div>

      <div className="studio-right">
        {!result && !loading && (
          <div className="empty-state card">
            <Sparkles size={40} className="empty-icon" />
            <h3>Your content will appear here</h3>
            <p>Fill in the form and click Generate to create marketing content</p>
          </div>
        )}

        {loading && (
          <div className="loading-state card">
            <Loader2 size={32} className="spin" style={{color:'var(--accent)'}} />
            <p>Generating content with Groq LLaMA 3.3...</p>
            <span className="text3">This may take 10–20 seconds</span>
          </div>
        )}

        {result && (
          <div className="result-panel slide-up">
            <div className="result-header card card-sm">
              <div>
                <span className="badge badge-accent">{CONTENT_LABELS[result.content_type]}</span>
                <span className="badge badge-green" style={{marginLeft:8}}>{tone}</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:'13px'}} onClick={handleCopy}>
                  {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}
                </button>
                <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:'13px'}} onClick={handleGenerate}>
                  <RefreshCw size={14}/> Regenerate
                </button>
              </div>
            </div>

            {result.image_url && (
              <div className="result-image card card-sm">
                {!imgLoaded && <div className="skeleton" style={{height:220, borderRadius:8}} />}
                <img
                  src={result.image_url}
                  alt="Generated marketing visual"
                  onLoad={() => setImgLoaded(true)}
                  style={{display: imgLoaded ? 'block' : 'none', borderRadius:8, width:'100%'}}
                />
                {result.image_prompt && (
                  <p className="img-caption"><Image size={12}/> {result.image_prompt.slice(0,120)}...</p>
                )}
              </div>
            )}

            <div className="result-content card">
              <div className="prose">
                <ReactMarkdown>{result.text_content}</ReactMarkdown>
              </div>
            </div>

            <button className="btn btn-primary plan-btn" onClick={handlePlanCampaign}>
              Plan Campaign with AI Agent <ArrowRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
