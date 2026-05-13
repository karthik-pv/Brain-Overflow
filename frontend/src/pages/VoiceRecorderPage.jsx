import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lightning, Brain } from '@phosphor-icons/react'
import VoiceRecorder from '../components/VoiceRecorder'
import { getSupabase } from '../lib/supabase.js'

export default function VoiceRecorderPage() {
  const [recentIdeas, setRecentIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRecentIdeas()
  }, [])

  async function fetchRecentIdeas() {
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('ideas')
        .select('id, idea, status, category, score, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentIdeas(data || [])
    } catch (e) {
      console.error('Failed to fetch recent ideas:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleIdeaCreated = (ideaId) => {
    setTimeout(() => {
      navigate(`/idea/${ideaId}`)
    }, 1500)
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.03),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_bottom,rgba(0,212,255,0.02),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain weight="fill" className="w-8 h-8 text-[#00d4ff]" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
              Brain Overflow
            </h1>
          </div>
          <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Speak your startup idea. Our AI will pressure-test it using the Paul Graham framework.
          </p>
        </motion.div>

        {/* Voice Recorder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mb-12"
        >
          <VoiceRecorder onIdeaCreated={handleIdeaCreated} />
        </motion.div>

        {/* Recent Ideas */}
        {recentIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Recent Ideas
              </h2>
              <button
                onClick={() => navigate('/ideas')}
                className="flex items-center gap-1 text-sm text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentIdeas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => navigate(`/idea/${idea.id}`)}
                  className="liquid-glass rounded-xl p-4 cursor-pointer hover:border-[rgba(0,212,255,0.2)] transition-all duration-300 group"
                >
                  <p className="text-sm line-clamp-2 mb-2 group-hover:text-[#00d4ff] transition-colors">
                    {idea.idea}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${
                      idea.status === 'completed' ? 'bg-status-green text-[#2ed573]' :
                      idea.status === 'processing' ? 'bg-status-orange text-[#ffa502]' :
                      'bg-[rgba(102,102,102,0.2)] text-[var(--color-text-dim)]'
                    }`}>
                      {idea.status}
                    </span>
                    {idea.score && (
                      <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${
                        idea.score === 'strong' ? 'bg-status-green text-[#2ed573]' :
                        idea.score === 'weak' ? 'bg-status-red text-[#ff4757]' :
                        idea.score === 'needs_pivot' ? 'bg-status-orange text-[#ffa502]' :
                        'bg-status-yellow text-[#fcc419]'
                      }`}>
                        {idea.score.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && recentIdeas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-12"
          >
            <Lightning className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-dim)]" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No ideas yet. Tap the microphone above to get started.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
