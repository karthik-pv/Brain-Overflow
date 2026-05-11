import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase.js'

export default function FlowsPage() {
  const [flows,   setFlows]   = useState([])
  const [prompts, setPrompts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(null)
  const [err,     setErr]     = useState('')
  const [busy,    setBusy]    = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const sb = getSupabase()
    const [{ data: f }, { data: p }] = await Promise.all([
      sb.from('flows').select('*').order('created_at', { ascending: true }),
      sb.from('prompts').select('id, prompt_name').order('created_at', { ascending: true }),
    ])
    setFlows(f || [])
    setPrompts(p || [])
  }

  async function createFlow() {
    if (!form.flow_name.trim()) { setErr('Flow name required'); return }
    // Validate telegram_command: lowercase letters only, no spaces
    if (form.telegram_command && !/^[a-z0-9_]+$/.test(form.telegram_command)) {
      setErr('Telegram command must be lowercase letters, numbers, or underscores only'); return
    }
    setBusy(true); setErr('')
    const sb = getSupabase()
    const { data, error } = await sb
      .from('flows')
      .insert({
        flow_name:        form.flow_name.trim(),
        telegram_command: form.telegram_command?.trim().toLowerCase() || null,
        prompt_ids:       [],
      })
      .select().single()
    if (error) { setErr(error.message); setBusy(false); return }
    setForm(null); setBusy(false)
    setEditing({ ...data, prompt_ids: [] })
    fetchAll()
  }

  async function saveFlow() {
    if (editing.telegram_command && !/^[a-z0-9_]+$/.test(editing.telegram_command)) {
      setErr('Telegram command must be lowercase letters, numbers, or underscores only'); return
    }
    setBusy(true); setErr('')
    const sb = getSupabase()
    const { error } = await sb.from('flows')
      .update({
        flow_name:        editing.flow_name,
        telegram_command: editing.telegram_command?.trim().toLowerCase() || null,
        prompt_ids:       editing.prompt_ids,
      })
      .eq('id', editing.id)
    if (error) { setErr(error.message); setBusy(false); return }
    setBusy(false); setEditing(null); fetchAll()
  }

  async function deleteFlow(id) {
    if (!confirm('Delete this flow?')) return
    const sb = getSupabase()
    await sb.from('flows').delete().eq('id', id)
    fetchAll()
  }

  function addPromptToFlow(promptId) {
    if (editing.prompt_ids.includes(promptId)) return
    setEditing(e => ({ ...e, prompt_ids: [...e.prompt_ids, promptId] }))
  }

  function removeFromFlow(idx) {
    setEditing(e => ({ ...e, prompt_ids: e.prompt_ids.filter((_, i) => i !== idx) }))
  }

  function moveUp(idx) {
    if (idx === 0) return
    setEditing(e => {
      const ids = [...e.prompt_ids]
      ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
      return { ...e, prompt_ids: ids }
    })
  }

  function moveDown(idx) {
    setEditing(e => {
      if (idx >= e.prompt_ids.length - 1) return e
      const ids = [...e.prompt_ids]
      ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
      return { ...e, prompt_ids: ids }
    })
  }

  function promptName(id) {
    return prompts.find(p => p.id === id)?.prompt_name ?? id
  }

  // ── Edit view ─────────────────────────────────────────────────────────────────
  if (editing) {
    const unusedPrompts = prompts.filter(p => !editing.prompt_ids.includes(p.id))

    return (
      <div className="page">
        <div className="back-link" onClick={() => { setEditing(null); setErr('') }}>← Back to Flows</div>
        <h1 className="page-title">Edit Flow</h1>

        {err && <div style={{ color: 'var(--red)', marginBottom: 16 }}>{err}</div>}

        <div className="row" style={{ maxWidth: 700, marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">Flow Name</label>
            <input
              value={editing.flow_name}
              onChange={e => setEditing(f => ({ ...f, flow_name: e.target.value }))}
              placeholder="e.g. Startup Analysis"
            />
          </div>
          <div className="form-group" style={{ maxWidth: 200 }}>
            <label className="form-label">Telegram Command</label>
            <input
              value={editing.telegram_command ?? ''}
              onChange={e => setEditing(f => ({ ...f, telegram_command: e.target.value.toLowerCase() }))}
              placeholder="startup"
            />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              Send <code>/startup idea</code> in Telegram
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Current chain */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>
              Prompt Chain ({editing.prompt_ids.length} steps)
            </div>
            {editing.prompt_ids.length === 0 && (
              <div className="empty" style={{ padding: '20px 0', fontSize: 13 }}>
                Add prompts from the right panel.
              </div>
            )}
            {editing.prompt_ids.map((pid, idx) => (
              <div key={pid} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 20 }}>#{idx + 1}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{promptName(pid)}</span>
                <button className="btn btn-sm" onClick={() => moveUp(idx)}   disabled={idx === 0}>↑</button>
                <button className="btn btn-sm" onClick={() => moveDown(idx)} disabled={idx === editing.prompt_ids.length - 1}>↓</button>
                <button className="btn btn-sm btn-danger" onClick={() => removeFromFlow(idx)}>✕</button>
              </div>
            ))}
          </div>

          {/* Available prompts */}
          <div style={{ width: 260 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Available Prompts</div>
            {unusedPrompts.length === 0 && (
              <div className="empty" style={{ padding: '20px 0', fontSize: 13 }}>All prompts are in the chain.</div>
            )}
            {unusedPrompts.map(p => (
              <div key={p.id} className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 8, cursor: 'pointer' }}
                onClick={() => addPromptToFlow(p.id)}>
                <span style={{ flex: 1, fontSize: 13 }}>{p.prompt_name}</span>
                <span style={{ fontSize: 18, color: 'var(--muted)' }}>+</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={saveFlow} disabled={busy}>{busy ? 'Saving...' : 'Save Flow'}</button>
          <button className="btn" onClick={() => { setEditing(null); setErr('') }}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Flows</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ flow_name: '', telegram_command: '' }); setErr('') }}>+ New Flow</button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        Flows chain prompts together. Set a <strong>Telegram Command</strong> on each flow so users can type
        <code> /startup</code> in Telegram — or use <code>/setflow startup</code> to set it persistently.
      </div>

      {err && <div style={{ color: 'var(--red)', marginBottom: 16 }}>{err}</div>}

      {form && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 500 }}>
          <h3 style={{ marginBottom: 14 }}>New Flow</h3>
          <div className="row">
            <div className="form-group">
              <label className="form-label">Flow Name</label>
              <input
                value={form.flow_name}
                onChange={e => setForm(f => ({ ...f, flow_name: e.target.value }))}
                placeholder="e.g. Startup Analysis"
              />
            </div>
            <div className="form-group" style={{ maxWidth: 180 }}>
              <label className="form-label">Telegram Command</label>
              <input
                value={form.telegram_command ?? ''}
                onChange={e => setForm(f => ({ ...f, telegram_command: e.target.value.toLowerCase() }))}
                placeholder="startup"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={createFlow} disabled={busy}>{busy ? 'Creating...' : 'Create'}</button>
            <button className="btn" onClick={() => { setForm(null); setErr('') }}>Cancel</button>
          </div>
        </div>
      )}

      {flows.length === 0 && !form && <div className="empty">No flows yet.</div>}

      {flows.map(flow => (
        <div key={flow.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                {flow.flow_name}
                {flow.telegram_command && (
                  <code style={{ fontSize: 12, background: 'rgba(88,101,242,0.12)', color: '#818cf8', padding: '2px 6px', borderRadius: 4 }}>
                    /{flow.telegram_command}
                  </code>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {(flow.prompt_ids || []).length} prompt(s) ·{' '}
                {(flow.prompt_ids || []).map(id => promptName(id)).join(' → ') || 'no prompts'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => setEditing({ ...flow, prompt_ids: [...(flow.prompt_ids || [])] })}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => deleteFlow(flow.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
