---
layout: page
title: Cloth Simulator
description: C++ SFML based simple 2D cloth simulator.
img: assets/img/project_covers/cloth_sim_cover.png
importance: 1
category: fun
report_pdf: https://github.com/ArastunM/Cloth-Sim
github_repo: https://github.com/ArastunM/Cloth-Sim
---

## Overview

Program provides realistic *tearing* and *moving*/*dragging* of the cloth. The simulation works based on the principles of [Verlet integration](https://en.wikipedia.org/wiki/Verlet_integration). The cloth consists of *particles* and *constraints* (sticks connecting the particles). The force is applied to the small particles and sticks adjust accordingly.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/demos/cloth_sim_demo.gif" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
        Cloth Simulator Demonstration
</div>

## Prerequisites

The program was developed in [C++14](https://en.cppreference.com/w/cpp/14). Additionally, the [SFML](https://www.sfml-dev.org) library was used for graphics.

## Future Improvements/Sophistications

- **Dynamic Tearing by Distance** - weight of the cloth itself could result in tears
- **Texture and other Graphics** - current implementation is kept simple for demonstration, but better graphics could be added

## Details

- Author - Arastun Mammadli
