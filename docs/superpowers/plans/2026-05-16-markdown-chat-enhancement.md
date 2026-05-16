# Markdown Chat Enhancement & Global Typography Bump — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance AI chat with full markdown rendering (syntax-highlighted code, tables, task lists, strikethrough), add per-message and full-chat copy buttons, add markdown/PDF export, and apply a ~10% global typography increase across all pages except Landing.

**Architecture:** Build on existing `react-markdown` + `remark-gfm` setup. Add `rehype-highlight` for code syntax highlighting. Add copy/export as inline UI in the IdeaChat component. Bump base font-size in `index.css` and adjust heading sizes across page components.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, react-markdown, remark-gfm, rehype-highlight, lucide-react

---

### Task 1: Install rehype-highlight

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install the dependency**

```bash
npm install rehype-highlight
```

Run from: `frontend/`

Expected: `rehype-highlight` added to `package.json` dependencies.

- [ ] **Step 2: Verify install**

```bash
ls node_modules/rehype-highlight/package.json
```

Expected: file exists.

---

### Task 2: Global typography bump + enhanced prose-os + GFM styles + print styles

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Bump base body font-size from 14px to 15.4px**

Replace in `index.css`:

```css
  body {
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.55;
```

With:

```css
  body {
    font-family: var(--font-mono);
    font-size: 15.4px;
    line-height: 1.55;
```

- [ ] **Step 2: Replace the entire `.prose-os` block with enhanced styles**

Replace lines 131-195 (the entire `.prose-os` block) with:

```css
/* Markdown content (chat responses) */
.prose-os {
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1.75;
  font-size: 15.4px;
}
.prose-os p {
  margin-bottom: 1.1em;
}
.prose-os h1,
.prose-os h2,
.prose-os h3,
.prose-os h4,
.prose-os h5,
.prose-os h6 {
  font-family: var(--font-pixel);
  letter-spacing: 0.02em;
  margin: 1.3em 0 0.5em;
  color: var(--color-text);
}
.prose-os h1 { font-size: 1.35rem; }
.prose-os h2 { font-size: 1.2rem; }
.prose-os h3 { font-size: 1.05rem; }
.prose-os h4 { font-size: 0.95rem; }
.prose-os h5 { font-size: 0.88rem; }
.prose-os h6 { font-size: 0.82rem; }
.prose-os strong { color: var(--color-text); }
.prose-os em { color: var(--color-text-mute); }
.prose-os del { color: var(--color-text-dim); text-decoration: line-through; }
.prose-os code {
  background: var(--color-surface);
  border: 1px solid var(--color-edge);
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 0.85em;
}
.prose-os pre {
  background: var(--color-deep);
  border: 1px solid var(--color-edge);
  border-radius: 6px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 0.9em 0;
}
.prose-os pre code {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 13px;
}
.prose-os ul,
.prose-os ol {
  margin: 0.7em 0 0.7em 1.2em;
}
.prose-os li {
  margin-bottom: 0.4em;
}
.prose-os li > ul,
.prose-os li > ol {
  margin-top: 0.3em;
  margin-bottom: 0.3em;
}
.prose-os ul {
  list-style-type: disc;
}
.prose-os ul ul {
  list-style-type: circle;
}
.prose-os ul ul ul {
  list-style-type: square;
}
.prose-os ol {
  list-style-type: decimal;
}
.prose-os ol ol {
  list-style-type: lower-alpha;
}
.prose-os ol ol ol {
  list-style-type: lower-roman;
}
.prose-os blockquote {
  border-left: 1px solid var(--color-edge-glow);
  padding-left: 1em;
  color: var(--color-text-mute);
  margin: 0.9em 0;
}
.prose-os a {
  color: var(--color-text);
  border-bottom: 1px dotted var(--color-edge-glow);
  text-decoration: none;
}
.prose-os a:hover {
  color: var(--color-dither);
  border-bottom-color: var(--color-dither);
}
.prose-os hr {
  border: 0;
  border-top: 1px solid var(--color-edge);
  margin: 1.4em 0;
}
.prose-os img {
  max-width: 100%;
  border-radius: 4px;
  margin: 0.9em 0;
}

/* GFM Tables */
.prose-os table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.9em 0;
  font-size: 0.92em;
}
.prose-os thead {
  border-bottom: 1px solid var(--color-edge-glow);
}
.prose-os th {
  font-family: var(--font-pixel);
  font-size: 0.85em;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: left;
  padding: 8px 12px;
  color: var(--color-text-mute);
}
.prose-os td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-edge);
}
.prose-os tbody tr:nth-child(even) {
  background: rgba(220, 224, 230, 0.02);
}

/* GFM Task Lists */
.prose-os ul li input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--color-edge-glow);
  border-radius: 2px;
  margin-right: 8px;
  vertical-align: middle;
  position: relative;
  cursor: default;
  flex-shrink: 0;
}
.prose-os ul li input[type="checkbox"]:checked {
  background: var(--color-strong);
  border-color: var(--color-strong);
}
.prose-os ul li input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 3px;
  top: 0px;
  width: 5px;
  height: 9px;
  border: solid var(--color-void);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.prose-os ul:has(li input[type="checkbox"]) {
  list-style: none;
  margin-left: 0;
}
.prose-os ul:has(li input[type="checkbox"]) li {
  display: flex;
  align-items: baseline;
}

/* Syntax highlighting — highlight.js theme overrides for bone-white palette */
.prose-os pre code.hljs {
  color: var(--color-text);
}
.prose-os .hljs-keyword { color: #c9b870; }
.prose-os .hljs-string { color: #88c9a1; }
.prose-os .hljs-number { color: #d4a574; }
.prose-os .hljs-comment { color: var(--color-text-dim); font-style: italic; }
.prose-os .hljs-function { color: var(--color-dither); }
.prose-os .hljs-title { color: var(--color-dither); }
.prose-os .hljs-type { color: #c9b870; }
.prose-os .hljs-built_in { color: #d4a574; }
.prose-os .hljs-literal { color: #d4a574; }
.prose-os .hljs-attr { color: #c9b870; }
.prose-os .hljs-variable { color: var(--color-text); }
.prose-os .hljs-params { color: var(--color-text-mute); }
.prose-os .hljs-meta { color: var(--color-text-mute); }
.prose-os .hljs-selector-class { color: var(--color-dither); }
.prose-os .hljs-selector-tag { color: #c9b870; }
.prose-os .hljs-property { color: var(--color-text); }
.prose-os .hljs-punctuation { color: var(--color-text-mute); }
.prose-os .hljs-operator { color: var(--color-text-mute); }
.prose-os .hljs-regexp { color: #c97070; }
.prose-os .hljs-deletion { color: #c97070; }
.prose-os .hljs-addition { color: #88c9a1; }
```

- [ ] **Step 3: Add @media print styles at the end of index.css**

Append to `index.css`:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
  }

  nav,
  .dock,
  footer,
  button,
  .bg-\[color\:var\(--color-void\)\],
  [class*="bg-[color:var(--color-void)]"],
  canvas,
  .scanline,
  .blink-cursor::after {
    display: none !important;
  }

  * {
    background: white !important;
    color: black !important;
    border-color: #ccc !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  .prose-os pre {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
  }

  .prose-os pre code {
    color: #333 !important;
  }

  .prose-os code {
    background: #f0f0f0 !important;
    border: 1px solid #ddd !important;
  }

  .prose-os a {
    color: #0066cc !important;
    border-bottom-color: #0066cc !important;
  }

  .prose-os blockquote {
    border-left-color: #999 !important;
    color: #555 !important;
  }

  .prose-os th,
  .prose-os td {
    border-color: #ccc !important;
  }

  .prose-os thead {
    border-bottom-color: #999 !important;
  }

  @page {
    margin: 1.5cm;
  }
}
```

- [ ] **Step 4: Verify CSS compiles**

```bash
npm run dev
```

Run from: `frontend/`

Expected: No CSS build errors. Page loads without style issues.

---

### Task 3: Enhance IdeaChat with syntax highlighting, copy, and export

**Files:**
- Modify: `frontend/src/components/idea/IdeaChat.tsx`

- [ ] **Step 1: Replace the entire IdeaChat.tsx with the enhanced version**

Replace the full file content with:

```tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import { User, Bot, Copy, Check, Download, FileText } from 'lucide-react'
import type { ChatMessage, Idea } from '@/types'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { createCustomChatPrompt } from '@/lib/api/prompts'
import { updateIdeaStatus } from '@/lib/api/ideas'
import { triggerProcessPrompt } from '@/lib/api/edgeFn'

interface Props {
  ideaId: string
  idea: Idea
  messages: ChatMessage[]
  onUpdate?: () => void
}

const ROLE_META = {
  idea: { label: 'YOU', Icon: User },
  response: { label: 'AI', Icon: Bot },
} as const

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
      title={label ?? 'Copy'}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[color:var(--color-strong)]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function buildFullChatText(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.message_type !== 'prompt')
    .map((m) => {
      const role = m.message_type === 'response' ? 'AI' : 'YOU'
      return `${role}:\n${m.message}\n`
    })
    .join('\n')
}

function buildMarkdownExport(idea: Idea, messages: ChatMessage[]): string {
  const visible = messages.filter((m) => m.message_type !== 'prompt')
  const lines: string[] = [
    `# Brain Overflow — Chat Export`,
    `**Idea**: ${idea.idea}`,
    `**Date**: ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
  ]
  for (const msg of visible) {
    const role = msg.message_type === 'response' ? '**AI:**' : '**YOU:**'
    lines.push(role)
    lines.push('')
    lines.push(msg.message)
    lines.push('')
  }
  return lines.join('\n')
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function IdeaChat({ ideaId, idea, messages, onUpdate }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = messages.filter((m) => m.message_type !== 'prompt')
  const isProcessing = idea.status === 'processing'

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text: string) {
    if (!text.trim()) return
    try {
      const prompt = await createCustomChatPrompt(text)
      await updateIdeaStatus(ideaId, 'processing')
      await triggerProcessPrompt(ideaId, { customPromptId: prompt.id })
      onUpdate?.()
    } catch (e) {
      console.error(e)
    }
  }

  const handleExportMd = useCallback(() => {
    const md = buildMarkdownExport(idea, messages)
    const slug = idea.idea.slice(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase()
    downloadFile(md, `brain-overflow-${slug}.md`, 'text/markdown')
  }, [idea, messages])

  const handleExportPdf = useCallback(() => {
    window.print()
  }, [])

  const fullChatText = buildFullChatText(messages)

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        {visible.length === 0 && !isProcessing && (
          <p className="font-mono text-sm text-[color:var(--color-text-mute)] text-center py-12">
            no transmissions yet. waiting on the chain…
          </p>
        )}
        {visible.map((msg, i) => {
          const meta = ROLE_META[msg.message_type as keyof typeof ROLE_META] ?? ROLE_META.idea
          const Icon = meta.Icon
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.24 }}
              className="group border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/40 backdrop-blur p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-[color:var(--color-text-mute)]" />
                <span className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)]">
                  {meta.label}
                </span>
                <span className="ml-auto font-mono text-[10px] text-[color:var(--color-text-dim)]">
                  #{msg.sequence_number}
                </span>
                <CopyButton text={msg.message} label="Copy message" />
              </div>
              {msg.message_type === 'response' ? (
                <div className="prose-os text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {msg.message}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
              )}
            </motion.div>
          )
        })}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-[color:var(--color-edge-glow)] bg-[color:var(--color-surface)]/30 px-4 py-3 flex items-center gap-3"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-pivot)] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--color-pivot)]" />
            </span>
            <span className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)]">
              ANALYZING…
            </span>
          </motion.div>
        )}
        <div ref={ref} />
      </div>

      {!isProcessing && visible.length > 0 && (
        <PromptInputBox
          placeholder="continue the thought…"
          onSend={(msg) => handleSend(msg)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update IdeaDetailPage.tsx to add export buttons in the TRANSMISSIONS header**

Replace the TRANSMISSIONS header section in `frontend/src/pages/IdeaDetailPage.tsx` (lines 125-135):

```tsx
        {/* Chat */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)]">
              TRANSMISSIONS
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const visible = messages.filter((m) => m.message_type !== 'prompt')
                  const text = visible
                    .map((m) => {
                      const role = m.message_type === 'response' ? 'AI' : 'YOU'
                      return `${role}:\n${m.message}\n`
                    })
                    .join('\n')
                  navigator.clipboard.writeText(text)
                }}
                className="font-pixel text-[10px] tracking-[0.18em] uppercase text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)] border border-[color:var(--color-edge)] px-3 py-1 transition-colors"
              >
                Copy All
              </button>
              <button
                onClick={() => {
                  const visible = messages.filter((m) => m.message_type !== 'prompt')
                  const lines = [
                    `# Brain Overflow — Chat Export`,
                    `**Idea**: ${idea.idea}`,
                    `**Date**: ${new Date().toLocaleString()}`,
                    ``,
                    `---`,
                    ``,
                  ]
                  for (const msg of visible) {
                    const role = msg.message_type === 'response' ? '**AI:**' : '**YOU:**'
                    lines.push(role)
                    lines.push('')
                    lines.push(msg.message)
                    lines.push('')
                  }
                  const md = lines.join('\n')
                  const slug = idea.idea.slice(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase()
                  const blob = new Blob([md], { type: 'text/markdown' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `brain-overflow-${slug}.md`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
                className="font-pixel text-[10px] tracking-[0.18em] uppercase text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)] border border-[color:var(--color-edge)] px-3 py-1 transition-colors"
              >
                Export .md
              </button>
              <button
                onClick={() => window.print()}
                className="font-pixel text-[10px] tracking-[0.18em] uppercase text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)] border border-[color:var(--color-edge)] px-3 py-1 transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>
          <IdeaChat
            ideaId={idea.id}
            idea={idea}
            messages={messages}
            onUpdate={refetch}
          />
        </div>
```

- [ ] **Step 3: Also bump the EXECUTION_TIMELINE heading in IdeaDetailPage.tsx**

Replace line 118:
```tsx
              EXECUTION_TIMELINE
```
The heading class should change from `text-[10px] tracking-[0.22em]` to `text-[11px] tracking-[0.2em]`:

```tsx
          <h2 className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)] mb-3">
            EXECUTION_TIMELINE
          </h2>
```

- [ ] **Step 4: Install remark-breaks**

```bash
npm install remark-breaks
```

Run from: `frontend/`

- [ ] **Step 5: Verify typecheck**

```bash
npm run typecheck
```

Run from: `frontend/`

Expected: No type errors.

---

### Task 4: Typography bump — IdeasPage

**Files:**
- Modify: `frontend/src/pages/IdeasPage.tsx`

- [ ] **Step 1: Bump section heading font sizes**

Replace line 139 (`text-[10px] tracking-[0.2em]` → `text-[11px] tracking-[0.2em]`):

```tsx
                <span className="font-pixel text-[11px] tracking-[0.2em] uppercase">
```

- [ ] **Step 2: Bump stats description text**

Replace line 118 (`text-xs` → keep, it inherits body bump):

No change needed — `text-xs` will scale with the body font-size bump.

- [ ] **Step 3: Bump NO_SIGNAL text**

Replace line 195 (`text-[10px]` → `text-[11px]`):

```tsx
            <pre className="inline-block font-pixel text-[11px] leading-tight text-[color:var(--color-text-dim)] mb-6">
```

- [ ] **Step 4: Verify typecheck**

```bash
npm run typecheck
```

Run from: `frontend/`

Expected: No type errors.

---

### Task 5: Typography bump — ModelsPage

**Files:**
- Modify: `frontend/src/pages/ModelsPage.tsx`

- [ ] **Step 1: Bump page heading**

Replace line 169 (`text-2xl` → `text-3xl`):

```tsx
            <h1 className="font-pixel text-3xl tracking-[0.06em]">MODELS</h1>
```

- [ ] **Step 2: Bump description text**

Replace line 182 (`text-xs` → keep, inherits body bump):

No change needed.

- [ ] **Step 3: Bump card heading**

Replace line 337 (`text-sm` → `text-base`):

```tsx
                        <h3 className="font-pixel text-base tracking-[0.04em] uppercase">
```

- [ ] **Step 4: Bump provider badge**

Replace line 339 (`text-[10px]` → `text-[11px]`):

```tsx
                        <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-text-mute)] border border-[color:var(--color-edge)] px-2 py-0.5">
```

- [ ] **Step 5: Bump ACTIVE badge**

Replace line 343 (`text-[10px]` → `text-[11px]`):

```tsx
                          <span className="font-pixel text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-strong)] border border-[color:var(--color-strong)]/40 px-2 py-0.5 flex items-center gap-1">
```

- [ ] **Step 6: Bump model_id code**

Replace line 349 (`text-xs` → keep, inherits body bump):

No change needed.

- [ ] **Step 7: Bump provider info helper text**

Replace line 255 (`text-xs` → keep):

No change needed.

- [ ] **Step 8: Bump form heading**

Replace line 211 (`text-sm` → `text-base`):

```tsx
              <h2 className="font-pixel text-base tracking-[0.2em] uppercase mb-5">
```

- [ ] **Step 9: Verify typecheck**

```bash
npm run typecheck
```

Run from: `frontend/`

Expected: No type errors.

---

### Task 6: Typography bump — FlowsPage

**Files:**
- Modify: `frontend/src/pages/FlowsPage.tsx`

- [ ] **Step 1: Bump list view heading**

Replace line 389 (`text-2xl` → `text-3xl`):

```tsx
            <h1 className="font-pixel text-3xl tracking-[0.06em]">FLOWS</h1>
```

- [ ] **Step 2: Bump edit view heading**

Replace line 247 (`text-2xl` → `text-3xl`):

```tsx
          <h1 className="mb-8 font-pixel text-3xl tracking-[0.06em]">EDIT_FLOW</h1>
```

- [ ] **Step 3: Bump section headings (FLOW_SETTINGS, PROMPT_CHAIN, AVAILABLE_PROMPTS)**

Replace lines 260, 299, 341 (`text-[10px] tracking-[0.22em]` → `text-[11px] tracking-[0.2em]`):

Line 260:
```tsx
              <h2 className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)] mb-4">
```

Line 299:
```tsx
              <h2 className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)] mb-4">
```

Line 341:
```tsx
            <h2 className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)] mb-3">
```

- [ ] **Step 4: Bump card heading**

Replace line 497 (`text-sm` → `text-base`):

```tsx
                        <h3 className="font-pixel text-base tracking-[0.04em] uppercase">
```

- [ ] **Step 5: Bump telegram command badge**

Replace line 501 (`text-[10px]` → `text-[11px]`):

```tsx
                          <span className="font-pixel text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-text-mute)] border border-[color:var(--color-edge)] px-2 py-0.5">
```

- [ ] **Step 6: Bump sortable prompt item index**

Replace line 93 (`text-[10px]` → `text-[11px]`):

```tsx
      <span className="font-pixel text-[11px] tracking-widest text-[color:var(--color-text-mute)] w-6">
```

- [ ] **Step 7: Bump NEW_FLOW form heading**

Replace line 431 (`text-sm` → `text-base`):

```tsx
              <h2 className="font-pixel text-base tracking-[0.2em] uppercase mb-5">
```

- [ ] **Step 8: Verify typecheck**

```bash
npm run typecheck
```

Run from: `frontend/`

Expected: No type errors.

---

### Task 7: Typography bump — PromptsPage

**Files:**
- Modify: `frontend/src/pages/PromptsPage.tsx`

- [ ] **Step 1: Bump page heading**

Replace line 114 (`text-2xl` → `text-3xl`):

```tsx
            <h1 className="font-pixel text-3xl tracking-[0.06em]">PROMPTS</h1>
```

- [ ] **Step 2: Bump card heading**

Replace line 236 (`text-sm` → `text-base`):

```tsx
                      <h3 className="font-pixel text-base tracking-[0.04em] uppercase mb-1">
```

- [ ] **Step 3: Bump context mode badge**

Replace line 240 (`text-[10px]` → `text-[11px]`):

```tsx
                        <span className="font-pixel text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)] border border-[color:var(--color-edge)] px-2 py-0.5">
```

- [ ] **Step 4: Bump form heading**

Replace line 153 (`text-sm` → `text-base`):

```tsx
              <h2 className="font-pixel text-base tracking-[0.2em] uppercase mb-5">
```

- [ ] **Step 5: Verify typecheck**

```bash
npm run typecheck**
```

Run from: `frontend/`

Expected: No type errors.

---

### Task 8: Typography bump — IdeaCard

**Files:**
- Modify: `frontend/src/components/idea/IdeaCard.tsx`

- [ ] **Step 1: Bump status label**

Replace line 90 (`text-[11px]` → `text-[12px]`):

```tsx
          <span className="font-pixel text-[12px] tracking-[0.18em] uppercase font-bold" style={{ color: status.tone }}>
```

- [ ] **Step 2: Bump category label**

Replace line 94 (`text-[11px]` → `text-[12px]`):

```tsx
            <span className="font-pixel text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-text-dim)] ml-auto">
```

- [ ] **Step 3: Bump idea text**

Replace line 102 (`text-[15px]` → `text-[16px]`):

```tsx
            'font-mono text-[16px] leading-relaxed text-[color:var(--color-text)]',
```

- [ ] **Step 4: Bump date text**

Replace line 110 (`text-[11px]` → `text-[12px]`):

```tsx
          <span className="font-mono text-[12px] text-[color:var(--color-text-dim)]">
```

- [ ] **Step 5: Bump score label**

Replace line 116 (`text-[11px]` → `text-[12px]`):

```tsx
                className="font-pixel text-[12px] tracking-[0.18em] uppercase font-bold"
```

- [ ] **Step 6: Verify typecheck**

```bash
npm run typecheck
```

Run from: `frontend/`

Expected: No type errors.

---

### Task 9: Final verification

- [ ] **Step 1: Run full typecheck**

```bash
npm run typecheck
```

Run from: `frontend/`

Expected: No type errors across all files.

- [ ] **Step 2: Run dev server and visually verify**

```bash
npm run dev
```

Run from: `frontend/`

Expected: 
- Chat messages render with full markdown (bold, italic, code blocks with syntax highlighting, tables, task lists, strikethrough)
- Copy button appears on hover on each message card
- Copy All, Export .md, Export PDF buttons appear in TRANSMISSIONS header
- All page headings and text are ~10% larger (except Landing)
- Print preview shows clean black-on-white output

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/index.css frontend/src/components/idea/IdeaChat.tsx frontend/src/pages/IdeaDetailPage.tsx frontend/src/pages/IdeasPage.tsx frontend/src/pages/ModelsPage.tsx frontend/src/pages/FlowsPage.tsx frontend/src/pages/PromptsPage.tsx frontend/src/components/idea/IdeaCard.tsx
git commit -m "feat: enhance markdown chat with syntax highlighting, copy/export, and global typography bump"
```
