# Agents

Each file defines one LLM agent. Frontmatter is machine-read by `src/agents/spec.js`:

- `name` — agent id
- `skills` — skill folders whose SKILL.md bodies are injected as playbooks
- `tier` — `fast` or `deep` (maps to model order in `SELLMAN_MODELS_FAST` / `SELLMAN_MODELS_DEEP`)
- `budget_usd_month` — kill switch pauses the agent above this
- `required_keys` — top-level keys the JSON output must contain
- `approval` — `none`, `always`, or `first` (first output of each kind)
- `web_search` — whether the router may attach a web search tool

Everything under `## System prompt` becomes the system prompt. Agents return JSON only; workers do the rest.
