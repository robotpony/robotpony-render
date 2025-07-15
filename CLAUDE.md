# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `graphinate` - a **focused** tool for generating SVG/PNG charts from markdown.

**Current Reality**: Feature-complete CLI with extensive comic-style utilities that may exceed core requirements.

**Quality Focus**: Improve core chart rendering accuracy and theme consistency rather than adding more features.

**Architecture Principle**: Simple, testable components that solve the core problem well.

## Command Structure

The implemented command structure is:
```bash
graphinate input.md output.svg --theme=robotpony --type=venn
graphinate input.md output.png --theme=rp --type=plot
```

## Development Workflow

1. Outline your tasks in tasks/ directory as markdown files, named by the feature name.
2. Create incremental, testable changes.
3. Verify each change works before proceeding.
4. Keep code functional, clear, and simple.
5. Minimize scope of each change.
6. Ensure examples cover all chart types and themes.

## Technical Architecture

### Core Components
- **CLI**: `src/cli/index.ts` - Full-featured command interface with theme preview
- **Generators**: `src/generators/` - Chart-specific rendering (venn, plot, flowchart)
- **Renderers**: `src/renderers/` - SVG output and factory pattern
- **Utils**: `src/utils/` - Comic text effects, font management, accessibility

### Current Implementation Status


### Technology Stack
- **Core**: TypeScript/Node.js with comprehensive tooling (Jest, ESLint, Sharp, D3)
- **Input**: Markdown files with YAML frontmatter
- **Output**: SVG and PNG images
- **Chart Types**: Venn diagrams, plot graphs, flowcharts (in development)

## Current Implementation Reality


### Priority: Simplify Before Enhancing
Before adding new features, evaluate if existing complex utilities are actually being used.

## Code Quality Focus

### Complexity Management
- **Prefer composition over inheritance**: Use factory patterns sparingly
- **Minimize dependencies**: Question each new utility before adding

### File Size Targets
- Individual files should stay under 200 lines
- Utils should be split by clear functional boundaries
- Remove unused or speculative code (like font caching for server-side rendering)

### Code Standards
- Clean, simple, functional code
- Use standard and popular libraries
- Structured error handling with specific failure modes
- Concise, purpose-driven function documentation
- Verify preconditions before critical operations
- File operations must verify existence and permissions

## Development Constraints

### Before Adding New Features
1. Run `npm run test` to verify current functionality
2. Check if existing utilities are actually used in the generators
3. Consider if feature belongs in core tool vs. external plugin

### Code Simplification Rules
- Remove commented-out code and TODOs
- Consolidate similar utilities into single files
- Eliminate speculative features not used by core generators

### Focus Areas for Quality Improvement
1. **Rendering accuracy** - Core chart generation quality
2. **Theme consistency** - Ensure themes work across all chart types
3. **Error handling** - Better validation and user feedback
4. **Performance** - Optimize hot paths in generators, not peripheral utilities

## Security Guidelines

- No hardcoded credentials
- Validate and sanitize all inputs
- Avoid eval and shell injection vectors
- Follow principle of least privilege
