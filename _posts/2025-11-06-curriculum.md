---
layout: post
title: Curriculum Learning Methods
date: 2025-11-06 11:00:00
description: Task-Specific, Teacher-Guided, Self-Play, Automatic Goal Generation
thumbnail: assets/img/blogs/curriculum-categories.png
tags: theory
categories: sample-posts
---

- [Overview](#overview)
- [Curriculum as a Continuation Method](#curriculum-as-a-continuation-method)
- [Curricula and Autocurricula for RL](#curricula-and-autocurricula-for-reinforcement-learning)
    - [Task-Specific](#task-specific-curriculum)
    - [Teacher-Guided](#teacher-guided-curriculum)
    - [Curriculum Through Self-Play](#curriculum-through-self-play)
    - [Automatic Goal Generation](#automatic-goal-generation)
    - [Skill-Based](#skill-based-curriculum)


## Overview

Curriculum Learning (CL) formalises ML and RL training strategies where examples are presented in an organised meaningful order illustrating gradually more and more complex concepts. It is hypothesized that CL has an effect on the speed of convergence of the training process and the quality of the local minima obtained. CL can be seen as a general strategy (a continuation method) for global optimisation of non-convex functions. Curriculum strategies appear on the surface as a regulariser (improving generalisation). 

### Curriculum as a Continuation Method

Continuation methods are global optimisation strategies that deal with minimising a non-convex criteria. We first optimise a smoothed objective and gradually consider less smoothing, with the intuition that a smooth version of the problem reveals the global picture. Say we have a single-parameter family of cost functions $C_{\lambda}(\theta)$, such that $C_0$ is a highly smoothed version of $C_1$, and can be optimised easily (maybe convex in $\theta$). Here $C_1$ is the actual criterion we wish to minimise. In continuation methods we would start with minimising $C_0(\theta)$, then gradually increase $\lambda$ while keeping $\theta$ at a local minimum of $C_{\lambda}(\theta)$. Hence, applying a continuation method to the problem of minimising a training criterion involves a sequence of training criteria, starting from $C_0$ and ending with the training criterion of interest $C_N$.

At an abstract level CL can be seen as a sequence of training criteria, where each criterion in the sequence is associated with a different set of weights on the training examples (more generally reweighting of the training distribution). At each training criterion we slightly change the weighting of examples to increase the probability of sampling sligtly more difficult examples. At the end the reweighting of examples is uniform, and we train on the target training set and distribution. Let $z$ be a random example for the learner (i.e. $(x, y)$ pair for supervised learning), $P(z)$ the target training distribution from which the learner should ultimately learn a function of interest. Let $0 \leq W_{\lambda}(z) \leq 1$ be the weight applied to example $z$ at step $\lambda$ with $0 \leq \lambda \leq 1$, and $W_1(z) = 1$. The corresponding training distribution at step $\lambda$ is:

$$
Q_{\lambda}(z) \propto W_{\lambda}(z) P(z) \ \ \ \forall z
$$

$$
\int Q_{\lambda}(z) dz = 1
$$

$$
Q_1(z) = P(z) \ \ \ \forall z
$$

We call the corresponding distributions of $Q_{\lambda}$ a curriculum if the entropy of these distribution increases and $W_{\lambda}(z)$ is monotonically increasing in $\lambda$. Note that here the entropy $H(Q_{\lambda})$ measures how broad or diverse the training distribution is.

$$
H(Q_{\lambda}) < H(Q_{\lambda + \epsilon}) \ \ \ \forall \epsilon > 0
$$

$$
W_{\lambda + \epsilon}(z) \geq W_{\lambda}(z) \ \ \ \forall z, \forall \epsilon > 0
$$


## Curricula and Autocurricula for Reinforcement Learning

There are several important categories of curriculum learning, most are applied to reinforcement learning with a few exceptions on supervised learning. More specifically, task-specific, teacher-guided, self-play, automatic goal generation, skill-based, and distillation based curriculum learning methods.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/curriculum-categories.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Task-Specific Curriculum

[Bengio et al., 2009](https://qmro.qmul.ac.uk/xmlui/bitstream/handle/123456789/15972/Bengio%2C%202009%20Curriculum%20Learning.pdf?sequence=1&isAllowed=y&ref=https://githubhelp.com) presents two ideas using manually designed **task-specific curriculum** (introducing gradually more difficult examples). The author also hypothesizes it would be beneficial to make learning focus on "interesting" examples that are neither too hard or too easy.

To train the model on samples with gradually increasing level of complexity, we need to quantify the difficulty of the tasks involved. **Minimal loss** with respect to another model can be used, transfering the knowledge of the pretrained model to the new model by suggesting a rank of training samples. Similarly, we can also develop our own metrics of difficulty depending on the problem. For example, [Zaremba & Sutskever 2014](https://arxiv.org/pdf/1410.4615) defined their Python program's (their model input/task) based on code length and nesting. Note that the order of tasks does not have to be sequential. For example, [Weng et al., 2019](https://arxiv.org/pdf/1910.07113) used Automatic Domain Randomisation (ADR) to generate a curriculum by growing a distribution of environments with increasing complexity.

### Teacher-Guided Curriculum

Teacher-guided curriculum can be classified as an **automatic curriculum learning**. The original work by [Graves et al., 2017](https://arxiv.org/pdf/1704.03003) implemented this considering an N-task curriculum as an N-armed bandit problem along with an adaptive policy which learns to optimise the returns from this bandit. They considered two types of learning signals; (1) **loss-driven progress**, and (2) **complex-driven progress** that is the KL divergence between posterior and prior distribution over network weights (model complexity is expected to increase most in reponse to model nicely generalising to training examples). 

The **Teacher-Student Curriculum Learning** (TSCL) was formalised by [Matiisen et al., 2017](https://arxiv.org/abs/1707.00183). Here the student is an RL agent working on actual tasks while the teacher agent is a policy for selecting tasks. The student aims to master a complex task that might be hard to learn directly, it aims to learn tasks that can best increase the learning progress or tasks that are at risk of being forgotten. We set up the teacher agent to guide the student's training process by picking proper sub-tasks. Training the teacher model is to solve a **Partially Observable Markov Decision Process** (POMPD) problem. The unobserved $s_t$ is the full state of the student model. The observed $o$ are a list of scores for $N$ tasks. The action $a$ is to pick on subtask. The reward per step is the score delta $r_t$ (equivalent to maximising the score of all tasks at the end of the episode).

$$
o = (x^{(1)}_t, \dots, x^{(N)}_t)
$$

$$
r_t = \sum^N_{i=1} x^{(i)}_t - x^{(i)}_{t-1}
$$

The method of estimating the learning progress from noisy task scores while balancing exploration vs exploitation can be borrowed from the non-stationary multi-armed bandit problem (e.g., using $\epsilon$-greedy or Thompson sampling). The core idea is to use one policy to propose tasks for another policy to "learn better" through this autocurricula. Previous works have found that uniformly sampling from all tasks is a surprisingly strong benchmark.

Another line of work, [Protelas et al., 2019](https://arxiv.org/pdf/1910.07224) studies a continuous teacher-student framework for **continuous task spaces**. Given a newly sampled parameter $p$, the absolute learning progress (ALP) is measured as $ALP_p = \mid r - r_{old} \mid$, where $r$ is the episodic reward associated with $p$ and $r_{old}$ is the reward associated with $p_{old}$. Here, $p_{old}$ is a previous sampled parameter closest to $p$ in the task space, which can be retrieved via nearest neighbour. Note that that ALP score measures the reward difference between two tasks rather than performance at two time steps of the same task (in the original TSCL).

On top of the task parameter space, a Gaussian mixture model (GMM) is trained to fit the distribution of $ALP_p$ over $p$. $\epsilon$-greedy algorithm is used when sampling the tasks; with some probability sampling at random, otherwise sampling proportionally to ALP score from the GMM model.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/curriculum-alpgmm.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Curriculum Through Self-Play

Self-play is an alternative version of automatic curriculum learning through asymmetric self-play, a concept first introduced by [Sukhbaatar et al., 2017](https://arxiv.org/pdf/1703.05407). Here instead of an explicit Teacher agent, we implicitly and gradually teach the curricula by adopting 2 competing agents (commonly referred to as Alice and Bob) that play the same task with different goals. Both have indepenent parameters and loss objective. The **self-play episode** consists of Alice altering the state from $s_0 \rightarrow s_t$ and Bob is asked to return the environment to its original state $s_0$ to get an internal reward. The **target episode** consists of Bob receiving an external reward if he visits the target flag.

The curriculum is built automatically through a self-regulating loop without explicit difficulty schedule. Bob is exposed to tasks that are neither too easy nor too hard (they gradually increase in difficulty as Bob gets better). This is because Alice's objective is to make tasks that are just hard enough for Bob to fail or struggle with. As Bob improves, Alice works harder to find challenges Bob can't yet solve, otherwise Alice's search for hard tasks stays in an easier regime. We can formally define Bob's and Alice's reward. Here $t_B$ is the total for Bob to complete the task, $t_A$ is the time until Alice performs the STOP action, and $\gamma$ is a scalar constant to rescale the reward to be comparable with the external task reward. If bob fails $t_B = t_{max} - t_A$.

$$
R_B = -\gamma t_B
$$

$$
R_A = \gamma \max(0, t_B - t_A)
$$


### Automatic Goal Generation

One approach for Automatic Goal Generation is to rely on **Goal Generative Adversarial Networks** (GAN) to generate desired goals automatically, proposed by [Florensa et al., 2018](https://arxiv.org/pdf/1705.06366). A goal $g \in \mathcal{G}$ can be defined as a set of states $S^g$ and a goal is considered achieved whenever an agent arrives at any of those states. In the original experiment the reward is a binary flag for whether the goal is achieved or not, and the policy $\pi$ is conditioned on the goal (and $R^g(\pi)$ is the expected return).

$$
\pi^*(a_t \mid s_t, g) = \arg \max_{\pi} \mathbb{E}_{g~p_g(.)} R^g(\pi)
$$

$$
R^g(\pi) = \mathbb{E}_{\pi} (\dot \mid s_t, g) \textbf{1} [\exists t \in [1, \dots, T] : s_t \in S^g]
$$

Given sampled trajectories from current policy $\pi$, as long as any state belongs to the goal set, the return will be positive. This approach iterates through 3 steps until policy convergence. First (1), label a set of goals based on appropriate level of difficulty for the curent $\pi$ named **GOID** (goals of intermediate difficulty). Here $R_{min}$ and $R_{max}$ are minimum and maximum probability of reaching a goal over $T$ time-steps.

$$
GOID_i \coloneqq {g: R_{min} \leq R^g(\pi_i) \leq R_{max}} \subseteq G
$$

Then (2) we train a Goal GAN model using labelled goals to produce new goals, and finally (3) use these goals to train the policy improving the coverage obejctive. Generator $G(z)$ produces a new goal expected to be uniformly sampled from GOID set. Discriminator $D(g)$ evaluates whether the goal can be achieved (whether it is indeed from the GOID set). The Goal GAN is constructed similar to LSGAN (Least-Squared GAN) which has better stability compared to vanilla GAN. According to LSGAN we should minimise following losses for $D$ and $G$ respectively. Here $a$ is the label for fake data, $b$ for real data, $c$ is the value that $G$ wants $D$ to believe for fake data (by default $a = -1, b = 1, c = 0$). 

$$
\mathcal{L}_{LSGAN}(D) = \frac{1}{2} \mathbb{E}_{g ~ p_{data}(g)} 
[(D(g) - b)^2] + \frac{1}{2} 
\mathbb{E}_{z ~ p_z(g)} 
[(D(G(z)) - a)^2]
$$

$$
\mathcal{L}_{LSGAN}(G) = \frac{1}{2} \mathbb{E}_{z ~ p_z(z)}
[(D(G(z)) - c)^2]
$$

Goal GAN introduces an extra binary flag $y_b$ indicating whether a goal $g$ is real ($y_g = 1$) or fake ($y_g = 0$) so that the model can use negative samples for training.

$$
\mathcal{L}_{GoalGAN}(D) = \frac{1}{2} \mathbb{E}_{g ~ p_{data}(g)} 
[(D(g) - b)^2 + (1 - y_g)(D(g) - a)^2] + \frac{1}{2} 
\mathbb{E}_{z ~ p_z(g)} 
[(D(G(z)) - a)^2]
$$

$$
\mathcal{L}_{GoalGAN}(G) = \frac{1}{2} \mathbb{E}_{z ~ p_z(z)}
[(D(G(z)) - c)^2]
$$

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/curriculum-goalgan.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

Following the same idea [Racainere et al., 2019](https://arxiv.org/pdf/1909.12892) designs a method to make the objectives of goal generator more sophisticated, by optimising in three objectives **goal validity**, **goal feasibility**, and **goal coverage**. The experiments show complex environments require all three of these losses. When the environment is changing between episodes, both the goal generator and the discriminator need to be conditioned on environmental observation to produce better results.


### Skill-Based Curriculum

Another view is to decompose what an agent is able to complete into a variety of skills, and map each skill set into a task. An agent could be interacting with the environment in an unsupervised manner, discovering useful skills and building into solutions for more complicated tasks through a curriculum. [Jabri et al., 2019](https://arxiv.org/abs/1912.04226) developed CARML (Curricula for Unsupervised Meta-Reinforcement Learning), by modeling unsupervised trajectories into a latent skill space, with a focus on training meta-RL policies (i.e., can transfer to unseen tasks).


## References

- ([Bengio et al., 2009](https://qmro.qmul.ac.uk/xmlui/bitstream/handle/123456789/15972/Bengio%2C%202009%20Curriculum%20Learning.pdf?sequence=1&isAllowed=y&ref=https://githubhelp.com))
- ([Weng et al., 2020](https://lilianweng.github.io/posts/2020-01-29-curriculum-rl/))