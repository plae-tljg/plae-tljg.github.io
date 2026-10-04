---
title: '04 Appendix: Derivation Template, Checklist, and Glossary'
summary: >-
  This appendix condenses the method from the four articles into an executable
  template: Goal -> Actors -> Intents -> Shapes -> Structures -> Columns -> IO
  -> Wake, plus a general exercise, final checklist, anti-patterns, when not to
  use it, and a glossary.
lang: en
translationKey: appendix-derivation-and-checklist
slug: appendix-derivation-and-checklist
date: '2026-10-01'
series: ai-maintainable-systems
seriesOrder: 4
tags:
  - AI
  - appendix
  - 清单
  - design
status: preview
aiTranslated: true
source: seasons/02-systems/04-appendix-derivation-and-checklist.en.md
syncedAt: '2026-10-04T14:43:38.332Z'
---
This is not the main text; it is the companion working document for the first 3 articles.

## 1. Derivation Chain

Do not start from "which table / which agent" — start from the goal and the constraints:

```text
Goal -> Actors -> Intents -> Information shapes
     -> Structures -> Columns -> IO -> Wake policy
```

### 1.1 Goal

One sentence: for whom, solving what. Include the end users, what they need to get done, and which things a human must take over.

### 1.2 Actors

Distinguish at least:

| Role | What they care about |
|---|---|
| End user | Whether they were answered / whether the action completed |
| Operations / customer | Whether the knowledge is correct, whether they can review and publish it |
| AI maintainer | What to read, what to write, how to verify |
| Developer | Engine, table structure, migrations, permissions |

### 1.3 Intents

List the real intents: look up a fact, look up an entity attribute, conditional judgement, multi-turn clarification, side effects / hand off to a human, unknown.

### 1.4 Information shapes

| Shape | Suitable structure |
|---|---|
| Static fact | Knowledge row / copy |
| Parameterised fact | Template + entity row |
| Conditional routing | Rule row / small DSL |
| Cross-turn reference | Projection, not a state table |
| Multi-turn collection | Flow + state |
| Side effect | task / external action |
| Unknown | Refusal + inbox |
| Compound question | Parsing algorithm, not a table |

### 1.5 Structures

- Configuration, content, data, or state?
- Preference order: config file > content file > existing table > new table;
- Default: generic entity + link + JSON attributes + a small vocabulary;
- Promotion is triggered by real cost, not by intuition.

### 1.6 Columns

- Fields that get queried, joined, filtered, constrained, aggregated -> typed columns;
- Fields that are domain-specific and travel only with the row -> JSON;
- Fields that need a bidirectional relationship -> link table;
- Fields that are no longer of an entity shape -> a separate fact table.

### 1.7 IO

| Role | Read | Write |
|---|---|---|
| End user | Conversation | Question / action |
| Operations | Console, review queue | Publish decision |
| AI maintainer | Read-only evidence, content | Content / proposal |
| Runtime | Data projection | Runtime state |

### 1.8 Wake policy

- Is the model allowed to fall back at runtime?
- Is maintenance daily, event-triggered, or manual?
- Which data changes never need the model at all?
- Do the misses the model has answered keep their evidence?
## 2. An exercise: the booking assistant

Goal: the user can book, and complex bookings get handed to a human.

| Intent | Shape | Structure |
|---|---|---|
| Opening hours | Static fact | Knowledge row |
| What services are there | Parameterised fact | Entity + template |
| Can I book on a weekend | Conditional rule | Rule row |
| "the second service" | Anaphora | Previous-turn quote |
| What information does a booking need | Multi-turn collection | Flow + state |
| Notify staff after submission | Side effect | task |
| Unknown policy | Unknown | Refusal + inbox |

## 3. Course-completion checklist

### Problem

- [ ] Am I facing an unstable runtime agent, or unverifiable hardcoded maintenance?
- [ ] Does the problem keep growing, or is it one-off?
- [ ] Am I treating "fixing one example" as "getting better"?

### Structure

- [ ] How many business facts still live in the code?
- [ ] Are configuration, content, data and state separate?
- [ ] Are the offline / online and build / runtime boundaries clear?
- [ ] Do values go into the sentences?
- [ ] Does the new structure have a real trigger?

### Verification

- [ ] Is there a test for every behaviour change?
- [ ] Are there the four categories: positive cases, confusable negatives, refusals, ambiguity?
- [ ] Is there a regression baseline and a rollback path?
- [ ] Is there a dead-row / ambiguity report?

### Permissions

- [ ] What is the AI's read / write / forbidden set?
- [ ] Are permissions enforced by tools or requested by prompt?
- [ ] Can the AI write directly to the online table, or merge directly?
- [ ] Can review be completed within a limited context?

### Cost

- [ ] How many runtime wake-ups? How many maintenance wake-ups?
- [ ] Which changes wake the model?
- [ ] Does the fallback still log `unresolved`?
- [ ] Are coverage, fallback rate and unit cost recorded?
## 4. Anti-patterns

- Putting all logic into code;
- Putting the agent in the runtime;
- Letting the agent directly modify online state;
- Letting the agent maintain without tests;
- Stuffing everything into JSON;
- Reserving empty tables for the future;
- Using the model as fallback but clearing unresolved;
- Using model answers to pretend the structure already knows the answers.

## 5. When Not to Use This

One-off scripts, small tools with no ongoing evolution needs, exploratory tasks with no repeated decisions—simple scripts are the correct answer.

Structure has a cost; don't use it when it's not worth it.

## 6. Glossary

| Term | Meaning |
|---|---|
| Maintainable | Changes are executable, verifiable, rollbackable, accumulable, affordable |
| Structure | The contract between code and data: rows, table structure, vocabulary, validation, process |
| Data | Declarable layer: knowledge, rules, variables, processes, tests, content files |
| meta-code | Interpreter/validator/runner whose code scale grows with vocabulary, not with domain |
| Four Homes | Config / Content / Data / State |
| Offline / Online | Editable, diff-comparable form vs indexable, queryable projection |
| Build / Online | Build tables vs runtime state tables |
| Rebuild Structure | Undeclared structure that must be re-derived every time |
| Reference | Cross-turn reference derived from previous turn's citation, no state table needed |
| Process / State | Runtime state needed only when values must persist across turns |
| Wake | Wake the model: runtime fallback / maintenance turn / build |
| Fallback | Model answer when structure can't answer; still records unresolved |
| Proposal | Auditable, rollbackable change; git PR or proposal table |
| κ | Deterministic coverage rate |
| Dead Row | Knowledge row never hit |

## 7. The Final Four Questions

If AI changed a data/content item, and you can answer the four questions below, the system is on the right track:

1. Why change? What's the evidence?
2. What changed? Where's the diff?
3. Did it improve? Do tests and metrics support it?
4. How to roll back if wrong?

Can answer, structure is maintainable; can't answer, no matter how strong the model, it's just changing things faster in a black box.

<!-- CTA: GitHub / newsletter / contact links are intentionally left blank until the launch gate. -->
