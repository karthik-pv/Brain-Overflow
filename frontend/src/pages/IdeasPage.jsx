import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowClockwise, Trash, Funnel, SortAscending,
  Lightning, CheckCircle, XCircle, Clock, Circle,
  TrendUp, TrendDown, ArrowsClockwise
} from '@phosphor-icons/react'
import { getSupabase } from '../lib/supabase.js'

const STATUS_CONFIG = {
  recorded:   { label: 'Recorded',   color: 'text-[var(--color-text-muted)]', bg: 'bg-[rgba(102,102,102,0.15)]' },
  processing: { label: 'Processing', color: 'text-[#ffa502]', bg: 'bg-status-orange' },
  completed:  { label: 'Completed',  color: 'text-[#2ed573]', bg: 'bg-status-green' },
  failed:     { label: 'Failed',     color: 'text-[#ff4757]', bg: 'bg-status-red' },
}

const SCORE_CONFIG = {
  strong:           { label: 'Strong',            color: 'text-[#2ed573]', bg: 'bg-status-green', icon: TrendUp },
  weak:             { label: 'Weak',              color: 'text-[#ff4757]', bg: 'bg-status-red', icon: TrendDown },
  needs_pivot:      { label: 'Needs Pivot',       color: 'text-[#ffa502]', bg: 'bg-status-orange', icon: ArrowsClockwise },
  needs_refinement: { label: 'Needs Refinement',  color: 'text-[#fcc419]', bg: 'bg-status-yellow', icon: Clock },
}

const CATEGORY_LABELS = {
  startup_idea: 'Startup Idea',
  automation: 'Automation',
  personal_tool: 'Personal Tool',
  dev_tool: 'Dev Tool',
  other: 'Other',
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterScore, setFilterScore] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const navigate = useNavigate()

  const fetchIdeas = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchIdeas()
  }, [fetchIdeas])

  // Poll for processing ideas
  useEffect(() => {
    const hasProcessing = ideas.some(i => i.status === 'processing')
    if (!hasProcessing) return

    const interval = setInterval(() => {
      fetchIdeas()
    }, 2000)

    return () => clearInterval(interval)
  }, [ideas, fetchIdeas])

  async function deleteIdea(e, id) {
    e.stopPropagation()
    if (!confirm('Delete this idea and all its messages?')) return
    const sb = getSupabase()
    await sb.from('ideas').delete().eq('id', id)
    fetchIdeas()
  }

  // Filter and sort
  const filteredIdeas = ideas
    .filter(idea => {
      if (filterStatus !== 'all' && idea.status !== filterStatus) return false
      if (filterScore !== 'all' && idea.score !== filterScore) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'score') {
        const scoreOrder = { strong: 4, needs_refinement: 3, needs_pivot: 2, weak: 1 }
        return (scoreOrder[b.score] || 0) - (scoreOrder[a.score] || 0)
      }
      return 0
    })

  // Stats
  const stats = {
    total: ideas.length,
    processing: ideas.filter(i => i.status === 'processing').length,
    completed: ideas.filter(i => i.status === 'completed').length,
    strong: ideas.filter(i => i.score === 'strong').length,
  }

  if (loading && ideas.length === 0) {
    return (
      <div className="min-h-[100dvh] pt-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-shimmer h-8 w-48 rounded-lg mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="liquid-glass rounded-xl p-6 animate-shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="liquid-glass rounded-xl p-6 h-40 animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] pt-24 px-4 md:px-8 pb-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Ideas Dashboard</h1>
            <p className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {stats.total} ideas · {stats.processing} processing · {stats.completed} completed
            </p>
          </div>
          <button
            onClick={fetchIdeas}
            className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass text-sm hover:border-[rgba(0,212,255,0.2)] transition-colors"
          >
            <ArrowClockwise className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Ideas', value: stats.total, icon: Lightning, color: '#00d4ff' },
            { label: 'Processing', value: stats.processing, icon: Circle, color: '#ffa502' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#2ed573' },
            { label: 'Strong Ideas', value: stats.strong, icon: TrendUp, color: '#2ed573' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="liquid-glass rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Funnel className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none"
            >
              <option value="all">All Status</option>
              <option value="recorded">Recorded</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="bg-transparent border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none"
            >
              <option value="all">All Scores</option>
              <option value="strong">Strong</option>
              <option value="needs_refinement">Needs Refinement</option>
              <option value="needs_pivot">Needs Pivot</option>
              <option value="weak">Weak</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAscending className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none"
            >
              <option value="created_at">Newest First</option>
              <option value="score">By Score</option>
            </select>
          </div>
        </div>

        {err && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-status-red text-[#ff4757]"
          >
            <XCircle className="w-5 h-5" />
            {err}
          </motion.div>
        )}

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Lightning className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
            <p className="text-lg mb-2">No ideas found</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {ideas.length === 0
                ? 'Record your first idea using the voice recorder'
                : 'Try adjusting your filters'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            <AnimatePresence>
              {filteredIdeas.map((idea, index) => {
                const statusConfig = STATUS_CONFIG[idea.status] || STATUS_CONFIG.recorded
                const scoreConfig = idea.score ? SCORE_CONFIG[idea.score] : null
                const ScoreIcon = scoreConfig?.icon

                return (
                  <motion.div
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 20 }}
                    onClick={() => navigate(`/idea/${idea.id}`)}
                    className="liquid-glass rounded-xl p-5 cursor-pointer hover:border-[rgba(0,212,255,0.2)] transition-all duration-300 group"
                  >
                    <p className="text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-[#00d4ff] transition-colors">
                      {idea.idea}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {idea.category && (
                        <span className="text-xs font-mono uppercase px-2 py-1 rounded bg-[rgba(0,212,255,0.1)] text-[#00d4ff]">
                          {CATEGORY_LABELS[idea.category] || idea.category}
                        </span>
                      )}
                      {scoreConfig && (
                        <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${scoreConfig.bg} ${scoreConfig.color} flex items-center gap-1`}>
                          {ScoreIcon && <ScoreIcon className="w-3 h-3" />}
                          {scoreConfig.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>
                        {formatDate(idea.created_at)}
                      </span>
                      <button
                        onClick={(e) => deleteIdea(e, idea.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-status-red hover:text-[#ff4757] transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
