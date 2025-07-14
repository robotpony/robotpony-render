# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an image generation tool called `rp-render` (or `graphinate` per README.md) that will read markdown files and render SVG or PNG images for venn diagrams and simple charts/graphs.

**Current Status**: Early development stage - only README.md exists with basic usage example.

## Planned Command Structure

Based on README.md, the intended command structure is:
```bash
graphinate source.md output.png --theme=rp --type=venn
```

## Development Workflow

1. Outline your tasks each in tasks/todo.md files, named by the feature name as you see it.
2. Create incremental, testable changes
3. Verify each change works before proceeding
4. Keep code functional, clear, and simple
5. Minimize scope of each change

## Planned Architecture

- **Target Structure**: `src/` for components, `bin/` for executables
- **Technology**: Appears to be Node.js based (referenced in original docs)
- **Input**: Markdown files
- **Output**: SVG and PNG images
- **Chart Types**: Venn diagrams, simple charts/graphs

## Code Standards

- Clean, simple, functional code
- Use standard and popular libraries
- Structured error handling with specific failure modes
- Concise, purpose-driven function documentation
- Verify preconditions before critical operations
- File operations must verify existence and permissions

## Security Guidelines

- No hardcoded credentials
- Validate and sanitize all inputs
- Avoid eval and shell injection vectors
- Follow principle of least privilege
