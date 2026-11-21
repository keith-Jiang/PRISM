## 1. 公式解析

BM25 是一种 **词面匹配** 的打分方法，其 **对查询中的每个词，计算它在候选 chunk 中的贡献，然后把所有词的贡献加起来**。Okapi BM25 公式如下：

$$
\operatorname{score}(D,Q)
=
\sum_{t\in Q}
\operatorname{IDF}(t)
\cdot
\frac{f(t,D)(k_1+1)}
{f(t,D)+k_1\left(1-b+b\frac{|D|}{\operatorname{avgdl}}\right)}
$$

可以理解为

```text
chunk D 对查询 Q 的总分
= 查询词 t1 的贡献 + 查询词 t2 的贡献 + ...
```

每个词的贡献由三部分决定：

1. 这个词有多稀有：$\operatorname{IDF}(t)$；
2. 这个词在 chunk 里出现多少次：$f(t,D)$；
3. 这个 chunk 相对平均长度有多长：长度归一化项。

### 1.1 符号含义

| 符号 | 含义 |
|---|---|
| $D$ | 候选文档单元；传统检索中可以是整篇文档，在 RAG 中一般为 chunk |
| $Q$ | 查询，即用户问题分词后的词项集合 |
| $t$ | 查询中的某个词 |
| $f(t,D)$ | 词 $t$ 在候选单元 $D$ 中出现的次数 |
| $\lvert D\rvert$ | 候选单元 $D$ 的长度，本文是分词后的 token 数 |
| $\operatorname{avgdl}$ | 所有候选单元的平均长度 |
| $N$ | 候选单元总数 |
| $df(t)$ | 包含词 $t$ 的候选单元数，即文档频率 |
| $\operatorname{IDF}(t)$ | 词 $t$ 的稀有度权重 |
| $k_1$ | 词频饱和参数 |
| $b$ | 长度归一化参数 |

### 1.2 单个查询词的贡献

我们先把长度归一化部分记作：

$$
C = k_1\left(1-b+b\frac{|D|}{\operatorname{avgdl}}\right)
$$

那么某个词 $t$ 的贡献就是：

$$
\operatorname{IDF}(t)
\cdot
\frac{f(t,D)(k_1+1)}{f(t,D)+C}
$$

可以看出

- 如果 chunk 里没有这个词，即 $f(t,D)=0$，则该词贡献为 0。
- 如果 chunk 里这个词出现很多次，即 $f(t,D)$ 增大，则该词贡献也会增大，但是不会无限线性增大，极限时趋近于 $\operatorname{IDF}(t)(k_1+1)$。
- 如果 $C$ 变大，该词贡献会变小。

所以 BM25 不是简单对关键词计数，而是 **稀有度 × 饱和后的词频收益 ÷ 长度惩罚**

### 1.3 IDF：为什么稀有词更重要

IDF 公式：

$$
\operatorname{IDF}(t)
=
\ln\left(
\frac{N-df(t)+0.5}{df(t)+0.5}+1
\right)
$$

可以看出

- 一个词出现的这个 chunk 的文档频率很小，即 $df(t)$ 小，则 IDF 大。
- 一个词出现的这个 chunk 的文档频率很大，即 $df(t)$ 大，则 IDF 小。
- 一个词几乎到处都有：IDF 接近 0，几乎不贡献区分度。

公式里的 `0.5` 是平滑项，避免极端值；`+1` 保证 IDF 不为负。

### 1.4 词频饱和参数 $k_1$

$k_1$ 控制“一个词出现更多次”还能带来多少额外收益。假设 chunk 长度等于平均长度，此时 $C=k_1$。当 $k_1=1.5$ 时，词频部分的相对收益为：

| $f(t,D)$ | 词频因子 $\frac{f(k_1+1)}{f+k_1}$ |
|---:|---:|
| 1 | 1.000 |
| 2 | 1.429 |
| 5 | 1.923 |
| 10 | 2.174 |
| 很大 | 趋近 2.5 |

可以看出

- 从出现 1 次到 2 次，收益明显；
- 从 5 次到 10 次，收益变小；
- 继续增加到几十次，收益接近上限。

参数影响：

- $k_1=0$：近似只看词是否出现，不关心出现几次；
- $k_1$ 较小：词频更快饱和；
- $k_1$ 较大：重复出现更容易继续加分；

### 1.5 长度归一化参数 $b$

长度因子是：

$$
L = 1-b+b\frac{|D|}{\operatorname{avgdl}}
$$

它进入分母：

$$
C = k_1 L
$$

可以看出

- chunk 比平均长度长：$L>1$，分母变大，同样词频的贡献降低；
- chunk 比平均长度短：$L<1$，分母变小，同样词频的贡献提高；
- chunk 等于平均长度：$L=1$。

参数影响：

- $b=0$：不做长度归一化，长 chunk 天然更容易包含更多词；
- $b=1$：完全按相对长度归一化。

所以短 chunk 里出现一次稀有词，可能比长 chunk 里出现一次更值得关注。

## 2. 代码解析

BM25 可以分成三个阶段：

```text
离线准备：
  文档 text → 切块 chunk_text → 保存 chunks.jsonl

加载统计：
  chunks → 分词 tokenize → TF / dl / DF → avgdl / IDF

在线检索：
  question → 分词 tokenize → 对每个 chunk 计算 BM25 分数 → 排序 → Top-K
```

### 2.1 分词

```python
_LATIN = re.compile(r"[a-z0-9]+") # 提取英文单词和数字，如 pexi、2027
_CJK = re.compile(r"[一-鿿]") # 提取中文字符


def _tokenize(text: str) -> list[str]:
    text = (text or "").lower() # 统一为小写
    toks = _LATIN.findall(text)
    cjk = _CJK.findall(text)
    toks += cjk # 加入中文单字
    toks += [cjk[i] + cjk[i + 1] for i in range(len(cjk) - 1)] # 加入相邻中文二字组合，即 bigram
    return toks
```

举个例子：

```text
输入：Which database is used in the Zeleneon service?
输出：which, database, is, used, in, the, zeleneon, service

输入：故障复盘
单字：故, 障, 复, 盘
bigram：故障, 障复, 复盘
```

注意：

- `I'm` 会被拆成 `i`、`m`；
- `Who's` 会拆出 `s`；
- 标点、空格、 apostrophe 不会保留。

这是一种轻量分词，不是精确 NLP 分词。它的优点是简单、无依赖；缺点是可能产生噪声词。

### 2.2 切块：把输入 text 变成 chunks

```python
def _chunk(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap # 注意有 overlap
    return chunks
```

一般分块会设置 overlap，目的是降低关键句刚好被切断在两个 chunk 边界上的风险。

举个例子：

```text
text:   [0 ................ 800 ................ 1600]
chunk1: [0 ............ 800]
chunk2:            [700 ............ 1500]
chunk3:                       [1400 ............ 1600]
```

### 2.3 离线索引：把 chunks 保存下来

```python
def _prepare(texts, index_dir):
    all_chunks = []
    for doc_id, text in enumerate(texts):
        for i, piece in enumerate(_chunk(text, size=800, overlap=100)):
            all_chunks.append({
                "id": f"doc{doc_id}:{i}",
                "text": piece,
            })

    save_jsonl(index_dir / "chunks.jsonl", all_chunks)
    save_json(index_dir / "index_meta.json", {
        "retriever": "bm25-okapi",
        "k1": 1.5,
        "b": 0.75,
        "total_chunks": len(all_chunks),
    })
```

这里的 `texts` 就是一组文档正文，例如：

```python
texts = [
    "第一篇文档的正文...",
    "第二篇文档的正文...",
    "第三篇文档的正文...",
]
```

注意，

- `prepare` 只生成 chunk store，不生成 Embedding；
- BM25 的词频、IDF、平均长度不是在这里持久化，而是在加载时计算。

### 2.4 加载统计：从 chunks 算出 TF、DF、IDF

```python
def load(chunks):
    # 每个 chunk 的词频 tf，即公式里的 f(t,D)；每个 chunk 的长度 dl；词项文档频率 df
    tf_list, dl, df = [], [], Counter()

    for c in chunks:
        toks = _tokenize(c["text"]) # 分词
        tf = Counter(toks) # 统计词频，即这个词在该 text 出现了几次
        tf_list.append(tf)
        dl.append(len(toks)) # 统计长度
        for t in tf: # 文档频率
            df[t] += 1

    N = len(chunks) # chunk 总数
    avgdl = sum(dl) / N if N else 0.0 # 平均长度
    idf = {
        t: math.log((N - d + 0.5) / (d + 0.5) + 1.0)
        for t, d in df.items()
    }
    return tf_list, dl, avgdl, idf
```

举个例子，假设有 3 个 chunk，分别来自事故描述、事故报告和知识库说明：

```python
chunks = [
    {
        "text": "PEXI service returned 404 after gateway upgrade. Team rolled back config. PEXI recovered. PEXI stable."
    },  # chunk 0：事故描述
    {
        "text": "Incident report: PEXI gateway timeout caused by bad config. Responders restored service."
    },  # chunk 1：事故报告
    {
        "text": "The metadata service uses PostgreSQL. Database backups run nightly."
    },  # chunk 2：知识库说明
]
```

处理第一个 chunk：

```python
c = chunks[0]
```

1. `toks = tokenize(c["text"])`

输出是一个词项列表：

```python
[
    "pexi", "service", "returned", "404", "after", "gateway", "upgrade",
    "team", "rolled", "back", "config", "pexi", "recovered", "pexi", "stable"
]
```

2. `tf = Counter(toks)`

输出是当前 chunk 的词频表：

```python
Counter({
    "pexi": 3, "service": 1, "returned": 1, "404": 1, "after": 1, "gateway": 1, "upgrade": 1, "team": 1, "rolled": 1, "back": 1, "config": 1, "recovered": 1, "stable": 1,
})
```

3. `tf_list.append(tf)`

`tf_list` 保存每个 chunk 的词频表。此时：

```python
tf_list = [
    Counter({
        "pexi": 3, "service": 1, "returned": 1, "404": 1, "after": 1, "gateway": 1, "upgrade": 1, "team": 1, "rolled": 1, "back": 1, "config": 1, "recovered": 1, "stable": 1,
    })
]
```

4. `dl.append(len(toks))`

`dl` 保存每个 chunk 的 token 数。第一个 chunk 有 15 个 token：

```python
dl = [15]
```

5. `for t in tf: df[t] += 1`

这里遍历的是当前 chunk 中出现过的 **不同词**。每个词只加 1，不管它在当前 chunk 里出现几次。例如 `pexi` 出现 3 次，但 `df["pexi"]` 只加 1。

处理完全部 3 个 chunk 后：

```python
dl = [15, 12, 9]

df = Counter({
    "pexi": 2,
    "service": 3,
    "gateway": 2,
    "config": 2,
    "returned": 1, "404": 1, "after": 1, "upgrade": 1,
    "team": 1, "rolled": 1, "back": 1, "recovered": 1, "stable": 1,
    "incident": 1, "report": 1, "timeout": 1, "caused": 1,
    "by": 1, "bad": 1, "responders": 1, "restored": 1,
    "the": 1, "metadata": 1, "uses": 1, "postgresql": 1,
    "database": 1, "backups": 1, "run": 1, "nightly": 1,
})
```

这里已经能看出不同词的常见程度：

- `service` 出现在 3 个 chunk 里，比较常见；
- `pexi`、`gateway`、`config` 出现在 2 个 chunk 里；
- `incident`、`database`、`postgresql` 等只出现在 1 个 chunk 里，更稀有。

继续计算平均长度：

```python
N = len(chunks)              # 3
avgdl = sum(dl) / N          # (15 + 12 + 9) / 3 = 12
```

再计算 IDF：

| $df(t)$ | 计算 $\ln\left(\frac{N-df(t)+0.5}{df(t)+0.5}+1 \right)$ | 近似 IDF |
|---:|---|---:|
| 1 | $\ln\left(\frac{3-1+0.5}{1+0.5}+1\right)=\ln\left(\frac{2.5}{1.5}+1\right)=\ln(2.667)$ | 0.981 |
| 2 | $\ln\left(\frac{3-2+0.5}{2+0.5}+1\right)=\ln\left(\frac{1.5}{2.5}+1\right)=\ln(1.6)$ | 0.470 |
| 3 | $\ln\left(\frac{3-3+0.5}{3+0.5}+1\right)=\ln\left(\frac{0.5}{3.5}+1\right)=\ln(1.143)$ | 0.134 |

因此部分词的 IDF 是：

```python
idf = {
    "pexi": 0.470,
    "gateway": 0.470,
    "config": 0.470,
    "service": 0.134,
    "incident": 0.981,
    "database": 0.981,
    "postgresql": 0.981,
}
```

可以看到：词越常见，IDF 越低。

### 2.5 在线检索：给每个 chunk 打分并取 Top-K

```python
def retrieve(question, chunks, k1=1.5, b=0.75, top_k=10):
    tf_list, dl, avgdl, idf = load(chunks) # 加载统计

    q = [t for t in tokenize(question) if t in idf] # 对查询进行分词，并且过滤不在 chunk 中的词
    if not q:
        return []

    avgdl = avgdl or 1.0
    scores = []
    for i, tf in enumerate(tf_list):
        C = k1 * (1 - b + b * dl[i] / avgdl) # 计算长度归一化项
        s = 0.0
        for t in q: # 累加每个查询词的贡献
            f = tf.get(t, 0)
            if f:
                s += idf[t] * (f * (k1 + 1)) / (f + C)
        if s > 0:
            scores.append((s, i)) # 只保留正分候选

    scores.sort(reverse=True)
    return [dict(chunks[i], _score=s) for s, i in scores[:top_k]] # 排序并截断 Top-K
```

沿用上面 3 个 chunk。假设真实查询是：

```python
question = "What caused the PEXI gateway incident?"
```

分词并过滤掉索引中不存在的词后：

```python
q = ["caused", "the", "pexi", "gateway", "incident"]
```

其中 `what` 没有出现在任何 chunk 中，所以被过滤掉。

对 chunk 0 来说，命中的查询词是 `pexi` 和 `gateway`；`caused`、`the`、`incident` 没有出现在 chunk 0 中，贡献为 0。下面先单独看 `pexi`：它在 chunk 0 中出现 3 次，即 `f = 3`；上面算出 `idf["pexi"] ≈ 0.470`。chunk 0 的长度是 `dl[0] = 15`，平均长度是 `avgdl = 12`。当 `k1 = 1.5`、`b = 0.75` 时：

对应代码是 `C = k1 * (1 - b + b * dl[0] / avgdl)`，代入数值：

$$
C 
= 
k_1\left(1-b+b\frac{|D|}{\operatorname{avgdl}}\right)
=
1.5\left(1-0.75+0.75\frac{15}{12}\right)
=
1.5(0.25+0.9375)
=
1.78125
$$

所以 `pexi` 这个词的贡献为：

$$
\text{score}_{t}
=
\operatorname{IDF}(t)
\cdot
\frac{f(t,D)(k_1+1)}{f(t,D)+C}
=
0.470 \cdot \frac{3 \times 2.5}{3 + 1.78125}
\approx
0.737
$$

如果固定 `C = 1.78125`，只看词频变化：

| `f` | 贡献近似值 |
|---:|---|
| 1 | `0.470 * 2.5 / (1 + 1.78125) ≈ 0.422` |
| 3 | `0.470 * 7.5 / (3 + 1.78125) ≈ 0.737` |
| 10 | `0.470 * 25 / (10 + 1.78125) ≈ 0.997` |

可以看到：词频从 1 到 3 提升明显，从 3 到 10 仍然提升，但边际收益变小。再看同一个查询里的 `gateway`：它在 chunk 0 中出现 1 次，`idf["gateway"]` 也约为 0.470，因此贡献约为 0.422。于是 chunk 0 对这个查询的总分约为：

```python
score_chunk0 = score_pexi + score_gateway
# = 0.737 + 0.422
# = 1.159
```

对于 chunk 1，它命中 `caused`、`pexi`、`gateway`、`incident`，且这些词都出现 1 次：

```python
score_chunk1 = 0.981 + 0.470 + 0.470 + 0.981
# caused   pexi    gateway  incident
# = 2.902
```

对于 chunk 2，它只命中 `the`，且出现 1 次：

```python
score_chunk2 = idf["the"] * (1 * (k1 + 1)) / (1 + C)
# = 0.981 * 2.5 / (1 + 1.21875)
# ≈ 1.105
```

三个 chunk 的总分汇总：

| chunk | 命中的查询词 | 总分 |
|---:|---|---:|
| 0 | `pexi`, `gateway` | 1.159 |
| 1 | `caused`, `pexi`, `gateway`, `incident` | 2.902 |
| 2 | `the` | 1.105 |

排序并取 Top-1：

```python
scores = [(1.159, 0), (2.902, 1), (1.105, 2)]
scores.sort(reverse=True)
top1 = scores[0]
# top1 = (2.902, 1)
```

所以这个查询的 Top-1 是 **chunk 1：事故报告**。

## 3. 优缺点与适用场景

优点：

- 不需要 Embedding API，构建成本低；
- 分数可解释；
- 对专名、别名、模块名、错误码、工单号等精确锚点有效；
- 是稀疏检索的强基线。

缺点：

- 词汇不匹配时容易漏召回；
- 不理解同义表达和隐含关系；
- 当前实现全扫描，不是大规模倒排索引；
- 分数不是概率，不同查询之间不宜直接比较。

适用场景：

- 企业知识库中的实体名、术语、编号检索；
- 作为 Dense Retrieval 的互补召回路；
- 作为 Hybrid Retrieval 的稀疏基线。
