import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase.js'

const BLANK = { model_name: '', model_id: '', provider: 'fireworks' }

export default function ModelsPage() {
  const [models, setModels] = useState([])
  const [form,   setForm]   = useState(null)
  const [err,    setErr]    = useState('')
  const [busy,   setBusy]   = useState(false)

  useEffect(() => { fetchModels() }, [])

  async function fetchModels() {
    const sb = getSupabase()
    const { data, error } = await sb.from('models').select('*').order('created_at', { ascending: true })
    if (error) { setErr(error.message); return }
    setModels(data || [])
  }

  async function save() {
    if (!form.model_name.trim() || !form.model_id.trim() || !form.provider.trim()) {
      setErr('All fields required'); return
    }
    setBusy(true); setErr('')
    const sb = getSupabase()
    if (form.id) {
      const { error } = await sb.from('models').update({
        model_name: form.model_name, model_id: form.model_id, provider: form.provider,
      }).eq('id', form.id)
      if (error) { setErr(error.message); setBusy(false); return }
    } else {
      const { error } = await sb.from('models').insert({
        model_name: form.model_name, model_id: form.model_id, provider: form.provider, is_active: false,
      })
      if (error) { setErr(error.message); setBusy(false); return }
    }
    setForm(null); setBusy(false); fetchModels()
  }

  async function setActive(id) {
    setBusy(true); setErr('')
    const sb = getSupabase()
    // Clear all active flags first, then set the chosen one
    const { error: clearErr } = await sb.from('models').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    if (clearErr) { setErr(clearErr.message); setBusy(false); return }
    const { error: setErr2 } = await sb.from('models').update({ is_active: true }).eq('id', id)
    if (setErr2) { setErr(setErr2.message); setBusy(false); return }
    setBusy(false); fetchModels()
  }

  async function del(id) {
    if (!confirm('Delete this model?')) return
    const sb = getSupabase()
    await sb.from('models').delete().eq('id', id)
    fetchModels()
  }

  return (
    <div className="page">
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Models</h1>
        <button className="btn btn-primary" onClick={() => { setForm(BLANK); setErr('') }}>+ Add Model</button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        The <strong>Active</strong> model is used for all LLM processing. Click <em>Set Active</em> to change it.
        Fireworks model IDs follow the format <code>accounts/fireworks/models/model-name</code>.
      </div>

      {err && <div style={{ color: 'var(--red)', marginBottom: 16 }}>{err}</div>}

      {form && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{form.id ? 'Edit Model' : 'Add Model'}</h3>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input value={form.model_name} onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))} placeholder="e.g. Llama 3.1 70B" />
          </div>
          <div className="form-group">
            <label className="form-label">Model ID (as used in provider API)</label>
            <input value={form.model_id} onChange={e => setForm(f => ({ ...f, model_id: e.target.value }))}
              placeholder="accounts/fireworks/models/llama-v3p1-70b-instruct" />
          </div>
          <div className="form-group">
            <label className="form-label">Provider</label>
            <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}>
              <option value="fireworks">Fireworks</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            <button className="btn" onClick={() => { setForm(null); setErr('') }}>Cancel</button>
          </div>
        </div>
      )}

      {models.length === 0 && !form && <div className="empty">No models configured.</div>}

      {/* Known good Fireworks model IDs */}
      {models.length === 0 && !form && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Confirmed Fireworks Model IDs</div>
          {[
            ['Llama 3.1 70B', 'accounts/fireworks/models/llama-v3p1-70b-instruct'],
            ['Llama 3.1 8B',  'accounts/fireworks/models/llama-v3p1-8b-instruct'],
            ['Mixtral 8x7B',  'accounts/fireworks/models/mixtral-8x7b-instruct'],
          ].map(([name, id]) => (
            <div key={id} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              <strong>{name}</strong>: <code>{id}</code>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        {models.length > 0 && (
          <table>
            <thead>
              <tr><th>Name</th><th>Model ID</th><th>Provider</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.model_name}</td>
                  <td><code style={{ fontSize: 11 }}>{m.model_id}</code></td>
                  <td>{m.provider}</td>
                  <td>
                    {m.is_active
                      ? <span className="badge" style={{ background: 'rgba(35,209,139,0.15)', color: 'var(--green)' }}>Active</span>
                      : <button className="btn btn-sm" onClick={() => setActive(m.id)} disabled={busy}>Set Active</button>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm" onClick={() => { setForm({ ...m }); setErr('') }}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(m.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
