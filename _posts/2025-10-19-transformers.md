---
layout: post
title: Transformers
description: Original design, BERT, Decoder-only
thumbnail: assets/img/blogs/transformer.png
date: 2025-10-19 17:00:00
tags: theory
categories: sample-posts
---

- [Original Transformer](#original-transformer)
  - [Embedding and Positional Encoding](#embedding-and-positional-encoding)
  - [Attention Mechanism](#attention-mechanism)
  - [Multi-Head Attention Layer](#multi-head-attention-layer)
  - [Feed-Forward Layer](#feed-forward-layer)
- [BERT](#bert-bidirectional-encoder-representations-from-transformers)
- [Decoder Only](#decoder-only-transformers)


## Original Transformer

Before entering the core architecture we prepare and process the input. That is, we **embed** the input and apply **positional encoding** (so that the model can understand sequence order). The original Transformer design ([Vaswani et al., 2017](https://arxiv.org/pdf/1706.03762)) consists of an **encoder** $E$ (reads and encodes the input sequence into a set of contextual embeddings) and a **decoder** $D$ (generates an output sequence attending both to its own previous outputs and to the encoder's representations). Both encoder and decoder blocks contain repeated sublayers of **multi-headed attention** and **feed-forward** (MLP). Finally, both sublayer components are followed by residual and layer normalisation steps to ensure stabiliy and gradient flow.

$$
N\times
\begin{cases}
E' = LayerNorm(E + MHA(E)) \\
E'' = LayerNorm(E' + FFN(E)) \\
H = Encoder(X)
\end{cases}
$$

$$
N\times
\begin{cases}
D' = LayerNorm(D + MHA_{masked}(D)) \\
D'' = LayerNorm(D' + MHA_{cross}(D', H)) \\
D''' = LayerNorm(D'' + FFN(D'')) \\
\end{cases}
$$

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/transformer.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The cross-attention sublayer $MHA_{cross}$ is where the decoder queries encoder's hidden state $H$, to incorporate relevant context into predictions. After the final decoder layer, the model produces **logits** $Z$ for the next token prediction. Subsequently, we apply a liner transformation ($W^T_E$ often tied to the input embedding matrix). Finally, $softmax$ converts logits to a probability distribution over the vocabulary. The decoder then samples or greedily selects the next token based on these probabilities. An important note is that the final computation you perform to predict the next token (output of the decoder) is entirely the function of the **last vector** in the sequence.

$$
logits = ZW^T_E + b \\
P(t_{t+1} \mid t_{\leq i}) = softmax(logits)
$$

In the original Transformer architecture there are 6 encoders and 6 decoders. The individual encoder and decoder layers are stacked one after another. They process the information sequentially. The final encoded layer returns the encoded representation $H$. Every decoder layer gets the same $H$ output, to enable the encoder-decoder attention.

$$
\cdots \rightarrow E_1 \rightarrow E_2 \cdots E_n \rightarrow H
$$

$$
E_n \rightarrow D_1(H) \rightarrow D_2(H) \cdots D_n(H) \rightarrow \cdots
$$


## Embedding and Positional Encoding

Earlier sequence models like RNNs and LSTMs inherently modelled through recurrence ($ h_t = f(x_t, h_{t-1})$), so each hidden state depends on all previous tokens. Transformers by contrast remove recurrence entirely, processing all tokens in parallel which is why explicit positional encodings are essential. Before any attention or FFN layers operate, the Transformer first converts discrete tokens (words, subwords, etc.) into continuous vector representations and adds positional information so the model can understand sequence order. Each token in the input sequence is mapped to a learned embedding vector via a learned embedding matrix.

$$
E = [\vec{e}_1, \vec{e}_2, \dots, \vec{e}_n]^T, \ \vec{e}_i \in \mathbb{R}^{d_{model}}
$$

$$
\vec{e}_i = W_E \ one\_hot(t_i)
$$

Here $t_i$ is the $i^{th}$ token index, and $W_E \in \mathbb{R}^{\mid V \mid \times d_{model}}$ is the token embedding table. These embeddings capture semantic meaning but contain no information about order. To inject sequence order, Transformers add a **positional encoding** vector to each token embedding. Here $\vec{p}_i \in \mathbb{R}^{d_{model}}$ encodes the position $i$ in the sequence.

$$
\vec{x}_i = \vec{e}_i + \vec{p}_i \\
X = E + P
$$

There are many choices of positional encoding, learned and fixed. The original transformer architecture uses **Sinusoidal Positional Encoding** to handle this. This method is based on the idea that the position of a token can be represent by a series of sine (even positions) and cosine (odd positions) functions with different frequencies. This method has no additional parameters and generalises well to unseen sequence lengths. Here $pos$ is the position index and $i$ is the dimension index (i-th slot of the positional encoding vector).

$$
PE_{(pos, 2i)} = sin(\frac{pos}{10000^{\frac{2i}{d_{model}}}})
$$

$$
PE_{(pos, 2i + 1)} = cos(\frac{pos}{10000^{\frac{2i}{d_{model}}}})
$$

The paper also notes that **Learned Positional Embedding** (used in GPT-family models) produce nearly identical results. This approach allows the model to learn positional patterns directly from data. Here $\vec{p}_i$ is a learned vector stored in a positional embedding matrix $W_P \in \mathbb{R}^{n_{max} \times d_{model}}$. This approach allows the model to learn positional patterns directly from data, often yielding better empirical performance for fixed context sizes.

$$
\vec{p}_i = W_P[i]
$$


## Attention Mechanism

The core component of the Transformer architecture is the **attention layer** that learns how to redistribute information between token embeddings. The attention learns how to contextually align each embedding based on relationships captured in the key-query space. Suppose we have an input sequence of $n$ tokens, represented by embedding vectors, assembled into a matrix (where $d_{model}$ is the embedding dimension). Each attention head projects these embeddings into three distinct spaces using the learned weight matrices.

$$
E = [\vec{e}_1, \vec{e}_2, ..., \vec{e}_n]^T \in \mathbb{R}^{n\times d_{model}}
$$

$$
Q = E W_Q, \ K = E W_K, \ V = E W_V
$$

Here, $W_Q, W_K, W_V \in \mathbb{R}^{n \times d_k}$ are the **query**, **key**, and **value** matrices. Intuitively, each query vector $\vec{q}_i$ asks "Which other tokens are relevant to me?", each key vector $\vec{k}_j$ represents the "content" of a token, each value vector $\vec{v}_j$ holds the information that will be aggregated. Following this, for every pair of tokens $(i, j)$, the similarity (or attention score) between query $i$ and key $j$ is computed via the scaled dot product, producing the score matrix $S$. Here the scaling $\sqrt{d_k}$ prevents the dot products from growing too large, stabilising the gradients. Where $d_k$ is the dimensionality per head (often $d_k = d_{model} / h$ for $h$ heads).

$$
S = \frac{Q K^T}{\sqrt{d_k}} \in \mathbb{R}^{n \times n}
$$

We then apply a softmax normalisation row-wise (so that in each row $i$ the weights sum to 1) to obtain the attention weights $A$ (which represents how much each token $i$ attends to each other token $j$). Finally, the attention output is obtained through a weighted sum over the value vectors $V$. The attention head output $Z \in \mathbb{R}^{n \times d_k}$ is then linearly projected and added back to the input embeddings (residual connection). Here $W^O \in \mathbb{R}^{d_k \times d_{model}}$ is a learned projection matrix. This yields a new set of contextually enriched embeddings (one iteration of the attention block) $E'$ that better capture dependencies between tokens, that can be then be passed on to the subsequent FFN layer.

$$
Attention(Q, K, V) = Z = softmax \bigg(\frac{Q K^T}{\sqrt{d_k}} \bigg) V
$$
$$
E' = E + Z W^O
$$

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/transformer_attention.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

It is important to note, if are working with causal (autoregressive) or decoder-side attention, we must prevent tokens from seeing future tokens. To enforce this, we apply **masking** $M \in \mathbb{R}^{n \times n}$. Only then do we normalise and calculate the attention weights.

$$
M_{ij} = 
\begin{cases}
0, & \text{if } j \leq i \\
-\infty, & \text{if } j > i
\end{cases}
$$

$$
A = softmax(S') = softmax \bigg( \frac{Q K^T}{\sqrt{d_k}} + M \bigg)
$$

## Multi-Head Attention Layer

A full **attention block** inside a Transformer contains multiple attention heads that run in parallel. Each head performs its scaled dot-product attention with independently learned projection matrices. These represent the independent "views" of attention, each capturing relationships in a different subspace of the embedding dimension. The outputs from all heads are concatenated and projected back (through $W^O \in \mathbb{R}^{(h \cdot d_k) \times d_{model}}$) to the model's embedding dimension. This combined result $Z$ represents the integrated contextual update from all attention heads. Finally, a residual connection adds this update back to the original embeddings $E'$.

$$
Z^{(i)} = softmax \bigg( \frac{Q^{(i)} K^{(i)T}}{\sqrt{d_k}} + M \bigg) V^{(i)}
$$

$$
Z = Concat(Z^{(1)}, Z^{(2)}, \dots, Z^{(h)}) W^O
$$

$$
E' = E + Z
$$


## Feed-Forward Layer

After each multi-headed attention block, Transformers apply a position-wise feed-forward network (**FFN**), also called the **MLP block**. While attention layers provide context mixing (context retrieval and integration mechanisms), FFN layers provide capacity expansion (acting as knowledge storage units). Each token's embedding is processed independently and identically by the same feed-forward network (no interaction between tokens at this stage). For each token representation $\vec{e}_i \in \mathbb{R}^{d_{model}}$, the feed-forward block applies 2 linear transformations with a non-linearity (commonly ReLU or GeLU) in between. Where $W_{\uarr} \in \mathbb{R}^{d_{model} \times d_{ff}}$ is the up-projection that expands dimensionality, $W_{\darr} \in \mathbb{R}^{d_{ff} \times d_{model}}$ is the down-projection that reduces dimensionality back. Note that $d_{ff}$ is usually 4 times larger than $d_{model}$. The updated token embedding is then computed via a residual connection. FFN is highly parallelisable as this operation is applied to all tokens independently. This isone of the key reasons Transformers scale efficiently to large models.

$$
FNN(\vec{e}_i) = ReLU(W_{\uarr}\vec{e}_i + \vec{b}_{\uarr})W_{\darr} + \vec{b}_{\darr} \\

\vec{e}_i = \vec{e}_i + FFN(\vec{e}_i)
$$


## BERT

Bidirectional Encoder Representations from Transformers

## Decoder-Only Transformers


### Side Note: Cross-Attention

In **cross-attention**, the model processes two distinct sequences. For example, text and image embeddings, or encoder-decoder pairs in translation models. Here the queries come from one sequence, while the keys and values come from another. Because this setup does not rely on the sequence order in the same way, no causal mask is used.

$$
CrossAtn(Q = E_{decoder}W_Q,\ K = E_{encoder}W_K,\ V = E_{encoder}W_V)
$$

### Side Note: Efficient Factorisation

In some efficient Transformer variants, the value projection matrix $W_V$ maybe factorised into two smaller matrices to reduce parameter count and improve computational efficiency. This low-rank decomposition allows approximation of the same mapping with fewer parameters.

$$
W_V \approx W^{\uarr}_V W^{\darr}_V
$$
$$
W^{\uarr}_V \in R^{d_{model} \times r}, \ W^{\darr}_V \in R^{r \times d_k}, \ r \ll d_model
$$

### Side Note: Computational Complexity

The attention matrix (attention pattern) $A$ for each head is of size $n \times n$, where $n$ is the context length (number of tokens). Both memory and compute scale quadratically $O(hn^2)$, a major bottleneck for large-context transformers. Several modern variants introduce sparsity or structured approximations to address this issue:

- **Sparse Attention** attends only to selected key positions.
- **Blockwise / Local Attention** attends within a fixed-size local windows.
- **Linformer** uses low-rank projections to reduce attention dimensionality.
- **Longformer** combines local and global attention patterns.


## References

- ([Viswani et al., 2017](https://arxiv.org/pdf/1706.03762))
- ([Devlin et al., 2019](https://arxiv.org/pdf/1810.04805))
- ([Radford et al., 2018](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf))