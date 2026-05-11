import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function SetupScreen({ onDone }) {
  const [url,  setUrl]  = useState('')
  const [key,  setKey]  = useState('')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  async function handleConnect() {
    if (!url.trim() || !key.trim()) { setErr('Both fields are required'); return }
    setBusy(true)
    setErr('')
    try {
      const sb = createClient(url.trim(), key.trim())
      const { error } = await sb.from('ideas').select('id').limit(1)
      if (error) throw error
      localStorage.setItem('sb_url', url.trim())
      localStorage.setItem('sb_key', key.trim())
      onDone()
    } catch (e) {
      setErr(`Connection failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="setup-wrap">
      <div className="setup-card">
        <div style={{ fontSize: 28, marginBottom: 12 }}>🧠</div>
        <div className="setup-title">Brain Overflow</div>
        <div className="setup-sub">Enter your Supabase credentials to connect.</div>

        <div className="form-group">
          <label className="form-label">Supabase URL</label>
          <input
            type="text"
            placeholder="https://xyz.supabase.co"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConnect()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Publishable Key</label>
          <input
            type="password"
            placeholder="sb_publishable_..."
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConnect()}
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleConnect} disabled={busy}>
          {busy ? 'Connecting...' : 'Connect'}
        </button>

        {err && <div className="setup-error">{err}</div>}

        <div style={{ marginTop: 20, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
          Find your URL and Publishable Key in:<br />
          Supabase Dashboard → Project Settings → API
        </div>
      </div>
    </div>
  )
}
