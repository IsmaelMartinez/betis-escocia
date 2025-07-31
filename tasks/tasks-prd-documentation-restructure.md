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

- [x] 1.0 Audit and Archive Current Documentation
  - [x] 1.1 Create backup copies of current `.github/copilot-instructions.md` and `GEMINI.md`
  - [x] 1.2 Analyze content overlap between current documentation files
  - [x] 1.3 Create `docs/historical/superseded-docs/` directory for version control during migration
  - [x] 1.4 Document current file sizes and structure for comparison metrics

- [x] 2.0 Create Workflow-Specific Instruction Files
  - [x] 2.1 Create template structure for workflow instruction files with update guidelines
  - [x] 2.2 Create `.github/instructions/development.instructions.md` for code development patterns
    - [x] 2.2.1 Extract architecture patterns from current copilot-instructions.md
    - [x] 2.2.2 Add references to `/docs/adr/` for architectural decisions
    - [x] 2.2.3 Include Supabase, Clerk, and Flagsmith integration patterns
    - [x] 2.2.4 Reference component development patterns from existing documentation
  - [x] 2.3 Create `.github/instructions/testing.instructions.md` for testing patterns
    - [x] 2.3.1 Extract Jest configuration and ES module handling patterns
    - [x] 2.3.2 Include API testing patterns and mocking strategies
    - [x] 2.3.3 Reference existing testing examples in `/tests/` directory
    - [x] 2.3.4 Add Playwright E2E testing guidance
  - [x] 2.4 Create `.github/instructions/debugging.instructions.md` for problem-solving
    - [x] 2.4.1 Extract common pitfalls section from current documentation
    - [x] 2.4.2 Include error resolution patterns for Clerk, Supabase, and build issues
    - [x] 2.4.3 Reference troubleshooting sections in existing documentation
  - [x] 2.5 Create `.github/instructions/deployment.instructions.md` for CI/CD workflows
    - [x] 2.5.1 Reference GitHub Actions workflows in `.github/workflows/`
    - [x] 2.5.2 Include Vercel deployment patterns
    - [x] 2.5.3 Add environment setup and validation steps
  - [x] 2.6 Create `.github/instructions/maintenance.instructions.md` for refactoring patterns
    - [x] 2.6.1 Include dependency management guidelines
    - [x] 2.6.2 Reference documentation update procedures
    - [x] 2.6.3 Add code cleanup and optimization patterns

- [x] 3.0 Restructure Main AI Instruction Files
  - [x] 3.1 Transform `.github/copilot-instructions.md` into comprehensive router
    - [x] 3.1.1 Create routing decision tree for workflow selection
    - [x] 3.1.2 Consolidate critical quick reference sections
    - [x] 3.1.3 Add links to specialized workflow instruction files
    - [x] 3.1.4 Include decision flow guidance for updating instructions
    - [x] 3.1.5 Remove duplicated content that now exists in workflow files
  - [x] 3.2 Streamline `GEMINI.md` as lightweight reference layer
    - [x] 3.2.1 Remove duplicated content from copilot-instructions.md
    - [x] 3.2.2 Keep only Gemini-specific features (MCP servers, CLI workflows)
    - [x] 3.2.3 Add clear references to sections in copilot-instructions.md
    - [x] 3.2.4 Maintain MCP server configuration documentation
  - [x] 3.3 Update `.github/instructions/README.md` with workflow routing index
    - [x] 3.3.1 Create overview of all workflow instruction files
    - [x] 3.3.2 Add decision matrix for selecting appropriate workflow
    - [x] 3.3.3 Include integration with existing create-prd → generate-tasks → process-tasks workflow

- [x] 4.0 Consolidate and Migrate Testing Documentation
  - [x] 4.1 Create `docs/testing/` directory structure
  - [x] 4.2 Create `docs/testing/testing-patterns.md` from current documentation
    - [x] 4.2.1 Migrate comprehensive test implementation patterns from `GEMINI.md`
    - [x] 4.2.2 Include ES module handling and mocking strategies
    - [x] 4.2.3 Add form validation testing patterns
    - [x] 4.2.4 Reference specific test files in project for examples
  - [x] 4.3 Create `docs/testing/api-testing-guide.md`
    - [x] 4.3.1 Consolidate API route testing patterns
    - [x] 4.3.2 Include webhook testing patterns for Clerk integration
    - [x] 4.3.3 Add security function mocking best practices
    - [x] 4.3.4 Reference actual test files for implementation examples

- [ ] 5.0 Validate and Test New Documentation Structure
  - [ ] 5.1 Test routing logic with sample development scenarios
    - [ ] 5.1.1 Validate feature development workflow (PRD → tasks → implementation)
    - [ ] 5.1.2 Test code development workflow routing
    - [ ] 5.1.3 Verify testing workflow instructions work with actual test scenarios
    - [ ] 5.1.4 Test debugging workflow with real error scenarios
  - [ ] 5.2 Validate cross-references and links
    - [x] 5.2.1 Check all internal links between instruction files
    - [x] 5.2.2 Verify references to `/docs/` and `/tasks/` content are accurate
    - [x] 5.2.3 Test links from GEMINI.md to copilot-instructions.md sections
  - [ ] 5.3 Test with both AI assistants
    - [x] 5.3.1 Validate GitHub Copilot can follow workflow routing logic
    - [x] 5.3.2 Test Gemini CLI integration with MCP server documentation
    - [x] 5.3.3 Verify both assistants provide consistent guidance
  - [ ] 5.4 Measure success metrics
    - [x] 5.4.1 Compare documentation line counts before and after restructure
    - [x] 5.4.2 Verify zero content duplication between main AI files and workflow instructions
    - [x] 5.4.3 Test time to find relevant workflow instructions (target: 15 seconds)
    - [x] 5.4.4 Document any remaining issues or improvements needed
