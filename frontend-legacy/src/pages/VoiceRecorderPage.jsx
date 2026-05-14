import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lightning, Brain, Sparkle, TrendUp } from '@phosphor-icons/react'
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
        .limit(6)
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
    <div className="relative min-h-[100dvh] flex flex-col px-4 py-8 md:py-12 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.04),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_bottom,rgba(0,212,255,0.02),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Brain weight="fill" className="w-10 h-10 text-[#00d4ff]" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-4">
            Brain Overflow
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Speak your startup idea. Our AI will pressure-test it using the Paul Graham framework.
          </p>
        </motion.div>

        {/* Voice Recorder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mb-12"
        >
          <VoiceRecorder onIdeaCreated={handleIdeaCreated} />
        </motion.div>

        {/* Recent Ideas Section */}
        {recentIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkle className="w-5 h-5 text-[#00d4ff]" />
                <h2 className="text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Recent Ideas
                </h2>
              </div>
              <button
                onClick={() => navigate('/ideas')}
                className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentIdeas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  onClick={() => navigate(`/idea/${idea.id}`)}
                  className="liquid-glass rounded-xl p-5 cursor-pointer hover:border-[rgba(0,212,255,0.2)] transition-all duration-300 group"
                >
                  <p className="text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-[#00d4ff] transition-colors">
                    {idea.idea}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded ${
                      idea.status === 'completed' ? 'bg-status-green text-[#2ed573]' :
                      idea.status === 'processing' ? 'bg-status-orange text-[#ffa502]' :
                      'bg-[rgba(102,102,102,0.2)] text-[var(--color-text-dim)]'
                    }`}>
                      {idea.status}
                    </span>
                    {idea.score && (
                      <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded flex items-center gap-1 ${
                        idea.score === 'strong' ? 'bg-status-green text-[#2ed573]' :
                        idea.score === 'weak' ? 'bg-status-red text-[#ff4757]' :
                        idea.score === 'needs_pivot' ? 'bg-status-orange text-[#ffa502]' :
                        'bg-status-yellow text-[#fcc419]'
                      }`}>
                        {idea.score === 'strong' && <TrendUp className="w-3 h-3" />}
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
