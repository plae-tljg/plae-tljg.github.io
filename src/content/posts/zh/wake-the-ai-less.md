---
title: 少唤醒 AI：让模型维护数据，而不是接住每一次请求
summary: >-
  AI 系统真正的成本不只在 token 单价，而在模型被唤醒的次数。本文先从 System = Code + Data 推导代码如何退为
  meta-code，再用真实公开项目 personal-chatbots 拆解四个家、五张表、参数化知识行和 git 审核闭环。
lang: zh
translationKey: wake-the-ai-less
slug: wake-the-ai-less
date: '2026-09-23'
series: ai-maintainable-systems
tags:
  - AI
  - architecture
  - maintainability
status: preview
source: seasons/02-systems/wake-the-ai-less.zh.md
syncedAt: '2026-10-01T04:02:48.255Z'
---
大多数 AI 应用是这样长出来的：

```text
用户请求 -> 构造 prompt -> 调用模型 -> 返回
```

已知的问题越多，账单越贵；同一个问题可能今天答对、明天答错；系统越“智能”，越难审计。另一个极端是把所有逻辑写进 `if/else`：运行时便宜、确定，但每次业务规则变化都要改代码、发版本、等回归。

两端都不理想：一端把成本花在运行时，另一端把成本花在维护时。

真正值得追问的是三个架构问题：

1. 运行时应该唤醒 AI 几次？
2. 维护时应该让 AI 改什么？
3. 人类在哪一步负责授权？

本文给出一套可推导的设计模型：

```text
Structure + AI = Product
```

确定性结构负责执行；AI 负责维护结构；人类负责审核。模型被唤醒的频率不是 prompt 技巧，而是可以度量、可以调度的成本变量。

> 本文用一个真实公开项目 **personal-chatbots** 做最小实现示例。它回答的是 LKM 的公开 GitHub 项目，数据来自公开元数据与手写判断，不包含私有或客户数据。它只是一个 “do until you need” 的成本有效实例，不是这套结构本身；MaaFwPhoneAI 是另一个复杂域的例子。

## 1. 核心模型：Structure + AI = Product

更基础的关系是：

```text
System = Code + Data
```

我们要做的是让 AI 维护 **Data** 那一侧；代码那一侧则逐渐退成 **meta-code**：解释器、词汇表、校验器、runner 和 review gate。数据侧不是“随便放”，它需要一套结构，让解释器能确定性执行、让 AI 能在小上下文里安全修改、让每个改动能被测试和回滚。

在这个意义上，本文讨论的 **结构 S** 就是 Code 和 Data 之间的契约：

**结构 S** 由三件事组成：

```text
S = (D, V, I)

D = 数据行，例如知识行、实体、链接、状态
V = 小型稳定词汇，例如 rung、action kind、entity type
I = 确定性解释器，把 D 和用户输入变成答案或动作
```

**AI A** 也由两件事组成：

```text
A = (M, O)

M = 模型能力
O = AI 的 IO 契约：能读什么，只能写什么
```

运行时优先走结构：

```text
P(request) =
  I(S, request)          如果结构能覆盖
  A_fallback(request)    否则
```

维护时，AI 不直接改线上数据，而是产生一个可审核的改动，由人合并：

```text
S(t+1) = S(t) ⊕ Review(A(S(t), Evidence(t)))
```

这里的 `⊕` 不是普通加法，而是“提议 → 审核 → 发布”的维护操作。在大型系统里，它可能是 proposal 表和审核界面；在 personal-chatbots 里，它就是 **git 分支、PR、CI 和 merge**。缺了它，AI 就会直接改写系统状态；缺了结构，AI 的修改就无法被确定性地执行和验证。

### 两个互相咬合的拼图

这个模型真正要解决的是两个 puzzle：

| Puzzle | 目标 | 对应结构 |
|---|---|---|
| Puzzle 1：执行结构 | 最大化确定性覆盖率 κ，降低运行时成本与延迟 | 知识行、实体、链接、指代帧、可选 fallback |
| Puzzle 2：维护结构 | 让 AI 能安全提议，人可审核、可回滚 | content 文件、测试、git、PR、CI |

两块的连接点是一套**共用词汇**。如果 AI 能表达一个改动，但引擎解释不了，系统就废了；如果引擎能执行一个改动，但 AI 无法表达，维护就仍然要人写代码。

这不是一个严格数学定理，而是一个设计分解。它的价值在于：把“AI 到底该干什么”从模糊直觉变成两张可以分别优化的结构图。

### 这不是独创性声明，而是约束推导

我们并不声称发明了这种结构。它更像数据结构课上的推导：**给定你希望系统具备的性质，问什么结构会自然出现。**

- 要 FIFO → queue；
- 要 ordered lookup → 平衡树；
- 要磁盘局部性 → B-tree；
- 要一套可被 AI 维护、又能确定执行的知识系统 → ？

这里的需求可以写成一组约束：

1. 运行时尽量确定、便宜、可审计；
2. AI 能在有限的上下文里做安全修改；
3. 新知识尽量是数据，只有真正的新 primitive 才改代码；
4. 每个改动都能 review、测试、回滚；
5. AI 成本与**结构变化**相关，而不是与流量或数据变化相关；
6. 简单项目用简单结构，只有 trigger 出现时才增加复杂度。

把这些约束放进去，结构会像算术一样被推出来：

| 约束 | 自然推出的结构 |
|---|---|
| 运行时确定、快速 | 解释器 + 行 / 索引 / FTS，而不是每次请求都问模型 |
| 数据频繁变化但句子不变 | 实体表 + `{slot}` 模板，而不是把值写进文字 |
| AI 上下文有限 | 离线 content 文件 + 稳定 slug，而不是让 AI 读取整个数据库 |
| 改动必须可审核 | diff / git / PR，或等价的 proposal 表 |
| 简单优先 | config file > content file > existing table > new table |
| 扩展性不能靠猜 | code seam（Store / Vocabulary / LADDER / build / Runner），而不是空表 |
| 不允许猜答案 | 槽位唯一命中才回答，否则 refuse，并记录成 inbox |

所以本文更准确的定位是：**不是“我们发明了一个结构”，而是“在这组约束下，结构被推出来”。** personal-chatbots 只是这个推导在某个低成本点的实现。

### 真正的张力：extensibility vs AI maintainability

这套推导背后有一个很难回避的拉扯：

- **Extensibility** 天然倾向于更多代码：更多 hook、更多抽象、更多“以后可能会用”的空表；
- **AI maintainability** 天然倾向于更少、更稳定的结构：小词汇、清晰的数据形状、可 diff 的改动；
- **CI / review** 又要求每个变动可以在不读完整套代码的情况下被验证。

三者不可能同时无限扩张。可行的平衡点是：

> **新的知识是数据；新的 primitive 是代码，而且应该很少。**

这也是为什么数据侧需要“结构”，而不是自由文本：结构让 CI 能测试它，让 AI 能安全地改它，让运行时能确定地解释它。

## 2. 成本公式：唤醒频率应该被计算

设：

```text
N  = 每个周期的请求数
c0 = 确定性解析一次的平均成本
ca = 一次 AI fallback 的平均成本
κ  = 确定性覆盖率，0 ≤ κ ≤ 1
w  = 每个周期唤醒 AI 做维护的次数
cm = 单次维护唤醒的成本（模型调用 + 上下文加载 + 人工 review）
```

一个周期的总成本可以写成：

```text
C(N, w) = N * [c0 + (1 - κ) * ca] + w * cm
```

单位请求成本是：

```text
unit_cost = c0 + (1 - κ) * ca + (w * cm) / N
```

如果一次维护能把覆盖率提高 `Δκ`，那么它每周期节省的 fallback 成本是：

```text
benefit = N * Δκ * ca
```

因此，一次维护在成本上值得做，当且仅当：

```text
N * Δκ * ca > cm
```

这个不等式解释了很多现象：

- 请求量 `N` 越大，维护的收益越高；
- fallback 成本 `ca` 越高，消除 fallback 越值得；
- 维护唤醒成本 `cm` 越高，就越应该合并唤醒、批量 review；
- 如果提高的覆盖率 `Δκ` 很小，就不值得为了维护而维护。

注意这里的 `Δκ` 是**边际覆盖率提升**，不是知识行数增加。AI 写 100 条规则但没有让系统多回答一个问题，收益仍然是零。

personal-chatbots 的设计文档里有一句话，把这件事说得更直接：

> **Make AI invocations proportional to structural change, not to data change and not to traffic.**

翻译过来：AI 的调用次数应该和“结构变化”成正比，而不是和“数据变化”或“流量”成正比。价格变了，不应该唤醒模型；一个访客问了未知问题，也不应该立刻在请求路径上唤醒模型。

### 唤醒策略的几种模式

| 模式 | 唤醒频率 w | 成本特征 | 适合场景 | 主要风险 |
|---|---|---|---|---|
| per-request | 接近未知请求数 | 最高，随时波动 | 冷启动、首次探索 | 账单不可控，延迟抖动 |
| micro-batch | 每 M 条请求或每 X 个未知问题 | 中等，可摊薄上下文 | 高峰后补学习 | 反馈延迟 |
| daily / weekly | 固定周期 | 低，适合 batch review | 稳定业务、日常维护 | 新问题多时反馈慢 |
| event-driven | 未命中率、投诉量或新活动触发 | 中低 | 突发流量、新目录、新政策 | 阈值难调 |
| manual | 人决定 | 最低 | 低流量、高敏感业务 | 长期不更新，结构腐化 |

daily batch 往往是一个好起点，不是因为它神奇，而是因为一次唤醒的固定成本可以分摊到许多个小问题上，Review 也可以批量进行。真正重要的是：**wake policy 是架构决策，不是模型选型决策。**

### 应该长期盯住的指标

不要只看 token 单价。至少记录：

- fallback rate：多少请求仍然需要 AI 在运行时兜底；
- AI wakes / 100 requests：每 100 个请求唤醒了几次模型；
- unit cost：确定性成本 + 概率性 fallback 成本 + 维护摊销；
- accepted changes / round：一轮维护有多少提议最终被人接受；
- replay success rate：已发布的结构在真实请求上是否稳定命中。

这些指标决定了下一次 wake 应该更频繁还是更稀疏。

## 3. 真实案例：personal-chatbots 怎么让 AI“住在系统里”

“让 AI 维护”不等于让它自由写数据库。为了避免 EAV 混沌和不可审计的自动修改，需要同时做两件事：

1. **词汇稳定**：代码只解释一小套固定词汇；
2. **数据自由**：行为、知识、决策放在可编辑的数据形态里。

personal-chatbots 是一个公开的“和我的公开作品聊天”项目。它不是理论证明，而是一个**成本有效的最小实现**：简单项目先把简单结构跑通。它的价值在于把上面的推导落成一个可以运行、被 CI 检查、被普通 coding agent 维护的实例。它的运行时不调用模型，答案来自 SQLite 行；这些行由 `content/*.yaml` 和公开 GitHub 元数据在构建时生成。

### 3.1 四个家：config / content / data / state

这个项目不试图回答“哪份数据是唯一真相”，而是先问：“这是哪一种东西？”

| 东西 | 住在哪里 | 形态 | 谁改 | build 做什么 |
|---|---|---|---|---|
| Config | `content/bot.json` | 离线 | 人 | 重新读取 |
| Content | `content/*.yaml` | **离线** | 人 **和 AI**（经 PR） | **同步进数据库** |
| Data | `data/bot.db` 的投影表 | **在线** | `pc build` | 重建 |
| State | `data/bot.db` 的 `messages` | **在线** | 运行时 | 永不触碰 |

最关键的一条界线是：

> **`content/` 不是运行时的一部分。** 运行时只读数据库；YAML 每次 build 只被读一次。

YAML 不是 seed，也不是第二个真相。它是知识的**可编辑形态**：人能读、AI 能改、git 能 diff。数据库是同一份知识在**运行形态**下的投影：有索引、能 join、微秒级可查。运行时产生的新东西只有一条：`messages` 里的真实对话，以及 `unresolved = 1` 的未命中证据。

这带来两个重要后果：

- **rebuild 永远安全**：`pc build` 只同步离线内容，不碰 live state；
- **AI 没有 ambient authority**：它只能改离线文件，不能写数据库，也不能 merge。

这就是“AI 住在系统里”的实际含义：它的记忆是 repo，它的收件箱是 `messages` 表，它的工作是 diff，merge 按钮在人的手里。

### 3.2 参数化知识行：句子稳定，数值来自实体

personal-chatbots 的 `knowledge` 表来自 `content/knowledge.yaml`。一行知识 = 一个问句形状 → 一个确定性动作：

```yaml
- slug: repo.about
  patterns:
    - "what is {repo} about"
    - "tell me about {repo}"
    - "what does {repo} do"
  slots: { repo: repo }
  action:
    kind: answer
    template: "{repo} — {repo.summary}"
```

模板里只能出现 `{slot}` 和实体字段，不能出现具体数值。仓库的 star 数、版本、价格、库存、营业时间这类“会变得比措辞更快”的值，一律放在实体行里：

```json
{
  "entity_type": "product",
  "key": "sku:rtx-4070",
  "name": "RTX 4070",
  "attrs_json": {
    "price_cents": 59900,
    "stock": 12
  }
}
```

价格行这样：

```yaml
- slug: product.price
  patterns:
    - "how much is {product}"
    - "what does {product} cost"
  slots: { product: product }
  action:
    kind: answer
    template: "{product} is {price}."
```

这条规则可以概括成一句**成本规则**，而不是风格规则：

> **Anything that changes faster than the wording around it must not live in the wording.**

也就是：**变化速度比周围文字更快的东西，不要写进文字里。** 价格写在每条答案里，改一次价格就要改 N 条知识，甚至唤醒模型；价格挂在实体上，改一次价格是 1 行数据、0 次 AI 唤醒。这个判断标准也适用于版本、库存、日期、star 数。

### 3.3 指代是投影，不是状态

很多聊天机器人一遇到“它”“第二个”“还有第三个”就引入状态机。personal-chatbots 把这件事拆得更细：

- **跨轮**不等于**有状态**；
- “第二个”需要的是上一轮答案的 citations，而 citations 本来为了可解释性已经存了；
- 它不需要一个 `flow_states` 表，也不需要自己的变量。

项目里的做法是：在解析问题之前，先做一次 **reference rewrite**。如果上一轮答案列出了多个实体，就把“第二个”改写成那个实体，再进入正常的确定性 ladder。

| | Reference（指代帧） | Flow（流程状态） |
|---|---|---|
| 存储 | 无 | `flow_states`（live table） |
| 真相在哪 | 已有的 transcript / citations | 一份需要维护正确的平行记录 |
| 失败模式 | 解析错对象，可见 | 访客卡在某一步 |
| 增加成本 | 一个 rewrite 步骤 | live state + timeout + escape hatch |

这条区分非常重要：**“跨轮但无状态”是一等公民。** 只有当一个值必须跨轮保留（例如“要几个？” → “3”）时，才值得增加 `flow_states`。这也是把结构做小的关键：不是所有对话能力都需要一张状态表。

### 3.4 五张表：只建现在需要的，不建“以后可能会用”的

personal-chatbots v1 只有五张表：

| 表 | 类型 | 为什么存在 |
|---|---|---|
| `entities` | built | 名词：repo、account、person、language、topic、project、product |
| `entity_links` | built | 关系：owned_by、uses_language、tagged、includes、forked_from |
| `documents` (+ FTS) | built | README 和笔记：最便宜的答案层 |
| `knowledge` | built | pattern → deterministic action |
| `messages` | **live** | 每一轮对话；`unresolved = 1` 是唯一学习信号 |

没有独立的 `products` 表：一个产品就是 `entity_type='product'`。没有 `settings` 表：配置是一个 JSON 文件。没有 `proposals` / `reviews` / `revisions` / `tests` / `test_results` / `runs` 表：这些东西由 git 分支、PR、CI、测试文件和 git history 承担。

项目给存储选择排了一个偏好顺序：

```text
config file  >  content file  >  existing table  >  new table
```

因为每加一张表，就多一份校验、审核、回滚和迁移的成本。只有在下面这些情况出现时，才值得升级：

1. 数据不再是实体形状（订单行、库存账本、价格历史）；
2. 需要数据库级约束（多列唯一、外键、跨行 CHECK）；
3. 数据量大到 JSON 查询真的变慢；
4. 有一个你无法控制的外部 schema。

一个产品要不要独立成表？只有当这些条件被测量到，而不是被想象到时。

### 3.5 从目标推导结构

把上面的做法写成推导链：

```text
Goal -> Actors -> Intents -> Information shapes -> Structures -> IO -> Wake policy
```

再按信息形态映射：

| 信息形态 | personal-chatbots 里的结构 | 关键点 |
|---|---|---|
| 静态事实 | `knowledge` 行 | pattern + answer |
| 参数化事实 | `knowledge` + `entities.attrs_json` | `{slot}` 从实体解析，值不进模板 |
| 跨轮指代 | 上一轮的 citations | projection，不是状态 |
| 多轮流程 | L2 的 `flows` + `flow_states` | 只有“值必须跨轮保留”时才加 |
| 对外任务 | L2 的 `tasks` | 有副作用和人工接手时才加 |
| 未知问题 | `messages.unresolved = 1` | 唯一学习信号，不猜 |
| 维护改动 | 分支 / diff / PR | 不需要 `proposals` 表 |

一条经验规则贯穿其中：**新的知识是数据；新的 primitive 是代码，而且应该很少。** 代码的可扩展性来自 seam，而不是空表：

- `Store`：所有 SQL 在一个模块，加表/列时集中改；
- `Vocabulary`：entity type / link type / action kind 的字典；
- `LADDER`：`bot.json` 里的字符串列表，加一档就是加一个字符串；
- `build()`：离线内容 → 数据库，幂等；
- `Runner`：`tests.yaml` 跑在已构建的数据库上。

> Leave seams in code, not empty tables in the database.

## 4. AI 的角色：不是特殊 API，而是一个普通 coding agent

personal-chatbots 最值得写进文章的决策是：**它没有为维护 AI 发明一套新的运行时。**

维护者就是一个普通 coding agent：opencode、DeepSeek Harness、Claude Code，或者一个照着同样说明做事的人。它已经有：

| 它已经有的东西 | 所以系统不需要造 |
|---|---|
| 一个 sandbox：这个 repo | 工具调用协议 |
| 迭代：改 → 跑 → 看错误 → 再改 | 自研 retry 循环 |
| diff 和 history | `revisions` + 审核界面 |
| 分支 | staging 环境 |
| PR + CI | `proposals` / `reviews` / `test_results` 表 |
| `git revert` | 自研回滚命令 |

维护循环是：

```text
pc inbox                     读结构答不出来的真实问题，按问句形状聚类
读 content/*.yaml            当前知识
改 knowledge.yaml            加 pattern、改模板、加一行
改 curation.yaml             修 alias、分组、override
加 content/tests.yaml        用访客的原话把它钉住
pc build && pc test          迭代到全绿
开 PR                        附 rationale 和做不到的部分
        |
        v
人 review -> merge -> deploy 重新 build 数据库
```

关键边界不是靠 prompt 请求 agent 遵守，而是由环境强制：

- `content/**` 允许编辑；
- engine、schema、docs 默认 deny；
- `sqlite3` 被拒绝，因为 CLI 可以写；读数据库只能用只读的 `pc sql`；
- AI 不能 raise level，不能加 live table，不能 merge；
- 它做不了的 code change，必须在 PR 描述里说清楚并停下。

这条边界的实际含义是：

> **AI 的提案系统是 git，审核系统是 PR，回滚系统是 git revert。**

所以 personal-chatbots 没有 `proposals` 表。不是“结构还不够”，而是“现有的通用基础设施已经把这件事做完了”。

## 5. 测试是架构的一部分：防止过严、过松和过拟合

如果文章只讲结构，很容易让人以为“把东西塞进表”就结束了。真正的问题在后面：**表数据也需要测试，否则规则会过严、过松，或者在真实流量里失效。**

personal-chatbots 的 `content/tests.yaml` 把测试分成四类：

| 测试类型 | 防什么 | 谁写 |
|---|---|---|
| 正例（must answer） | **过严**：一条永远不命中的行 | AI，从真实流量写 |
| confusable negative（must refuse） | **过松**：抢别人的问题 | 人在种子阶段写 |
| refusal（must refuse） | 编造 / 幻觉 | 人在种子阶段写 |
| ambiguity（must refuse, not guess） | 在两个相近实体里挑一个 | 人在种子阶段写 |

这里的核心设计是：**后三类由人在 AI 开始编辑之前种下**。如果测试集全部由 AI 从同一批未命中问题里生成，它会写出刚好覆盖这三条问法的模式，然后测试全绿，现实继续拒答。让三类负例先于 AI 存在，是这个规模下最现实的防过拟合手段。

另外几条规则也很重要：

- **断言要粗**：`answer_contains` 是子串，不是精确答案。一个改个措辞就报警的测试集，人很快就会学会忽略它；
- **允许拒答**：`refuse` 是 feature，不是 failure。唯一学习信号就是 `unresolved = 1` 的收件箱；
- **死行报告**：`v_dead_knowledge` 找出 30 天从未命中的知识行；该归档，不是该继续加规则；
- **回归基线是 git**：main 全绿，分支变红就是回归；
- **双引擎 parity**：Python 引擎和浏览器 JS 引擎跑同一份 `tests.yaml`，CI 检查 `8/8 cases agree`；没有这层检查，两个解释器一个月就会漂移。

测试在这里不是“质量保证的附录”，而是结构的一部分。没有测试的结构，只是一张还没出事的表。

## 6. 唤醒策略在 personal-chatbots 里的落地

回到成本公式。personal-chatbots 的 ladder 顺序是：

```text
reference -> knowledge -> entity -> search -> fallback -> refuse
```

但 `fallback` 是否出现在 ladder 里，是一个由人决定的开关。项目最初的选择是**把模型从 serving path 上拿掉**；只有当拒答率持续很高，并且缺口确实是开放性问题时，才把 fallback 作为 opt-in rung 加回来。这个 trigger 后来真的触发了，所以当前仓库已经按这个条件开启了 fallback。

即使开启，它仍然遵守两条边界：

- 模型回答过的问题，仍然记录为 `unresolved`——回答访客和让结构学会是两件事；
- 它只从问题实际触及的实体里取上下文，而不是看见整个知识库；超时、报错、key 失效时，最终结果仍然是安心地 refuse。

设计文档给出的数字是：

- 确定性层：约 0.2 ms，0 token；
- fallback 模型：约 7 秒，一次模型调用；
- 两者相差约三个半数量级。

这就是 wake policy 在一个真实系统里的形态：

- 数据变化（star 数、价格、版本）→ 0 次唤醒；
- 结构变化（新 pattern、新实体类型）→ 一轮 batch 维护；
- 运行时未知问题 → 先记录，是否让模型在运行时兜底由人决定，而且兜底也不会清掉学习信号。

## 7. 局限与反模式

这套模式不是万能药：

- 它不是 RAG，不是 text-to-SQL，不是“AI 全自动改系统”，也不是无代码；
- Schema 设计仍然困难，JSON 自由度过高会退化成不可维护的隐藏格式；
- AI 会产生错误的 proposal / diff，所以必须有测试、review、回滚路径；
- 规则和模式会重叠，需要优先级、冲突检测和持续回归；
- 流程和 task 会引入 live state，需要恢复、并发、过期和迁移；
- 不是所有问题都适合结构化；探索性、开放性任务可能更适合直接调用模型。

personal-chatbots 自己也明确写下了边界：它是一个 L1（Facts）系统；L2 的 Flow 和 Task 只有出现真实 trigger 时才加；fallback 对公开网页来说不可用（会把 API key 暴露给浏览器）；没有多租户，也没有 scheduler。它不假装自己已经是一个完整的自主维护系统。

最重要的限制是：**这不是“一次性把 AI 接上”的架构。** 它需要持续读 inbox、加测试、观察拒答率，并根据成本收益调整 wake 频率。好处是，这些维护工作逐渐变成数据工作和 PR review，而不是每次都在代码里救火。

## 8. 落地清单

如果你想把一个已有的小系统改成这个方向，可以按 personal-chatbots 的循环开始：

1. 找出一个重复决策最多、fallback 成本最高的流程；
2. 把它拆成 config / content / data / state 四个家，先问“这东西到底属于哪一种”；
3. 定义最小的一行知识和一套小词汇；
4. 写确定性解释器，先让已知问题稳定命中；
5. 把 AI 的工作限制成编辑离线 content，只能走分支和 PR；
6. 每一轮维护都从 `inbox`（未命中问题）开始，而不是从 prompt 开始；
7. 每一个行为改动都加一条测试，优先补“必须继续拒答”的负例；
8. 记录 fallback rate、唤醒频率、单位成本和 review 结果，再决定要不要加 fallback rung。

## 9. 收尾

AI 的价值不在于每次请求都出面。相反，它应该把每次解决问题的经验沉淀成结构，让下一次不再需要模型。

结构负责记住，AI 负责改进，人负责授权。结构本身不是被“发明”出来的，而是在这些约束下被推导出来的；personal-chatbots 只是其中一种低成本实现。

这就是：

```text
Structure + AI = Product
```

下一篇会进入具体的数据结构：**参数化知识行——从 FAQ 到可维护的数据结构**。我们会用 personal-chatbots 的 `content/knowledge.yaml`、`entities.attrs_json` 和 `messages` 收件箱，说明“一行数据”到底应该长什么样，以及为什么“价格变化不该唤醒 AI”。

<!-- CTA: GitHub / newsletter / contact links are intentionally left blank until the launch gate in AGENTS.md is satisfied. -->
