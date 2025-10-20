---
layout: post
title: Transformer Architecture
description: Original design, BERT, GPT-1
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
- [BERT](#bert)
- [Decoder Only](#decoder-only-transformers)
- [Additional Notes](#additional-notes)


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
logits = ZW^T_E + b
$$

$$
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

After each multi-headed attention block, Transformers apply a position-wise feed-forward network (**FFN**), also called the **MLP block**. While attention layers provide context mixing (context retrieval and integration mechanisms), FFN layers provide capacity expansion (acting as knowledge storage units). Each token's embedding is processed independently and identically by the same feed-forward network (no interaction between tokens at this stage). For each token representation, the feed-forward block applies 2 linear transformations with a non-linearity (commonly ReLU or GeLU) in between. Where the up-projection expands dimensionality, and the down-projection reduces dimensionality back. Note that $d_{ff}$ is usually 4 times larger than $d_{model}$. The updated token embedding is then computed via a residual connection. FFN is highly parallelisable as this operation is applied to all tokens independently. This isone of the key reasons Transformers scale efficiently to large models.

$$
FNN(\vec{e}_i) = ReLU(W_{\uarr}\vec{e}_i + \vec{b}_{\uarr})W_{\darr} + \vec{b}_{\darr}
$$

$$
\vec{e}_i = \vec{e}_i + FFN(\vec{e}_i)
$$

$$
\vec{e}_i \in \mathbb{R}^{d_{model}}
$$

$$
W_{\uarr} \in \mathbb{R}^{d_{model} \times d_{ff}}
$$

$$
W_{\darr} \in \mathbb{R}^{d_{ff} \times d_{model}}
$$


## BERT

BERT stands for Bidirectional Encoder Representations from Transformers. It was developed to improve contextual understanding of unlabeled text across a broad range of tasks. The developers believe unidirectional techniques (where each token can only attent to previous tokens) restrict the power of pre-trained representations (e.g., GPT). They argued such restrictions can be harmful when applying fine-tuning approaches to token-level tasks (Question Answering, Named Entity Recognition) where it is crucial to incorporate context from both directions.

To avoid unnecessary and costly training steps, transfer learning techniques are employed to separate the pre-training and fine-tuning phases. This features amkes LLMs like BERT the foundational models, with endless applications built on top of them. BERT achieved SoTA results in multiple NLP tasks including; QA, sentiment analysis, text generation, text summaries, and autocomplete tasks. There are a good number of BERT variants such as RoBERTa (larger training dataset with dynamic masking learning), and DistilBERT (smaller, faster, lighter variant with knowledge distillation techniques).  

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/bert.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Model Architecture

BERT's model architecture is a multi-layer bidirectional Transformer encoder based on the original implementation. The initial report consisted of 2 model sizes:

$$
BERT_{BASE}(L=12, H=768, A=12, Params=110M)
$$

$$
BERT_{LARGE}(L=24, H=1024, A=16, Params=340M)
$$

Here $L$ is number of layers, $H$ the hidden size, and $A$ number of self-attention heads. The input is able to represent a single sentence (or in general an arbitrary span of text), and a pair of sentences in one token sequence. The first token in the sequence is always a special classification token $[CLS]$. In classification tasks, the final hidden state corresponding to this token is used as the aggregate sequence representation. We differentiate the pair of sentences through a special token $[SEP]$, and a learned embeding (Added to every token) identifying them with their sentence ($A$ or $B$). The input embeddings are sum of the token embeddings, segmentation embeddings are the position embeddings. For example, $E_{input} = E_{my} + E_A + E_i$ represents an input representation for token $my$ in sentence $A$ at position $i$.

### Pre-training BERT

BERT is pre-trained using two unsupervised tasks. First, **Masked LM (MLM)** is used to mask some percentage of input tokens at random, and subsequently predict those masked tokens. The final hidden vectors corresponding to the mask tokens, are fed into an output softmax over the vocabulary (same as in a standard LM). BERT mask $15%$ of all tokens in each sequence. It only predicts masked words rather than reconstructing the entire input. Similarly, BERT also incorporates the **Next Sentence Prediction (NSP)** technique to understand the relationship between two sentences. NSP is a binarised task that can be trivially generated from any monolingual corpus (e.g., choose sentences $A, B$, that at random either actually follow each other $IsNext$ or don't $NotNext$). Pre-training towards this task is very beneficial to both QA and NLI.  BERT uses BookCorpus (800M words) and English Wikipedia (2500M words) as its pre-training corpus. Subsequently fine-tuning is straightforward as self-attention mechanism allows BERT to model many downstream tasks by swapping out the appropriate inputs and outputs. Compared to pre-training this step is also relatively inexpensive.


## Decoder-Only Transformers

The **Generative Pre-trained Transformer 1** (GPT-1) is a foundational example of autoregressive and unidirectional transformer-based architectures. Unlike the original design, these models are decoder-only. They also introduce a semi-supervised approach with unsupervised **generative pre-training** state (learning initial parameters) and a supervised **discriminative fine-tuning** stage (adapting these parameters), resulting in robust transfer performance across diverse tasks. GPT-1 architecture is a 12 layer decoder-only transformer.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/gpt-1.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Pre-training GPT-1

The general framework work consists of two stages. The first stage is learning a high-capacity language model on a large corpus of text (unsupervised pre-training). The second stage is fine-tuning to adapt the model to a discriminative task with labelled data. Given an unsupervised corpus of tokens $\mathcal{U} = \set{u_1, \dots, u_n}$, they use a standard language modeling objective to maximise the following likelihood ($k$ conext size, $\Theta$ model parameters) by training on stochastic gradient descent.

$$
L_1(\mathcal{U}) = \sum_i log P(u_i \mid u_{i-k}, \dots, u_{i-1}; \Theta)
$$

They use a multi-layer Transformer decoder for the language model, a variant of the original Transformer architecture. We prepare the input token sequence $\mathcal{U}$ through embedding $W_e$ and positional encoding $W_p$. This is followed by a decoder layer that consists of a masked multi-headed self-attention and FFN sublayers to produce output distribution over target tokens ($n$ is the number of layers).

$$
h_0 = UW_e + W_p
$$
$$
h_l = transformer\_block (h_{l-1}) \ \forall_i \in [1, n]
$$
$$
P(u) = softmax(h_n W^T_e)
$$


### Supervised Fine-tuning

This is followed by a fine-tuning stage where we adapt the parameters to the supervised target task. We assume a labeled dataset $C$, where each instance consists of a sequence of input tokens $x^1, \dots, x^m$ along with a label $y$. The inputs are passed through our pre-trained model to obtain the final block's activation $h^m_l$, which is then fed into an added linear output layer with parameters $W_y$ to predict $y$ (our target labels). Giving us an objective to maximise. Overall the only extra parameters for fine-tuning are $W_y$ and embeddings for delimiter tokens.

$$
P(y \mid x^1, \dots, x^m) = softmax(h^m_l W_y)
$$

$$
L_2(C) = \sum_{(x, y)} log P(y \mid x^1, \dots, x^m)
$$


## Additional Notes

### Cross-Attention

In **cross-attention**, the model processes two distinct sequences. For example, text and image embeddings, or encoder-decoder pairs in translation models. Here the queries come from one sequence, while the keys and values come from another. Because this setup does not rely on the sequence order in the same way, no causal mask is used.

$$
CrossAtn(Q = E_{decoder}W_Q,\ K = E_{encoder}W_K,\ V = E_{encoder}W_V)
$$

### Efficient Factorisation

In some efficient Transformer variants, the value projection matrix $W_V$ maybe factorised into two smaller matrices to reduce parameter count and improve computational efficiency. This low-rank decomposition allows approximation of the same mapping with fewer parameters.

$$
W_V \approx W^{\uarr}_V W^{\darr}_V
$$

$$
W^{\uarr}_V \in R^{d_{model} \times r}, \ W^{\darr}_V \in R^{r \times d_k}, \ r \ll d_{model}
$$

### Computational Complexity

The attention matrix (attention pattern) $A$ for each head is of size $n \times n$, where $n$ is the context length (number of tokens). Both memory and compute scale quadratically $O(hn^2)$, a major bottleneck for large-context transformers. Several modern variants introduce sparsity or structured approximations to address this issue:

- **Sparse Attention** attends only to selected key positions.
- **Blockwise / Local Attention** attends within a fixed-size local windows.
- **Linformer** uses low-rank projections to reduce attention dimensionality.
- **Longformer** combines local and global attention patterns.


## References

- ([Viswani et al., 2017](https://arxiv.org/pdf/1706.03762))
- ([Radford et al., 2018](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf))
- ([Devlin et al., 2019](https://arxiv.org/pdf/1810.04805))