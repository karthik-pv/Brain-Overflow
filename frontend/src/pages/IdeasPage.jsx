import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase.js'

const STATUS_LABELS = {
  recorded:   'Recorded',
  processing: 'Processing',
  completed:  'Completed',
  failed:     'Failed',
}

const CATEGORY_LABELS = {
  startup_idea:  'Startup Idea',
  automation:    'Automation',
  personal_tool: 'Personal Tool',
  dev_tool:      'Dev Tool',
  other:         'Other',
}

const SCORE_LABELS = {
  strong:            'Strong',
  weak:              'Weak',
  needs_pivot:       'Needs Pivot',
  needs_refinement:  'Needs Refinement',
}

function formatDate(ts) {
  return new Date(ts).toLocaleString()
}

export default function IdeasPage() {
  const [ideas,   setIdeas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchIdeas() }, [])

  async function fetchIdeas() {
    setLoading(true)
    setErr('')
    try {
      const sb = getSupabase()
      const { data, error } = await sb
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setIdeas(data || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteIdea(e, id) {
    e.stopPropagation()
    if (!confirm('Delete this idea and all its messages?')) return
    const sb = getSupabase()
    await sb.from('ideas').delete().eq('id', id)
    fetchIdeas()
  }

  if (loading) return <div className="page"><div className="empty">Loading ideas...</div></div>

  return (
    <div className="page">
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Ideas</h1>
        <button className="btn" onClick={fetchIdeas}>↻ Refresh</button>
      </div>

      {err && <div style={{ color: 'var(--red)', marginBottom: 16 }}>{err}</div>}

      {ideas.length === 0 && (
        <div className="empty">
          No ideas yet. Send a message to your Telegram bot to get started!
        </div>
      )}

      <div className="ideas-grid">
        {ideas.map(idea => (
          <div key={idea.id} className="idea-card" onClick={() => navigate(`/idea/${idea.id}`)}>
            <div className="idea-text">{idea.idea}</div>
            <div className="idea-meta">
              <span className={`badge badge-status-${idea.status}`}>
                {STATUS_LABELS[idea.status] ?? idea.status}
              </span>
              {idea.category && (
                <span className="badge badge-category">
                  {CATEGORY_LABELS[idea.category] ?? idea.category}
                </span>
              )}
              {idea.score && (
                <span className={`badge badge-score-${idea.score}`}>
                  {SCORE_LABELS[idea.score] ?? idea.score}
                </span>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{formatDate(idea.created_at)}</span>
              <button className="btn btn-sm btn-danger" onClick={e => deleteIdea(e, idea.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
