import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, MessageSquareText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import DotPattern from '@/components/ui/dot-pattern-1'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  createPrompt,
  deletePrompt,
  listPrompts,
  updatePrompt,
} from '@/lib/api/prompts'
import type { ContextMode, Prompt } from '@/types'

const BLANK: { id?: string; prompt_name: string; prompt: string; context_mode: ContextMode } = {
  prompt_name: '',
  prompt: '',
  context_mode: 'idea_only',
}

const CONTEXT_LABELS: Record<ContextMode, string> = {
  idea_only: 'Idea Only',
  previous_response: 'Previous Response',
  full_history_json: 'Full History JSON',
}

export function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [form, setForm] = useState<typeof BLANK | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  async function fetchAll() {
    try {
      setPrompts(await listPrompts())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load prompts')
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  async function save() {
    if (!form) return
    if (!form.prompt_name.trim() || !form.prompt.trim()) {
      setErr('Name and prompt text are required')
      return
    }
    setBusy(true)
    setErr('')
    try {
      if (form.id) {
        await updatePrompt(form.id, {
          prompt_name: form.prompt_name,
          prompt: form.prompt,
          context_mode: form.context_mode,
        })
      } else {
        await createPrompt({
          prompt_name: form.prompt_name,
          prompt: form.prompt,
          context_mode: form.context_mode,
        })
      }
      setForm(null)
      fetchAll()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deletePrompt(pendingDelete)
      setPendingDelete(null)
      fetchAll()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to delete')
      setPendingDelete(null)
    }
  }

  return (
    <div className="relative min-h-[100dvh] pt-20 pb-32 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-5 w-5 text-[color:var(--color-text-mute)]" />
            <h1 className="font-pixel text-2xl tracking-[0.06em]">PROMPTS</h1>
          </div>
          <Button
            variant="default"
            onClick={() => {
              setForm({ ...BLANK })
              setErr('')
            }}
          >
            <Plus className="h-4 w-4" />
            NEW PROMPT
          </Button>
        </header>

        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 font-mono text-xs text-[color:var(--color-weak)] border border-[color:var(--color-weak)]/30 px-3 py-2 flex items-center justify-between"
            >
              <span>! {err}</span>
              <button onClick={() => setErr('')} className="opacity-60 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="mb-8 border border-[color:var(--color-edge-glow)] bg-[color:var(--color-surface)]/60 backdrop-blur p-6"
            >
              <h2 className="font-pixel text-sm tracking-[0.2em] uppercase mb-5">
                {form.id ? 'EDIT_PROMPT' : 'NEW_PROMPT'}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label>PROMPT_NAME</Label>
                  <Input
                    value={form.prompt_name}
                    onChange={(e) => setForm({ ...form, prompt_name: e.target.value })}
                    placeholder="e.g. categorize & score"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>PROMPT_TEXT</Label>
                  <Textarea
                    value={form.prompt}
                    onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                    placeholder="You are an expert evaluator…"
                    rows={7}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>CONTEXT_MODE</Label>
                  <Select
                    value={form.context_mode}
                    onValueChange={(v) => setForm({ ...form, context_mode: v as ContextMode })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea_only">Idea Only</SelectItem>
                      <SelectItem value="previous_response">Previous Response</SelectItem>
                      <SelectItem value="full_history_json">Full History JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={save} disabled={busy}>
                  {busy ? 'SAVING…' : 'SAVE'}
                </Button>
                <Button variant="ghost" onClick={() => setForm(null)}>
                  CANCEL
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {prompts.length === 0 && !form ? (
          <div className="py-24 text-center font-mono text-sm text-[color:var(--color-text-mute)]">
            no prompts yet. create one to start chaining.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {prompts.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="group relative overflow-hidden border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/40 backdrop-blur p-5"
                >
                  <DotPattern
                    width={6}
                    height={6}
                    className="fill-[color:var(--color-edge-glow)] opacity-25"
                  />
                  <span className="absolute -left-px -top-px h-2 w-2 bg-[color:var(--color-text-dim)]" />
                  <span className="absolute -right-px -top-px h-2 w-2 bg-[color:var(--color-text-dim)]" />
                  <span className="absolute -bottom-px -left-px h-2 w-2 bg-[color:var(--color-text-dim)]" />
                  <span className="absolute -bottom-px -right-px h-2 w-2 bg-[color:var(--color-text-dim)]" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-pixel text-sm tracking-[0.04em] uppercase mb-1">
                        {p.prompt_name}
                      </h3>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="font-pixel text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)] border border-[color:var(--color-edge)] px-2 py-0.5">
                          {CONTEXT_LABELS[p.context_mode]}
                        </span>
                        <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
                          ID: {p.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-[color:var(--color-text-mute)] line-clamp-3 whitespace-pre-wrap">
                        {p.prompt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setForm({
                            id: p.id,
                            prompt_name: p.prompt_name,
                            prompt: p.prompt,
                            context_mode: p.context_mode,
                          })
                          setErr('')
                        }}
                        className="p-1.5 text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setPendingDelete(p.id)}
                        className="p-1.5 text-[color:var(--color-text-mute)] hover:text-[color:var(--color-weak)]"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>DELETE PROMPT?</AlertDialogTitle>
            <AlertDialogDescription>
              this may break any flow that references it. cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
