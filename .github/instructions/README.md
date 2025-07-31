# AI Dev Tasks Workflow Index

Welcome to the AI Dev Tasks workflow index! This document serves as a central guide to help you navigate the various AI-assisted development workflows available in this project. By leveraging these structured instructions, you can systematically approach different software engineering tasks, from feature development to debugging and maintenance.

## Workflow Overview

This project utilizes a set of specialized instruction files to guide AI agents through specific development processes. Each workflow is designed to provide clear guidelines, relevant file references, and best practices for efficient and effective task completion.

## Workflow Selection Guide

To select the appropriate workflow, identify the primary nature of your current task:

- **Development**: For writing new code, implementing features, or making significant code changes.
  - **Reference**: `@.github/instructions/development.instructions.md`

- **Testing**: For writing tests (unit, integration, E2E), understanding testing patterns, or debugging test failures.
  - **Reference**: `@.github/instructions/testing.instructions.md`

- **Debugging**: For identifying and resolving issues, understanding common pitfalls, or troubleshooting errors.
  - **Reference**: `@.github/instructions/debugging.instructions.md`

- **Deployment**: For managing CI/CD pipelines, deploying applications, or configuring environment variables.
  - **Reference**: `@.github/instructions/deployment.instructions.md`

- **Maintenance**: For refactoring code, managing dependencies, optimizing performance, or updating documentation.
  - **Reference**: `@.github/instructions/maintenance.instructions.md`

## Structured Feature Development Workflow

For systematic feature development with AI assistance, follow this structured workflow:

1.  **Create a Product Requirement Document (PRD)**:
    -   Generate a clear blueprint for your feature, outlining what needs to be built, for whom, and why.
    -   **Reference**: `@.github/instructions/create-prd.instructions.md`

2.  **Generate Your Task List from the PRD**:
    -   Break down your PRD into a detailed, step-by-step implementation plan.
    -   **Reference**: `@.github/instructions/generate-tasks.instructions.md`

3.  **Implement Tasks Systematically**:
    -   Work through the generated task list one sub-task at a time, with built-in checkpoints for review and approval.
    -   **Reference**: `@.github/instructions/process-tasks-list.instructions.md`

## How to Use

To initiate a workflow, simply reference the relevant instruction file in your prompt to the AI agent (e.g., `Please help me with a development task using @.github/instructions/development.instructions.md`). The AI will then follow the guidelines outlined in that document.

This structured approach helps ensure the AI stays on track, makes it easier to manage complex tasks, and provides a clear overview of the development process.