---
title: '02 Preparation: Several Ways of Looking at Mathematics'
summary: >-
  Seven ways of looking at mathematics, from the staircase and proof-as-search
  to the physicists-versus-academy contrast.
lang: en
translationKey: why-ai-takes-over-math-02
slug: why-ai-takes-over-math-02
date: '2026-09-24'
series: why-ai-takes-over-math
seriesOrder: 2
partLabel: 第二篇 — 准备
tags:
  - 数学
  - 学习方法
  - AI
  - 词汇
status: preview
aiTranslated: true
source: seasons/01-math/02-preparation.en.md
syncedAt: '2026-10-04T14:43:38.327Z'
---
This article doesn't directly answer "will AI take over mathematics." What it does is preparatory work: laying out several perspectives needed to understand that question. Each perspective comes from my experience learning mathematics, and from my observations of AI. Viewed individually they may just be anecdotal experience; placed together, they point toward the conclusion the next article will present.

## One, The Staircase: Mathematics Looks Inaccessibly High, But It Can Be Traversed

When I studied mathematical analysis, I always had an image in my mind: mathematics is like a very tall staircase.

It's tall, but not because each step is high. On the contrary, each step is very short. You go from limits of sequences, to continuity of functions; from continuity, to differentiability; from differentiability, to integrability; from single-variable functions, to multi-variable functions; from Analysis I, to Analysis II, then to Analysis III. The "intellectual increment" of each step is actually very small. No step requires you to suddenly become a genius; no step is a genuine leap.

But each step is very wide. You have to walk on a single step for a long time. A definition, you have to look at repeatedly; a proof, you have to write out many times yourself; an estimate, you have to practice until you can do it without thinking. The height difference of the staircase is very low, but the tread width is very large. It consumes not genius, but time, memory, and fluency.

This is why mathematics gives people such a contradictory feeling: on one hand, it doesn't seem that "hard," because each step is understandable; on the other hand, it's extremely "hard," because each step takes a long time to walk, and a human lifetime is limited. Many people aren't scared off by the height of some step, but are worn down by its width.

More critically, if you really finish walking this staircase, and stand at some position looking back, you'll discover a fact that outsiders completely cannot understand: from Mathematical Analysis I to Mathematical Analysis III, to Real Analysis, Complex Analysis, and even further out, you didn't feel any "breakthrough progress" at all. You just walked for a long time. Each step was like a tiny extension of the previous one. But a person who hasn't walked this staircase, standing at the same position, would completely not understand what you're saying. Between his "not understanding" and your "understanding," what separates them isn't some single theorem, but the width of the entire staircase.

A distinction must be added here, otherwise the above sentence will be misread. "No breakthrough progress" refers to **the time and effort needed to walk it**: going up step by step, each step not high. It doesn't mean there are no conceptual ruptures. As mentioned in the first article when discussing real numbers, discovering that rational numbers are full of holes, that the entire number line with holes must be re-accepted as an object of study—that was a worldview flip. At that moment what you had to do was reorganize everything you already knew, not just do one more problem.

**The flip is conceptual; the staircase is temporal.** And a conceptual flip, after the fact, gets written into a smooth, logical lesson, so it also looks like a short step. Textbooks smooth over the ruptures. This point will become critical in the third article: what can be "run" is the path after it's been smoothed.

This staircase is also where the threshold of the mathematical community lies. It divides "have studied" and "haven't studied" into two worlds: outsiders cannot finish walking it in a short time, and insiders also struggle to explain to outsiders what exactly they walked.

But the threshold isn't everything. There's one more mundane thing: **both sides actually don't care much about the other.** New tools developed inside academia, outsiders mostly don't use—physicists have their own singularity concepts and approximation methods, handling in a few steps what you'd spend great effort generalizing. Conversely, the problems outsiders genuinely care about often can't get onto academia's agenda either. This mutual lack of caring, more than the threshold itself, explains why the mathematical community is closed.

What does this staircase have to do with AI?

The connection lies in: each step of the staircase is "short" because they can ultimately be formalized, written down, executed step by step. And what machines are best at is precisely executing those formalized, step-by-step actions. Humans need ten years to walk the whole staircase; machines don't need to "walk," they can directly "run," or rather, they can run repeatedly until every step is covered. They don't need to possess the same understanding as humans; they need every step to have explicit rules, and a verifier that can judge right from wrong.

At least, this is true for the mechanical parts of the staircase. There are also a few places on the staircase where the width suddenly narrows—places where what's needed isn't time, but genuine conceptual leaps. Those places will be discussed later.

## Two, Mechanical Deduction: The Skeleton of Mathematics

The second principle says: once objects are generated, much work no longer requires "understanding the substance," only manipulating symbols according to rules.

The purest example is logic. You don't need to know whether P represents "it's raining" or "1+1=2"; as long as you see "if P then Q" and "P," you can deduce "Q." Logic is like an automaton that only looks at syntax, not semantics. What it cares about isn't content, but shape.

Proofs in mathematical analysis are an advanced version of this mechanical deduction. Suppose you already know two theorems: compact sets are necessarily closed and bounded; continuous functions on closed and bounded sets necessarily have extreme values. Mechanically connecting these two gives you: continuous functions on compact sets necessarily have extreme values. The whole process doesn't require you to rethink the philosophical meaning of "compactness," only to legally use already-proven conclusions.

This mechanical nature is often misunderstood. People think mathematical proofs require "inspiration," but actually, the vast majority of proofs are expansions of definitions, combinations of estimates, invocations of theorems. Inspiration appears in a few key places—like choosing which estimate, introducing which auxiliary object, swapping which two quantifiers—not in every step.

Mechanical deduction is the skeleton of mathematics. It lets mathematics be taught, learned, written down, checked. Without it, mathematics would just be the private intuitions of a few people; with it, mathematics becomes a discipline that can accumulate, be inherited, and ultimately be executed by machines.

But the skeleton isn't everything. Mechanical deduction cannot choose its own premises, cannot judge which path is worth pursuing, and cannot invent new concepts. It can prove anything you give it, provided you've already stated the problem clearly. Its greatest limitation isn't "can it deduce," but "what to deduce."
## III. Proofs Are Search: Toothpicks and Bidirectional Derivation

The second principle talks about "a single step of derivation." But a proof is usually not one step, it is many. Here is a finer metaphor than the staircase, which shows how a proof gets found.

Imagine two points: one is the starting point S, the other the endpoint E. S is the given conditions, E is the conclusion to be proved. Three toothpicks extend from S, representing three forward directions of derivation; three toothpicks extend from E, representing three backward directions of reduction. If a toothpick coming from S meets a toothpick coming from E, the proof is complete. If they have not met yet, grow more toothpicks from the end of each one, and see whether the two sides can meet somewhere.

This is the actual process of proving: push forward from the known toward the target while working backward from the target toward the known, until the two trees meet. In exams this is exactly what we do: first manipulate the conditions, then simplify the conclusion, and see whether the two connect. Mathematicians do the same in research, only on a larger scale and with more tools.

This picture has a formal name: **bidirectional search**. In automated theorem proving, starting from the axioms is called forward chaining, starting from the goal is called backward chaining; the proof is where the two search trees meet. Some inference engines — EYE (Euler Yet another proof Engine), for instance — do exactly forward/backward chaining, except that what they work on is N3/RDF rules, not mathematical analysis.

The toothpick metaphor is finer than the staircase: the staircase speaks of the path through learning a discipline, the toothpick speaks of the search for one proof. It is also more complete than modus ponens: modus ponens is only one of the toothpicks; the toothpick metaphor is about the whole search space.

For AI, the most crucial thing in this metaphor is this: **toothpicks can be grown in parallel.** A human can only track a few toothpicks in their head at a time, and gets tired, forgets, gives up because "this path doesn't look elegant"; an AI can grow tens of thousands at once, remember where each one is, use search and learned heuristics to decide which one to grow next, and then use a verifier to check each one for legality.

This is AI's advantage in proving: not that it is smarter, but that its search space is larger, its memory fuller, its verification faster.

But the toothpick metaphor also exposes the boundaries:

- **Who decides the starting point and the endpoint?** The problem itself (what to prove, what is worth proving) is not something search can decide.
- **Who invents the kinds of toothpicks?** Most of the time, toothpicks are the known rules of derivation; but genuinely hard proofs often require inventing new kinds of toothpicks — new definitions, new lemmas, new representations, new vertical objects. This is the concept collision / vertical jump from the first piece, not search.
- **Which meeting toothpick is worth keeping?** Search may find many paths, but which one is "the right proof" (understandable, generalizable, worth entering the canon) is not something search can answer.

So the toothpick metaphor naturally splits in two: the extension, combination, and meeting of toothpicks belong to operation, which is AI's strong suit; the choice of starting and endpoint, the invention of new toothpick types, and which path is worth keeping belong to choice, which is where problem-awareness lives.

## IV. The Embodied Method: Pen and Mouth, Not Essence

For a while I thought the biggest obstacle to learning mathematics was "not understanding." Later I found a more accurate description: I had been chasing a kind of "understanding" that does not exist.

What is called "understanding" is often imagined as an essential insight: you suddenly see the "thing" behind a definition, you grasp the "soul" of a theorem. But in my own experience, such "soul moments" rarely happen. Most of the time, you write and say things repeatedly at your desk, and one day you suddenly find that you can write on fluently. You cannot say exactly what you understood, but your hand and your mouth already know how.

I later called this way of learning the "embodied method": do not hold too strong a sense of self, do not keep asking "what is its essence," but take a pen or your mouth and manipulate the symbols directly according to the legitimate rules. When you write an ε-δ definition, you do not have to think about "what ε really is"; you just write it down in the order of the quantifiers. When you make an estimate, you do not have to think about "whether this estimate is beautiful"; you just carry it through to the end.

This sounds mechanical, even humble. But it works. And in a certain sense it comes close to how AI works: a language model also predicts word by word, and it does not need to "understand" the essence of each word. What you have in common with it is that you are both, in some form, "continuing on from what came before."

The analogy can only go this far. "The hand and mouth already know how" is trained bodily memory — you repeated it many times, so it became a skill, something shaped by time. The model's "predicting what comes next" is its mode of generation, not a habit it trained. So the common point is only that **you can keep operating without first grasping the essence**, not that you and it are doing the same thing.

But this does not mean understanding does not exist. The difference is this: a human can, while performing mechanical operations, step back at any time and ask "why am I doing this," "is this direction right," "is there another road." AI can also generate such questions, but its "asking" is a prediction of similar sentences in the corpus, not something grown out of a living confusion. **The embodied method is an entrance, not an endpoint.** It can let you walk into mathematics, but it cannot decide for you where to walk.

## V. Operational Equality: The Parallelogram and the Housewife

The fifth preparatory perspective is an equality about "operation."

We have learned many basic operations in mathematics: addition, multiplication, taking limits, differentiation, integration, forming quotients, taking duals. Many complicated things, traced to the root, are combinations of these basic operations. For instance, the addition of vectors satisfies a+b=b+a, and drawn out it forms a parallelogram; this commutativity law looks very simple, but it is a promise that "operations can be freely rearranged."

From numbers to functions, from functions to function spaces, each step applies the basic operation of the level before it all over again: limits, continuity, convergence were first used on numbers, later on functions, and later still on functions of functions. Complexity comes from combination, not from how different each individual step is.

I would even push this observation a little further: the mental operations a scientist performs when solving a problem — decomposition, comparison, combination, trial and error, scheduling — and the mental operations a housewife performs when cooking, arranging her time, preparing the materials, are at a certain level the same kind of thing. Not the same difficulty, and not the same value, but the same kind of operation: breaking a big problem into small ones, combining what is already known, searching for workable paths under constraints.

This equality has strict boundaries. It says the operations are similar at the "operation level," not identical in "epistemic status." A recipe does not need peer review; a mathematical theorem does. If you cook something wrong, you can start over; if a mathematical theorem is wrong, it wastes a great many people's time. Pushing the equality to "so everything is the same" goes beyond the scope in which it holds.

Here only one sentence needs to be kept in mind: **a large part of mathematical ability is the combination of basic operations.** What that means for AI will be left to the third piece.
## VI. Physicists vs. the Academy: Tools, or Problems?

The sixth perspective comes from my experience reading mathematics papers, especially the ones physicists write.

There is a kind of paper where, as you read, every step feels clever. For example, a class of papers on invariants of 3-manifolds: given a homology 3-sphere, take the gauge equivalence classes of flat SU(2) connections as generators, use four-dimensional anti-self-dual connections — that is, the instantons that come out of physics — to count the relations among them, and end up with an invariant. Representation theory, homology, Yang–Mills, instantons, layer on layer; and the estimates, compactness, and perturbation in the proof really are arranged just right.

But after you close the paper, you ask yourself: "Why should I care about this problem?" And the answer is usually: because words like homology, representation, Yang–Mills are big, and breaking up big words is what mathematics naturally does. But that answer only redescribes the problem.

Then there is the other kind of paper, Witten's *Supersymmetry and Morse Theory*, where while reading you may feel that the mathematical tools are classical and elementary — Morse theory, Betti numbers, Hodge theory, eigenvalues — but the whole problem is alive, because it comes from physics: supersymmetry, quantum mechanics, tunneling, the ground state. What the paper does is take supersymmetric quantum mechanics as a tool and rederive the Morse inequalities of Morse theory: the physics is alive, the mathematics is off the shelf. Here mathematics is not the protagonist, it is a tool. Witten looks more like an intruder: he pushes into mathematics from physics, reminding you that people often do mathematics not for mathematics itself but for something else.

This contrast is not about who is smarter. It is about **the direction of the argument**:

- The Academy's direction: from tools to problems. Because these mathematical structures are important, we study them; the problem grows from inside the tradition.
- The direction of problem-consciousness: from problems to tools. First there is a live problem that comes from outside, and only then do you select or invent the right tool.

Physicists often do not care about generalizations internal to the Academy, and the reason is here too. You generalize a 2-dimensional result to n dimensions, and if no new structure and no new computable quantity comes out of it, physicists feel this is only adding indices; they have their own notion of singularities, their own approximation methods, and they dispose of it quickly. They do not need your rigor, because their problem is not inside your tradition.

There is a concrete example that shows this difference in the direction of argument: the moduli space of pseudoholomorphic curves.

On the mathematics side, you care about the compactness of that moduli space, the compactification of stable maps, the virtual fundamental class, Gromov–Witten invariants. You want to turn the whole space of curves into an object you can operate on rigorously, and that needs a large amount of formal work: Gromov compactness, bubbling, compactifying the moduli space with stable maps, constructing the virtual fundamental class, and an entire obstruction theory.

On the physics side, the same set of objects often shows up in another form: worldsheet instantons, the A-model, and quick treatments of specific cases. Physicists have their own conventions and their own fast mathematics; they do not necessarily need your compactness proof. They take some particular case as an entry point into the whole continuum of the theory: first discretize it, localize it, compute it, and then see how it embeds into the larger picture. For them the borderline case is not an exception but an entry point into the continuum.

("Borderline case" and "local model" are my own words here, not fixed terminology in this field; what physicists care about is whether it can be computed.)

This makes the point exactly: mathematics often handles continuity, structure, rigor; physics and the applied disciplines often handle discretization, special cases, computable quantities. It is not a question of which is higher, but of a different direction of argument. When the Academy internally generalizes a structure from 2 dimensions to n dimensions, and this only adds indices without producing a new computable quantity or a new physical correspondence, physicists are entitled to ignore it — in their own language of discretization they get to the point they care about faster.

This is not to say that some discipline is nobler. If I were a physicist but kept the same problem-consciousness, I might feel the same way about Witten: not because he used advanced mathematics, but because he brought in a live problem from outside. Conversely, things like QCD and gauge invariance in physics can also turn into big words nobody asks the origin of. Academy-style elaboration and live problem-consciousness exist in every discipline; the difference is not the discipline, but whether you are still asking "why".

Finally, let me state my own position, because it decides why this piece is written the way it is: **when I use mathematics, I use it as a tool.** I do not think it is some higher intermediate layer, nor that pure mathematics is naturally more respectable than applied mathematics. So applied mathematics has never been my enemy; quite the opposite: if a tool cannot solve any problem outside of toolhood, my interest in it drops off fast.

This is also why "big words" make me uneasy. The big words are not wrong in themselves; what is wrong is that after a problem's original origin has disappeared, the big word can still demand a lifetime of investment purely on the strength of its own bulk — like the Foolish Old Man Removing the Mountains, carrying one basket of dirt a day, until the job is done. The problem is not the man moving the mountain, but whether the mountain is still worth moving.

This perspective also produces a key distinction: **the first self** and **the second self**.

- The first self is inside the tradition. He accepts the established framework, follows the proof, appreciates local cleverness. He is necessary: without him you cannot even formulate the question.
- The second self is outside the tradition. He does not ask "is this step correct", he asks "why this game". He represents problem-consciousness: he brings the origin, he sets the direction.

To be clear: these are **definitions used to describe positions**, not a discovery about consciousness. I call "accepting the established framework from inside the tradition" the first self, and "pressing the question of origin from outside" the second self. The definitions themselves prove nothing; they are useful because they let you see the difference between the same person and the same paper in different positions. The same person can have been in both places — while reading the proof he is the first self; after closing the paper he is the second self.

Put the two papers side by side and this distinction becomes a table you can compare:

| | A paper on invariants of 3-manifolds | Witten, *Supersymmetry and Morse Theory* |
|---|---|---|
| Mathematics used | Representation theory, homology, Yang–Mills connections, instantons; layer on layer | Classical and elementary: Morse theory, Betti numbers, Hodge theory, eigenvalues |
| Where the problem comes from | It grows from inside the tradition — these big words matter, so we study them | From physics: supersymmetry, quantum mechanics, tunneling, the ground state |
| Direction of the argument | From tools to problems | From problems to tools |
| The proof itself | Locally very clever: estimates, compactness, perturbation, just right | Locally not complicated; what is genuinely new is the problem |
| What the first self sees | Follows along, admires every step | Follows along, admires every step |
| What the second self asks | Why this game? | What is the origin of this physics problem? |
| Conclusion | Problem-consciousness is inherited | Problem-consciousness is alive |

> In the left-hand column I deliberately do not name the authors. What is being criticized here is the fact that "a problem can be inherited",
> not one particular paper, and certainly not any one author — the paper itself is very well written, and every step of it deserves respect.
> Swap in any paper of the same type and the left column of this table still holds.

AI is currently an extremely strong first self. Whether it can become a second self is the central question of the later pieces.

## VII. The Vigor of AI Nonsense: Making the Boundaries of Words Visible

The last perspective to prepare comes from a special ability of AI: it is not afraid of terms being "esoteric".

When humans learn a subject, big words easily overwhelm them. You see "Yang–Mills", "instanton", "stratum", "cohomology", and your first reaction is awe; you dare not use them carelessly, because you are not sure whether you understand them. AI has no such awe. It will string terms together with complete confidence, sometimes right, sometimes spectacularly wrong — talking nonsense in quantum field theory, for instance.

Beginners often take this kind of "talking nonsense" for pure defect. But it has a strange pedagogical value: when AI puts two words together that cannot go together, you are forced to look at **why they cannot go together**. You start paying attention to grammar, types, quantifiers, domains of definition, semantic boundaries. AI's gibberish lights up the edges of the formal system.

This is also a kind of "concept collision", but it is the chaotic version: a large number of candidate combinations get generated, most of them wrong; then a verifier — your judgement, a textbook, Lean, one concrete counterexample — filters them out. The one that survives may show you a legitimate combination you could not otherwise see.

There is a question here I have never worked out, and it is more fundamental than "can AI do mathematics": **why can one word be joined to another word, and swapping in a different one will not do?** This is both a linguistics question and a question of formalization in mathematics: which combinations are well-formed? Where does the boundary between syntax and semantics lie? AI's fluency is precisely what makes that boundary visible: it can speak with unimaginable smoothness right up until you discover that it is not on the legal track at all.

But this must be emphasized: the value of nonsense is not in the nonsense itself, but in **verification**. The systems in 2026 that actually built something are all a generator plus a verifier: the generator is responsible for speculating wildly, the verifier is responsible for filtering. A system with only a generator is just noise; a system with only a verifier cannot produce anything new either. Only when the two combine do you get mathematics. This structure is the key to the next piece.

## Coda: The Preparation Ends, the Problems Begin

Put the seven perspectives above together and a recurring shape comes into view:

- There is a layer of mathematics that is mechanical, formalizable, verifiable, something you can "run" — the mechanical part of the staircase, the Academy's layer of elaboration, the world of the first self.
- There is a layer of mathematics that is origin, choice, and the vertical leap — problem-consciousness, the second self, the world of the intruder.

Notice that "concept collision" is not in the second line. Collision is a kind of **generation**: putting two concepts together and knocking out new candidate objects. Generation can happen in large quantities, and Section Seven of the second piece even says that AI's gibberish is a chaotic version of collision. What really belongs in the second line is **judgement** — which candidate is worth keeping, and whether a new overarching object ought to be introduced at all. With generation and judgement separated, the vocabulary of this piece is finally in the right place.

Which layer will AI take over? On what grounds will it take it over? After it takes over, what is left of the other layer?

That is the question the next piece will answer.

## Notes and Boundaries

- These seven perspectives come from my own reading and learning experience, not from a literature review. The comparison of the two papers in Section Six is a personal reading; I deliberately do not name the one on the left, because what is under criticism is the fact that "a problem can be inherited", not any one author.
- "Scientists and housewives are the same kind of thing at the operational level" holds only at the operational level and says nothing about epistemological standing: a recipe does not need peer review, a theorem does. Once you cross that line, the analogy no longer holds.
- "AI nonsense has pedagogical value" is for the moment only my observation, and I have no reproducible example yet: what the error was, who caught it, what was learned, how much it cost — there is no data for any of it. The end of Section Seven already explained this: the value lies in verification, not in the nonsense itself.
- The staircase metaphor describes a learning path that has already been tidied up, not the process by which mathematics itself is created. Textbooks smooth over history, and this point will be used again in the third piece.
- This piece only prepares the vocabulary and draws no conclusions. If these perspectives themselves are flawed, the arguments in the two pieces that follow will collapse too.

<!-- CTA-PLACEHOLDER: replace with real links before publishing (GitHub / newsletter / contact email).
     Blocked on the launch gate in AGENTS.md §4: the domain, the newsletter, and the repository audit are all undecided. -->
