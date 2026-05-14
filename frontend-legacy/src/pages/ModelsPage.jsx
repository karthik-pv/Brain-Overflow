import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, PencilSimple, Trash, Check, X, Circuitry,
  Star, Info
} from '@phosphor-icons/react'
import { getSupabase } from '../lib/supabase.js'

const BLANK = { model_name: '', model_id: '', provider: 'fireworks' }

const PROVIDER_CONFIG = {
  fireworks: {
    color: '#00d4ff',
    name: 'Fireworks AI',
    description: 'Serverless inference for open-source models',
    modelFormat: 'accounts/fireworks/models/{model-name}',
    examples: [
      { name: 'Llama 3.1 70B', id: 'accounts/fireworks/models/llama-v3p1-70b-instruct' },
      { name: 'Llama 3.1 8B', id: 'accounts/fireworks/models/llama-v3p1-8b-instruct' },
      { name: 'Mixtral 8x7B', id: 'accounts/fireworks/models/mixtral-8x7b-instruct' },
    ],
    docs: 'https://fireworks.ai/models',
  },
  openai: {
    color: '#10a37f',
    name: 'OpenAI',
    description: 'GPT models via OpenAI API',
    modelFormat: '{model-name}',
    examples: [
      { name: 'GPT-4o', id: 'gpt-4o' },
      { name: 'GPT-4o Mini', id: 'gpt-4o-mini' },
      { name: 'GPT-3.5 Turbo', id: 'gpt-3.5-turbo' },
    ],
    docs: 'https://platform.openai.com/docs/models',
  },
  anthropic: {
    color: '#d4a574',
    name: 'Anthropic',
    description: 'Claude models via Anthropic API',
    modelFormat: '{model-name}',
    examples: [
      { name: 'Claude 3.5 Sonnet', id: 'claude-3-5-sonnet-20241022' },
      { name: 'Claude 3 Haiku', id: 'claude-3-haiku-20240307' },
    ],
    docs: 'https://docs.anthropic.com/en/docs/about-claude/models',
  },
}

export default function ModelsPage() {
  const [models, setModels] = useState([])
  const [form, setForm] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

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

  const currentProvider = form ? PROVIDER_CONFIG[form.provider] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] pt-24 px-4 md:px-8 pb-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Circuitry className="w-6 h-6 text-[#00d4ff]" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Models</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setForm(BLANK); setErr('') }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass text-sm hover:border-[rgba(0,212,255,0.2)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </motion.button>
        </div>

        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          The <span className="text-[#2ed573]">Active</span> model is used for all LLM processing.
          Choose a provider below to see the correct model ID format.
        </p>

        {err && (
          <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-status-red text-[#ff4757] text-sm">
            <X className="w-4 h-4" />
            {err}
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="liquid-glass rounded-2xl p-6 mb-8"
            >
              <h2 className="text-lg font-semibold mb-6">{form.id ? 'Edit Model' : 'Add Model'}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                    Display Name
                  </label>
                  <input
                    value={form.model_name}
                    onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))}
                    placeholder="e.g. Llama 3.1 70B"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm focus:border-[#00d4ff] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                    Provider
                  </label>
                  <select
                    value={form.provider}
                    onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm focus:border-[#00d4ff] outline-none transition-colors appearance-none cursor-pointer"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="fireworks" style={{ background: '#0a0f1e', color: '#e8ecf1' }}>Fireworks AI</option>
                    <option value="openai" style={{ background: '#0a0f1e', color: '#e8ecf1' }}>OpenAI</option>
                    <option value="anthropic" style={{ background: '#0a0f1e', color: '#e8ecf1' }}>Anthropic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                    Model ID
                  </label>
                  <input
                    value={form.model_id}
                    onChange={e => setForm(f => ({ ...f, model_id: e.target.value }))}
                    placeholder={currentProvider?.modelFormat || 'model-id'}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm focus:border-[#00d4ff] outline-none transition-colors"
                  />
                </div>

                {/* Provider-specific instructions */}
                {currentProvider && (
                  <div className="rounded-xl p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4" style={{ color: currentProvider.color }} />
                      <span className="text-sm font-medium">{currentProvider.name}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                        {currentProvider.description}
                      </span>
                    </div>
                    <p className="text-xs font-mono mb-3" style={{ color: 'var(--color-text-muted)' }}>
                      Format: <code style={{ color: currentProvider.color }}>{currentProvider.modelFormat}</code>
                    </p>
                    <div className="space-y-2">
                      {currentProvider.examples.map(ex => (
                        <div key={ex.id} className="flex items-center justify-between text-sm">
                          <span>{ex.name}</span>
                          <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: `${currentProvider.color}15`, color: currentProvider.color }}>
                            {ex.id}
                          </code>
                        </div>
                      ))}
                    </div>
                    <a
                      href={currentProvider.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs mt-3 inline-block hover:underline"
                      style={{ color: currentProvider.color }}
                    >
                      View all {currentProvider.name} models →
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={save}
                  disabled={busy}
                  className="px-6 py-2.5 rounded-xl bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] text-sm font-medium hover:bg-[rgba(0,212,255,0.25)] disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Saving...' : 'Save'}
                </motion.button>
                <button
                  onClick={() => { setForm(null); setErr('') }}
                  className="px-6 py-2.5 rounded-xl text-sm hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {models.length === 0 && !form && (
          <div className="text-center py-20">
            <Circuitry className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
            <p className="text-lg mb-2">No models configured</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Add your first LLM model to get started
            </p>
          </div>
        )}

        {/* Models list */}
        <div className="space-y-3">
          <AnimatePresence>
            {models.map((m, index) => {
              const providerConfig = PROVIDER_CONFIG[m.provider]
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="liquid-glass rounded-xl p-5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{m.model_name}</h3>
                        <span
                          className="text-xs font-mono uppercase px-2.5 py-0.5 rounded"
                          style={{
                            background: `${providerConfig?.color || '#5a6a7d'}15`,
                            color: providerConfig?.color || '#5a6a7d',
                          }}
                        >
                          {m.provider}
                        </span>
                        {m.is_active && (
                          <span className="flex items-center gap-1 text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-status-green text-[#2ed573]">
                            <Star className="w-3 h-3" weight="fill" />
                            Active
                          </span>
                        )}
                      </div>
                      <code className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>
                        {m.model_id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      {!m.is_active && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActive(m.id)}
                          disabled={busy}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(0,212,255,0.1)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] disabled:opacity-50 transition-colors"
                        >
                          Set Active
                        </motion.button>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setForm({ ...m }); setErr('') }}
                          className="p-2 rounded-lg hover:bg-[rgba(0,212,255,0.1)] text-[#00d4ff] transition-colors"
                        >
                          <PencilSimple className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => del(m.id)}
                          className="p-2 rounded-lg hover:bg-status-red hover:text-[#ff4757] transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
