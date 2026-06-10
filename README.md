# Brain Overflow

> an abandoned operating system for thinkers and dreamers.

Speak an idea — the machine remembers. Then it roasts it, analyzes it, and tells you what to do next.

Brain Overflow is a personal idea processing system. You talk to it (voice, text, Telegram), it runs your idea through a chain of AI prompts, and gives you back structured analysis — categorization, scoring, market research, actionable next steps. Everything lands in **your** Supabase database. Not ours. Yours.

---

## What you get

- **Voice recorder** on the landing page — hit record, speak, done
- **Telegram bot** — send ideas from your phone, even offline (they queue up)
- **AI prompt chains** (called "flows") — configurable multi-step analysis pipelines
- **Dashboard** — browse, filter, search all your ideas with full chat history
- **Markdown chat** — syntax-highlighted code, tables, task lists, copy/export
- **Your database** — Supabase hosts the data, you own every row

---

## Architecture in 30 seconds

```
You (voice/Telegram/web)
  → Supabase (ideas, chat_messages, flows, prompts, models)
    → Edge Function: telegram-webhook (receives messages)
    → Edge Function: process-prompt  (runs AI chain per idea)
      → LLM (Fireworks / OpenAI / Anthropic)
    ← Results stored in Supabase
  ← React dashboard reads from Supabase
```

No backend server. No Docker. No Kubernetes. Supabase handles the database and edge functions. The frontend is a static React app. The "backend" is two Deno edge functions deployed to Supabase.

---

## Prerequisites

| Thing | Why | Get it |
|-------|-----|--------|
| Node.js 20+ | Frontend + scripts | [nodejs.org](https://nodejs.org) |
| Supabase CLI | Deploy functions & migrations | `npm install -g supabase` |
| Supabase account | Your database | [supabase.com](https://supabase.com) — free tier works |
| Telegram Bot Token | The bot | [@BotFather](https://t.me/BotFather) on Telegram |
| AI API Key | LLM calls | [Fireworks AI](https://fireworks.ai) (recommended) or OpenAI/Anthropic |

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url> brain-overflow
cd brain-overflow
cd frontend && npm install && cd ..
cd backend  && npm install && cd ..
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is fine)
2. Click **New Project** — give it a name, set a database password, pick a region close to you
3. Wait for the project to provision (usually ~30 seconds)

Once it's ready, you need two things from the project dashboard:

- **Project URL** — found in Settings → API → Project URL (looks like `https://abcdefgh.supabase.co`)
- **Project Ref** — the `abcdefgh` part of your URL

You also need two API keys from Settings → API:

- **Publishable key** (`sb_publishable_...`) — safe for the frontend, read-only-ish
- **Secret key** (`sb_secret_...`) — full admin access, never put this in frontend code

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in every field:

```bash
# From Supabase Settings → API
SUPABASE_PROJECT_REF=abcdefgh
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_actual_key_here
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_actual_key_here

# From @BotFather on Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# From your AI provider (Fireworks, OpenAI, or Anthropic)
AI_API_KEY=fw_your_fireworks_key_here

# Your Telegram user ID(s) — only these users can talk to the bot
# Find your ID: message @userinfobot on Telegram
TELEGRAM_ALLOWED_USERS=["123456789"]
```

**Finding your Telegram user ID:** Send `/start` to [@userinfobot](https://t.me/userinfobot) on Telegram. It replies with your numeric ID. Put it in the array. If you want multiple people to use the bot: `["123456789", "987654321"]`.

**Getting a Telegram bot token:**
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Pick a name (e.g. "My Brain Overflow")
4. Pick a username ending in `bot` (e.g. `my_brain_overflow_bot`)
5. BotFather gives you the token — paste it in `.env`

**Getting an AI API key:**
- **Fireworks AI** (recommended, cheap, fast): Sign up at [fireworks.ai](https://fireworks.ai), go to API Keys, create one. The default model (`llama-v3p1-70b-instruct`) runs on Fireworks.
- **OpenAI**: Sign up at [platform.openai.com](https://platform.openai.com), create an API key. Then add a model in the dashboard with provider `openai` and model_id like `gpt-4o`.
- **Anthropic**: Sign up at [console.anthropic.com](https://console.anthropic.com), create an API key. Add a model with provider `anthropic` and model_id like `claude-3-5-sonnet-20241022`.

### 4. Configure the frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Open `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_actual_key_here
```

These are the same values from your Supabase dashboard. The publishable key is safe to expose — it's designed for client-side use.

### 5. Run the setup script

This is the magic button. From the `backend/` directory:

```bash
npm run setup
```

This one command does **all** of the following:

1. Installs backend dependencies
2. Links your local project to your Supabase project
3. Runs all database migrations (creates tables: `ideas`, `chat_messages`, `flows`, `prompts`, `models`, `telegram_chat_config`)
4. Deploys the two edge functions (`telegram-webhook`, `process-prompt`) to Supabase
5. Sets secrets in Supabase (your AI API key, Telegram bot token, allowed users)
6. Configures the Telegram webhook (so Telegram knows where to send messages)
7. Seeds a default AI model (Llama 3.1 70B on Fireworks)
8. Verifies everything works

If it fails at any step, it tells you why. Fix the issue and re-run — it's idempotent (safe to run again).

### 6. Seed sample data (optional but recommended)

```bash
cd backend
npm run seed
```

This populates your database with:
- 3 AI models (Llama 3.1 70B, Llama 3.1 8B, Mixtral 8x7B — all Fireworks)
- 3 sample prompts (categorize & roast, market analysis, actionable next steps)
- 3 flows that chain those prompts together:
  - `/startup` — full 3-step analysis
  - `/roast` — quick brutal feedback
  - `/default` — categorize + next steps

### 7. Start the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You should see the Brain Overflow landing page with the voice recorder and the Telegram bot alert in the top-right corner.

### 8. Sync Telegram commands (optional)

This registers the bot's command menu in Telegram so users get autocomplete:

```bash
cd backend
npm run sync-telegram-commands
```

After this, typing `/` in your Telegram chat with the bot will show the available commands.

---

## Using the Telegram bot

Open your bot on Telegram (the username you picked with BotFather). Here's what you can do:

| Command | What it does |
|---------|-------------|
| `/flows` | List all available flows |
| `/currentflow` | Show your active flow |
| `/setflow <command>` | Set a persistent default flow for this chat |
| `/startup my idea text` | Run the "Startup Analysis" flow on your idea |
| `/roast my idea text` | Quick roast — just the brutal feedback |
| Just type anything | Logs the idea using your default flow |

**Using keyboard TTS (text-to-speech):** On most phone keyboards, there's a microphone icon. Tap it, speak your idea, and the keyboard converts it to text. Hit send. The bot treats it like any other message. This is the fastest way to capture ideas on the go.

**Setting a default flow:** If you always want the startup analysis, run `/setflow startup`. Then every plain message you send automatically goes through that flow. You can still override with an explicit `/roast some idea` anytime.

---

## How flows work

A **flow** is a sequence of prompts. When an idea enters a flow, each prompt runs one at a time — the output of each step feeds into the next.

```
Idea: "an app that reminds you to water your plants"
  → Prompt 1: "Categorize & Roast" → response stored
  → Prompt 2: "Market Analysis" (sees previous response) → response stored
  → Prompt 3: "Actionable Next Steps" (sees full history) → response stored
  → Idea marked COMPLETED
```

Each prompt has a **context mode** that controls what the AI sees:

| Mode | What the AI gets |
|------|-----------------|
| `idea_only` | Just the original idea text |
| `previous_response` | The idea + the last AI response |
| `full_history_json` | The idea + all prior prompt/response pairs as JSON |

You can create your own prompts and flows from the dashboard (PROMPTS and FLOWS pages). Drag and drop to reorder prompts in a flow.

---

## Dashboard pages

| Page | What's there |
|------|-------------|
| **Landing** | Voice recorder + recent ideas + Telegram bot alert |
| **Ideas** | Filterable card grid with status, score, category, search |
| **Idea Detail** | Full chat history with markdown rendering, copy/export buttons |
| **Models** | Add/switch AI models (Fireworks, OpenAI, Anthropic) |
| **Prompts** | Create and edit AI prompts with context mode selection |
| **Flows** | Chain prompts together, set Telegram commands, drag to reorder |

---

## Project structure

```
brain-overflow/
├── frontend/                  # React + Vite + Tailwind v4
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # UI + feature components
│   │   ├── lib/api/          # Supabase client + API helpers
│   │   ├── hooks/            # React hooks (useIdea, useIdeas)
│   │   └── types/            # TypeScript types
│   └── .env.local            # Supabase URL + publishable key
│
├── backend/                   # Supabase infra + scripts
│   ├── supabase/
│   │   ├── migrations/       # SQL schema (run via db push)
│   │   └── functions/        # Deno edge functions
│   │       ├── telegram-webhook/   # Receives Telegram messages
│   │       ├── process-prompt/     # Runs AI chain per idea
│   │       └── _shared/           # DB client, CORS, LLM providers
│   ├── scripts/              # setup, seed, reset, sync-telegram-commands
│   └── .env                  # All secrets (never commit this)
│
└── frontend-legacy/          # Old frontend, ignore this
```

---

## Useful scripts

All run from the `backend/` directory:

```bash
npm run setup                  # Full first-time setup (safe to re-run)
npm run seed                   # Add sample models, prompts, flows
npm run reset                  # Clear ideas + chat_messages (keeps config)
npm run sync-telegram-commands # Register /commands in Telegram menu
```

---

## Database schema

The migrations create these tables:

- **`ideas`** — The idea text, status (`recorded` → `processing` → `completed`/`failed`), category, score, flow reference
- **`chat_messages`** — Immutable conversation log per idea (idea text, prompt, AI response)
- **`flows`** — Named prompt chains with optional `telegram_command`
- **`prompts`** — AI prompt text with `context_mode` (`idea_only`, `previous_response`, `full_history_json`)
- **`models`** — LLM configs (model_id, provider), one marked `is_active`
- **`telegram_chat_config`** — Per-chat persistent flow selection

RLS is disabled — this is a single-user trust-based system. If you need multi-user auth, you'll want to add Supabase Auth and enable RLS. That's a you-sized project.

---

## Troubleshooting

**"Unauthorized" when messaging the Telegram bot**
Your Telegram user ID isn't in `TELEGRAM_ALLOWED_USERS`. Message [@userinfobot](https://t.me/userinfobot) to find your ID, add it to `.env`, then re-run `npm run setup` (it re-deploys the secrets).

**Ideas stay in "processing" forever**
The edge function probably hit an error. Check the Supabase dashboard → Edge Functions → Logs. Common causes: invalid AI API key, model not found, or the AI returned non-JSON (the system retries 3 times then marks it `failed`).

**"No model configured" error**
You need at least one model in the `models` table. Run `npm run seed` or add one manually from the dashboard's Models page.

**Frontend shows nothing / blank page**
Check `frontend/.env.local` — both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be set. Restart the dev server after changing env vars.

**Telegram webhook not working**
Re-run `npm run setup` — it re-configures the webhook. You can also check the webhook info: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

**Edge function deployment fails**
Make sure you have the Supabase CLI installed (`npm install -g supabase`) and you're logged in (`supabase login`). The CLI needs to link to your project — `setup.mjs` handles this, but if it fails, try `npx supabase link --project-ref <your-ref>` manually.

---

## Tech stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite, Framer Motion, react-markdown, rehype-highlight
- **Backend:** Supabase (Postgres + Edge Functions), Deno
- **AI:** Fireworks AI (default), OpenAI, Anthropic — pick your poison
- **Integration:** Telegram Bot API

---

## License

Do whatever you want with it. It's your brain overflow now.
