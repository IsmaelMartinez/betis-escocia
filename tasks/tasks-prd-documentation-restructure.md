# Task List: AI Assistant Documentation Restructure

*Generated from: `prd-documentation-restructure.md`*

## Relevant Files

- `.github/copilot-instructions.md` - Main AI instruction router containing all critical patterns and routing logic
- `.github/instructions/development.instructions.md` - New workflow instruction file for code development patterns
- `.github/instructions/testing.instructions.md` - New workflow instruction file for testing patterns and strategies
- `.github/instructions/debugging.instructions.md` - New workflow instruction file for problem-solving and error resolution
- `.github/instructions/deployment.instructions.md` - New workflow instruction file for build and deployment workflows
- `.github/instructions/maintenance.instructions.md` - New workflow instruction file for refactoring and dependency management
- `.github/instructions/README.md` - Updated index with workflow routing guidance
- `GEMINI.md` - Lightweight reference layer pointing to copilot-instructions.md
- `docs/testing/testing-patterns.md` - Consolidated testing patterns migrated from current documentation
- `docs/testing/api-testing-guide.md` - API testing guide with comprehensive patterns
- `docs/historical/superseded-docs/` - Directory for old documentation versions

### Notes

- This restructure focuses on organizing existing content rather than creating new documentation
- All workflow instruction files should reference existing `/docs` and `/tasks` content instead of duplicating it
- Maintain version control during migration by keeping old files until restructure is validated
- Test with both GitHub Copilot and Google Gemini CLI during implementation
- Upon completion: Move `prd-documentation-restructure.md` → `docs/historical/implemented-prds/`
- Upon completion: Move `tasks-prd-documentation-restructure.md` → `docs/historical/completed-tasks/`

## Tasks

- [ ] 1.0 Audit and Archive Current Documentation
  - [ ] 1.1 Create backup copies of current `.github/copilot-instructions.md` and `GEMINI.md`
  - [ ] 1.2 Analyze content overlap between current documentation files
  - [ ] 1.3 Identify completed sections in `GEMINI.md` (Tasks 1.8, 1.9, form validation patterns) for migration
  - [ ] 1.4 Create `docs/historical/superseded-docs/` directory for version control during migration
  - [ ] 1.5 Document current file sizes and structure for comparison metrics

- [ ] 2.0 Create Workflow-Specific Instruction Files
  - [ ] 2.1 Create template structure for workflow instruction files with update guidelines
  - [ ] 2.2 Create `.github/instructions/development.instructions.md` for code development patterns
    - [ ] 2.2.1 Extract architecture patterns from current copilot-instructions.md
    - [ ] 2.2.2 Add references to `/docs/adr/` for architectural decisions
    - [ ] 2.2.3 Include Supabase, Clerk, and Flagsmith integration patterns
    - [ ] 2.2.4 Reference component development patterns from existing documentation
  - [ ] 2.3 Create `.github/instructions/testing.instructions.md` for testing patterns
    - [ ] 2.3.1 Extract Jest configuration and ES module handling patterns
    - [ ] 2.3.2 Include API testing patterns and mocking strategies
    - [ ] 2.3.3 Reference existing testing examples in `/tests/` directory
    - [ ] 2.3.4 Add Playwright E2E testing guidance
  - [ ] 2.4 Create `.github/instructions/debugging.instructions.md` for problem-solving
    - [ ] 2.4.1 Extract common pitfalls section from current documentation
    - [ ] 2.4.2 Include error resolution patterns for Clerk, Supabase, and build issues
    - [ ] 2.4.3 Reference troubleshooting sections in existing documentation
  - [ ] 2.5 Create `.github/instructions/deployment.instructions.md` for CI/CD workflows
    - [ ] 2.5.1 Reference GitHub Actions workflows in `.github/workflows/`
    - [ ] 2.5.2 Include Vercel deployment patterns
    - [ ] 2.5.3 Add environment setup and validation steps
  - [ ] 2.6 Create `.github/instructions/maintenance.instructions.md` for refactoring patterns
    - [ ] 2.6.1 Include dependency management guidelines
    - [ ] 2.6.2 Reference documentation update procedures
    - [ ] 2.6.3 Add code cleanup and optimization patterns

- [ ] 3.0 Restructure Main AI Instruction Files
  - [ ] 3.1 Transform `.github/copilot-instructions.md` into comprehensive router
    - [ ] 3.1.1 Create routing decision tree for workflow selection
    - [ ] 3.1.2 Consolidate critical quick reference sections
    - [ ] 3.1.3 Add links to specialized workflow instruction files
    - [ ] 3.1.4 Include decision flow guidance for updating instructions
    - [ ] 3.1.5 Remove duplicated content that now exists in workflow files
  - [ ] 3.2 Streamline `GEMINI.md` as lightweight reference layer
    - [ ] 3.2.1 Remove duplicated content from copilot-instructions.md
    - [ ] 3.2.2 Keep only Gemini-specific features (MCP servers, CLI workflows)
    - [ ] 3.2.3 Add clear references to sections in copilot-instructions.md
    - [ ] 3.2.4 Maintain MCP server configuration documentation
  - [ ] 3.3 Update `.github/instructions/README.md` with workflow routing index
    - [ ] 3.3.1 Create overview of all workflow instruction files
    - [ ] 3.3.2 Add decision matrix for selecting appropriate workflow
    - [ ] 3.3.3 Include integration with existing create-prd → generate-tasks → process-tasks workflow

- [ ] 4.0 Consolidate and Migrate Testing Documentation
  - [ ] 4.1 Create `docs/testing/` directory structure
  - [ ] 4.2 Create `docs/testing/testing-patterns.md` from current documentation
    - [ ] 4.2.1 Migrate comprehensive test implementation patterns from `GEMINI.md`
    - [ ] 4.2.2 Include ES module handling and mocking strategies
    - [ ] 4.2.3 Add form validation testing patterns
    - [ ] 4.2.4 Reference specific test files in project for examples
  - [ ] 4.3 Create `docs/testing/api-testing-guide.md`
    - [ ] 4.3.1 Consolidate API route testing patterns
    - [ ] 4.3.2 Include webhook testing patterns for Clerk integration
    - [ ] 4.3.3 Add security function mocking best practices
    - [ ] 4.3.4 Reference actual test files for implementation examples

- [ ] 5.0 Validate and Test New Documentation Structure
  - [ ] 5.1 Test routing logic with sample development scenarios
    - [ ] 5.1.1 Validate feature development workflow (PRD → tasks → implementation)
    - [ ] 5.1.2 Test code development workflow routing
    - [ ] 5.1.3 Verify testing workflow instructions work with actual test scenarios
    - [ ] 5.1.4 Test debugging workflow with real error scenarios
  - [ ] 5.2 Validate cross-references and links
    - [ ] 5.2.1 Check all internal links between instruction files
    - [ ] 5.2.2 Verify references to `/docs/` and `/tasks/` content are accurate
    - [ ] 5.2.3 Test links from GEMINI.md to copilot-instructions.md sections
  - [ ] 5.3 Test with both AI assistants
    - [ ] 5.3.1 Validate GitHub Copilot can follow workflow routing logic
    - [ ] 5.3.2 Test Gemini CLI integration with MCP server documentation
    - [ ] 5.3.3 Verify both assistants provide consistent guidance
  - [ ] 5.4 Measure success metrics
    - [ ] 5.4.1 Compare documentation line counts before and after restructure
    - [ ] 5.4.2 Verify zero content duplication between main AI files and workflow instructions
    - [ ] 5.4.3 Test time to find relevant workflow instructions (target: 15 seconds)
    - [ ] 5.4.4 Document any remaining issues or improvements needed
