---
layout: page
title: RL Overview
description: Taxonomy and a high-level overview
img: assets/img/blogs/rl_taxonomy.png
importance: 1
category: blog
---

## Conceptual Table

| Concept                          | Axis                  | Main Question                                      |
| -------------------------------- | --------------------- | -------------------------------------------------- |
| **Offline vs. Online (RL)**      | Planning (MDP) vs. Learning (RL) | Do we already know the environment?                |
| **Model-based vs. Model-free**   | Environment model     | Do we know/approximate $\hat{T}, \hat{R}$ or learn directly from interactions?            |
| **Value-based vs. Policy-based** | Representation        | Do we learn a value function or a policy directly? |
| **Passive vs. Active**           | Exploration           | Are we evaluating or improving a policy?           |

## Taxonomy

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/rl_taxonomy.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

## Extended Summary

The general big picture interms of solving **MDPs** (with or without RL) can be categorised as following:

1. **Offline planning** assumes knowledge over the environment; $T$, $R$. We can compute $\pi^*$ without interacting with real-world. Methods include: **Value Iteration** and **Policy Iteration**.
2. **Online planning** assumes no knowledge over the model or environment (we must learn through interaction). We use RL techniques: **Q-Learning**, **Monte Carlo**, **Policy Gradients**, etc.

Within **RL** (aka online planning) there are 2 overlapping but distinct ways people categorise techniques:

1. By access to the model of the environment: **Model-Based Learning** (approximate $\hat{T}$ and $\hat{R}$), **Model-Free Learning** (**Direct Evaluation**, **TD Learning**, **Q-Learning**, **Policy-Gradient**, etc.)
2. By what is learned directly: **Value-Based**, **Policy-Based** and **Hybrid** (Actor-Critic).

Within **Model-Free Learning** we can categorise algorithms in 2 distinct ways based on the learning approach:

1. **Passive RL** determines *How good is the given policy is*. The agent follows a fixed $\pi$ and learns $V^\pi(s)$ or $Q^\pi(s, a)$ (**Direct Evaluation**, **TD Learning**).
2. **Active RL** determines *What is the best policy*. The agent both learns $\pi$ (**Q-Learning**).

Another, separate taxonomy is in terms of *what is learned*, what you represent or optimise directly.

1. **Value-Based** techniques learn the value of states and actions $Q^*(s, a)$ (or an estimate $Q^\pi(s, a)$). That is, they learn the **value functions** $V(s)$ or **Q functions** $Q(s, a)$. Subsequently we use **policy extraction** $\forall{s} \in S, \pi^*(s)$ to get a policy for deciding actions. Algorithms include **Q-learning**, **SARSA**, **Deep-Q Networks** (DQN).
2. **Policy-based** techniques learn a policy directly, completely bypassing learning value of states or actions (e.g., **Policy Iteration**, **Policy-Gradient** methods). This is very useful when the state space or the action space are massive (or infinite).
3. **Hybrid** (Actor-Critic) that learn both a policy (actor) and a value function (critic). The critic stabilizes policy learning. Examples include **A2C**, **A3C**, **DDPG**.
