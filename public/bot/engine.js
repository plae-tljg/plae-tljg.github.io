/**
 * engine.js — the same ladder as the Python runtime, in the browser.
 *
 * Why two implementations of one engine is not a mistake here: the runtime is a
 * small interpreter over rows, and the rows are data. So the rows can ship as
 * JSON and the whole bot runs client-side — no server, no hosting cost, and no
 * model on the request path, which was already true.
 *
 * What makes it safe is `pc export` + `web/parity.mjs`: the exported snapshot
 * carries `content/tests.yaml`, and the JS engine runs those same cases. If the
 * two engines disagree, CI says so. A port without that check is a fork.
 *
 * Ported from: personal_chatbots/textnorm.py, resolve.py, frame.py, engine.py
 */

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]/;
const CJK_OR_ASCII = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]|[A-Za-z0-9_]+/g;
const CAMEL = /(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g;

/** Split into comparable tokens. Must match textnorm.tokenize exactly. */
export function tokenize(text) {
  const out = [];
  // \p{L}\p{N} rather than \w: JavaScript's \w is ASCII-only even under /u,
  // while Python's \w under re.UNICODE matches any Unicode letter. Using \w here
  // meant every Chinese question tokenized to NOTHING -- seven characters in,
  // empty array out -- so the engine refused them for the wrong reason and no
  // Chinese pattern could ever match. Caught by adding one Chinese test case and
  // watching the parity check go red.
  for (const match of String(text).matchAll(/\{[^}]*\}|[\p{L}\p{N}_]+/gu)) {
    const token = match[0];
    if (token.startsWith("{")) {
      out.push(token.toLowerCase());
    } else if (CJK.test(token)) {
      out.push(...(token.toLowerCase().match(CJK_OR_ASCII) || []));
    } else {
      // split the original casing: lowercasing first destroys camel boundaries
      for (const part of token.split("_")) {
        for (const piece of part.replace(CAMEL, " ").split(/\s+/)) {
          if (piece) out.push(piece.toLowerCase());
        }
      }
    }
  }
  return out;
}

export const normalize = (text) => tokenize(text).join(" ");
const compact = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "");

// ---------------------------------------------------------------------------
// resolution
// ---------------------------------------------------------------------------

class AliasIndex {
  constructor(entities) {
    this.byType = new Map();
    this.lengths = new Map();
    for (const entity of entities) {
      if (!this.byType.has(entity.type)) this.byType.set(entity.type, new Map());
      const bucket = this.byType.get(entity.type);
      for (const alias of entity.aliases || []) {
        const tokens = tokenize(alias);
        if (!tokens.length) continue;
        const key = tokens.join(" ");
        if (!bucket.has(key)) bucket.set(key, []);
        bucket.get(key).push(entity);
      }
    }
    for (const [type, bucket] of this.byType) {
      const sizes = new Set();
      for (const key of bucket.keys()) sizes.add(key.split(" ").length);
      this.lengths.set(type, [...sizes].sort((a, b) => b - a));
    }
  }

  matches(tokens, type) {
    const bucket = this.byType.get(type);
    if (!bucket) return [];
    const out = [];
    for (const size of this.lengths.get(type) || []) {
      for (let start = 0; start + size <= tokens.length; start++) {
        const entities = bucket.get(tokens.slice(start, start + size).join(" "));
        if (!entities) continue;
        for (const entity of entities) out.push({ start, end: start + size, entity });
      }
    }
    return out;
  }

  matchesAny(tokens) {
    const out = [];
    for (const type of this.byType.keys()) out.push(...this.matches(tokens, type));
    return out;
  }
}

/** Longest non-overlapping matches. Identical spans from different entities
 *  both survive, because that is ambiguity rather than a duplicate. */
function select(matches, taken) {
  const chosen = [];
  const sorted = [...matches].sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);
  for (const match of sorted) {
    if (taken.some(([s, e]) => match.start < e && s < match.end)) continue;
    if (chosen.some((c) => match.start < c.end && c.start < match.end
      && !(match.start === c.start && match.end === c.end))) continue;
    chosen.push(match);
  }
  return chosen;
}

/** Resolve every declared slot, then return the question's skeleton. */
function resolve(tokens, slots, index) {
  const taken = [];
  const assignments = [];
  const chosen = {};
  for (const [slot, type] of Object.entries(slots)) {
    const candidates = select(index.matches(tokens, type), taken);
    if (!candidates.length) return null;
    const distinct = new Set(candidates.map((c) => c.entity.key));
    if (distinct.size > 1) return null; // two things could fill it: refuse
    const best = candidates[0];
    taken.push([best.start, best.end]);
    assignments.push([slot, best]);
    chosen[slot] = best.entity;
  }

  const byStart = new Map(assignments.map(([slot, m]) => [m.start, [slot, m.end]]));
  const parts = [];
  let cursor = 0;
  while (cursor < tokens.length) {
    const hit = byStart.get(cursor);
    if (hit) {
      parts.push(`{${hit[0]}}`);
      cursor = hit[1];
    } else {
      parts.push(tokens[cursor]);
      cursor += 1;
    }
  }
  return { skeleton: parts.join(" "), slots: chosen };
}

function singleEntity(tokens, index) {
  const matches = select(index.matchesAny(tokens), []);
  const distinct = new Map();
  for (const match of matches) distinct.set(match.entity.key, match.entity);
  return distinct.size === 1 ? [...distinct.values()][0] : null;
}

function leftover(tokens, entity, index) {
  const matches = index.matches(tokens, entity.type).filter((m) => m.entity.key === entity.key);
  if (!matches.length) return tokens.filter((t) => !t.startsWith("{"));
  const best = matches.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
  return [...tokens.slice(0, best.start), ...tokens.slice(best.end)].filter((t) => !t.startsWith("{"));
}

// ---------------------------------------------------------------------------
// the frame: cross-turn, derived, not stored
// ---------------------------------------------------------------------------

const ORDINALS = {
  first: 0, "1st": 0, second: 1, "2nd": 1, third: 2, "3rd": 2, fourth: 3, "4th": 3,
  fifth: 4, "5th": 4, sixth: 5, "6th": 5, seventh: 6, "7th": 6, eighth: 7, "8th": 7,
  ninth: 8, "9th": 8, tenth: 9, "10th": 9, last: -1,
  一: 0, 二: 1, 三: 2, 四: 3, 五: 4,
};
const PRONOUNS = new Set(["it", "that", "this", "that one", "this one", "the same", "the same one"]);

function ordinalIndex(tokens) {
  const words = tokens.filter((w) => w !== "the" && w !== "one");
  if (words.length !== 1) return null;
  return Object.prototype.hasOwnProperty.call(ORDINALS, words[0]) ? ORDINALS[words[0]] : null;
}

const PHRASES = (() => {
  const set = new Set(PRONOUNS);
  for (const word of Object.keys(ORDINALS)) {
    set.add(word);
    set.add(`the ${word}`);
    set.add(`${word} one`);
    set.add(`the ${word} one`);
  }
  return [...set].map((p) => p.split(" ")).sort((a, b) => b.length - a.length || (a < b ? -1 : 1));
})();

/** Build a frame from the previous answers. `turns` are {citations:[{key}]}. */
export function frameFrom(turns, index, window = 6) {
  const frame = { subject: null, items: [] };
  // A model answer is excluded: its citations are the context it was given, not
  // a list the visitor was shown. Must match frame.py.
  const answers = turns
    .filter((t) => t.role === "assistant" && t.source !== "fallback")
    .slice(-window);
  let blocked = false;
  for (const row of [...answers].reverse()) {
    const keys = (row.citations || []).map((c) => c.key).filter(Boolean);
    const entities = keys.map((k) => index.entityByKey.get(k)).filter(Boolean);
    if (!entities.length) continue;
    if (entities.length >= 2) {
      if (!frame.items.length) frame.items = entities;
      blocked = true;
    } else if (!frame.subject && !blocked) {
      frame.subject = entities[0];
    }
    if (frame.items.length && frame.subject) break;
  }
  return frame;
}

/** Rewrite referring expressions into the entities they point at. */
export function applyFrame(tokens, frame) {
  if (!frame || (!frame.subject && !frame.items.length)) return { tokens: [...tokens], refs: {} };

  const found = [];
  let cursor = 0;
  while (cursor < tokens.length) {
    let hit = null;
    for (const phrase of PHRASES) {
      const end = cursor + phrase.length;
      if (end > tokens.length) continue;
      if (phrase.some((w, i) => tokens[cursor + i] !== w)) continue;
      const ordinal = ordinalIndex(phrase);
      const entity = ordinal !== null
        ? (ordinal < 0 ? frame.items[frame.items.length + ordinal] : frame.items[ordinal])
        : frame.subject;
      if (!entity) continue;
      hit = { start: cursor, end, phrase: phrase.join(" "), entity };
      break;
    }
    if (!hit) { cursor += 1; continue; }
    found.push(hit);
    cursor = hit.end;
  }

  const rewritten = [...tokens];
  for (const ref of [...found].sort((a, b) => b.start - a.start)) {
    rewritten.splice(ref.start, ref.end - ref.start, ...tokenize(ref.entity.name));
  }
  const refs = {};
  for (const ref of found) refs[ref.phrase] = ref.entity.key;
  return { tokens: rewritten, refs };
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------

const stringify = (v) => {
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (Array.isArray(v)) return v.map(stringify).join(", ");
  return v === null || v === undefined ? "" : String(v);
};

const render = (template, values) =>
  String(template).replace(/\{[^}]*\}/g, (whole) =>
    Object.prototype.hasOwnProperty.call(values, whole) ? values[whole] : whole);

function entityValues(slot, entity) {
  const values = {
    [`{${slot}}`]: entity.name,
    [`{${slot}.key}`]: entity.key,
    [`{${slot}.name}`]: entity.name,
    [`{${slot}.summary}`]: entity.summary || "",
    [`{${slot}.url}`]: entity.url || "",
    [`{${slot}.entity_type}`]: entity.type,
  };
  for (const [k, v] of Object.entries(entity.attrs || {})) values[`{${slot}.attrs.${k}}`] = stringify(v);
  return values;
}

function rowValues(entity) {
  const values = {
    "{key}": entity.key, "{name}": entity.name, "{summary}": entity.summary || "",
    "{url}": entity.url || "", "{entity_type}": entity.type,
  };
  for (const [k, v] of Object.entries(entity.attrs || {})) values[`{attrs.${k}}`] = stringify(v);
  return values;
}

const cite = (e) => ({ key: e.key, label: e.name, url: e.url || "" });

// ---------------------------------------------------------------------------
// the bot
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(`a an and are about do does for from how i in is it me my of on or tell that the
  to what when where which who why you your have has can could would`.split(/\s+/));
const FILLER = new Set(["what", "is", "who", "about", "the", "tell", "me", "a", "an", "of",
  "do", "you", "know", "and", "also", "then", "next", "please"]);

export function createBot(data) {
  const index = new AliasIndex(data.entities);
  // id -> entity, for links. Not keyed by `key`: a key is unique only within a
  // type, and `plae-tljg` is both an account and the person who owns it.
  index.byId = new Map(data.entities.map((e) => [e.id, e]));
  // key -> entity, for the citations a frame reads back. First wins, matching
  // Store.entity_by_key's ORDER BY id LIMIT 1 -- a last-wins Map silently picked
  // the person where Python picked the account.
  index.entityByKey = new Map();
  for (const e of data.entities) if (!index.entityByKey.has(e.key)) index.entityByKey.set(e.key, e);
  const byType = new Map();
  for (const e of data.entities) {
    if (!byType.has(e.type)) byType.set(e.type, []);
    byType.get(e.type).push(e);
  }
  const bot = data.bot;
  const knowledge = data.knowledge;

  function runAction(row, slots) {
    const action = row.action || {};
    if (action.kind === "refuse") return { text: action.template || bot.refuse_template, citations: [] };

    if (action.kind === "answer") {
      const values = {};
      const cited = [];
      for (const [name, entity] of Object.entries(slots)) {
        Object.assign(values, entityValues(name, entity));
        cited.push(entity);
      }
      const citations = cited.map(cite);
      for (const extra of row.citations || []) {
        const url = render(extra, values);
        if (url && !citations.some((c) => c.url === url)) citations.push({ key: url, label: url, url });
      }
      return { text: render(action.template, values), citations };
    }

    if (action.kind === "list") {
      let entities;
      if (action.link_type) {
        const slotName = Object.keys(row.slots || {})[0];
        const from = slots[slotName];
        if (!from) return { text: "", citations: [] };
        const links = data.links || [];
        const want = action.direction === "out" ? "from" : "to";
        const other = want === "from" ? "to" : "from";
        entities = links
          .filter((l) => l.type === action.link_type && l[want] === from.id)
          .map((l) => index.byId.get(l[other]))
          .filter((e) => e && e.type === action.entity_type);
      } else {
        entities = [...(byType.get(action.entity_type) || [])];
        const order = String(action.order_by || "id");
        const desc = /\sdesc$/i.test(order);
        const column = order.split(/\s+/)[0];
        const value = (e) => (column.startsWith("attrs.")
          ? (e.attrs || {})[column.slice(6)]
          : (column === "name" ? e.name : e.key));
        entities.sort((a, b) => {
          const x = value(a); const y = value(b);
          if (x === y) return 0;
          if (x === undefined || x === null) return 1;
          if (y === undefined || y === null) return -1;
          const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x) < String(y) ? -1 : 1;
          return desc ? -cmp : cmp;
        });
      }
      const limit = Number(action.limit || 0);
      if (limit) entities = entities.slice(0, limit);
      if (!entities.length) return { text: "", citations: [] };
      const lines = entities.map((e) => "• " + render(action.template || "{name}", rowValues(e)));
      return { text: lines.join("\n"), citations: entities.map(cite) };
    }

    return { text: "", citations: [] };
  }

  // ---- typo tolerance (mirror of personal_chatbots/similarity.py) ----------
  // Drift between these two implementations is what web/parity.mjs exists to
  // catch, so this is a deliberate transliteration rather than a tidier
  // rewrite: same rules, same thresholds, same refusals.

  const LONG_PATTERN_TOKENS = 8;
  const MIN_TOKENS_FOR_FUZZ = 4;

  // Damerau-Levenshtein: a swapped pair costs one, not two. "abotu" is one
  // slip of the fingers to a reader, and plain Levenshtein calls it two edits.
  function editDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let twoBack = null;
    let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const current = [i];
      for (let j = 1; j <= b.length; j++) {
        let cost = Math.min(
          previous[j] + 1,
          current[j - 1] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] && twoBack) {
          cost = Math.min(cost, twoBack[j - 2] + 1);
        }
        current.push(cost);
      }
      twoBack = previous;
      previous = current;
    }
    return previous[b.length];
  }

  function pairCost(left, right) {
    return Math.min(editDistance([...left], [...right]), Math.max(left.length, right.length));
  }

  function wordDistance(a, b) {
    if (a.length === 0) return b.reduce((n, w) => n + w.length, 0);
    if (b.length === 0) return a.reduce((n, w) => n + w.length, 0);
    let previous = [0];
    for (const w of b) previous.push(previous[previous.length - 1] + w.length);
    for (const left of a) {
      const current = [previous[0] + left.length];
      for (let j = 1; j <= b.length; j++) {
        current.push(Math.min(
          previous[j] + left.length,
          current[j - 1] + b[j - 1].length,
          previous[j - 1] + pairCost(left, b[j - 1]),
        ));
      }
      previous = current;
    }
    return previous[b.length];
  }

  function skDistance(skeleton, pattern) {
    const sk = skeleton.split(" ").filter(Boolean);
    const pat = pattern.split(" ").filter(Boolean);
    return Math.min(wordDistance(sk, pat), editDistance(sk, pat));
  }

  function fuzzLimit(pattern) {
    const n = pattern.split(" ").filter(Boolean).length;
    if (n < MIN_TOKENS_FOR_FUZZ) return 0;
    return n >= LONG_PATTERN_TOKENS ? 2 : 1;
  }

  function slotTokens(text) {
    return text.split(" ").filter((w) => w.startsWith("{"));
  }

  // The one pattern this skeleton may be matched to, or null.
  // Exported below as well: web/engine.test-ish parity is checked from Python
  // (tests/test_similarity.py) by asking this file for the same numbers, so a
  // tweak to one implementation cannot pass unnoticed.
  function bestMatch(skeleton, patterns, exclude, slotTypes) {
    const blocked = new Set(exclude || []);
    const sk = skeleton.split(" ").filter(Boolean);
    const pat0 = slotTokens(skeleton);
    const names0 = pat0.map((w) => w.replace(/[{}]/g, ""));
    const types = slotTypes || {};
    const scored = [];
    for (const raw of patterns) {
      if (blocked.has(raw)) continue;
      const parts = raw.split(" ").filter(Boolean);
      const slotTokensHere = parts.filter((w) => w.startsWith("{"));
      if (slotTokensHere.join(" ") !== pat0.join(" ")) continue;
      // A placeholder is only satisfied by the same kind of placeholder.
      const hereNames = slotTokensHere.map((w) => w.replace(/[{}]/g, ""));
      if (hereNames.length) {
        const a = hereNames.map((n) => types[n] || "").sort().join(",");
        const b = names0.map((n) => types[n] || "").sort().join(",");
        if (a !== b) continue;
      }
      const limit = fuzzLimit(raw);
      if (limit === 0) continue;
      if (pat0.length && parts.length) {
        if (sk[0] !== parts[0]) continue;
        if (pairCost(sk[sk.length - 1], parts[parts.length - 1]) > 1) continue;
      }
      const gapTokens = Math.abs(sk.length - parts.length);
      const gapChars = Math.abs(skeleton.length - raw.length);
      if (gapTokens > limit && gapChars > limit) continue;
      const d = skDistance(skeleton, raw);
      if (d <= limit) scored.push([d, raw]);
    }
    if (!scored.length) return null;
    scored.sort((x, y) => x[0] - y[0]);
    // Equally close means ambiguous, and ambiguity refuses.
    if (scored.length > 1 && scored[0][0] === scored[1][0]) return null;
    return scored[0];
  }

  // Exact patterns first, then one fuzzy pass. Same order as Python: nothing
  // that used to match can start matching differently.
  function rungKnowledge(tokens) {
    return knowledgePass(tokens, false) || knowledgePass(tokens, true);
  }

  function knowledgePass(tokens, fuzzy) {
    const candidates = [];
    for (const row of knowledge) {
      if (row.locale && row.locale !== bot.default_locale) continue;
      const resolved = resolve(tokens, row.slots || {}, index);
      if (!resolved) continue;
      const joined = tokens.join(" ");
      const require = (row.match?.require || []).map(normalize).filter(Boolean);
      const exclude = (row.match?.exclude || []).map(normalize).filter(Boolean);
      if (require.some((w) => !joined.includes(w))) continue;
      if (exclude.some((w) => joined.includes(w))) continue;
      const patterns = (row.patterns || []).map(normalize);
      let distance = 0;
      if (fuzzy) {
        const hit = bestMatch(resolved.skeleton, patterns, exclude, row.slots || {});
        if (!hit) continue;
        distance = hit[0];
      } else if (!new Set(patterns).has(resolved.skeleton)) {
        continue;
      }
      candidates.push({ distance, row, resolved });
    }
    if (!candidates.length) return null;
    candidates.sort((a, b) => a.distance - b.distance);
    if (fuzzy && candidates.length > 1 && candidates[0].distance === candidates[1].distance) {
      // Two rows equally close: the question is between things, not a bad
      // spelling of one. Refuse, exactly as the entity resolver does.
      return null;
    }
    const { distance, row, resolved } = candidates[0];
    const result = runAction(row, resolved.slots);
    if (!result.text) return null;
    return {
      text: result.text, source: "knowledge", citations: result.citations,
      matched: row.slug,
      // `slots` is part of the public answer shape (slot -> key), so the
      // resolved entities ride alongside it: a key alone cannot be looked up
      // unambiguously, and the follow-ups need the entity.
      slots: Object.fromEntries(
        Object.entries(resolved.slots).map(([k, v]) => [k, v.key])),
      _slotEntities: Object.values(resolved.slots),
      // Present only when a typo was tolerated, so the page can say so.
      ...(distance ? { fuzzy: distance } : {}),
    };
  }

  function rungEntity(tokens) {
    const entity = singleEntity(tokens, index);
    if (!entity || !entity.summary) return null;
    const rest = new Set(leftover(tokens, entity, index));
    for (const token of rest) if (!FILLER.has(token)) return null;
    return {
      text: `${entity.name} — ${entity.summary}`, source: "entity",
      citations: [cite(entity)], matched: entity.key, slots: {},
    };
  }

  function rungSearch(tokens) {
    const entity = singleEntity(tokens, index);
    if (!entity) return null;
    const words = leftover(tokens, entity, index)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !FILLER.has(w))
      .slice(0, 3);
    if (!words.length) return null;
    let best = null;
    for (const doc of data.documents) {
      if (doc.entity_key !== entity.key) continue;
      const haystack = `${doc.title}\n${doc.body}`;
      if (!words.every((w) => haystack.includes(w))) continue;
      best = doc;
      break;
    }
    if (!best) return null;
    const body = best.body.split(/\s+/).filter(Boolean).join(" ");
    return {
      text: `From the ${best.title} README: ${body.slice(0, 280)}${body.length > 280 ? "…" : ""}`,
      source: "search", citations: [cite(entity)], matched: best.slug, slots: {},
    };
  }

  // A bilingual site serves one engine, so the refusal follows the question's
  // language rather than the config's default. Must match engine.py exactly.
  const rungRefuse = (tokens) => {
    const zh = tokens.some((t) => CJK.test(t));
    const template = (zh && bot.refuse_template_zh) || bot.refuse_template;
    return { text: template, source: "refuse", citations: [], matched: "", slots: {} };
  };

  const RUNGS = { knowledge: rungKnowledge, entity: rungEntity, search: rungSearch, refuse: rungRefuse };

  /** Answer one question. `turns` is the session so far, used only to rewrite
   *  referring expressions — no rung below reads it, which is why context cost
   *  no state. */
  function ask(question, turns = []) {
    const started = performance.now();
    const frame = turns.length ? frameFrom(turns, index) : null;
    const { tokens, refs } = applyFrame(tokenize(question), frame);

    let answer = null;
    for (const name of bot.ladder) {
      const rung = RUNGS[name];
      if (!rung) throw new Error(`bot.json: rung ${name} is not implemented in the browser engine`);
      answer = rung(tokens);
      if (answer && (answer.text || answer.source === "refuse")) break;
    }
    if (!answer || !(answer.text || answer.source === "refuse")) answer = rungRefuse(tokens);
    const resolved = answer._slotEntities || [];
    delete answer._slotEntities;
    return {
      ...answer,
      refs,
      suggestions: suggestions(tokens, {
        exclude: answer.source === "knowledge" ? answer.matched : "",
        extra: resolved,
      }),
      latency_ms: Math.round((performance.now() - started) * 1000) / 1000,
      tokens: 0,
    };
  }

  /** Run the exported content/tests.yaml — the same cases Python runs. */
  function selfCheck() {
    const results = [];
    for (const test of data.tests || []) {
      if ((test.status || "active") !== "active") continue;
      const answer = ask(test.question);
      const notes = [];
      const expect = test.expect || {};
      const text = answer.text.toLowerCase();
      if ("refuses" in expect && (answer.source === "refuse") !== !!expect.refuses) {
        notes.push(`expected refuses=${!!expect.refuses}, got ${answer.source}`);
      }
      if (expect.source && answer.source !== expect.source) {
        notes.push(`expected source=${expect.source}, got ${answer.source}`);
      }
      for (const [slot, key] of Object.entries(expect.resolves || {})) {
        if (answer.slots[slot] !== key) notes.push(`expected ${slot} -> ${key}, got ${answer.slots[slot]}`);
      }
      for (const needle of expect.answer_contains || []) {
        if (!text.includes(String(needle).toLowerCase())) notes.push(`missing ${JSON.stringify(needle)}`);
      }
      for (const needle of expect.answer_excludes || []) {
        if (text.includes(String(needle).toLowerCase())) notes.push(`unexpected ${JSON.stringify(needle)}`);
      }
      for (const needle of expect.cites || []) {
        const n = String(needle).toLowerCase();
        if (!answer.citations.some((c) =>
          c.key.toLowerCase().includes(n) || (c.url || "").toLowerCase().includes(n)
          || (c.label || "").toLowerCase().includes(n))) notes.push(`no citation matching ${JSON.stringify(needle)}`);
      }
      results.push({ slug: test.slug, passed: notes.length === 0, notes, got: answer });
    }
    return results;
  }

  // -- follow-ups ------------------------------------------------------------
  //
  // The same rule as engine.py: only offer a question this bot can actually
  // answer. A suggestion that would itself refuse is worse than none. Once an
  // answer has resolved a slot, only that entity is used; after a refusal,
  // anything the question named is fair game.

  function entitiesInPlay(tokens, extra) {
    const entities = extra && extra.length ? extra : index.matchesAny(tokens).map((m) => m.entity);
    const byType = new Map();
    for (const entity of entities) {
      if (!byType.has(entity.type)) byType.set(entity.type, []);
      const bucket = byType.get(entity.type);
      if (!bucket.some((e) => e.key === entity.key)) bucket.push(entity);
    }
    return byType;
  }

  function example(row, byType) {
    const pattern = (row.patterns || [])[0];
    if (!pattern) return "";
    let rendered = pattern;
    for (const [slot, type] of Object.entries(row.slots || {})) {
      const candidates = byType.get(type) || [];
      if (!candidates.length) return ""; // would not resolve: do not offer it
      rendered = rendered.split(`{${slot}}`).join(candidates[0].name);
    }
    return rendered;
  }

  function suggestions(tokens, { exclude = "", extra = [], limit = 3 } = {}) {
    const byType = entitiesInPlay(tokens, extra);
    const out = [];
    for (const row of knowledge) {
      if (row.slug === exclude || row.action?.kind === "refuse") continue;
      const text = example(row, byType);
      if (text && !out.includes(text)) out.push(text);
      if (out.length >= limit) break;
    }
    return out;
  }

  return { ask, selfCheck, suggestions, index, data };
}

export { compact };
