---
type: plot
theme: robotpony
title: "Advanced Multi-Line Plot"
background: beige
x_axis: "Time (months)"
y_axis: "Performance Score"
x_range: [0, 12]
y_range: [0, 100]

grid:
  show: true
  color: "#d0d0d0"
  style: dotted

lines:
  - label: "Team A"
    color: "#9fb665"
    style: solid
    width: 3
    points:
      - [1, 20]
      - [3, 35]
      - [6, 60]
      - [9, 75]
      - [12, 85]
  - label: "Team B"
    color: "#c8986b"
    style: dashed
    width: 2
    points:
      - [1, 15]
      - [3, 25]
      - [6, 45]
      - [9, 65]
      - [12, 80]
  - label: "Target"
    color: "#2c3e50"
    style: dash-dot
    width: 2
    points:
      - [0, 70]
      - [12, 70]

markers:
  - type: circle
    x: 6
    y: 60
    size: 8
    color: "#9fb665"
    label: "Milestone A"
  - type: square
    x: 6
    y: 45
    size: 6
    color: "#c8986b"
    label: "Milestone B"
  - type: triangle
    x: 9
    y: 70
    size: 7
    color: "#d32f2f"
    label: "Target Hit"

legend:
  show: true
  position: top-left

captions:
  - text: "Q2 Review"
    x: 6
    y: 50
  - text: "Q4 Target"
    x: 12
    y: 70
---

# Performance Tracking Dashboard

This advanced plot demonstrates multiple data series, custom markers, grid lines, and a legend system for comprehensive data visualization.