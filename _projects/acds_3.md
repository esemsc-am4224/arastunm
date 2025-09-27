---
layout: page
title: Palusznium Rush
description: Optimal mineral recovery using a genetic algorithm approach.
img: assets/img/project_covers/acds_3_cover.png
importance: 1
category: work
related_publications: false
---

## Motivation 

Separation technologies are widely used to improve the purity of products. Although the physical separation units are different, their key shared feature is that they will recover a proportion of the “valuable” material and will simultaneously recover a proportion of the “waste” material. In general it is hoped that the proportion of valuable material will increase in the separated output compared to the input mixture.

## Overview

This project is a C++ application designing an optimised separation circuit for Gormanium/Palusznium using a Genetic Algorithm, which can also handle both discrete & continuous circuit configurations, balance economic value and waste penalties, ensure robustness, flexibility, and tunability via configuration.

It features:
- Simulator: Model a circuit and calculate its performance.
- Genetic Algorithm: Algorithm implemented to find the optimal separation circuit.

We implement three flavours of genetic algorithms:
- Discrete GA: evolves circuit topologies encoded as integer vectors.
- Beta-Only GA: evolves continuous β-parameters for a fixed circuit topology using SBX crossover and Gaussian mutation.
- Hybrid GA: co-evolves both discrete topology and continuous β in one run.

Here is the circuit with highest fitness value (for standard **10** unit design) produced by our algorithm:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/best_circuit.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Best Circuit with 10 units.
</div>


## Standard Genetic Algorithm

1. Results with **tournament selection**:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/Dyn-tour-fitness-sum.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/Dyn-tour-diver-dist.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

2. Results with **rank-based selection**:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/Rank-based-fitness-sum.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/Rank-based-diver-dist.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

3. Resuls with **hybrid selection methods**:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/Tour-plus-rank-fitness-sum.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/Tour-plus-rank-diver-dist.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Performance Notes

All experiments were carried out using a unit size of **10**. Below is a summary of the different selection strategies tested and their outcomes.

#### 1. Baseline: Non-Optimized Version

* **Method**: Standard tournament selection with a fixed tournament size.
* **Results**:
  * Achieves a consistent best fitness in the range of ~430–470.
  * Shows a drop in both population and fitness diversity.
  * Performance steadily improves and converges around the mid-400s.

#### 2. Optimized Version 1: Dynamic Tournament Size

* **Method**: Tournament size scales dynamically from `pop_size/50` (minimum) to `pop_size/2` (maximum).
* **Results**:
  * Produces less consistent results, with more oscillations in best performance.
  * Achieves best fitness values up to ~490.
  * Adjusting the tournament size scaling rate (e.g., factor of 2.0 to control the speed of change) does not meaningfully improve outcomes.

#### 3. Optimized Version 2: Rank-Based Selection

* **Results**:
  * Performs worse than tournament selection with smaller populations (e.g., 100).
  * Performs roughly on par with earlier versions at larger populations (e.g., 500).
  * Average population fitness drops significantly as generations progress.

#### 4. Hybrid: Rank-Based + Tournament Selection

* **Method**: Start with rank-based selection to encourage diversity, then switch to standard tournament selection to push toward convergence.
* **Results**:
  * Does not outperform the non-optimized version.
  * Gains from rank-based diversity fail to translate into better final results.


## Age-Layered Genetic Algorithm (ALGP)

This method is designed to address **premature convergence** by encouraging exploration and maintaining population diversity. Below are the key ideas and implementation details:

### Core Principles

* Focuses on managing **premature convergence** to push the algorithm toward more optimal results.
* **New individuals** are always assigned **age 0**.
* **Breeding restrictions**: mating is limited to a selected layer and one layer below, promoting gradual information flow across layers.
* **Periodic injections** occur every *n-th* age gap, introducing new diversity into the system.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/ALPS-10-best-age-dist.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Age Layer Distribution Over Generations.
</div>

### Observations

* Tracking the **best fitness values across multiple layers** provides insight into how this method operates.
* The **first and youngest layer** receives periodic injections. This helps preserve younger, lower-performing members with the expectation that they may “trickle down” into older layers, boosting overall diversity.
* Larger population sizes and longer iteration counts were used successfully, since the layered structure reduces the risk of premature convergence and allows the algorithm to explore for longer.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/ALPS-10-best-fitness-sum.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds3/ga_results/ALPS-10-best-diver-dist.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>