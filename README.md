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
    → Edge Function: telegram-webhook  (receives Telegram messages)
    → Edge Function: process-prompt    (runs AI chain per idea)
    → Edge Function: start-run         (triggers idea processing)
    → Edge Function: manage-api-keys   (securely stores AI provider keys)
      → LLM (Fireworks / OpenAI / Anthropic)
    ← Results stored in Supabase
  ← React dashboard reads from Supabase
```

No backend server. No Docker. No Kubernetes. Supabase handles the database and edge functions. The frontend is a static React app. The "backend" is four Deno edge functions deployed to Supabase.

---

## Prerequisites

| Thing | Why | Get it |
|-------|-----|--------|
| Node.js 20+ | Frontend + scripts | [nodejs.org](https://nodejs.org) |
| Supabase CLI | Deploy functions & migrations | `npm install -g supabase` |
| Supabase account | Your database | [supabase.com](https://supabase.com) — free tier works |
| Telegram Bot Token | The bot | [@BotFather](https://t.me/BotFather) on Telegram |
| AI API Key | LLM calls | [Fireworks AI](https://fireworks.ai) (recommended) or OpenAI/Anthropic |

> **New to Supabase?** The free tier is generous and perfect for this project. You only need one project.

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

Once it's ready, gather these from the project dashboard:

| What you need | Where to find it | Looks like |
|--------------|-----------------|-----------|
| **Project Ref** | Settings → API → Project Ref | `abcdefghijkl` |
| **Project URL** | Settings → API → Project URL | `https://abcdefghijkl.supabase.co` |
| **Publishable key** | Settings → API → `sb_publishable_...` | `sb_publishable_abc123...` |
| **Secret key** | Settings → API → `service_role` / `sb_secret_...` | `sb_secret_xyz789...` |

Also create a **Personal Access Token** for the CLI:
1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **Generate Token**, name it "brain-overflow-cli", copy the token (`sbp_...`)

> **Save these values somewhere — you'll need them in the next step.**

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` — here's what goes where:

```bash
# ── Required ─────────────────────────────────────────────────────
SUPABASE_PROJECT_REF=abcdefghijkl
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_actual_secret_key
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_actual_publishable_key
ENCRYPTION_KEY=your-super-secret-encryption-key-at-least-32-chars

# ── Optional (CLI speed-up) ──────────────────────────────────────
SUPABASE_ACCESS_TOKEN=sbp_your_personal_access_token

# ── Optional (Telegram bot) ──────────────────────────────────────
# Skip these if you only use the web dashboard. Add later anytime.
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
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
3. Runs all database migrations (creates all tables: `ideas`, `chat_messages`, `flows`, `prompts`, `models`, `idea_runs`, `api_keys`, `telegram_chat_config`, and more)
4. Deploys all four edge functions to Supabase:
   - `telegram-webhook` — receives Telegram messages
   - `process-prompt` — runs the AI prompt chain for each idea
   - `start-run` — triggers idea processing
   - `manage-api-keys` — securely stores your AI provider keys
5. Sets the required secrets in Supabase (`ENCRYPTION_KEY`; also `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALLOWED_USERS` if configured)
6. Configures the Telegram webhook (skipped if no Telegram config)
7. Seeds a default AI model (Llama 3.1 70B on Fireworks)
8. Verifies everything works

If it fails at any step, it tells you why. Fix the issue and re-run — it's idempotent (safe to run again).

> **No Telegram? No problem.** The setup script only requires the Supabase + encryption vars. Leave `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALLOWED_USERS` blank and everything else works fine — you use the web dashboard instead.

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
│   │       ├── start-run/          # Triggers idea processing
│   │       ├── manage-api-keys/    # Securely stores AI provider keys
│   │       └── _shared/           # DB client, CORS, LLM providers
│   ├── scripts/              # setup, seed, reset, sync-telegram-commands
│   └── .env                  # All secrets (never commit this)
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

If you see `toomanyrequests: Rate exceeded`, Docker is rate-limiting image pulls. Run `docker login` to authenticate (gives higher limits) or wait a minute and retry — the limits reset per-IP every 6 hours.

**"Save" button on Models page does nothing / API key not saved**
The `manage-api-keys` edge function was not deployed. Re-run `npm run setup` — it's now included in the deployment step. Make sure `ENCRYPTION_KEY` is set in your `backend/.env`.

---

## Tech stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite, Framer Motion, react-markdown, rehype-highlight
- **Backend:** Supabase (Postgres + Edge Functions), Deno
- **AI:** Fireworks AI (default), OpenAI, Anthropic — pick your poison
- **Integration:** Telegram Bot API

---

## License

Do whatever you want with it. It's your brain overflow now.
