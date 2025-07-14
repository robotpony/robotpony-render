# Robotpony Render

A simple tool for rendering Venn diagrams from Markdown, perfect for creating comic-style graphics for the Robotpony blog.

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

## Themes

### `robotpony` Theme
Perfect for comic-style diagrams matching the Robotpony.ca aesthetic:
- Beige background with muted colors
- Bold white text on colored circles
- Dark badges for intersection labels with connector lines

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

### Custom Colors
```markdown
---
type: venn
theme: default
background: white

sets:
  - Design (#3498db)
  - Engineering (#e74c3c)

overlap: Product Management
---
```

## Command Line Options

```bash
graphinate <input.md> <output.svg|png> [options]

Options:
  --theme <theme>    Theme: robotpony, rp, or default
  --type <type>      Chart type (currently only 'venn')
  -h, --help         Show help
  -V, --version      Show version
```

## Installation

```bash
npm install -g graphinate
```

## Features

- ✅ Natural language format (no JSON!)
- ✅ Automatic line breaks for long text
- ✅ Multiple themes including comic-style
- ✅ SVG and PNG output
- ✅ Custom colors with intuitive names
- ✅ Background color support
- ✅ Intersection labels with connector lines
