---
layout: post
title: Natural Policy Gradient Methods
date: 2025-10-26 16:00:00
description: General overview of TRPO and PPO
thumbnail: assets/img/blogs/trpo.png
tags: theory
categories: sample-posts
pseudocode: true
---

- [Introduction](#introduction)
- [Trust Region Policy Optimisation](#trust-region-policy-optimisation-trpo)
- [Proximal Policy Optimisation](#proximal-policy-optimisation-ppo)


## Introduction

Policy gradient methods work by computing an estimator (a gradient estimator) of the policy gradient and plugging it into a **stochastic gradient ascent** algorithm. Consider the following gradient estimator $\hat{g}$ where $\pi_{\theta}$ is the stochastic policy and $\hat{A}_t$ is an estimator of the advantage function at timestep $t$. Similarly, consider the objective function $L^{PG}$ whose gradient is the policy gradient estimator.

$$
\hat{g} = \nabla J(\theta) = \hat{\mathbb{E}}_t \bigg[\nabla_{\theta} ln (\pi_{\theta}(a_t \mid s_t)) \hat{A}_t \bigg]
$$

$$
L^{PG}(\theta) = J(\theta) = \hat{\mathbb{E}}_t \bigg[ln (\pi_{\theta}(a_t \mid s_t)) \hat{A}_t \bigg]
$$


Here the expectation $\hat{\mathbb{E}}_t[\cdot]$ indicates the empirical average over a finite batch of samples, in an algorithm that alternates between sampling and optimisation. Performing multiple steps of optimisation on this objective function using the same trajectory is not well justified. Empirically, it often leads to desctructively large policy updates. Vanilla policy gradients have no mechanism to prevent the new policy from collapsing far away from the old one in just one update. Natural policy gradient methods fix this by constraining how far the policy is allowed to move per update. For example, via explicit KL trust region (TRPO) or implicit clipping (PPO).


## Trust Region Policy Optimisation (TRPO)

TRPO updates policies by taking the largest possible step to improve peformance, while satisfying a special constraint on how close new and old policies are allowed to be (following a "trust region"). The constraint is expressed in term os KL-Divergence (a measure of distance between probability distributions). This is different from vanilla policy gradient, which keeps new and old policies close in **parameter space** instead of the **probability distribution space**. But even seemingly small differences in parameter space can have very large differences in performance (so a single bad step can collapse the performance). Therefore, we often avoid using large step sizes in vanilla policy gradients. On the other hand, resorting to small step size is sample inefficient (safe but slow, more samples to make progress). TRPO nicely avoids this kind of collapse, and tends to quickly and monotonically improve performance. Similar to REINFORCE, TRPO is an on-policy algorithm and can be used for environments with discrete and continuous action spaces. In general, given a policy $\pi_{\theta}$, we can formulate a TRPO update based on an objective surrogate advantage $\mathcal{L}(\theta_k, \theta)$ (how a new policy performs relative to the old policy $\pi_{\theta_k}$ based on an advantage function $A^{\pi}(s, a) = Q^{\pi}(s, a) - V^{\pi}(s)$) and a KL-divergence constraint between policies $\bar{D}_{KL}(\theta \| \theta_k)$.

$$
\theta_{k+1} = \arg\max_{\theta} \mathcal{L}(\theta_k, \theta)
\quad \text{s.t.} \quad \bar{D}_{KL}(\theta \| \theta_k) \leq \delta
$$

$$
\mathcal{L}(\theta_k, \theta) = \mathbb{E}_{s, a \sim \pi_{\theta_k}}
\bigg[ \frac{\pi_{\theta}(a \mid s)}{\pi_{\theta_k}(a \mid s)}
A^{\pi_{\theta_k}}(s, a) \bigg]
$$

$$
\bar{D}_{KL}(\theta \| \theta_k) = \mathbb{E}_{\pi_{\theta_k}}
[D_{KL} (\pi_{\theta}(\cdot \mid s) \| \pi_{\theta_k}(\cdot \mid s))]
$$

The objective $\mathcal{L}$ and constraint $\bar{D}_{KL}$ are both zero when $\theta = \theta_k$. Similarly, the gradient of the constraint with respect to $\theta$ is zero when $\theta = \theta_k$. TRPO makes approximations to the theoretical update formula to get an answer quickly (taylor expanding the objective and constraint to leading order around $\theta_k$).

$$
\mathcal{L}(\theta_k, \theta) \approx g^T(\theta - \theta_k)
$$

$$
\bar{D}_{KL}(\theta \| \theta_k) \approx \frac{1}{2}(\theta - \theta_k)^T H(\theta - \theta_k)
$$

$$
\theta_{k+1} = \arg \max_{\theta} g^T(\theta - \theta_k)
\quad \text{s.t.} \quad \frac{1}{2}(\theta - \theta_k)^T H(\theta - \theta_k) \leq \delta
$$

This approximate problem can be analytically solved by methods of Lagrangian duality. TRPO adds a further modification to the solved update rule through a backtracking line search to yield the final update formula. Here $\alpha \in (0,1)$ is the backtracking coefficient, and $j$ is the smallest nonnegative integer such that $\pi_{\theta_{k+1}}$ satisfies the KL constraint and produces a positive surrogate advantage. 

$$
\theta_{k+1} = \theta_k + \alpha^j \sqrt{\frac{2\delta}{g^T H^{-1}g} H^{-1} g}
$$

$$
\theta_{k+1} = \theta_k + \alpha^j \Delta k
$$

Computing and storing the matrix inverse $H^{-1}$ can be expensive when dealing with neural network policies with millions of parameters. We need this for the natural gradient step $x^* = H^{-1}g$. Instead of explicitly inverting $H$, TRPO uses the conjugate gradient (CG) algorithm to solve $Hx = g$ for $x = H^{-1}g$. CG iteratively searches for the $x$ (choose test vectors $x_1, x_2, \dots$) such that $Hx = g$ (until convergence) and hence returns $x = H^{-1}g$. Such approximations help TRPO scale well to deep neural networks.

$$
Hx = \nabla_{\theta} \bigg((\nabla_{\theta} \bar{D}_{KL}(\theta \| \theta_k))^T x \bigg)
$$


## Proximal Policy Optimisation (PPO)

Proximal Policy Optimisation are a family of policy gradient methods that alternate between sampling data through interaction with the environment, and optimising a surrogate objective function using stochastic gradient ascent. This is unlike the standard policy gradient methods that perform one gradient update per data sample. PPO builds on TRPO by introducing an algorithm that maintains the same data efficiency and performance reliability while using only first-order optimisation (not dependent on second-order derivatives like Hessians $H$ in TRPO). It uses a novel objective with clipped probability ratios, which form a pessimistic estimate (lower bound) of the performance of the policy.

### Clipped Surrogate Objective

TRPO maximises a surrogate objective, where $CPI$ is conservative policy iteration $[KL02]$.

$$
L^{CPI} = \mathbb{E}_{t}
\bigg[ \frac{\pi_{\theta}(a \mid s)}{\pi_{\theta_{old}}(a \mid s)}
\hat{A}_t \bigg] = \hat{\mathbb{E}}_t \bigg[ r_t(\theta) \hat{A}_t \bigg]
$$

$$
r_t(\theta) = \frac{\pi_{\theta}(a \mid s)}{\pi_{\theta_{old}}(a \mid s)} \quad s.t. \quad r(\theta_{old}) = 1
$$

Without a constraint, the maximisation of $L^{CPI}$ would lead to an excessively large policy update; hence, we consider how to modify the objective to penalise changes to the policy that move $r_t(\theta)$ away from 1.

$$
L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \bigg[
\textbf{min}
    (r_t(\theta)\hat{A}_t, 
    clip(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t)
\bigg]
$$

Where epsilon is a hyperparameter (e.g., $\epsilon = 2$), the first term inside the min is $L^{CPI}$, and the second term modifies the surrogate objective by clipping the probability ratio, which removes the incentive for moving $r_t$ outside the interval $[1 - \epsilon, 1 + \epsilon]$. Finally, we take the minimum of the clipped and unclipped objective. With this scheme, we ignore the change in probability ratio when it would make the objective improve, and we include it when it makes the objective worse. Note that $L^{CLIP}(\theta) = L^{CPI}(\theta)$ to first order around $\theta_{old}$ (where $r = 1$). However, they become different as $\theta$ moves away from $\theta_{old}$. Also note that the probability ratio $r$ is clipped at $1-\epsilon$ or $1+\epsilon$ dependeing on whether the advantage $A$ is positive or negative.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/ppo_clip.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>


### PPO Algorithm

The proposed clipped surrogate loss can be computed and differentiated with a minor change to a typical policy gradient implementation. If using a neural network architecture that shares parameters between the policy and value function, we must use a loss function that combines the **policy surrogate** and a **value function** error term. This objective can be further augmented by adding an **entropy bonus** to ensure sufficient exploration. Here $c_1, c_2$ are coefficients, $S$ denotes an entropy bonus, and $L^{VF}_t$ is a squared-error loss.

$$
L^{CLIP + VF + S}_t(\theta) = \hat{\mathbb{E}}_t \bigg[L^{CLIP}_t(\theta) - c_1 L^{VF}_t(\theta) + c_2 S[\pi_{\theta}](s_t) \bigg]
$$

$$
L^{VF}_t = (V_{\theta}(s_t) - V^{targ}_t)^2
$$

Below pseudocode shows a PPO algorithm that uses fixed-length trajectory segments. Each iteration, each of $N$ (parallel) actors collect $T$ timesteps of data. Then we construct the surrogate loss on these $NT$ timesteps of data, and optimise it with minibatch SGD (or Adam) for $K$ epochs.

```pseudocode
\begin{algorithm}
\caption{PPO, Actor--Critic Style}
\begin{algorithmic}

\FOR{iteration = $$1, 2, \ldots$$}
    \FOR{actor = $$1, 2, \ldots, N$$}
        \STATE Run policy $$\pi_{\theta_{\text{old}}}$$ in environment for $$T$$ timesteps
        \STATE Compute advantage estimates $$\hat{A}_1, \ldots, \hat{A}_T$$
    \ENDFOR
    \STATE Optimise surrogate $$L w.r.t. \theta$$, with $$K$$ epochs and minibatch size $$M \le NT$$
    \STATE $$\theta_{\text{old}} \leftarrow \theta$$
\ENDFOR

\end{algorithmic}
\end{algorithm}
```


```pseudocode
\begin{algorithm}
\caption{PPO, Actor--Critic Style}
\begin{algorithmic}
\PROCEDURE{PPO}{}
    \FOR{iteration = $$1, 2, \ldots$$}
        \FOR{actor = $$1, 2, \ldots, N$$}
            \STATE Run policy $$\pi_{\theta_{\text{old}}}$$ in environment for $$T$$ timesteps
            \STATE Compute advantage estimates $$\hat{A}_1, \ldots, \hat{A}_T$$
        \ENDFOR
        \STATE Optimise surrogate $$L w.r.t. \theta$$, with $$K$$ epochs and minibatch size $$M \le NT$$
        \STATE $$\theta_{\text{old}} \leftarrow \theta$$
    \ENDFOR
\ENDPROCEDURE
\end{algorithmic}
\end{algorithm}
```


## References

- ([Schulman et al., 2015](https://arxiv.org/pdf/1502.05477))
- ([Schulman et al., 2017](https://arxiv.org/pdf/1707.06347))
- ([Carnegie Mellon, Natural Policy Gradients](https://www.andrew.cmu.edu/course/10-703/slides/Lecture_NaturalPolicyGradientsTRPOPPO.pdf))
- ([OpenAI Spinning Up](https://spinningup.openai.com/en/latest/algorithms/trpo.html#trust-region-policy-optimization))
