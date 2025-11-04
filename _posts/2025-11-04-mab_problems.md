---
layout: post
title: Multi-Armed Bandit Problems
date: 2025-11-04 11:00:00
description: Bandit Strategies, UCB1, Bayesian UCB, Thompson Sampling
thumbnail: assets/img/blogs/mab.png
tags: theory prototype
categories: sample-posts
---

- [Overview](#overview)
- [Bandit Strategies](#bandit-strategies)
- [Upper Confidence Bounds](#upper-confidence-bounds)
- [Thompson Sampling](#thompson-sampling)
- [Experimentations](#experimentations)
- [Summary](#summary)


## Notation

- $K$ - number of arms (slot machines) in the bandit problem
- $\theta_i$ - true reward probability of arm $i$
- $Q(a_t)$ - true expected reward
- $\hat{Q}_t(a)$ - estimated mean reward of action $a$ up to time $t$
- $\tilde{Q}(a)$ - sample reward estimate from a posterior distribution
- $\bar{X}_t$ - sample mean of observed rewards up to time $t$
- $\alpha_i, \beta_i$ - parameters of the Beta prior/posterior for the Bernoulli bandit of arm $i$
- $Beta(\alpha_i, \beta_i)$ - beta distribution representing posterior belief about $\theta_i$
- $a^{UCB1}_t$ - action selected by the UCB1 algorithm
- $a^{TS}_t$ - action selected by the Thompson Sampling algorithm


## Overview

The **multi-armed bandit** is a classic problem that demonstrates the exploration vs exploitation dilemma. We mostly focus on infinite number of trials (to achieve the highest long-term reward), however there also exist problems with a limited number of trials (where we need to behave smartly w.r.t. a limited set of knowledge and resources).

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/mab.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

A Bernoulli multi-armed bandit (or binary multi-armed bandit) can be described as a tuple $\left<A, R\right>$, where we have $K$ machines with reward probabilities $\set{\theta_1, \dots, \theta_K}$. Here $A$ is the set of actions (i.e., interactions with the slot machine). The value of action $a$ (expected reward) at time step $t$ on the i-th machine can be denoted as:

$$
Q(a_t) = \mathbb{E}[r_t \mid a_t] = \theta_i
$$

Similarly, $R$ is a reward function. In the case of Bernoulli bandit we observe a reward $r$ in a stochastic fashion. At time step $t$, we may have a reward ($r_t = R(a_t)$) 1 with probability $Q(a_t)$ or 0 otherwise. Note that, this is a simplified version of MDP with no state $S$. The goal is to maximise the cumulative reward $\sum^T_{t=1} r_t$. If we know the optimal action with the best reward, then the goal is to minimise the potential regret or loss of not picking the optimal action. The optimal reward probability $\theta^*$ of the optimal action $a^*$ can be defined as:

$$
\theta^* = Q(a^*) = \max_{a \in A} Q(a) = \max_{1 \leq i \leq K} \theta_i
$$

Our loss function is the total regret we might have by not selecting the optimal action up to the time step $T$.

$$
\mathcal{L}_T = \mathbb{E} \bigg[\sum^T_{t=1} (\theta^* - Q(a_t)) \bigg]
$$

## Bandit Strategies

There are several ways to solve the multi-armed bandit problem based on the exploration method: no exploration (naive), exploration at random, exploration with preference to uncertainty (e.g., similar to MCTS selective search).

The **$\epsilon$-Greedy Algorithm** takes the best action most of the time, but does random exploration occasionally (exploration at random). The action value is estimated according to the past experience (averaging the rewards associated with the target action $a$ that we have observed up to current time step $t$).

$$
\hat{Q_t}(a) = \frac{1}{N_t(a)} \sum^t_{\tau=1} r_{\tau} \textbf{1} [a_{\tau} = a]
$$

$$
N_t(a) = \sum^t_{\tau=1} \textbf{1}[a_\tau = a]
$$

Where $\textbf{1}$ is a binary indicator function and $N_t(a)$ is how many times the action $a$ has been selected so far. According to the $\epsilon$-greedy algorithm, with a small probability $\epsilon$ we take a random action, but otherwise we pick the best action that we have learnt so far $\hat{a}^*_t$.

## Upper Confidence Bounds

Due to the randomness in the "exploration at random" problems (e.g., $\epsilon$-greedy algorithm), we might end up exploring a bad action which we have confirmed in the past. To avoid such inefficient exploration we can, (1) decrease $\epsilon$ in time, and (2) be optimistic about options with high uncertainty and thus prefer actions for which we have not had a confident value estimation yet (by default promote exploration). By doing so, we would favor exploration of actions with a strong potential to have an optimal value. The **Upper Confidence Bound** (UCB) algorithm measures this potential by an estimated upper confidence bound $\hat{U}_t(a)$ of the reward value, so that: $Q(a) \leq \hat{Q}_t(a) + \hat{U}_t(a)$. The upper bound $\hat{U}_t(a)$ is a function of $N_t(a)$; a large number of trials should give us a smaller bound. In the **UCB algorithm** we always select the greediest action to maximise the upper confidence bound.

$$
a^{UCB}_t = \arg \max_{a \in A} \hat{Q}_t(a) + \hat{U}_t(a)
$$

If we do not want to assign any prior knowledge on how the distribution looks like, we can get help from the **Hoeffding's Inequality** (a theorem applicable to any bounded distribution). Let $X_1, \dots, X_t$ be i.i.d random variables all bounded by the interval $[0, 1]$. Then for $u > 0$ we have (where $\bar{X}_t$ is sample mean):

$$
\mathbb{P} [\mathbb{E}[X] > \bar{X}_t + u] \leq e^{-2tu^2}
$$

$$
\bar{X}_t = \frac{1}{t} \sum^t_{\tau = 1} X_{\tau}
$$

Given one target action $a$ we can consider; $r_t(a)$ as the random variables, $Q(a)$ as the true mean, $\hat{Q}_t(a)$ as the sample mean, and $u$ as the upper confidence bound $u = U_t(a)$. Then we have:

$$
\mathbb{P}[Q(a) > \hat{Q}_t(a) + U_t(a)] \leq e^{-2tU_t(a)^2}
$$

We want to pick a bound so that with high chances the true mean is below the sample mean + the upper confidence bound ($Q(a) \leq \hat{Q}_t(a) + \hat{U}_t(a)$). Thus, $e^{-2tU_t(a)^2}$ should be a small probability, say a tiny treshold $p$.

$$
e^{-2tU_t(a)^2} = p
$$

$$
U_t(a) = \sqrt{\frac{-\log p}{2N_t(a)}}
$$

One heuristic is to reduce the threshold $p$ in time, as we want to make more confident bound estimation with more rewards observed. This is known as the **UCB1** algorithm, where we set $p = t^{-4}$. Also recall the UCB criterion used in MCTS UCT (Upper Confidence bounds applied to Trees) algorithm.

$$
U_t(a) = \sqrt{\frac{2 \log t}{N_t(a)}}
$$

$$
a^{UCB1}_t = \arg \max_{a \in A} \bigg[ Q(a) + \sqrt{\frac{2 \log t}{N_t(a)}} \bigg]
$$

$$
\text{MCTS}^{UCB1} = \frac{U(n)}{N(n)} + C \times \sqrt{\frac{log N(PARENT(n))}{N(n)}}
$$

In **UCB** or **UCB1** algorithm, we do not assume any prior on the reward distribution and therefore we have to rely on **Hoeffding's Inequality** for a very generalised estimation. If we know the distribution upfront, for example we expect the mean reward for every slot machine to be a Gaussian, we can set the upper bound as $95\%$ confidence interval by setting $\hat{U}_t(a)$ to be twice the standard deivation. This is known as the **Bayesian UCB**. That is, $\sigma(a_i)$ is the standard deivation, $c\sigma(a_i)$ is the UCB, and $c$ is an adjustable hyperparameter absed on our confidence interval.

## Thompson Sampling

The idea behind the **Thompson Sampling** is to select an action $a$ according to the probability that $a$ is optimal at each time step $t$. Given $\pi(a \mid h_t)$ is the probability of taking action $a$ given history $h_t$ we can formally define the thompson sampling:

$$
\pi(a \mid h_t) = \mathbb{P}[Q(a) > Q(a'), \forall a' \neq a \mid h_t] = \mathbb{E}_{R \mid h_t} [\textbf{1}(a = \arg \max_{a \in A} Q(a))]
$$

For the simple Bernoulli bandit it is natural to assume $Q(a)$ follows a Beta distribution, as $Q(a)$ is essentially the success probability $\theta$ in Bernoulli distribution. The value of $Beta(\alpha, \beta)$ is within the interval $[0, 1]$; $\alpha$ and $\beta$ correspond to the counts when we succeeded or failed to get a reward respectively. Say $\alpha = 1000, \beta = 9000$, then we strongly belive the reward probability is $10\%$. At each time $t$ we sample expected reward $\tilde{Q}(a)$ from the prior distribution $Beta(\alpha_i, \beta_i)$ for every action. The best action is selected among samples, and the Beta distribution is updated accordingly. 

$$
\alpha_i \leftarrow \alpha_i + r_t \textbf{1} [a^{TS}_t = a_i]
$$

$$
\beta_i \leftarrow \beta_i + (1- r_t) \textbf{1} [a^{TS}_t = a_i]
$$

Thompson sampling implements the idea of probability matching. The reward estimations $\tilde{Q}$ are sampled from posterior distributions, each of these probabilities are equivalent to the probability that the corresponding action is optimal (conditioned on observed history). In practical settings estimating posterior distributions with observed true rewards is computationally intractable. Hence, we use approximations of the posterior distributions through methods like Gibbs sampling, Laplace approximate, and the bootstraps.

## Experimentations

We experiment with 4 of the discussed algorithms, **$\epsilon$-Greedy**, **UCB1**, **Bayesian UCB**, and **Thompson Sampling**. We run experiments on $K=10$ slot machines, and $T=5000$ timesteps. We initalise probabilities as 1; $\alpha_0 = 1, \beta_0 = 1$.

```python
test_solvers = [
    EpsilonGreedy(b, 0), # full exploitation
    EpsilonGreedy(b, 1), # full exploration
    EpsilonGreedy(b, 0.01),
    UCB1(b),
    BayesianUCB(b, 3, 1, 1),
    ThompsonSampling(b, 1, 1)
]
```

We first run baseline experiments that are (1) exploitation only, and (2) exploration only.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/mab-problems-baseline.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

We then run experiments with smarter exploration strategies: (1) $\epsilon$-Greedy, (2) UCB1, (3) Bayesian UCB (with $\sigma=3$ as the upper bound), and (4) Thompson Sampling.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/mab-problems-exp.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

We see that naive methods (full exploitation and full exploration) naturally have much higher regret values. Other observations, are that (1) the full-exploration method is able to accurately predict esimtated reward probability (vs true reward probability, see middle plot), and (2) full-exploitation method has sticked to the machine number 8 (see right plot). Among our smarter exploration strategies, Thompson Sampling has the lowest cumulative regret and is the best performer followed by the Bayesian UCB.


## Summary

We need exploration because information is valuable. In terms of exploration strategies we can do; (1) no exploration (naive) and fcous on short-term returns, (2) explore at random ($\epsilon$-Greedy), (3) explore with preference to actions with higher uncertainty (e.g., UCB1, Thompson).


## References

- ([Weng 2018](https://lilianweng.github.io/posts/2018-01-23-multi-armed-bandit/))