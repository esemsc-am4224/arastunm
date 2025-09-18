---
layout: page
title: Pathfinder
description: C++ based 2D pathfinder simulator.
img: assets/img/project_covers/pathfinder_cover.png
importance: 1
category: fun
---

## Overview

Pathfinder consists of a *runner* (controlled by the player) and a *tracker* which follows the runner using the shortest available path.

Shortest path is found using the principles of [A* search algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm). The program also allows placing and removing blocks/tiles, switching between players, pausing (<kbd>space</kbd>) and generating a new random map (<kbd>shift</kbd>).

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/demos/pathfinder_demo1.png" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/demos/pathfinder_demo2.png" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Pathfinder Demonstrations
</div>

## Prerequisites

The program was developed in [C++14](https://en.cppreference.com/w/cpp/14). Additionally, the [SFML](https://www.sfml-dev.org) library was used for graphics and audio.

## Future Improvements/Sophistications

- **Movable Blocks** - a new type of block that can be moved by both runner and tracker, tracker's path cost increases when moving blocks
- **Multiple Trackers** - more than one tracker tries to catch on to the runner

## Details
- Author - Arastun Mammadli