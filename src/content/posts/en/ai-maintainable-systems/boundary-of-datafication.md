---
title: 02 When Do You Actually Need a Products Table? The Boundary of Datafication
summary: >-
  After moving behaviour into data, a natural question follows: why not
  generalise all the way, and make products and prices just entities and
  attributes? Instead of synthesising too early, this article lets the generic
  extreme fail in concrete ways — JSON conventions, ugly queries, weak
  validation — then derives promotion conditions from that failure and
  demonstrates a migration where the knowledge template stays unchanged.
lang: en
translationKey: boundary-of-datafication
slug: boundary-of-datafication
date: '2026-10-01'
series: ai-maintainable-systems
seriesOrder: 2
tags:
  - AI
  - data
  - 表结构
  - 辩证
status: preview
aiTranslated: true
source: seasons/02-systems/02-boundary-of-datafication.en.md
syncedAt: '2026-10-04T14:43:38.330Z'
---
## 0. The Boundary Question Left by the Previous Article

The previous article concluded: code and data are two materials, and structure is the boundary contract between them; the hardest line among them is **generic data vs domain tables**. It stopped at a concrete question:

```text
entities + entity_links + attrs_json
```

A product can be just:

```json
{
  "entity_type": "product",
  "key": "sku:iphone-17",
  "attrs_json": { "price_cents": 99900 }
}
```

But this immediately raises a question:

> Since a product can be a generic entity, why do we still need a domain table like `products`?  
> If we never need it, where does structure live?  
> If we do need it, why wasn't it needed from day one?

This article doesn't rush to an answer. First, let both extremes fail for real, then derive the boundary from those failures.

## 1. Seriously Stay at the "Fully Generic" End First

Suppose we really insist:

- No `products` table;
- No typed columns;
- All business facts go into `attrs_json`.

At first it works great: new domains need no migrations, AI just adds a few rows of data.

Then the system grows. The first failure is **naming drift**.

Three months later, when querying prices you might see:

```json
{"price_cents": 99900}
{"price": 999}
{"priceCents": 99900}
{"price_usd": "999.00"}
```

No one deliberately created divergence; different people, different agents, different times simply made different naming choices. The database never rejected any of them.

The second failure is **validation decay**:

- Price can be negative;
- Currency can be USD, HKD, or missing;
- "Stock" can be a number, a string, or absent;
- A delisted product might still have a price, but no one knows whether that's a legal state.

The third failure is **queries turn ugly**:

```sql
SELECT *
FROM entities
WHERE entity_type = 'product'
  AND json_extract(attrs_json, '$.price_cents') > 10000
  AND status = 'live'
```

Once such queries multiply, performance, indexes, and readability all start exacting a price.

This shows:

> **Genericisation does not eliminate structure; it merely moves structure from the schema into conventions, naming, and queries.**

Structure becomes **reconstructed structure**: every person reading it, every AI session, every debugging round has to piece it back together from scratch.

### 1.1 Declared Structure vs Reconstructed Structure

The same structure can live in two places:

- **Declared structure**: columns, constraints, vocabularies. Declared once at write time, the engine and database read it;
- **Reconstructed structure**: naming conventions, comments, JSON keys. Every reader, every AI session, every query has to piece it back together from scratch.

The goal isn't to eliminate structure, but to minimise reconstructed structure.

### 1.2 How Long Is the Handoff Brief?

An actionable test:

> **How long is the handoff brief?** Every sentence an AI or new maintainer needs to be told before they can act is structure that hasn't been declared yet.

But declared structure has costs too: migrations, coupling, a badly designed column is harder to delete than to add. So the goal isn't less structure the better, but to compress the declared structure that must be kept down to the necessary minimum.

## 2. Seriously Stay at the "One Table Per Domain" End

The other extreme is creating a table for every domain that arrives:

```text
products
orders
coupons
flows
rules
...
```

It queries conveniently, constrains strongly, teams know it well. But the price is:

- New domains need migrations and deployments;
- AI cannot truly extend the system, only modify existing domains;
- Lots of repeated structure: status, source, time, audit;
- When a domain changes, the schema changes with it.

Its failure mode isn't "can't express" — it's "can't evolve lightly".

## 3. Don't Rush to Synthesise: Compare with the Same Currency

The two extremes aren't "one more advanced" — they put the same kind of cost in different places. We can compare on four dimensions:

| Dimension | Fully Generic Entities | One Table Per Domain |
|---|---|---|
| Add domain | Add data, 0 migrations | Add table, 1 migration |
| Queries & constraints | Weak, relies on JSON & conventions | Strong, database can enforce |
| Readability & handoff | Every reader reconstructs | Schema explains directly |
| Evolution cost | Low (data layer), high (semantic layer) | Low (semantic layer), high (schema layer) |

The real question isn't "domain table or not", but:

> Put structure in conventions, or put it in the schema?  
> Which cost hurts more in the current system?

## 4. Derive Promotion Conditions from Failure

Promotion conditions shouldn't be a checklist; they should be derived from the failures above.

### 4.1 When Data Is No Longer a "Thing"

Order lines, inventory streams, price history aren't entities — they're events / state changes. Forcing events into `attrs_json` makes queries and temporal relationships awkward. That's when you need fact tables.

### 4.2 When the Database Can Enforce but Validators Struggle

Multi-column unique, foreign keys, cross-row CHECK — these constraints are natively stronger in the database. If they're prerequisites for business correctness, promotion is worth it.

### 4.3 When Query Pain Is Measured, Not Imagined

JSON queries aren't slow because you "feel 50k SKUs would be slow", but because:

- There are real slow queries;
- There are real index needs;
- There are real aggregations and sorts.

Measure first, then split.

### 4.4 When External Schema Doesn't Let You Choose

Integrating with ERP, payments, inventory systems — the other side gives you a fixed schema. You no longer design it; you can only adapt.

### 4.5 Two Counterexamples

Even when the above conditions hold, you might still not promote:

- Large data volume but few, cold queries; bottleneck isn't in JSON; optimisation would just be premature complexity.
- Query pain exists but can be solved with materialised views or index optimisation, without changing the core model.

Even when the above conditions don't hold, you might still be forced to promote:

- External schema forces you; even without internal query pain, you still need the table.

So promotion isn't a rule table — it's:

> Only move the boundary when one cost genuinely outweighs the other.

## 5. A Real Promotion: Knowledge Template Unchanged

Below I demonstrate a promotion where the key point isn't how elegant the SQL is, but that **the knowledge layer doesn't change**.

### 5.1 Before Promotion

Entity row:

```json
{
  "entity_type": "product",
  "key": "sku:iphone-17",
  "attrs_json": { "price_cents": 99900 }
}
```

Knowledge row:

```yaml
- slug: product.price
  patterns: ["how much is {product}"]
  slots: { product: product }
  action:
    kind: answer
    template: "{product} is {price}."
```

Test:

```yaml
- name: product.price.iphone
  question: "how much is iphone-17"
  expect:
    resolves: { product: "sku:iphone-17" }
    answer_contains: ["999.00"]
```

### 5.2 After Promotion

Add `products` table, entity backbone stays:

```sql
CREATE TABLE products (
  entity_id    INTEGER PRIMARY KEY REFERENCES entities(id),
  price_cents  INTEGER NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'USD',
  stock        INTEGER NOT NULL DEFAULT 0
);
```

When the storage layer reads price, it takes from `products` instead of `attrs_json`. But:

- The knowledge template (`knowledge`) remains `{product}` and `{price}`;
- The parser's returned context still contains `price`;
- Test cases don't need rewriting;
- Only the data projection and SQL change.

This is the payoff of parameterisation:

> **Storage form can change; knowledge sentences don't.**

## 6. A Domain Table Is Also a Naming Act

One layer often overlooked: the word `products` itself does naming work for future readers.

`entity_type='product'` + vocabulary entries scatter the definition of "what is this thing" across code, data, docs, and human memory; a `products` table declares that definition in one place.

This is its advantage, and its cost:

- Advantage: handoff brief gets shorter, readers know faster what lives here;
- Cost: once a name is public it's hard to change, table coupling locks future choices.

So "domain table = naming act" isn't rhetoric — it means at promotion time you must additionally ask:

> Is this name stable enough to become part of the schema?

If the answer is uncertain, maybe let it exist as vocabulary / entity_type first, wait for enough evidence before solidifying.

## 7. Four Homes: Where Structure Ultimately Lives

Whether promoted or not, structure must be divided into four homes:

| Home | Who Changes | Change Means |
|---|---|---|
| Config | Humans | One deployment |
| Content | Humans & AI (reviewed) | One PR |
| Data | Build process | One rebuild |
| State | Runtime | Append-only; never rebuilt |

Two further lines:

- **Offline / Online**: content diffable offline; projection queryable online; runtime reads projection only;
- **Build / Online**: build tables stateless; state lives only in online tables.

These four boundaries matter more than "is there a products table". They decide:

- Which layer AI modifies;
- Whether rebuild hurts state;
- What review sees;
- Where a new structure should land.

### 7.1 State Must Also Be Earned

Domain tables aren't the only thing over-created; state tables are too.

"The second" can be rewritten from the previous round's citation — no state table needed; only when a value must persist across rounds ("How many people?" -> "3") do flow and state deserve to exist. Conversely, step state in GUI automation is a real need because recognition and action inherently have sequence and branching. `MaaFwPhoneAI` is a domain where state must be modelled.

So state isn't taboo — it must be earned by cross-round values or side effects.

## 8. Notes & Boundaries

- This article doesn't advocate "never domain tables". It advocates: promotion triggered by real cost, not by intuition.
- If the business inherently demands strong transactions, strong constraints, heavy queries, domain tables may belong on day one.
- If the team lacks capacity to maintain schema, generic entities fit better; if the team lacks capacity to maintain conventions, domain tables fit better.
- Author's bias: start with generic structure for evolution speed, wait until one cost genuinely outweighs the other, then promote.

## 9. The Next Question

We have the datafication boundary, and knowledge sentence stability. But one question remains unanswered:

> **After AI changes data / structure, how do we know the change actually made the system better?**

That's exactly the next article's topic: verification, permissions, and wake-up cost.

<!-- CTA: GitHub / newsletter / contact links are intentionally left blank until the launch gate. -->
