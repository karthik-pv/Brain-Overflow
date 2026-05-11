import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase.js'

// Minimal markdown → HTML (supports bold, italic, code, headers, lists, newlines)
function renderMarkdown(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Newlines → <br> (only outside block tags)
    .replace(/\n/g, '<br/>')
  return html
}

const ROLE_LABELS = { user: 'User', system: 'System Prompt', assistant: 'LLM' }

const CATEGORY_LABELS = {
  startup_idea: 'Startup Idea', automation: 'Automation',
  personal_tool: 'Personal Tool', dev_tool: 'Dev Tool', other: 'Other',
}
const SCORE_LABELS = {
  strong: 'Strong', weak: 'Weak',
  needs_pivot: 'Needs Pivot', needs_refinement: 'Needs Refinement',
}

export default function IdeaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [idea,     setIdea]     = useState(null)
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [err,      setErr]      = useState('')

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)
    setErr('')
    try {
      const sb = getSupabase()
      const [{ data: ideaRow, error: ie }, { data: msgs, error: me }] = await Promise.all([
        sb.from('ideas').select('*').eq('id', id).single(),
        sb.from('chat_messages').select('*').eq('idea_id', id).order('sequence_number', { ascending: true }),
      ])
      if (ie) throw ie
      if (me) throw me
      setIdea(ideaRow)
      setMessages(msgs || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page"><div className="empty">Loading...</div></div>
  if (err)     return <div className="page"><div style={{ color: 'var(--red)' }}>{err}</div></div>
  if (!idea)   return <div className="page"><div className="empty">Idea not found.</div></div>

  // Show only user (original) and assistant messages — hide system prompts by default
  const displayed = messages.filter(m => m.role !== 'system')

  return (
    <div className="page">
      <div className="back-link" onClick={() => navigate('/')}>← Back to Ideas</div>

      <div className="detail-header">
        <div className="detail-title">{idea.idea}</div>
        <div className="idea-meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className={`badge badge-status-${idea.status}`}>{idea.status}</span>
          {idea.category && <span className="badge badge-category">{CATEGORY_LABELS[idea.category] ?? idea.category}</span>}
          {idea.score    && <span className={`badge badge-score-${idea.score}`}>{SCORE_LABELS[idea.score] ?? idea.score}</span>}
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>
            {new Date(idea.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>Conversation</h2>
        <button className="btn btn-sm" onClick={fetchData}>↻ Refresh</button>
      </div>

      <div className="chat-wrap">
        {displayed.length === 0 && (
          <div className="empty">No messages yet — processing may still be in progress.</div>
        )}
        {displayed.map(msg => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            <div className="chat-msg-meta">
              <span className={`chat-msg-label label-${msg.role}`}>{ROLE_LABELS[msg.role] ?? msg.role}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                #{msg.sequence_number} · {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
            {msg.role === 'assistant'
              ? <div className="md-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.message) }} />
              : <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
            }
          </div>
        ))}
      </div>
    </div>
  )
}
