import { useEffect, useMemo, useState } from 'react'
import Plan, { type AgentTask } from '@/components/ui/agent-plan'
import { listPrompts } from '@/lib/api/prompts'
import { getDefaultFlow, listFlows } from '@/lib/api/flows'
import type { ChatMessage, Flow, Idea, Prompt } from '@/types'

interface Props {
  idea: Idea
  messages: ChatMessage[]
}

export function IdeaTimeline({ idea, messages }: Props) {
  const [flow, setFlow] = useState<Flow | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [allPrompts, allFlows] = await Promise.all([listPrompts(), listFlows()])
      if (cancelled) return
      setPrompts(allPrompts)
      let f = allFlows.find((x) => x.id === idea.flow_id) ?? null
      if (!f) f = await getDefaultFlow()
      setFlow(f)
    }
    load().catch(() => {})
    return () => {
      cancelled = true
    }
  }, [idea.flow_id])

  const tasks: AgentTask[] = useMemo(() => {
    if (!flow) return []
    const promptMsgs = messages.filter((m) => m.message_type === 'prompt')
    const responseMsgs = messages.filter((m) => m.message_type === 'response')

    return flow.prompt_ids.map((pid, idx) => {
      const prompt = prompts.find((p) => p.id === pid)
      const sent = idx < promptMsgs.length
      const responded = idx < responseMsgs.length
      const isCurrent =
        idea.status === 'processing' && sent && !responded
      const isFailedHere =
        idea.status === 'failed' && idx === promptMsgs.length - 1 && !responded

      const status: string = responded
        ? 'completed'
        : isFailedHere
          ? 'failed'
          : isCurrent
            ? 'in-progress'
            : sent && !responded
              ? 'in-progress'
              : idea.status === 'processing' && idx === promptMsgs.length
                ? 'in-progress'
                : 'pending'

      const events = [
        { id: `${pid}.1`, title: 'prompt sent', status: sent ? 'completed' : 'pending' },
        { id: `${pid}.2`, title: 'llm responded', status: responded ? 'completed' : 'pending' },
        {
          id: `${pid}.3`,
          title: 'json parsed',
          status: responded ? 'completed' : isFailedHere ? 'failed' : 'pending',
        },
        {
          id: `${pid}.4`,
          title: 'idea updated',
          status: responded ? 'completed' : 'pending',
        },
      ]

      return {
        id: pid,
        title: prompt?.prompt_name ?? `Step ${idx + 1}`,
        description: prompt?.prompt.slice(0, 120) ?? '',
        status,
        priority: 'high',
        level: 0,
        dependencies: idx > 0 ? [`step ${idx}`] : [],
        subtasks: events.map((e) => ({
          id: e.id,
          title: e.title,
          description: '',
          status: e.status,
          priority: 'medium',
        })),
      }
    })
  }, [flow, prompts, messages, idea.status])

  if (!flow || tasks.length === 0) {
    return (
      <div className="border border-[color:var(--color-edge)] p-6 text-center font-mono text-xs text-[color:var(--color-text-mute)]">
        no flow attached.
      </div>
    )
  }

  return (
    <div className="border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/40 backdrop-blur">
      <div className="px-4 pt-4 pb-2 border-b border-[color:var(--color-edge)] flex items-baseline justify-between">
        <h3 className="font-pixel text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-text-mute)]">
          {flow.flow_name} // CHAIN
        </h3>
        <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
          {tasks.length} step{tasks.length === 1 ? '' : 's'}
        </span>
      </div>
      <Plan tasks={tasks} expandFirst={false} />
    </div>
  )
}
