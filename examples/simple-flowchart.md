---
type: flowchart
theme: robotpony
background: beige

nodes:
  - id: start
    type: circle
    text: START
    color: "#9fb665"
  - id: process
    type: rectangle
    text: "Process\nData"
    color: "#c8986b"
  - id: decision
    type: diamond
    text: "Valid?"
    color: "#7ba23f"
  - id: output
    type: rectangle
    text: "Output\nResult"
    color: "#9fb665"
  - id: error
    type: rectangle
    text: "Show\nError"
    color: "#d32f2f"
  - id: end
    type: circle
    text: END
    color: "#2c3e50"

connections:
  - from: start
    to: process
  - from: process
    to: decision
  - from: decision
    to: output
    label: "Yes"
  - from: decision
    to: error
    label: "No"
  - from: output
    to: end
  - from: error
    to: end

caption: "Simple Data Processing Flow"
subtitle: "Error handling with validation step"
---

# Simple Flowchart

A basic flowchart showing data processing with validation and error handling.