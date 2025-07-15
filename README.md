# Robotpony Render

A simple tool for rendering Venn diagrams, plot graphs, and flowcharts from Markdown, perfect for creating comic-style graphics for the Robotpony blog.

## Quick Start

```bash
graphinate diagram.md output.svg --theme=robotpony
```

## Markdown Format

Create Venn diagrams using natural language in your markdown frontmatter:

```markdown
---
type: venn
theme: robotpony
background: beige

sets:
  - Best Practices (olive)
  - Zen and the Art Of (orange)

overlap: Wishful Thinking
---

# Optional markdown content

This diagram shows the intersection of practical methodology and philosophical approaches.
```

### Plot Graphs

Create comic-style scatter plots with labeled axes and annotated points:

```markdown
---
type: plot
theme: robotpony
x_axis: "Cool"
y_axis: "Relevance"
x_range: [0, 10]
y_range: [0, 10]
line:
  style: dotted
  points:
    - [1, 1]
    - [3, 2]
    - [6, 5]
    - [8, 7]
    - [9.5, 9]
captions:
  - text: "PALM/PRE"
    x: 1
    y: 1
  - text: "ANDROID"
    x: 6
    y: 5
  - text: "IPHONE"
    x: 8
    y: 7
---

# Relevance vs Cool

A classic plot showing the relationship between how cool something is and how relevant it becomes.
```

## Themes

### `robotpony` Theme
Perfect for comic-style diagrams matching the Robotpony.ca aesthetic:
- Beige background with muted colors
- Bold white text on colored circles
- Dark badges for intersection labels with connector lines
- Comic-style plot graphs with caption boxes and connector lines

### `rp` Theme
Clean, professional styling:
- Modern colors and typography
- Suitable for technical documentation

### `default` Theme
Basic styling with standard colors.

## Natural Color Names

Use intuitive color names in your diagrams:

- `olive` → #9fb665 (muted green)
- `orange` → #c8986b (warm orange)
- `beige` → #d4c5a9 (warm background)
- `blue`, `red`, `green`, `purple`, `yellow`
- `gray`/`grey`, `black`, `white`
- Or use hex codes: `#ff0000`

## Advanced Examples

### Overlapping Circles WITH Labels
When you want to label the intersection area:

```markdown
---
type: venn
theme: robotpony
background: beige

sets:
  - Best Practices (olive)
  - Zen and the Art Of (orange)

overlap: Wishful Thinking
---
```

### Overlapping Circles WITHOUT Labels
When circles overlap but the intersection doesn't need a label:

```markdown
---
type: venn
theme: robotpony
background: beige

sets:
  - Design (blue)
  - Engineering (red)
---
```

### Three Sets
```markdown
---
type: venn
theme: robotpony

sets:
  - Programming (blue)
  - Coffee (red)
  - Sleep (green)

overlap: Pick Any Two
---
```

### Three Sets with Unlabeled Intersections  
Perfect for complex relationships where overlaps exist but don't need labels:

```markdown
---
type: venn
theme: robotpony
background: beige

sets:
  - COOKIE (blue)
  - C (blue)  
  - ME (olive)
---
```

**Note**: All Venn diagrams create overlapping circles by design. The difference is whether intersection areas are labeled with text or left unlabeled.

## Command Line Options

```bash
graphinate <input.md> <output.svg|png> [options]

Options:
  --theme <theme>    Theme: robotpony, rp, or default
  --type <type>      Chart type (venn, plot, flowchart)
  -h, --help         Show help
  -V, --version      Show version
```

## Installation

```bash
npm install -g graphinate
```

## Features

- ✅ Natural language format (no JSON!)
- ✅ Multiple chart types: Venn diagrams, plot graphs, flowcharts
- ✅ Comic-style plot graphs with labeled axes and captions
- ✅ Automatic line breaks for long text
- ✅ Multiple themes including comic-style
- ✅ SVG and PNG output
- ✅ Custom colors with intuitive names
- ✅ Background color support
- ✅ Intersection labels with connector lines
- ✅ Plot line styles: solid, dotted, dashed
