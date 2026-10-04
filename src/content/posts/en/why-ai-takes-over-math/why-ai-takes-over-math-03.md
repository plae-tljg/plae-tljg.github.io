---
title: 03 Why AI Will Take Over Mathematics
summary: >-
  Why the January 2024 judgement followed from the structure of mathematics:
  which layer is a composition of operations, and why operations can be
  automated.
lang: en
translationKey: why-ai-takes-over-math-03
slug: why-ai-takes-over-math-03
date: '2026-09-24'
series: why-ai-takes-over-math
seriesOrder: 3
partLabel: 第三篇 — 操作
tags:
  - AI
  - 数学
  - 自动化
  - 定理证明
status: preview
aiTranslated: true
source: seasons/01-math/03-why-ai-takes-over.en.md
syncedAt: '2026-10-04T14:43:38.328Z'
---
Part one set out three principles: one grows into many, mechanical deduction, the collision of concepts. Part two prepared seven lenses: the staircase, mechanical deduction, proof as search, the physical method, the equality of operations, physicists and the academy, and the vitality of AI bullshit. Now comes part three, applying those lenses to the same question:

> Which part of mathematics will AI take over, and why?

First, let me be clear about "take over". In everyday usage it slides around, but it can mean at least four things:

1. A machine **can do** this;
2. A machine **is doing** this;
3. A machine **has replaced** the people who used to do it;
4. This **no longer needs people at all**.

These four senses differ enormously in strength, and they require completely different kinds of evidence. The sense of "take over" I use in this piece is the weakest one: **the marginal output of a layer is done mainly by machines, and people no longer take part item by item.** It does not mean that layer disappears, and it does not mean people stop taking part; it means the output of that layer is no longer determined by people's time.

Why the weakest sense? Because it is the version the evidence can support. The facts I listed in section seven support "machines can do it, and people already are doing it" — not "mathematicians are out of a job". Stating the conclusion that way goes beyond the evidence.

This piece's answer has four steps. I return first to January 2024 and show what that judgment actually rested on; then I use the staircase and mechanical deduction to explain AI's structural advantage; then I use the equality of operations to show which part of the academy layer that advantage can cover; finally I treat the evidence from 2024 to 2026 as corroborating only, not as the argument itself.

## 1. January 2024: the judgment comes from the structure of mathematics

In January 2024, GPT-4 had been out for less than a year, and GPT-3.5 was still in wide use. As chatbots they were already quite natural, but their mathematical ability was very limited: they often got undergraduate exercises wrong, and research-level mathematics was essentially out of reach. Judged by the models of that time, "AI will take over mathematics" was an exaggerated judgment.

But that judgment never came from model capability.

If it had depended on "AI is already very smart", I should have withheld my conclusion until it got smarter. My judgment came from another direction: the structure of mathematics itself. A large part of mathematics — definitions, derivations, verification, composition, retrieval — is mechanical. Mechanical work can be automated step by step; once model scale, data, compute, and verification means are in place, machines will catch up with and surpass humans in these parts. GPT-4 in 2024 not being smart enough showed only that more time was needed, not that the direction was wrong.

That judgment has an even earlier root. I heard about EYE around 2021 — its full name is Euler Yet another proof Engine, a semantic-web inference engine maintained continuously since 2006, doing forward / backward chaining. It is not a mathematical theorem prover and does not handle mathematical analysis; it handles N3/RDF rules. I may not be remembering the name correctly, but it made me realize for the first time that inference is not solely a human affair: it can be executed by machines, searched over, verified. GPT-4 in 2024 simply carried this from the small world of logic and the semantic web into natural language and mathematics. In other words, I did not start believing that "proofs can be machine-executed" only after GPT-4; that belief predates GPT-4.

More precisely: **I am not predicting that AI will get smarter; I am observing which part of mathematics does not require smarts.**

Then under what conditions is this judgment wrong? A prediction that cannot be overturned has no content, so this section must commit itself. If any of the following three holds, "AI will take over the academy layer" needs discounting:

- **The cost of formalization never comes down**, so the mathematics machines can check will always be a small fraction of the whole;
- **Problems with large combinatorial depth never converge in practice**, and machines can only handle the parts humans have long since finished;
- **In the layers machines can already do, human time remains the bottleneck** — not because people do it better, but because processes, responsibility, or institutional requirements demand that a human handle it.

This piece cannot decide among these three. The evidence in section seven reaches only the status of corroboration; it is not enough to confirm, and not enough to refute; it can only indicate direction.

Still, that passage also buries a problem I must admit right now: **"once model scale, data, compute, and verification means are in place" is an unfalsifiable phrasing.** If it is achieved, the judgment was correct; if it is not, the conditions simply were not yet in place. In section four I will split this phrasing into two distinct assertions, one structural and one about resources; the 2024 judgment relies only on the former.

This observation comes from part two's staircase metaphor.

## 2. The staircase revisited: AI does not need to walk, it can run

Part one's section already laid out this staircase: the steps are low, the treads wide, and what it consumes is not genius but time, memory, and mastery. Here I take only one of its consequences.

Humans have to "walk" the staircase: every step must be experienced in real time, the body gets tired, memory is limited, and the length one person can walk in a lifetime is finite. AI does not need to walk. It can try, verify, and try again at high speed on every step. It does not need to possess the same kind of understanding as humans, nor live through human time; it needs two things:

1. **Every step has clear rules**: definitions, types, syntax, formal systems;
2. **Every step can be checked cheaply**: the Lean kernel, code execution.

The second point deserves emphasis: it is not "blind peer review of humans" or "benchmarks". Those are evaluations, not verification — they are slow, statistical, and happen after the fact, and they cannot give feedback at every step of the search process. The only thing that makes "running" possible is a checker that immediately says right or wrong for a single step. This accounting has to be done again in the next section.

With these two things, AI can turn "walking the staircase" into "running the staircase": trade compute for time, search for inspiration, verification for confidence. Part two's toothpick metaphor says the same thing — proof is bidirectional search, and AI can grow thousands of toothpicks in parallel and have a verifier check them one by one; a human can only track a few in their head at a time.

This staircase does not end at Analysis III. Once AI has mastered the basic operations of Analysis I, it can compose them into Analysis II, Analysis III, real analysis, complex analysis, even PDEs and the Navier-Stokes equations. When I told a classmate in 2024 "learn it even if AI looks stupid", this was the basis: it may walk very slowly, but as long as every step is executable, it will eventually run the whole staircase.

One line must be drawn first: this staircase describes **the path that has already been organized into textbooks**, not the process by which mathematics is created. Textbooks flatten history — a real breakthrough is later written up as a perfectly natural lesson, looking like a slight extension of the previous one. So "the staircase can be run" refers to mathematics after it has been organized, not mathematics being created. This distinction becomes crucial in section six.

And the academy layer of mathematics consists precisely and mainly of work where **every step has clear rules**: axioms, definitions, theorems, proofs, symbolic manipulation. So the question is not "can AI understand mathematics", but "which parts of mathematics do not need understanding, only execution". The answer is far larger than people imagine.
## 3. Mechanical derivation: why the part that "needs no inspiration" is so large

The second principle of the first article and the second section of the second both said it: once the objects have been generated, much of the work no longer requires "understanding the substance" — it only requires moving symbols around according to rules. Two points to add here, both about scale.

First, AI is not afraid of terminology. A human learning a subject is easily crushed by the big words; AI is not: it will staple terms together until a verifier stops it. Awe is a human cost, and the machine does not pay it.

Second, and more importantly: mechanical derivation can only run if the step has **already been formalised**. Formalisation itself is expensive human labour — AlphaProof's IMO problems were translated into Lean by hand, by human experts. So "mechanisation" is not a free switch; it is an assembly line: a person first writes the proposition in a form a machine can check, and only then can the machine search over it at speed.

This brings a limitation that has to be stated plainly: **verification is not cheap.** The Lean kernel can only check statements that have already been formalised; code can only check what has already been written as a program. Mathematics that has not been formalised — which is to say, most of the mathematics currently being created — still has to be verified by a person, by a mathematician who can read it. That cost shows up in its bluntest form in section 7.

## 4. Operational equality: why this advantage covers most of the academic layer

Section 5 of the second article offered a perspective: a large part of mathematical ability is the combination of basic operations, and at the level of operations, a mathematician's mental operations and an ordinary person's belong to the same class — the difference lies in epistemic status, not in the type of operation.

Take one corollary from it:

**If a large part of mathematical ability is "the combination of basic operations", then a machine that has learned those operations can search the combination space at speed.**

It can even combine faster, more, and with less fear of error than a person. A human scholar hesitates between a few possible proof paths; an AI can try hundreds at once and let a verifier filter out the wrong ones. Combinations of operations that take a human decades to master can be covered at scale by training and search.

Most work in the academic layer is exactly this kind of combination: the operation of defining, of proving, of verifying, of searching the literature, of computing with symbols. AI does not need to understand the "essence" behind each operation; it only needs to know which operations are legal and which combinations pass verification. That is the precise meaning of "running up the stairs" — not skipping the stairs, but turning every step into a fast executable move.

There is, though, a gap in this step that must be written down: **"combinable" does not mean "coverable".** The combination space is exponential in size, and being able to search it quickly is not the same as being able to search it exhaustively. The phrase "covers the whole academic layer" therefore has to be narrowed: it holds strictly for the part where combination depth is bounded and every step can be checked cheaply. For parts with great combination depth, whether the search converges is a question of compute, not of structure.

So what this article offers is first of all a **structural judgement**: in principle, this layer can be mechanised. Whether it will be mechanised in any given year is another question, needing another kind of evidence — section 7 offers circumstantial evidence, not a conclusion.

## 5. The key turn: the machine-like quality is not in the proof but in the origin

Here there is a distinction that has to be made clear. Without it, "AI will take over mathematics" becomes a conclusion that is far too coarse.

An academic proof can, in fact, be clever at every step. In much of analysis, as you read, the author seems formidable at every move: an estimate, a compactness argument, a perturbation, gathering back what looked about to scatter. That is not brute force; it is arrangement that is exactly right. A local proof is not only not mechanical — it can be full of spirit.

I should say what I mean by "spirit", because it is easily read as something else. It is not a description of a person being clever, and it is not a gift. It is a **judgement**: having read a piece of reasoning, do you find it alive — is there a real problem behind it, driving it forward? The judgement is made about the mathematics, not about the person; had someone else written the same thing, the judgement would be the same. So "spirit" has nothing to do with identity, talent or the status of a field. It has only to do with whether that reasoning has a living origin.

Where, then, is the "mechanical"?

**The machine-like quality is not in the proof. It is in the origin of the theory.**

A paper can prove a technically difficult theorem, but if its question was inherited, if it exists only because the big words of the tradition are still there, then its overall agenda is mechanical. The cleverer the proof, the more visible the contrast can be: every step is clever, and what the whole thing proves is boring.

That is the real characteristic of the academic layer: not "mechanical proofs" but "**inherited problem-consciousness**". What it is good at is this: given a question that has already been chosen, unfold it, verify it, combine it, generalise it. It does not need to decide afresh which questions are worth asking; it needs only to work inside the problem space it already has.

AI is precisely the supreme executor of this kind of work. It is the strongest "first me" inside the academy: accept the given framework, follow the proof, take the local work to its limit. It needs no origin, and no judgement about whether the game is worth playing; it needs rules and a verifier.

So "AI will take over mathematics" has to be made precise:

> What AI will take over is the layer of **inherited problems + mechanical unfolding + verification** — that is, the academic layer. What it does not take over is **the origin of questions** — which questions are worth asking, which objects are worth inventing, which direction is worth investing in.

Proofs in the academic layer can be very clever; AI's takeover is not because cleverness has stopped mattering, but because **once the question has been chosen, cleverness can be replaced by search, verification and scale**. What cannot be replaced is the step where the question is chosen.
## 6. The academy and problem consciousness

We can now pin down these two terms formally.

**The academy** is mathematics that has already been canonicalised: definitions, theorems, proofs, methods, papers, formalisation libraries. It really does accumulate — it turns scattered insights into things that can be passed on and taught. But it is also a machine running on inertia: the academy's big words — homology, representation, Yang–Mills, cohomology — can themselves become the reason to keep working, long after the original problem that gave rise to them has blurred.

Here I need to explain a matter of tone, because it determines why this piece is written the way it is: **I do not think the academy is a cause worth celebrating.** New tools developed inside the academy are mostly unused outside it. Generalise a 2-dimensional result in physics to n dimensions, and physicists will not be moved — they have their own notions of singularities and their own approximation methods, and a few steps take care of it. They do not care about your rigour, not because you are not rigorous enough, but because your problem is not in their tradition.

This is not a put-down of the academy. It is a necessary machine, and the only machine that can store insights. But "necessary" is not the same as "worthy of praise", and a machine that runs on big words is the easiest thing to take over once the marginal cost of operating it drops to near zero.

**Problem consciousness** is the side of origins: which questions are worth asking, which objects are worth inventing, which directions are worth investing in, which path will look inevitable in hindsight. Its problems come from outside — from physics, geometry, experience, other disciplines, and a mathematician's personal perplexities. It cannot be inherited; it has to be posed afresh. What it produces is not more theorems of the same kind, but new questions, new concepts, new lines of argument.

Before going further, I have to admit something: the characterisation of the academy above actually used two different rulers.

- One measures **where a problem comes from**: is it inherited, or was it posed afresh?
- The other measures **whether the work can be formalised**: can it be written into a formal system, can a machine check it?

The two rulers do not coincide. An inherited problem that cannot be formalised belongs to the academy by the first ruler, but AI may not be able to swallow it; a freshly originated, still-hot problem that happens to formalise cleanly should be handed over to the machine by the second ruler, yet it plainly belongs on the side of problem consciousness.

They point to the same conclusion in this essay only because historically the two are highly correlated: the process by which a branch of mathematics becomes canonicalised itself grinds its language into a formalisable shape. So "the academy layer" should be understood as **the layer that is already canonicalised and therefore largely formalisable**, not the union of the two rulers' separate territories.

The non-overlapping zone is real. It is what this essay does not cover, and also where the machine takes over most slowly — there lies a large body of inherited mathematics that has never been formalised.

AI will take over the academy layer first, for clear reasons:

- The academy's work can be formalised, so AI can search and verify inside a formal system;
- The academy's work can be benchmarked, so AI companies have a strong incentive to optimise it;
- The academy's successes can be measured, so models can improve themselves;
- Most academy problems are "given the setup, find the proof" — exactly what a generator plus a verifier is best at.

Problem consciousness is hard to handle that way:

- "Which questions are worth asking" has no benchmark;
- "Is this direction meaningful" has no Lean kernel;
- "Which path will look inevitable in ten years" requires the community's historical judgement;
- "Is this origin still alive" requires living, experience, and real problems from other disciplines.

That is why AI is the ultimate insider rather than a natural intruder. It moves through the academy's corridors faster than anyone, but it did not build the corridor itself; it can move at high speed through the existing problem space, but "which problem space to choose" remains an external act.

The question from the first essay gets its real-world version here:

> Who picks the one that matters? You still need a person.

The first principle (from one, many) and the third principle (conceptual collision) can generate endless candidates; the second principle (mechanised deduction) can expand, verify, and combine them. But **which candidate is worth keeping** is not something generation and deduction can answer. The academy is good at expanding what has already been chosen; problem consciousness is responsible for choosing a question worth asking before the choice has happened.

So the claim "AI will take over mathematics" must be split:

- The academy layer: taken over, and already being taken over.
- Problem consciousness: not taken over, and no path to taking it over is visible for now.

## 7. 2024→2026: only as corroborating evidence

A structural judgement is one thing; evidence is another. But this section writes only the necessary corroboration, and does not expand into a news roundup.

From January 2024 to now, four facts matter most:

1. **AlphaProof (announced July 2024, Nature paper November 2025)**: it combines large-model pre-training, Mathlib supervised fine-tuning, reinforcement learning and tree search in the Lean theorem prover, and solved three non-geometry problems (P1, P2, P6) at IMO 2024; with P4 solved by AlphaGeometry 2, that is four problems, 28/42, silver-medal level (the gold cut-off that year was 29 points). Proofs were verified step by step by the Lean kernel. The cost was roughly 80,000 TPU-days for the main reinforcement-learning stage, huge inference compute, and manual formalisation of the competition problems by human experts.
2. **IMO 2025**: both DeepMind's and OpenAI's models scored 35/42, crossing the gold cut-off. But the two differ in kind: DeepMind's score was confirmed by official IMO marking, OpenAI's was marked by three former medallists and is not officially certified; neither was an official contestant, and human contestants still scored a perfect 42 that year. So the accurate statement is "reached the gold cut-off", not yet "entered the range of the top human competitors".
3. **First Proof (2026)**: an independent evaluation project. Mathematicians supply ten not-yet-published problems from their own research; four AI systems each answer once with no human intervention, then human mathematicians review them blind. The second batch's result: seven of the ten problems were rated by at least one system as "flawless" or "needing only minor changes" — that is the combined result across the four systems, not a single model's score. The cost is on the order of tens to hundreds of dollars per problem (Tao's estimate).
4. **OpenAI's ten advances and the Navier–Stokes claim (2026)**: in August 2026 the company announced that its internal model Astra had produced results or significant progress on ten long-open problems — including an explicit construction of non-sofic groups and a refutation of Connes' rigidity conjecture — each with a Lean certificate, the ten totalling around two thousand dollars. In September the company claimed that roughly ten thousand cooperating agents, about 88 hours, and around 130 billion output tokens produced a proof of a finite-time Navier–Stokes singularity, formalised in Lean, while stating it would not claim the Millennium Prize. These are company claims, not yet verified by the academic community, and priority disputes have already appeared.

Together these facts point to the same mechanism:

> **Generate → search → verify → repeat.** 
> An unreliable generator, paired with a reliable verifier, plus lots of compute and human scaffolding.

Tao puts it most clearly. He writes that generative AI

> is inherently ungrounded, because what it optimises is the "appearance" of a satisfying output, not the underlying property that the output is supposed to indicate.

He goes on to note that in almost every other field AI's biggest weakness is that "it makes errors that cannot be verified", but in mathematics — almost uniquely — "you can automatically check the output". So the genuinely effective use is to combine generative models with more traditional, more reliable verification methods, filtering out those hallucinations that would otherwise make the output worthless.

From this we can say: the systems that actually produce things are not "models that understand mathematics", but an unreliable yet powerful stochastic generator plus a layer of reliable filtering. **This last sentence is my summary, not Tao's words.**

This confirms this essay's structural judgement: AI wins in the academy layer first, because the academy's work can be formalised, verified, searched, and benchmarked. The closer you get to origins, topic selection, meaning, and community acceptance, the less the verifier can help.

The reconciliation table can be short:

| 2024's implicit judgement | 2026's evidence | Verdict |
|---|---|---|
| AI will do undergraduate mathematics | Competition and undergraduate problems largely solved; but one controlled study shows that changing the numbers or adding irrelevant conditions causes a significant score drop (the study tested primary-school word problems, and the model had no tools) | Basically holds, but brittle |
| AI will enter research-level mathematics | First Proof second batch 7/10 (combined across four systems)【peer review in progress】; OpenAI's ten advances【company claim】; Navier–Stokes【company claim】 | Direction holds, with many caveats |
| AI will take over mathematics | Victory has already appeared in the formalisable, verifiable, benchmarkable academy layer | Holds for the academy layer; not for problem consciousness |
| AI will understand mathematics | Lean verifies a formal statement, not whether it matches the intended meaning; no evidence on origins or topic selection | Does not hold |

## 8. Conclusion: what gets taken over is operations, not choices

Back to the title: **Why will AI take over mathematics?**

Because mathematics has an enormous academy layer whose work is combinations of operations: given a problem, find the proof; given a definition, unfold the corollaries; given a conjecture, search for a counterexample; given the literature, combine the tools. These operations can be formalised, verified, searched, and scaled. AI is an unprecedented operations machine; it does not need to "understand" the essence behind each operation, only rules and verifiers.

But mathematics also has a layer of problem consciousness, whose work is origins, choices, vertical jumps, narratives of meaning, and community acceptance. This layer has no benchmark, no Lean kernel, no clear reward signal. AI is currently not an actor in this layer; it is this layer's tool, accelerator, and — if trained properly — a borrowed intruder.

So the 2024 judgement should be made precise:

> **AI will take over the academy layer of mathematics; mathematics' problem consciousness will not be automatically taken over.**

This is neither a despairing conclusion nor an ecstatic one. It is a structural fact. The first essay's mechanised deduction, the second's staircase and equality of operations, all point the same way: **operations can be taken over by machines; choices cannot.**

The remaining questions are: if what gets taken over is operations, where do choices happen? What is problem consciousness after all? Why can it not be formalised, benchmarked, searched? What can people still do?

That is what the fourth essay will answer.

## Notes and limits

- What this essay claims is a structural judgement: in mathematics there is a layer of work that can be formalised, verified, and scaled. It is not a capability timetable and predicts nothing about which year what will happen. **What would count as this judgement failing** — this essay does not answer; that is its biggest gap.
- The facts in section 7 fall into three grades: already verified, still in peer review, and companies' public claims. Company claims were not treated as evidence, only as indications.
- Verification is not cheap. Lean can only check statements that have already been formalised, and formalisation itself is expensive human labour — AlphaProof's IMO problems were manually formalised by human experts. This essay does not factor that cost into the speed of "climbing the staircase".
- This essay does not claim that AI understands mathematics. The word "understand" appears in the whole essay only in a negated position.
- The converse also holds: if the cost of formalisation cannot be brought down, then how fast the academy layer is taken over depends on the supply of human formalisation, not on machines' search ability.

<!-- CTA-PLACEHOLDER: Replace before publication with a real link (GitHub / newsletter / contact email).
     Blocked on the launch gate in AGENTS.md §4: domain, newsletter, and repository audit all undecided. -->
