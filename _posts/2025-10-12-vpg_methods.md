---
layout: post
title: Vanilla Policy Gradient Methods
description: Theoretical foundations and REINFORCE
thumbnail: assets/img/blogs/reinforce_alg.png
date: 2025-10-12 16:00:00
tags: rl vpg reinforce
categories: sample-posts
---

- [Introduction](#introduction)
- [Policy Gradients](#policy-gradients)
- [Policy Improvement with Gradient Ascent](#policy-improvement-with-gradient-ascent)
- [Policy Gradient Theorem](#policy-gradient-theorem)
- [Softmax Policy](#a-standard-gradient-policy-softmax-policy)
- [REINFORCE](#reinforce)


## Introduction 

**Policy-based** methods learn a $\pi$ directly rather than the value of states and actions, that is $V(s)$ and $Q(s, a)$. Learning $\pi$ directly has advantages for applications with increasingly large state or action space. Notice that if the action space is infinite, we cannot perform a policy extraction, as this requires iteration over all $a \in A$, and extracting the one that maximises the reward. Learning a policy directly mitiages this. Two common policy-based methods are **policy iteration** and **policy gradients**. 

Policy iteration is not a policy-based method in the modern sense. Recall that it is a dynamic programming algorithm for solving MDPs when the model is known (model-based). It alternatives between the steps of policy evaluation and policy improvement until convergence ($\pi_{i+1} = \pi_i$).

$$
\pi: V^\pi(s) = \sum_{s'} T(s, \pi(s), s') \big[R(s, \pi(s), s') + \gamma V^\pi(s')\big]
$$

$$
\pi_{i+1}(s) = \underset{a}{\arg\max}\ \sum_{s'} T(s, a, s') \big[R(s, a, s') + \gamma V^{\pi_i}(s')\big]
$$


## Policy Gradients

**Policy gradients** is a model-free technique that performs gradient ascent, akin to the well-known gradient descent technique, though here we maximise the reward instead of minimising the error. In policy gradients, instead of updating $Q(s, a)$ (like in Q-learning and SARSA), we update the parameters $\theta$ of a $\pi$ directly using gradient descent. Similarly, we approximate the $\pi$ from $R$ and $A$ received in our episodes. Our $\pi$ should follow two key properties:

1. $\pi$ is represented using some differentiable function (with respect to its parameters).
2. We want $\pi$ to be stochastic (gives probabilities for all possible actions).

$$
\pi_{\theta}(s, a) = P (A_t = a \mid S_t = s; \theta)
$$

$$
\pi_{\theta}(s) = \big [P(a_1 \mid s), P(a_2 \mid s), \dots, P(a_n \mid s) \big]
$$

The goal of a policy gradient is to approximate the optimal policy $\pi_{\theta}(s, a)$ via gradient ascent on the expected return. Gradient ascent will find the best parameters $\theta$ for a particular MDP.


### Policy Improvement with Gradient Ascent

We calculate the gradient from some data and update the weights of the policy. The expected value (expected cumulative return $\mathbb{E}$) of a policy $\pi_{\theta}$ with parameters $\theta$ is defined as (with an initial state $s_0$):

$$
J(\theta) = V^{\pi_{\theta}}(s_0)
$$

This formula would be expensive to compute (execute every possible episode $s_0 \to s_{terminal}$). We use policy gradient algorithms to provide an approximation. We search for a local maximum in $J(\theta)$ by ascending the gradient of the policy with respect to the parameters $\theta$, using episodic samples. Given a policy objective $J(\theta)$ the policy gradient of $J$ with respect to $\theta$ written $\nabla_{\theta}J(\theta)$ is defined as:

$$
\nabla_{\theta} J(\theta) =
\begin{pmatrix}
\frac{\partial J(\theta)}{\partial \theta_1} \\
\vdots \\
\frac{\partial J(\theta)}{\partial \theta_n}
\end{pmatrix}
$$

Where $\frac{\partial J(\theta)}{\partial \theta_i}$ is the partial derivative of $J$ with respect to $\theta_i$. Subsequently, we use the gradient and update the weights (with a learning rate parameter $\alpha$ that dictates the step size in the direction of the gradient).

$$
\theta \leftarrow \theta + \alpha \nabla J(\theta)
$$

### Policy Gradient Theorem

So the question is: what is "$\nabla J(\theta) = \nabla V^{\pi_{\theta}}(s)$"? The policy gradient theorem says that for any differentiable policy $\pi_{\theta}$ state $s$ and action $a$, $\nabla J(\theta)$ is:

$$
\nabla J(\theta) = \mathbb{E}\big[\nabla ln (\pi_{\theta}(s, a)) Q(s, a)\big]
$$

The expression $ln(\pi_{\theta}(s, a))$ tells us how to change the weights $\theta$ (increase the log probability of selecting an action $a$ in state $s$). Taking the log derivative is convenient and gives a property called **log-derivative trick**, simplifying the expectations. If the quality of selecting action $a$ in $s$ is positive we would increase that probability, otherwise we decrease the probability. The log makes unlikely but good actions get strong reinforcement, and penalises likely but bad actions. Over time, the policy shifts probability mass towards rewarding actions. Hence, this is the expected return of taking action $\pi_{\theta}(s, a)$ multipled by the gradient.

To better explain the underlying math, $ln (\pi_{\theta}(s, a))$ measures how likely actions $a$ is, $\nabla_{\theta}$ asks "how does changing $\theta$ change that log-likelihood?". Together they tell as the direction in parameter space that would make this action more (or less) probable. This is the signal the policy gradient uses to nudge the network weight in the right direction.


### A Standard Gradient Policy: Softmax Policy

The softmax Policy consists of a softmax function that converts output to a distribution of probabilities (for all possible actions). Note that this is necessary to define a stochastic policy. Softmax is mostly used in the case of discrete actions, for example 3; $A = \set{a_1, a_2, a_3}$.

$$
\pi_{\theta}(s, a) = \frac{e^{\phi(s, a)^T \theta}}{\sum^3_{k=1} e^{\phi(s, a_k)^T \theta}}
$$

It follows that:

$$
\nabla_{\theta} ln(\pi_{\theta}(s, a)) = \phi(s, a) - E_{\pi_{\theta}} \big[\phi(s, .) \big]
$$

Where $\phi(s, a)$ is a feature vector, the input related to the state and action.


## REINFORCE (Monte Carlo Policy Gradient)

We cannot calculate the gradient optimally due to computational costs (solving for all possible trajectories in our model). **REINFORCE** algorithm offers a way to sample trajectories similar to the Monte-Carlo RL.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/reinforce_alg.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The algorithm iteratively generates and executes new actions $a$, by sampling from its policy. Once an episode terminates, a list of the obtained rewards and visited states is used to update the policy. Hence, the policy is only updated at the end of each episode.  REINFORCE is an on-policy learning approach (sample trajectories directly from $\pi_{\theta}$).

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/reinforce_pseudo.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

REINFORCE generates an entire episode using Monte-Carlo simulation by following the policy (so far) and sampling actions using this stochastic policy $\pi_{\theta}$. It then steps through each action in the episode, calculates $G$ (the total future discounted reward of the trajectory/episode). Finally, using this reward $G$, it calculates the policy gradient and multiplies it in the direction of $G$. Therefore, it generates better and better policies as $\pi$ is improved.

Unlike to value-based techniques, REINFORCE (and other policy-gradient approaches) do not evaluate each action in the policy improvement process. In policy iteration we update the policy:

$$
\pi(s) \leftarrow \underset{a \in A(s)}{\arg\max} \ Q^\pi(s, a)
$$

In REINFORCE, the most recently sampled action and its reward are used to calculate the gradient and update the policy. This has the advantage that policy-gradient approaches can be applied when the action space or state space are continious (e.g., there are one or more actions with a parameter that takes a continious value). This is because it uses the gradient instead of doing policy improvement explicitly. For the same reason, policy-gradient approaches are often more efficient than value-based approaches the state and action space are higher-dimensional.

Although, it important to note the policy gradient algorithms suffer from sample inefficiency (difficult to determine which state-action pairs in the entire episode are those that affect the episode reward $G$, and therefore which to sample).


## References

- ([Tim Miller, Mastering RL](https://gibberblot.github.io/rl-notes/single-agent/policy-gradients.html))
- ([OpenAI Spinning Up](https://spinningup.openai.com/en/latest/algorithms/trpo.html#background))