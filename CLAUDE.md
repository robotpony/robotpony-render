# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an image generation tool called `graphinate` that reads markdown files and renders SVG or PNG images for venn diagrams, plot graphs, and flowcharts.

**Current Status**: Fully functional implementation with TypeScript codebase. Working on rendering quality.

## Command Structure

The implemented command structure is:
```bash
graphinate input.md output.svg --theme=robotpony --type=venn
graphinate input.md output.png --theme=rp --type=plot
```

## Development Workflow

1. Outline your tasks in tasks/ directory as markdown files, named by the feature name
2. Create incremental, testable changes
3. Verify each change works before proceeding
4. Keep code functional, clear, and simple
5. Minimize scope of each change

## Current Architecture

- **Structure**: `src/` for components, `bin/` for executables, `tests/` for testing
- **Technology**: TypeScript/Node.js with comprehensive tooling (Jest, ESLint, Sharp, D3)
- **Input**: Markdown files with YAML frontmatter
- **Output**: SVG and PNG images
- **Chart Types**: Venn diagrams, plot graphs, flowcharts (in development)
- **Themes**: Theme system partially implemented (needs completion)

## Implemented Features

- ✅ CLI interface with Commander.js
- ✅ Markdown parsing with frontmatter support
- ✅ Venn diagram generation using venn.js
- ✅ Plot graph generation with D3
- ✅ SVG and PNG output using Sharp
- ✅ Comprehensive test suite with Jest
- ✅ Working examples in `/examples` directory
- ⚠️ Theme system (structure exists, needs implementation)
- ⚠️ Flowchart generation (partial implementation)

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
