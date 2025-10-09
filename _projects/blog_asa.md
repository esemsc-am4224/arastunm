---
layout: page
title: Adversarial Search Algorithms
description: Minimax, Expectimax, Monte Carlo Tree Search
img: assets/img/blogs/mcts.jpeg
importance: 1
category: blog
---

- [Introduction](#introduction)
- [Minimax](#minimax)
- [Alpha-Beta Pruning](#alpha-beta-pruning)
- [Evaluation Functions](#evaluation-functions)
- [Expectimax](#expectimax)
- [Mixed Layer Types](#note-mixed-layer-types)
- [General Games](#note-general-games)
- [Monte Carlo Tree Search](#monte-carlo-tree-search-mcts)

## Introduction

The key difference between search problems and **games** (aka adversarial search problems) is that in games the agent does not simply determine and execute the best plan, it also faces adversaries who attempt to keep it from reaching its goal(s). Typically, we do not deterministically know how our adversaries will plan against and respond to our actions. In general, games can have actions with **deterministic** or **stochastic** outcomes, can have arbitary number of **players**, and are not necessarily **zero-sum** (one party's gain come at the expense of another party).

A normal search returns a comprehensive plan, an adversarial search returns a **strategy** or **policy** (best possible move given some configuration of our agent(s) and their adversaries). Such algorithms have a property of giving rise to behaviour through computation (cooperation between agents on the same team, outthinking of adversarial agents). Standard formulation includes; initial state $s_0$, $Players(s)$ denoting current turn, $Actions(s)$ denoting available actions to a player, $Result(s, a)$ a transition model, $test(s)$ terminal test, $Utility(s, player)$ terminal values/utilities.

### Deterministic Zero-Sum Games

Here our actions $a$ are deterministic, and or gain directly corresponds to opponent's loss and vice versa. For example, a single variable value $X$ that player $A$ tries to maximise and player $B$ tries to minimise. Common examples include:

- **Checkers** is a solved game; any position $s$ can be evaluated a win, loss, or draw given both players act optimally.
- **Chess**
- **Go** has a much larger search space compared to Chess and Checkers.

## Minimax

**Minimax** is a zero-sum game that runs under the assumption that opponent behaves optimally. **State value** is the optimal value/score attainable by an agent/player which controls that state $s$. A **terminal state** is the end state of the game (e.g., win/loss). **Game tree** is a graph representing all possible game states within our sequential game (all possible ways a game can pan out). Akin to a search tree, children are successor states following an action $a$ from current state $s$. A states $s$ value is determined as the best possible outcome (**utility**). The value of a terminal state is known as **terminal utility** which is a deterministic (except in stochastic games), known value. The value of a **non-terminal** state is determined as the $\max$ of the values of its children. In general:

$$
\forall{non{-}terminal \ states},\ V(s) = \max_{s' \in{successors(s)}} V(s') 
$$

$$
\forall{terminal \ states},\ V(s) = known
$$

In adversarial settings, an agent having control over a node simply means that node corresponds to a state $s$ where it is the agents turn. Instead of maximising the utility over children at every level of the tree (node), the **minimax** algorithm only maximises over children of nodes controlled by our agent, and minimises for over children of nodes controlled by the adversarial agent (hence called min-max). For example, here the adversarial nodes (at depth 1) have values of $min(-8, -5) = -8$ and $min(-10, 8) = -10$, while the root node (our agent) has values of $max(-8, -10) = -8$.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/minimax.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

We can formalise the minimax value assignment as follows:

$$
\forall{agent{-}controlled \ states},\ V(s) = \max_{s' \in{successors(s)}} V(s') 
$$

$$
\forall{opponent{-}controlled \ states},\ V(s) = \min_{s' \in{successors(s)}} V(s') 
$$

$$
\forall{terminal \ states},\ V(s) = known
$$

Minimax evaluation implementation is similar to the depth-first search (**DFS**) algorithm. However, while DFS algorithms are classically implemented using pre-order traversal ot the tree (using the stack approach), in minimax we use **post-order traversal** (starting from the leftmost child node iteratively working our way rightwards).

### Alpha-Beta Pruning

Minimax is optimal and intuitive, but has a time complexity of $O(b^m)$ where $b$ is the branching factor and $m$ is the approximate tree depth (averaged). **Alpha-Beta Pruning** is a classic search optimisation for the minimax algorithms. Given the min-max nature of sucessive nodes, we stop looking (prune) as soon as a node $n$ value can at best equal current (so far) optimal value of $n$'s parent. For example, we are currently minimising and we have a sibling with higher value, we can prune as we know the current node will not pick a path/value any higher (it is minimising) than the current value. Alpha-beta pruning can reduce our runtime complexity to $O(b^{m/2})$, effectively doubling the solvable depth.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/alpha-beta-pseudo.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Evaluation Functions

However, even with **alpha-beta pruning** we are not able to get to the bottom of the search trees for the majority of games. **Evaluation functions** take in a state $s$ and output an estimate of the minimax value of that node $n$. These functions are analogous to heuristics in standard search problems. Evaluation functions are widely employed for **depth-limited minimax**. Here we define a maximum solvable depth, and treat the non-terminal nodes at this depth as terminal giving them mock terminal utilites determined by the evaluation function. Note that the evaluation functions remove the guarantee of optimal play when running minimax. A common design is a linear combination of **features**:

$$
Eval(s) = w_1f_1(s) + w_2f_2(s) + ... + w_nf_n(s)
$$

Each $f_i(s)$ corresponds to a feature extracted from an input state $s$. Each feature is assigned a corresponding weight $w$. Features are some elements of a game-state we can extract and assign numerical values to (e.g., number of opponent pawns). In the reinforcement learning applications, you can commonly see non-linear evaluation functions based on neural networks. Improvements to evaluation functions include optimising the agent performance by fine-tuning weights $w$ and/or features $f$.


## Expectimax

Minimax is often overly pessimistic (responds to an optimal opponent). Some scenarious involve inherent randomness (card or dice games) or unpredictable opponents (also see Markov Decision Processes). **Expectimax** is a generalisation of minimax used to capture this randomness. We introduce chance nodes that compute **expected utility** or expected value to consider the average-case scenario:

$$
\forall{agent{-}controlled \ states},\ V(s) = \max_{s' \in{successors(s)}} V(s') 
$$

$$
\forall{chance \ states},\ V(s) = \sum_{s' \in{successors(s)}} p(s' \mid s) V(s')
$$

$$
\forall{terminal \ states},\ V(s) = known
$$

In the above formulation $p(s' \mid s)$ can refer to the probability of an action $a$ resulting from moving from $s$ to $s'$, or the probability of the adversarial agent moving from $s$ to $s'$. In expectimax probabilities are selected to properly reflect game state we are trying to model. We see that, minimax is a special case of expectimax, where minimiser nodes are chance nodes that assign probability of 1 to their lowest-value child (and probability of 0 to the rest). An important note is that in expectimax we can't utilise alpha-beta pruning, as we have to look at all the children of chance nodes. Pruning may be possible when we have known finite bounds on possible node $n$ values.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/expectimax-pseudo.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Note: Mixed Layer Types

We see that minimax and expectimax follow the alternating pattern of **maximiser/minimiser** or **maximiser/chance** respectively. However, often more robust node variations are adopted to develop game trees (and adversarial search algorithms) that are modified minimax/expectimax hybrids for any zero-sum game. For example in Pacman we may have multiple ghosts (say 4), hence we can adopt pattern of a maximiser followed by 4 minimisers (or say 3 minmisers and 1 chance if only 3 of ghosts behave optimally). In fact, doing so inherently gives rise to cooperation behaviour across all minimisers.

### Note: General Games

Similarly, not all games are **zero-sum**. Agents may involve different tasks that do not directly involve strict competition with one another. Such game trees are characterised by **Multi-agent utilities**. No there is no single alternating value, instead there is a tuple of utilities/values (for each agent). Each agent attempts to maximise its own utility and ignores the utilities of other agents. General games with multi-agent utilities are prime examples of rise of behaviour through computation. These setups invoke cooperation among agents (final utility tuple at the root tends to yield a reasonable utility for all agents).

## Monte Carlo Tree Search (MCTS)

**Monte Carlo Tree Search** (MCTS) algorithm is used for applications with large branching factor, where minimax would be unfeasible. It is a **best-first** **stochastic-search** algorithm that builds a partial game tree by sampling possible trajectories/simulations (instead of expanding the full tree like minimax).

It is based on 2 ideas: **evaluation by rollouts** (play $n$ times from state $s$ based on a policy $\pi$, count wins/losses) and **selective search**. Fraction of wins correlate well with value of state $V(s)$. Here we can also re-allocate computation (do more simulations for other actions $A \setminus {a_k}$) if a certain action $a_k$ does not return many wins. When actions ${a_k, a_j}$ yield similar scores (% of wins), estimate of the action with fewer simulations will have higher variance, and hence we might want to allocate more computation to that action to increase the confidence of the estimation. In general, **Upper Confidence Bound (UBC)** algorithm is used to capture such trade-off between *promising* and *uncertain* actions. It uses the following criterion at each node $n$:

$$
UCB1(n) = \frac{U(n)}{N(n)} + C \times \sqrt{ \frac{\log{N(PARENT(n))}}{N(n)}}
$$

$N(n)$ is the total number of rollouts from node $n$, $U(n)$ is the total number of wins for $Player(Parent(n))$. The first term captures how *promising* (exploration) the node is (win percentage), the second term captures how *uncertain* (exploitation) we are about nodes utility. User-specified *C* balances the weight (exploration vs exploitation).

 MCTS **UCT** (Upper Confidence bounds applied to Trees) uses **UCB** criterion in tree search problems. It iteratively repeats the following 3 steps:

 1. **UCB** criterion is used to move down the tree (from root), until we reach an leaf node.
 2. We add (expand) a new child to the leaf node, and run rollouts (simulations) from the child (to determine the number of wins for the child).
 3. We update the number of wins from the child back up to the root node using backpropagation.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/mcts.jpeg" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

 After running the algorithm for sufficient number of steps, we choose the action $a$ that leads to the child state $s$ with highest $N$ (number of visits). **UCT** inherently explores more promising children a higher number of times. As $N \rightarrow \infty$, UCT approaches the behaviour of minimax. This choice is justified in statistical reliability (most visited node has the lowest variance estimate of its value), consistency with asymptotic behaviour (as $N \rightarrow \infty$, UCB converges to minimax), practical stability (visit count $N$ represents both the value and confidence in that value).

## Summary

- **Minimax**: used when the opponent behaves optimally, can be pruned using $\alpha-\beta$ pruning. More conversative, yields better results when opponent is not well-known.
- **Expectimax**: used when facing a suboptimal opponent, using a probability distribution over the moves we believe they will make (to compute the expected value of states $s$).
- **Evaluation Function**: akin to a heuristics in standard search problems, for early termination (e.g., depth-limited minimax).
- **Monte Carlo Tree Search**: for problems with large branching factors, using **UCT** algorithm with **UCB** to guide the search (exploration vs exploitation), easily parallelisable.

## References

1. ([Berkeley AI](https://inst.eecs.berkeley.edu/~cs188/textbook/mdp/solve.html)).