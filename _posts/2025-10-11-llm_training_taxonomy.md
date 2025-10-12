---
layout: post
title: LLM Fine-Tuning; Overview & Taxonomy
description: supervised fine-tuning, reinforcement learning
thumbnail: assets/img/blogs/rl_taxonomy.png
date: 2025-10-11 16:00:00
tags: llm fine-tuning sft rl
categories: sample-posts
---

<style>
/* --- Academic-style Markdown Tables --- */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 0.95rem;
  border: none;
}

/* Header line (like booktabs \toprule) */
thead tr {
  border-bottom: 2px solid #555;
}

/* Cell spacing and text alignment */
th, td {
  text-align: left;
  padding: 0.6em 0.8em;
  border: none; /* Removes vertical and outer borders */
}

/* Horizontal separators between rows */
tbody tr {
  border-bottom: 1px solid #ccc;
}

/* Remove final line for a clean bottom */
tbody tr:last-child {
  border-bottom: none;
}

/* Emphasize header text */
th {
  font-weight: 600;
}

/* Subtle hover (optional) */
tbody tr:hover {
  background-color: #f9f9f9;
  transition: background-color 0.2s ease;
}

/* Optional dark mode refinement */
@media (prefers-color-scheme: dark) {
  thead tr {
    border-bottom: 2px solid #888;
  }
  tbody tr {
    border-bottom: 1px solid #444;
  }
  tbody tr:hover {
    background-color: #2b2b2b;
  }
}
</style>


## Conceptual Table

| Concept | Axis | Main Question |
|:--|:--|:--|
| **Offline vs. Online (RL)** | Planning (MDP) vs. Learning (RL) | Do we already know the environment? |
| **Model-based vs. Model-free** | Environment model | Do we know/approximate ĤT, ĤR or learn directly from interactions? |
| **Value-based vs. Policy-based** | Representation | Do we learn a value function or a policy directly? |
| **Passive vs. Active** | Exploration | Are we evaluating or improving a policy? |

## Taxonomy

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blogs/rl_taxonomy.png" height="300" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
