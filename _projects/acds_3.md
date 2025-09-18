---
layout: page
title: Palusznium Rush
description: Optimal mineral recovery using a Genetic Algorithm approach.
img: assets/img/project_covers/acds_3_cover.png
importance: 1
category: work
related_publications: false
---

## Overview

This project is a C++ application designing an optimised separation circuit for Gormanium/Palusznium using a Genetic Algorithm, which can also handle both discrete & continuous circuit configurations, balance economic value and waste penalties, ensure robustness, flexibility, and tunability via configuration.

It features:
- Simulator: Model a circuit and calculate its performance.
- Genetic Algorithm: Algorithm implemented to find the optimal separation circuit.

We implement three flavours of genetic algorithms:
- Discrete GA: evolves circuit topologies encoded as integer vectors.
- Beta-Only GA: evolves continuous β-parameters for a fixed circuit topology using SBX crossover and Gaussian mutation.
- Hybrid GA: co-evolves both discrete topology and continuous β in one run.
