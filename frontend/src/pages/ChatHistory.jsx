import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, X, Clock, FileText, Map, Sparkles,
  ChevronDown, Trash2, Loader2, MessageSquare,
  ArrowRight, Image as ImageIcon, ListChecks
} from 'lucide-react'
import { getHistory, searchHistory, deleteSession } from '../utils/api'
import './ChatHistory.css'

export default function ChatHistory() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  // ── Fetch sessions ──────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getHistory(activeFilter, 100)
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchSessions()
    }
  }, [fetchSessions, searchQuery])

  // ── Semantic Search with debounce ───────────────────────────
  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)

    if (searchTimeout) clearTimeout(searchTimeout)

    if (!q.trim()) {
      setIsSearching(false)
      return
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true)
      setLoading(true)
      try {
        const data = await searchHistory(q, activeFilter, 20)
        setSessions(data.results || [])
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    }, 500)

    setSearchTimeout(timeout)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
  }

  // ── Delete session ──────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSession(deleteTarget.id, deleteTarget.type)
      setSessions(prev => prev.filter(s => s.id !== deleteTarget.id))
      if (expandedId === deleteTarget.id) setExpandedId(null)
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── Counts ──────────────────────────────────────────────────
  const contentCount = sessions.filter(s => s.type === 'content').length
  const campaignCount = sessions.filter(s => s.type === 'campaign').length

  // ── Helpers ─────────────────────────────────────────────────
  const formatTime = (ts) => {
    if (!ts) return ''
    try {
      const d = new Date(ts)
      const now = new Date()
      const diff = now - d
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      if (days < 7) return `${days}d ago`
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return ''
    }
  }

  const parseSteps = (stepsJson) => {
    try {
      return JSON.parse(stepsJson)
    } catch {
      return []
    }
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="history">
      {/* Header */}
      <div className="history-header">
        <h1>Chat History</h1>
        <p>Revisit your past content generations and campaign plans with semantic search.</p>
      </div>

      {/* Search */}
      <div className="history-search">
        <Search size={18} className="search-icon" />
        <input
          id="history-search-input"
          type="text"
          placeholder="Search history — try &quot;headphones campaign&quot; or &quot;social media ads&quot;..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <button className="search-clear" onClick={clearSearch} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="history-filters">
        {[
          { key: 'all', label: 'All', icon: <Clock size={14} />, count: sessions.length },
          { key: 'content', label: 'Content Studio', icon: <FileText size={14} />, count: contentCount },
          { key: 'campaign', label: 'Campaign Plans', icon: <Map size={14} />, count: campaignCount },
        ].map(f => (
          <button
            key={f.key}
            id={`filter-${f.key}`}
            className={`filter-tab ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.icon}
            {f.label}
            <span className="filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Search info */}
      {searchQuery.trim() && !loading && (
        <div className="results-info">
          <Sparkles size={14} />
          <span>
            Semantic search for <strong>"{searchQuery}"</strong> — {sessions.length} result{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="history-loading">
          <Loader2 size={28} className="spin" style={{ color: 'var(--accent)' }} />
          <p>{isSearching ? 'Searching with AI...' : 'Loading history...'}</p>
          <div className="sessions-grid">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </div>
      ) : sessions.length === 0 ? (
        /* Empty state */
        <div className="history-empty">
          <div className="empty-icon-wrap">
            <MessageSquare size={36} style={{ color: 'var(--accent2)' }} />
          </div>
          <h3>{searchQuery ? 'No results found' : 'No history yet'}</h3>
          <p>
            {searchQuery
              ? `No sessions matched "${searchQuery}". Try a different search term.`
              : 'Generate content or plan a campaign to see your history appear here.'
            }
          </p>
          {!searchQuery && (
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={() => navigate('/studio')}>
                <FileText size={16} />
                Content Studio
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/planner')}>
                <Map size={16} />
                Campaign Planner
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Sessions list */
        <div className="sessions-grid">
          {sessions.map((session, idx) => {
            const meta = session.metadata || {}
            const isContent = session.type === 'content'
            const isExpanded = expandedId === session.id
            const title = isContent ? (meta.topic || 'Untitled') : (meta.goal || 'Untitled')
            const contentType = meta.content_type || ''
            const timestamp = meta.timestamp || ''
            const preview = meta.preview || ''
            const tone = meta.tone || ''

            return (
              <div
                key={session.id}
                className={`session-card ${isExpanded ? 'expanded' : ''}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div
                  className="session-card-header"
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                >
                  {/* Type icon */}
                  <div className={`session-type-icon ${session.type}`}>
                    {isContent ? <FileText size={20} /> : <Map size={20} />}
                  </div>

                  {/* Info */}
                  <div className="session-info">
                    <div className="session-title">{title}</div>
                    <div className="session-meta">
                      <span className="meta-tag">
                        <Clock size={10} />
                        {formatTime(timestamp)}
                      </span>
                      {contentType && (
                        <span className="meta-tag">
                          {contentType.replace(/_/g, ' ')}
                        </span>
                      )}
                      {tone && (
                        <span className="meta-tag">{tone}</span>
                      )}
                      <span className="meta-tag">
                        {isContent ? 'Content' : 'Campaign'}
                      </span>
                    </div>
                    <div className="session-preview">{preview}</div>
                  </div>

                  {/* Actions */}
                  <div className="session-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="delete-btn"
                      title="Delete session"
                      onClick={() => setDeleteTarget({ id: session.id, type: session.type })}
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      className="expand-btn"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    >
                      <ChevronDown size={16} className="chevron-icon" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="session-detail">
                    {isContent ? (
                      /* Content detail */
                      <>
                        <div className="detail-section">
                          <div className="detail-label">Generated Content</div>
                          <div className="detail-content prose">
                            {session.document || ''}
                          </div>
                        </div>
                        {meta.image_url && (
                          <div className="detail-section">
                            <div className="detail-label">
                              <ImageIcon size={12} style={{ display: 'inline', marginRight: 6 }} />
                              Generated Image
                            </div>
                            <div className="detail-image">
                              <img src={meta.image_url} alt="Generated" />
                            </div>
                          </div>
                        )}
                        {meta.banner_url && (
                          <div className="detail-section">
                            <div className="detail-label">Banner</div>
                            <div className="detail-image">
                              <img src={meta.banner_url} alt="Banner" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Campaign detail */
                      <>
                        <div className="detail-section">
                          <div className="detail-label">Campaign Plan</div>
                          <div className="detail-content prose">
                            {session.document || ''}
                          </div>
                        </div>
                        {meta.steps_json && (
                          <div className="detail-section">
                            <div className="detail-label">
                              <ListChecks size={12} style={{ display: 'inline', marginRight: 6 }} />
                              Agent Steps ({meta.steps_count || 0})
                            </div>
                            <div className="detail-steps">
                              {parseSteps(meta.steps_json).map((step, i) => (
                                <div key={i} className="step-card">
                                  <div className="step-card-header">
                                    <span className="step-tool-badge">{step.tool}</span>
                                  </div>
                                  <div className="step-input">
                                    <strong>Input:</strong> {step.input}
                                  </div>
                                  <div className="step-output">
                                    <strong>Output:</strong> {step.output}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Metadata footer */}
                    <div className="detail-section" style={{ marginTop: 16 }}>
                      <div className="detail-label">Session Info</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text3)' }}>
                        <span>ID: {session.id}</span>
                        <span>Type: {session.type}</span>
                        {timestamp && <span>Created: {new Date(timestamp).toLocaleString()}</span>}
                        {session.distance != null && (
                          <span>Relevance: {(1 - session.distance).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="delete-confirm" onClick={() => setDeleteTarget(null)}>
          <div className="delete-confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Delete Session?</h3>
            <p>This will permanently remove this session from your history. This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
