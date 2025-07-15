# Phase 1: Documentation & Configuration (High Priority)

## Overview
Critical foundational improvements to align documentation with reality and implement core configuration features that users expect.

## Goals
- Fix misleading project documentation 
- Implement advertised theme system
- Add robust input validation
- Ensure examples work as documented

## Tasks

### 1. Update CLAUDE.md Status
**Priority**: Critical  
**Effort**: Low  
**Dependencies**: None

- [ ] Remove outdated "Early development stage - only README.md exists" statement
- [ ] Update current status to reflect working implementation
- [ ] Add notes about existing architecture and features
- [ ] Update planned vs implemented features list

**Acceptance Criteria**: CLAUDE.md accurately reflects current project state

### 2. Implement Theme System
**Priority**: High  
**Effort**: Medium  
**Dependencies**: None

- [ ] Create theme interface/type definitions
- [ ] Implement `robotpony` theme with specified colors:
  - Beige background (#d4c5a9)
  - Bold white text on colored circles
  - Dark badges for intersection labels
  - Comic-style plot graphs
- [ ] Implement `rp` theme (clean, professional styling)
- [ ] Implement `default` theme (basic styling)
- [ ] Add theme loading mechanism in renderers
- [ ] Update CLI to properly apply theme selection

**Acceptance Criteria**: All three themes render correctly and match README descriptions

### 3. Add Schema Validation for Markdown Frontmatter
**Priority**: High  
**Effort**: Medium  
**Dependencies**: None

- [ ] Define JSON schema for each chart type (venn, plot, flowchart)
- [ ] Add validation library (e.g., ajv, joi)
- [ ] Implement validation in MarkdownParser
- [ ] Add specific error messages for common mistakes:
  - Missing required fields
  - Invalid color names/hex codes
  - Invalid coordinate ranges
  - Malformed YAML
- [ ] Add tests for validation scenarios

**Acceptance Criteria**: Clear, helpful error messages for invalid input files

### 4. Sync README Examples with Working Examples
**Priority**: Medium  
**Effort**: Low  
**Dependencies**: Theme system completion

- [ ] Verify all README examples work with current implementation
- [ ] Update any examples that don't match `/examples` folder
- [ ] Ensure consistent naming and formatting
- [ ] Test that documented command-line usage produces expected outputs
- [ ] Add missing example files if referenced in README

**Acceptance Criteria**: All README examples can be successfully executed and produce expected output

## Estimated Timeline
- Total effort: 1-2 weeks
- Can be worked on in parallel after theme system is defined

## Success Metrics
- All examples in README work correctly
- Theme switching produces visually distinct outputs
- Invalid input files show helpful error messages instead of crashes
- Documentation accurately reflects project capabilities