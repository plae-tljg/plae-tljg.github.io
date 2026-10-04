---
title: '01 After the Rapid Prototype: Code, Data, and Structure'
summary: >-
  The two tempting shortcuts for a rapid chatbot prototype are wrapping an agent
  CLI as the backend, or hardcoding rules and letting an agent maintain them.
  Both work at low traffic; the failure appears once the system accumulates
  changes. The answer is not that data beats code, but that code and data need
  the right boundary: what should be declared as data, what must stay in code,
  and who guards the structure.
lang: en
translationKey: rapid-prototypes-and-structure
slug: rapid-prototypes-and-structure
date: '2026-10-01'
series: ai-maintainable-systems
seriesOrder: 1
tags:
  - AI
  - structure
  - prototype
  - data
status: preview
aiTranslated: true
source: seasons/02-systems/01-rapid-prototypes-and-structure.en.md
syncedAt: '2026-10-04T14:43:38.330Z'
---
## 1. A Very Typical Friday Afternoon

Suppose you want to build a chatbot quickly, or any small app that uses AI. What you want to validate is "will anyone use it", not "can it be written as a textbook architecture". So you quite naturally do not want to write a data access layer, migrations, permissions, channels, read/write modules, and a review process.

Then you see two shortcuts.

**Shortcut one: treat the agent as the backend.**

```python
# 伪代码：把 agent 命令包成一个 API
import subprocess
from fastapi import FastAPI

app = FastAPI()

@app.post("/chat")
def chat(question: str):
    result = subprocess.run(
        ["claude", "-p", question],   # 或 opencode -c、其他 agent 命令
        capture_output=True, text=True,
    )
    return {"answer": result.stdout}
```

A user request comes in and is forwarded straight to the agent. You write no schema, no permissions, no channels, no read/write modules, and you can demo it in an afternoon. This is not writing a system; it is letting an agent play the whole system for a while.

**Shortcut two: hardcode first, then let an agent maintain it.**

```python
if "price" in question and "iphone" in question:
    return "iPhone is $999."

if "refund" in question:
    return "Refunds are available within 14 days."
```

It is more stable and cheaper at runtime. During the rapid-prototype stage that is a reasonable choice. The problem comes after: the price changed, edit a branch; the wording changed, add a branch; a bug, toss it to the agent to fix the code. After dozens of repetitions, no one can state in full what the system now knows.

## 2. At Low Traffic, Both Shortcuts Can Be Right

One counterexample has to be admitted:

> If the prototype lives only three days, traffic is low, the model is cheap enough to ignore, and the system barely changes — both shortcuts are rational.

Short-circuiting a prototype is not a sin; treating a one-off prototype as a system that will keep growing is.

So what you actually have to judge is:

- Will it keep changing?
- Do changes need to be verified?
- Besides the author, does anyone else need to review / understand it?
- When something breaks, is the loss just one demo, or has a customer already come to depend on it?

If even one answer is "yes", the shortcuts start getting expensive. But their shared problem is not "used an agent" or "used hardcoding", it is:

> **The system gives change no verifiable landing point.**

With an agent as the backend, the landing point does not exist; with hardcoding plus agent maintenance, the landing point is the code that is hardest to verify.

## 3. A Conclusion Reached Too Fast

At this point it is easy to reach a conclusion:

> Then let AI change the data, not the code. Data is better suited than code to AI maintenance.

That conclusion moves too fast, and it would carry the whole season toward a wrong premise.

It is wrong in two ways:

1. **Code is not bad.** Algorithms, side effects, performance, security boundaries, transactions, and interaction with external systems are exactly what code should express.
2. **Data is not automatically maintainable.** A pile of JSON with no vocabulary, no schema, and no validation only hides the structure inside conventions, which is harder to verify than code.

The real question is not "code or data", but:

> **What should be declared as data, what must stay in code, where the boundary lies, and who is responsible for guarding it.**

"Data is more advanced than code" is a lazy way of putting it; the right question is where the structure sits.

## 4. Code and Data Are Two Materials

You can treat code and data as two materials rather than two ranks.

| | Code | Data |
|---|---|---|
| Excels at | algorithms, side effects, I/O, performance, security, invariants | facts, rules, copy, configuration, content |
| Verifiability | depends on tests, execution paths, boundaries | addressable, diffable, validatable |
| Blast radius | call chains, timing, exception paths | usually limited to a row / entity / rule |
| Modified by | developers + AI (high risk) | people and AI (reviewable) |
| Failure mode | found only when some path runs | can be rejected at write time |

Data suits AI maintenance better not because data is nobler, but because:

- it can have a stable identity;
- changes are usually local;
- the context can be trimmed;
- it can be rebuilt idempotently;
- it can be validated at write time.

But these properties hold only for **structured data**. Free text and randomly dropped JSON do not have them.

Code still carries the work it is good at: defining primitives, running algorithms, handling side effects, holding security boundaries. Code is not "moved out"; it retreats to a smaller, more stable position:

```text
System = Code + Data
```

Code is responsible for interpreting, validating, executing, and reviewing; data carries knowledge, rules, variables, processes, and state.

When code only interprets the vocabulary and no longer implements the business case by case, it approaches **meta-code (metacode)**:

> If code size grows with the number of domain objects, it is business code;
> If code size grows only with the size of the vocabulary, it earns the name meta-code.

## 5. When Behavior Belongs in Data

Not everything should be datafied. A checklist is more useful than a slogan:

- **Change frequency**: does it change often? Facts that change often suit data better.
- **Addressability**: can it be given a stable identity? Prices, rules, and copy can; a piece of control flow usually cannot.
- **Review needs**: does the change need to be understood by non-programmers?
- **Verification method**: can you write tests / validations, rather than only running it?
- **Blast radius**: does a wrong change affect one row, or a call chain?
- **Context size**: can the AI finish the change after reading only a small piece?

Conversely, the following usually belong in code:

- algorithms and performance-sensitive paths;
- external side effects and I/O;
- concurrency, transactions, security boundaries;
- primitives that cannot be expressed in the data vocabulary.

This is not "emptying the code out", but pulling **declarable knowledge** out of the code so that code keeps only the part it is best at.

### 5.1 One Minimal Rule: Values Do Not Enter Sentences

Anything that changes faster than a sentence should not be written into a sentence.

Prices, versions, stock, dates, and star counts belong to data; sentences belong to templates. That way one data change needs one line edited and one rebuild, not N answers edited — and no need to wake a model.

## 6. Structure Is a Boundary, Not a Slogan

When you say "use structure", what do you concretely mean? At least five things:

1. What vocabulary the data uses (entity types, relationship types, action types);
2. What shape the data takes (rows, JSON, files, columns);
3. Which fields are declared and which are left free;
4. Who validates, who reviews, how you roll back;
5. How state and build artifacts are kept apart.

Structure is not "the more tables the better", nor "the less code the better". It is a contract about boundaries.

The hardest clause in this contract is:

> **How far do you generalize, and how far do you make it domain-specific?**

## 7. Core Tension: Generic Data vs Domain Tables

One concrete example makes the tension clear.

A product can be written as a generic entity:

```json
{
  "entity_type": "product",
  "key": "sku:iphone-17",
  "attrs_json": { "price_cents": 99900, "stock": 12 }
}
```

The benefit is that extension is cheap: a new domain needs no migration, the AI just adds data.

But three months later you may see:

```json
{"price_cents": 99900}
{"price": 999}
{"priceCents": 99900}
{"price_usd": "999.00"}
```

Names start to drift; the price can be negative; stock can be a string; nobody knows whether "listed but no price" is legal. Queries get ugly too: every one has to write `json_extract`, and performance depends on convention.

The other extreme is building a `products` table: types, constraints, and queries are all strong, but every domain change needs a migration, and the AI can no longer extend by "adding data".

So the question is not "datafy or codify", but:

- generic data buys **extensibility** with **structural strength**;
- domain tables buy **structural strength** with **evolution cost**;
- the choice depends on which cost hurts more right now.

That is the dialectic of data and code: **not which one is more advanced, but which layer the structure sits on.**

## 8. Failure Conditions and the Author's Position

When does this approach not hold?

- If the system barely changes, the investment in structure never pays back;
- If models are cheap, stable, and auditable enough that a runtime agent is acceptable, the tipping point moves;
- If every change needs a new primitive rather than new data, the generic structure has failed;
- If maintenance cost stays above just editing the code, the structure is not worth it.

The author's position: I do not think "data is better than code" or "code is better than data" is a meaningful debate. The meaningful question is:

> **The change frequency, verification needs, and blast radius of this behavior decide whether it should live in code or in data; and the boundary must be explicitly declared rather than held up by convention.**

## 9. The Next Question

The frame is now in place: code and data are two materials, structure is the boundary contract between them, and the core tension is generic data vs domain tables.

But how exactly is the boundary drawn? When does a project that "can have generic entities" actually need a `products` table? And why is the answer not "never"?

The next piece takes up exactly this question: **The Boundary of Datafication**.

<!-- CTA: GitHub / newsletter / contact links are intentionally left blank until the launch gate. -->
