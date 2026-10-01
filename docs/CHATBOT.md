# The chatbot on this site

The "ask about my work" bot is a **floating chatroom in the bottom-right
corner** of every page. It is a static bundle: no server, no API key, no model
call at request time, and nothing on the page's critical path until a visitor
opens it.

The bot itself is not written here. It lives in the private `personal-chatbots`
repository, where its knowledge base is compiled — its rows are data, so
`pc export --bundle` writes the whole knowledge base as JSON plus the browser
engine that reads it. This repository only *hosts* the compiled result.

```text
~/Music/personal-chatbots/                the compiler + the source of truth
  content/*.yaml · data/bot.db
        │
        │  npm run bot:sync        ← runs `pc export --bundle public/bot` there
        v
this repo
  public/bot/data.json      every row: 11 knowledge rows, 176 entities, 43 docs
  public/bot/engine.js      the ladder, ~700 lines, no dependencies
  public/bot/CONTRACT.md    what these files are (written by the compiler)
  src/content/.bot-manifest.json   hashes + counts, written by the sync
  src/components/ChatBot.astro     the widget that hosts them
        │
        │  npm run build
        v
the browser               0 tokens, 0 servers, 0 request-time anything
```

## Commands

| Command | What it does |
|---|---|
| `npm run bot:status` | What the committed bundle is, and whether it still matches the manifest |
| `npm run bot:sync` | Compile in the source repo, copy `data.json` + `engine.js` + `CONTRACT.md` into `public/bot/`, rewrite the manifest |
| `npm run bot:sync -- --dry-run` | Show what sync would run, write nothing |
| `npm run bot:verify` | CI gate: fail if `public/bot` was edited by hand or is missing |

The source repository is set by `BOT_SYNC.source` in [`src/site.mjs`](../src/site.mjs)
(`~/Music/personal-chatbots`, override with `BOT_SOURCE=/path/to/repo`). Python is
`<source>/.venv/bin/python` if it exists, else `python3`; override with
`BOT_PYTHON=…`.

`sync` runs the compiler's documented invocation in the source repository. That
refreshes the source repo's own gitignored `web/data.json` as a side effect —
the artifact the compiler is designed to write — and touches nothing else there.

## Why the bundle is committed

CI builds this repository on a GitHub runner, which has no access to the private
compiler repository. The compiled artifacts therefore have to be in the tree —
`data.json` is ~290 KB raw, ~95 KB gzipped, and `engine.js` is ~28 KB raw,
~9 KB gzipped. Static hosts gzip; this is smaller than one photograph.

They are generated files, so `npm run bot:verify` (also run in CI) fails if
anyone edits them by hand. That is the same contract `content:verify` enforces
for articles: **one source of truth, and it is not this repository.**

## The widget

`src/components/ChatBot.astro` is mounted by `src/layouts/BaseLayout.astro`, so
it appears on every page. Its styles are the `.lkm-bot__*` block in
`src/styles/global.css` and use the site's theme tokens, so light/dark comes for
free.

What it does:

- **Floating launcher, bottom-right, draggable.** Position is clamped to the
  viewport and remembered in `localStorage` (`lkm.bot.pos.v1`); a drag never
  counts as a click, and the panel opens on the side of the launcher that has
  room, shrinking rather than covering the button.
- **Lazy.** `engine.js` and `data.json` are imported on the first open, so a
  reader who never opens the widget pays nothing for it.
- **Chatroom, not a single thread.** Conversations are listed in a drawer
  (new / switch / delete), and the transcript is replayed with the same
  citations and the same rung that produced each answer. Sessions live in
  `localStorage` (`lkm.bot.v1`) — there is no server, so a visitor's transcript
  is theirs.
- **References carry across turns.** Turns are stored with `role: "assistant"`,
  which is what the engine reads back to resolve "tell me about the second one".
  Without that field the engine silently cannot tell which list is meant.
- **Honest about provenance.** Every answer carries badges: which rung answered
  (`knowledge:repo.about`), the latency, the citations, a near-match warning if
  the question was matched fuzzily, and "question recorded" on a refusal.
- **Self-checking.** The frozen cases ship inside `data.json`, so the drawer's
  *run the frozen cases here* button runs the same assertions the Python runtime
  runs — in the visitor's browser.

### One thing to know before changing the content

The knowledge rows are **English**. A Chinese question therefore gets the
Chinese refusal template (`这个我的表里没有答案，我记下来了。`) rather than an
answer. That is the bot behaving correctly, not a bug: the refusal is the
feature that makes the answers credible. The empty state says so in the `zh`
locale (`chatLangNote` in `src/site.mjs`) and offers English sample questions,
because a click should never land on a refusal.

### There is no model fallback, and that is deliberate

The server build (`pc serve`) can fall back to a model. A static page cannot:
a browser-side call needs the key in the page, where anyone can read it, and
the endpoint the fallback uses sends no `Access-Control-Allow-Origin` header, so
the browser withholds the reply with or without a key. `docs/STATIC_SITE.md` in
the compiler repository has the `curl` that settles it. The public site stays
deterministic and refuses.

## Changing what the bot knows

1. Edit `content/*.yaml` in `personal-chatbots` and run its tests there
   (`python -m personal_chatbots test`).
2. `npm run bot:sync` here.
3. Commit `public/bot/` and `src/content/.bot-manifest.json` with the site.

Never edit anything in `public/bot/` directly; the next sync overwrites it and
CI fails before that.
