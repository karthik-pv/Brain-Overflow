import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase.js'

const BLANK = { prompt_name: '', prompt: '' }

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([])
  const [form,    setForm]    = useState(null) // null = closed, {} = new, {id,...} = editing
  const [err,     setErr]     = useState('')
  const [busy,    setBusy]    = useState(false)

  useEffect(() => { fetchPrompts() }, [])

  async function fetchPrompts() {
    const sb = getSupabase()
    const { data, error } = await sb.from('prompts').select('*').order('created_at', { ascending: true })
    if (error) { setErr(error.message); return }
    setPrompts(data || [])
  }

  async function save() {
    if (!form.prompt_name.trim() || !form.prompt.trim()) { setErr('Name and prompt text are required'); return }
    setBusy(true)
    setErr('')
    const sb = getSupabase()
    if (form.id) {
      const { error } = await sb.from('prompts').update({ prompt_name: form.prompt_name, prompt: form.prompt }).eq('id', form.id)
      if (error) { setErr(error.message); setBusy(false); return }
    } else {
      const { error } = await sb.from('prompts').insert({ prompt_name: form.prompt_name, prompt: form.prompt })
      if (error) { setErr(error.message); setBusy(false); return }
    }
    setForm(null)
    setBusy(false)
    fetchPrompts()
  }

  async function del(id) {
    if (!confirm('Delete this prompt? It will break any flows using it.')) return
    const sb = getSupabase()
    const { error } = await sb.from('prompts').delete().eq('id', id)
    if (error) { setErr(error.message); return }
    fetchPrompts()
  }

  return (
    <div className="page">
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Prompts</h1>
        <button className="btn btn-primary" onClick={() => { setForm(BLANK); setErr('') }}>+ New Prompt</button>
      </div>

      {err && <div style={{ color: 'var(--red)', marginBottom: 16 }}>{err}</div>}

      {form && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{form.id ? 'Edit Prompt' : 'New Prompt'}</h3>
          <div className="form-group">
            <label className="form-label">Prompt Name</label>
            <input
              value={form.prompt_name}
              onChange={e => setForm(f => ({ ...f, prompt_name: e.target.value }))}
              placeholder="e.g. Categorize & Score"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Prompt Text</label>
            <textarea
              style={{ minHeight: 180 }}
              value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              placeholder="You are an expert evaluator. Analyze the following idea and provide a detailed assessment..."
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            <button className="btn" onClick={() => { setForm(null); setErr('') }}>Cancel</button>
          </div>
        </div>
      )}

      {prompts.length === 0 && !form && (
        <div className="empty">No prompts yet. Create your first prompt to get started.</div>
      )}

      {prompts.map(p => (
        <div key={p.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.prompt_name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>ID: {p.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => { setForm({ ...p }); setErr('') }}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => del(p.id)}>Delete</button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'hidden' }}>
            {p.prompt}
          </div>
        </div>
      ))}
    </div>
  )
}
