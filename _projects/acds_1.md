---
layout: page
title: Deep Impact
description: Numerical airburst solver and an airblast hazard mapper.
img: assets/img/acds1/solver_workflow.png
importance: 1
category: work
related_publications: false
---

## Motivation

Asteroids entering Earth’s atmosphere are subject to extreme drag forces that decelerate, heat and disrupt the space rocks. The fate of an asteroid is a complex function of its initial mass, speed, trajectory angle and internal strength. 

[Asteroids](https://en.wikipedia.org/wiki/Asteroid) 10-100 m in diameter can penetrate deep into Earth’s atmosphere and disrupt catastrophically, generating an atmospheric disturbance. Such an event occurred over the city of [Chelyabinsk](https://en.wikipedia.org/wiki/Chelyabinsk_meteor) in Russia, in 2013, releasing energy equivalent to about 520 [kilotons of TNT](https://en.wikipedia.org/wiki/TNT_equivalent) (1 kt TNT is equivalent to $4.184 \times 10^{12}$ J), and injuring thousands of people (Popova et al., 2013; Brown et al., 2013).

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds1/chelyabinsk.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

## Overview

This project was developed as part of the Applying Computational Science group project (with a team of 8) at Imperial College London.

It is a Python-based solution with two core features:
- **Airburst Solver** - a fast numerical simulator to predict the fate of asteroids entering Earth's atmosphere.
- **Airblast Damage Mapper** - a hazard mapper (that uses the solver) for an impact over the UK.

## Technical Details

1. The operational workflow of the numerical airbust solver:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds1/solver_workflow.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Airburst Solver Workflow
</div>

2. The operational workflow of the airblast damage mapper:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds1/mapper_workflow.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Airblast Mapper Workflow
</div>

## Airbust Solver Demo

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds1/impact_simulation_demo.png" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds1/calculate_energy_demo.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

## Airblast Damage Mapper Demo

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds1/damage_map_demo.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>