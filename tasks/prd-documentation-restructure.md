# Product Requirements Document: AI Assistant Documentation Restructure

## Introduction/Overview

The current AI assistant documentation files (`copilot-instructions.md` and `GEMINI.md`) have grown organically to 357 and 653 lines respectively, resulting in information duplication, conflicting guidance, and an overwhelming experience for both AI assistants and human developers. Additionally, the existing workflow-specific instruction files in `.github/instructions/` (create-prd, generate-tasks, process-tasks-list) demonstrate the value of specialized guidance but lack integration with the main AI instruction system.

**Problem Statement**: The current documentation lacks a coherent workflow-based structure, contains duplicated information between files, has inconsistent guidance that confuses AI assistants, and doesn't leverage the existing specialized instruction files or comprehensive documentation in `/docs` and `/tasks`.

**Goal**: Create a workflow-focused instruction system where specialized instruction files handle specific development flows (development, testing, problem-solving, etc.), while main AI files (`copilot-instructions.md` and `GEMINI.md`) serve as intelligent routers that determine when to reference these specialized workflows without duplicating content.

## Goals

1. **Create Workflow-Based Instruction System**: Develop specialized instruction files for different development workflows (development, testing, problem-solving, debugging, feature-development)
2. **Establish Intelligent Routing**: Transform main AI files into smart routers that determine when to reference specialized workflows
3. **Leverage Existing Documentation**: Reference and integrate with existing `/docs`, `/tasks`, and README.md content without duplication
4. **Eliminate Information Conflicts**: Remove contradictory guidance between documentation files
5. **Support Multiple AI Assistants**: Ensure both GitHub Copilot and Google Gemini CLI can effectively use the workflow system
6. **Maintain Single Source of Truth**: Consolidate all instruction content in `copilot-instructions.md` with `GEMINI.md` serving as a reference layer

## User Stories

**As a GitHub Copilot user**, I want workflow-specific instructions that guide me through development tasks so that I receive targeted assistance based on what I'm trying to accomplish.

**As a Google Gemini CLI user**, I want access to the same workflow guidance with additional context about MCP servers and project-specific tools so that I can leverage extended capabilities.

**As a human developer**, I want clear workflow instructions for common tasks (development, testing, debugging) so that I can follow established patterns and get AI assistance when needed.

**As a project maintainer**, I want workflow-based instructions that reference existing documentation so that I don't need to maintain duplicate information across multiple files.

**As an AI assistant**, I want clear routing logic to determine which workflow instructions to follow so that I provide relevant, focused guidance for each development scenario.

## Functional Requirements

### 1. Workflow-Based Instruction System
- **FR-1.1**: Create specialized instruction files for each development workflow:
  - `development.instructions.md` - Code development, feature implementation
  - `testing.instructions.md` - Unit, integration, E2E testing patterns
  - `debugging.instructions.md` - Problem-solving, error resolution
  - `deployment.instructions.md` - Build, deployment, CI/CD workflows
  - `maintenance.instructions.md` - Refactoring, updates, dependency management
- **FR-1.2**: Extend existing workflow files (create-prd, generate-tasks, process-tasks-list) to integrate with new system
- **FR-1.3**: Each workflow instruction file must reference existing documentation in `/docs` and `/tasks` rather than duplicating content
- **FR-1.4**: Maintain consistent structure across all workflow instruction files
- **FR-1.5**: Include update guidelines in each workflow instruction file for continuous improvement when new learnings appear

### 2. Intelligent Routing System
- **FR-2.1**: Transform `copilot-instructions.md` into a comprehensive routing system that:
  - Contains all critical patterns and setup information
  - Includes routing logic to determine which workflow instructions to use
  - Maintains quick reference sections for immediate needs
- **FR-2.2**: Create `GEMINI.md` as a lightweight reference layer that:
  - Points to relevant sections in `copilot-instructions.md`
  - Adds Gemini-specific context (MCP servers, CLI-specific features)
  - Avoids duplicating content from the main instruction file
- **FR-2.3**: Implement clear decision trees for when to use each workflow instruction file
- **FR-2.4**: Include decision flow guidance for determining which instruction file to update when new learnings emerge

### 3. Documentation Integration
- **FR-3.1**: Reference existing content in `/docs` (ADRs, guides, security docs) without duplication
- **FR-3.2**: Link to relevant sections in main `README.md` for setup and project overview
- **FR-3.3**: Point to `/tasks` folder for feature development examples and templates
- **FR-3.4**: Create summary tables that map workflows to existing documentation

### 4. Content Consolidation and Archival
- **FR-4.1**: Move completed task information (Tasks 1.8, 1.9) to `/docs/historical/completed-tasks/`
- **FR-4.2**: Consolidate extensive testing patterns into `testing.instructions.md`
- **FR-4.3**: Archive outdated Storybook v9 migration content to historical documentation
- **FR-4.4**: Remove duplicate content between current `copilot-instructions.md` and `GEMINI.md`

### 5. Archive and Cleanup
- **FR-5.1**: Move completed task information (Tasks 1.8, 1.9, form validation patterns) to historical documentation
- **FR-5.2**: Consolidate extensive testing patterns into dedicated testing guide
- **FR-5.3**: Archive outdated or superseded information
- **FR-5.4**: Create summary sections with links to detailed documentation

## Non-Goals (Out of Scope)

- **Not creating entirely new documentation content** - focus is on restructuring existing information
- **Not changing the underlying project architecture** - documentation restructure only
- **Not modifying actual code patterns** - only the documentation of those patterns
- **Not creating automated documentation generation** - manual template-based approach is sufficient
- **Not supporting additional AI assistants beyond Copilot and Gemini** - can be added later

## Design Considerations

### Proposed File Structure

```text
.github/
├── instructions/
│   ├── README.md (updated index with workflow routing)
│   ├── create-prd.instructions.md (existing, enhanced)
│   ├── generate-tasks.instructions.md (existing, enhanced)
│   ├── process-tasks-list.instructions.md (existing, enhanced)
│   ├── development.instructions.md (new)
│   ├── testing.instructions.md (new)
│   ├── debugging.instructions.md (new)
│   ├── deployment.instructions.md (new)
│   └── maintenance.instructions.md (new)
└── copilot-instructions.md (comprehensive router + all content)

docs/
├── testing/
│   ├── testing-patterns.md (migrated from current docs)
│   └── api-testing-guide.md (consolidated testing info)
└── historical/
    ├── completed-tasks/ (archived Tasks 1.8, 1.9, etc.)
    └── superseded-docs/ (old documentation versions)

GEMINI.md (root level - lightweight reference to .github/copilot-instructions.md)
README.md (existing, referenced by instructions)
tasks/ (existing, referenced by instructions)
```

### Routing Logic in copilot-instructions.md

The main instruction file will include decision trees like:

```markdown
## When to Use Specialized Instructions

**For Feature Development**: Use `.github/instructions/create-prd.instructions.md` → `generate-tasks.instructions.md` → `process-tasks-list.instructions.md`

**For Code Development**: Use `.github/instructions/development.instructions.md`
- New components, pages, API routes
- Architecture pattern implementation
- Integration with Supabase, Clerk, Flagsmith

**For Testing**: Use `.github/instructions/testing.instructions.md`
- Unit tests, integration tests, E2E tests
- API testing patterns, mocking strategies

**For Problem Solving**: Use `.github/instructions/debugging.instructions.md`
- Error resolution, performance issues
- Build failures, deployment problems
```

### GEMINI.md Structure

```markdown
# Gemini CLI Instructions - Peña Bética Escocesa

## Quick Start
This file serves as a Gemini-specific overlay for the main instructions.

**Primary Instructions**: See [.github/copilot-instructions.md](.github/copilot-instructions.md) for comprehensive guidance.

## Gemini-Specific Features
- MCP Server Configuration: [Link to relevant section in .github/copilot-instructions.md]
- CLI-Specific Workflows: [Link to relevant section in .github/copilot-instructions.md]
- Extended Tool Integration: [Link to relevant section in .github/copilot-instructions.md]

## When This File Differs
This file only contains information that is specific to Gemini CLI and not applicable to GitHub Copilot.
```

## Technical Considerations

### Implementation Approach
- **Incremental Migration**: Start with creating new structure, then migrate content piece by piece
- **Validation**: Use markdown linting and link checking to maintain quality
- **Version Control**: Keep old files during transition for rollback capability
- **Testing**: Validate with both AI assistants during restructure

### Maintenance Strategy

- **Continuous Improvement**: Update instructions and documentation immediately when new learnings appear
- **Decision Flow Integration**: Use routing logic to determine which instruction file to update based on the type of learning
- **Template Enforcement**: Use templates for new documentation sections
- **Cross-Reference Validation**: Regular checks for broken internal links

### Integration Points
- **Existing ADR System**: Reference existing Architecture Decision Records
- **Storybook Documentation**: Link to component documentation
- **CI/CD Pipeline**: Integrate documentation validation into build process

## Success Metrics

### Quantitative Metrics

- **Reduce documentation maintenance**: Target 50% reduction in time to update instruction content
- **Improve workflow clarity**: Each development scenario should point to exactly one instruction file
- **Eliminate duplication**: Zero content overlap between main AI files and workflow instructions
- **Increase reference efficiency**: Enable finding relevant workflow within 15 seconds

### Qualitative Metrics

- **AI Assistant Effectiveness**: Both Copilot and Gemini provide consistent, workflow-appropriate guidance
- **Developer Experience**: Clear routing to appropriate instructions for any development task
- **Content Freshness**: Workflow instructions reference live documentation rather than stale copies
- **Maintenance Efficiency**: Updates to patterns/workflows require changes in only one place

### Validation Criteria

- All workflow instructions properly reference existing `/docs` and `/tasks` content
- No conflicting information between any instruction files
- `GEMINI.md` successfully serves as lightweight overlay without content duplication
- New developers can identify correct workflow instruction within first interaction
- Existing documentation in `/docs` and `/tasks` remains authoritative source

---

**Target Implementation Schedule**: 2-3 weeks  
**Primary Stakeholders**: Development team, AI assistant users  
**Success Dependencies**: Content audit of existing files, validation of routing logic, integration testing with both AI assistants
