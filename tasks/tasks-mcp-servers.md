## Task List: MCP Servers for GitHub, Supabase, Clerk, and Flagsmith

Generated from: `prd-read-only-mcp-servers.md`
Created: July 2025

## 🎯 PROJECT OVERVIEW

### Goal: Implement MCP servers to expose data and status from GitHub, Supabase, Clerk, and Flagsmith to the Gemini CLI.

### Key Requirements:
- Expose access to GitHub repository information and workflows.
- Expose access to specified Supabase tables.
- Expose access to Clerk user information.
- Expose access to Flagsmith feature flag status and values.
- Prioritize simplicity and ease of maintenance.

## 📊 PROGRESS TRACKING

### Overall Progress: 50% COMPLETE

## 🏗️ PHASE 1: Core Setup and Common Components

### 1.0 Project Scaffolding
- [x] 1.1 Create a new directory for MCP servers (`mcp-servers/`).
- [x] 1.2 Inside `mcp-servers/`, create subdirectories for each service (`clerk-mcp/`, `flagsmith-mcp/`). (Note: `github-mcp` and `supabase-mcp` are official MCP servers run via `npx`, not cloned projects).
- [x] 1.3 Initialize a new Node.js/TypeScript project within each service subdirectory.
    - [x] 1.3.1 `npm init -y`
    - [x] 1.3.2 `npm install typescript @types/node`
    - [x] 1.3.3 Configure `tsconfig.json`.

### 1.4 Implement Basic MCP Server Structure
- [x] 1.4.1 For each MCP server, create a basic server file (`src/index.ts`) that can register and expose tools.
- [x] 1.4.2 Define a simple tool registration mechanism.

### Relevant Files:
- `mcp-servers/` (new directory)
- `mcp-servers/clerk-mcp/package.json`
- `mcp-servers/clerk-mcp/tsconfig.json`
- `mcp-servers/clerk-mcp/src/index.ts`
- `mcp-servers/flagsmith-mcp/package.json`
- `mcp-servers/flagsmith-mcp/tsconfig.json`
- `mcp-servers/flagsmith-mcp/src/index.ts`

## 🗄️ PHASE 2: GitHub MCP Server Integration

### 2.0 GitHub Official MCP Server Setup
- [ ] 2.1 **Install GitHub CLI**: Ensure the GitHub CLI is installed and configured.
- [ ] 2.2 **Run Official GitHub MCP Server**: The GitHub MCP server is typically run directly via `npx` by the Gemini CLI.
- [ ] 2.3 **Configure GitHub MCP Server**: Set up environment variables for the GitHub MCP server (e.g., `GITHUB_TOKEN`).

### 2.4 Integrate GitHub MCP Server with Gemini CLI
- [ ] 2.4.1 Update `.gemini/settings.json` to include the GitHub MCP server configuration.
    - Example configuration:
    ```json
    {
      "mcpServers": {
        "githubMcp": {
          "command": "npx",
          "args": [
            "-y",
            "@github/mcp-server-github@latest",
            "--read-only",
            "--project-ref=<project-ref>"
          ],
          "env": {
            "GITHUB_TOKEN": "<personal-access-token>"
          }
        }
      }
    }
    ```
- [ ] 2.4.2 Verify that the Gemini CLI can discover and interact with the GitHub MCP server's tools.

### Relevant Files:
- `.gemini/settings.json` (modified file)

## 🗄️ PHASE 3: Supabase Official MCP Server Integration

### 3.0 Supabase Official MCP Server Setup
- [x] 3.1 **Install Supabase CLI**: Ensure the Supabase CLI is installed and configured.
- [ ] 3.2 **Run Official Supabase MCP Server**: The Supabase MCP server is typically run directly via `npx` by the Gemini CLI.
- [ ] 3.3 **Configure Supabase MCP Server**: Set up environment variables for the Supabase MCP server (e.g., `SUPABASE_ACCESS_TOKEN`).

### 3.4 Integrate Supabase MCP Server with Gemini CLI
- [ ] 3.4.1 Update `.gemini/settings.json` to include the Supabase MCP server configuration.
    - Example configuration:
    ```json
    {
      "mcpServers": {
        "supabaseMcp": {
          "command": "npx",
          "args": [
            "-y",
            "@supabase/mcp-server-supabase@latest",
            "--read-only",
            "--project-ref=<project-ref>"
          ],
          "env": {
            "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
          }
        }
      }
    }
    ```
- [ ] 3.4.2 Verify that the Gemini CLI can discover and interact with the Supabase MCP server's tools.

### Relevant Files:
- `.gemini/settings.json` (modified file)
- `docs/adr/003-supabase-database.md` (for reference on Supabase setup)
- `docs/adr/006-clerk-supabase-jwt-integration.md` (for reference on Supabase credentials)
- `GEMINI.md` (will be updated with configuration details)
- `.github/instructions/create-prd.instructions.md` (will be updated with guidance)

## 🛡️ PHASE 4: Clerk MCP Server Implementation

### 4.0 Clerk Integration
- [x] 4.1 Install Clerk SDK: `npm install @clerk/backend`.
- [x] 4.2 Configure Clerk client with credentials (e.g., `CLERK_SECRET_KEY`).

### 4.3 Expose Tools for Clerk Users
- [x] 4.3.1 Create a tool to retrieve user information by `userId`.
- [x] 4.3.2 Ensure the tool returns `userId`, `emailAddresses`, `firstName`, `lastName`, and `publicMetadata`.

### Relevant Files:
- `mcp-servers/clerk-mcp/src/index.ts`
- `mcp-servers/clerk-mcp/src/tools/clerk-user-reader.ts`

## 🏳️ PHASE 5: Flagsmith MCP Server Implementation

### 5.0 Flagsmith Integration
- [x] 5.1 Install Flagsmith SDK: `npm install flagsmith`.
- [x] 5.2 Configure Flagsmith client with credentials (e.g., `FLAGSMITH_ENVIRONMENT_ID`).

### 5.3 Expose Tools for Flagsmith
- [x] 5.3.1 Create a tool to check the status (`isEnabled`) and value of a specific feature flag by its `flagName`.

### Relevant Files:
- `mcp-servers/flagsmith-mcp/src/index.ts`
- `mcp-servers/flagsmith-mcp/src/tools/flagsmith-reader.ts`
- `src/lib/flagsmith/index.ts` (for reference on existing Flagsmith client usage)

## ✅ PHASE 6: Testing and Verification

### 6.0 Unit Testing
- [ ] 6.1 Write unit tests for each exposed MCP tool to ensure correct functionality and data retrieval.

### 6.2 Integration Testing (with Gemini CLI)
- [ ] 6.2.1 Configure `.gemini/settings.json` to include the newly created MCP servers.
- [ ] 6.2.2 Manually test each exposed tool from the Gemini CLI to verify it returns accurate data.
- [ ] 6.2.3 Verify error handling for invalid inputs or service failures.

### Relevant Files:
- `mcp-servers/*/src/index.test.ts` (new files)
- `.gemini/settings.json` (new or modified file)

## 📝 NOTES

- Ensure all API keys and sensitive information are handled securely (e.g., via environment variables).
- Start with the simplest possible implementation for each tool.
- Focus on implementing tools as per the PRD.
- Remember to compile TypeScript files (`tsc`) before running the Node.js applications.
