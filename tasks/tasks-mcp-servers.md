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

### Overall Progress: 0% COMPLETE

## ⚙️ PHASE 0: Initial Setup

### 0.0 Configure VSCode
- [ ] 0.0.1 Ensure VSCode is configured with recommended extensions and settings for the project (e.g., ESLint, Prettier, TypeScript, etc.).

## 🏗️ PHASE 1: Core Setup and Common Components

### 1.0 Project Scaffolding
- [ ] 1.1 Create a new directory for MCP servers (e.g., `mcp-servers/`).
- [ ] 1.2 Inside `mcp-servers/`, create subdirectories for each service (e.g., `github-mcp/`, `supabase-mcp/`, `clerk-mcp/`, `flagsmith-mcp/`).
- [ ] 1.3 Initialize a new Node.js/TypeScript project within each service subdirectory.
    - [ ] 1.3.1 `npm init -y`
    - [ ] 1.3.2 `npm install typescript @types/node`
    - [ ] 1.3.3 Configure `tsconfig.json`.

### 1.4 Implement Basic MCP Server Structure
- [ ] 1.4.1 For each MCP server, create a basic server file (e.g., `src/index.ts`) that can register and expose tools.
- [ ] 1.4.2 Define a simple tool registration mechanism.

### Relevant Files:
- `mcp-servers/` (new directory)
- `mcp-servers/github-mcp/package.json`
- `mcp-servers/github-mcp/tsconfig.json`
- `mcp-servers/github-mcp/src/index.ts`
- `mcp-servers/supabase-mcp/package.json`
- `mcp-servers/supabase-mcp/tsconfig.json`
- `mcp-servers/supabase-mcp/src/index.ts`
- `mcp-servers/clerk-mcp/package.json`
- `mcp-servers/clerk-mcp/tsconfig.json`
- `mcp-servers/clerk-mcp/src/index.ts`
- `mcp-servers/flagsmith-mcp/package.json`
- `mcp-servers/flagsmith-mcp/tsconfig.json`
- `mcp-servers/flagsmith-mcp/src/index.ts`

## 🗄️ PHASE 2: GitHub MCP Server Integration

### 2.0 GitHub Official MCP Server Setup
- [ ] 2.1 **Install GitHub CLI**: Ensure the GitHub CLI is installed and configured.
- [ ] 2.2 **Download/Clone Official GitHub MCP Server**: Obtain the official GitHub MCP server (e.g., from its GitHub repository).
- [ ] 2.3 **Configure GitHub MCP Server**:
    - [ ] 2.3.1 Set up environment variables for the GitHub MCP server (e.g., `GITHUB_TOKEN`).
    - [ ] 2.3.2 Configure any necessary authentication or API keys within the GitHub MCP server's configuration.
- [ ] 2.4 **Run GitHub MCP Server**: Start the GitHub MCP server, ensuring it's accessible by the Gemini CLI (e.g., running on a specific port).

### 2.5 Integrate GitHub MCP Server with Gemini CLI
- [ ] 2.5.1 Update `.gemini/settings.json` to include the GitHub MCP server configuration.
    - Example configuration:
    ```json
    {
      "mcpServers": {
        "githubMcp": {
          "httpUrl": "http://localhost:8081/mcp", // Replace with actual URL/port
          "timeout": 30000,
          "trust": false
        }
      }
    }
    ```
- [ ] 2.5.2 Verify that the Gemini CLI can discover and interact with the GitHub MCP server's tools.

### Relevant Files:
- `mcp-servers/github-mcp/` (new directory for official server, if cloned into project)
- `.gemini/settings.json` (modified file)
- GitHub MCP Server's own configuration files (e.g., `.env`, `config.json`)

## 🗄️ PHASE 3: Supabase Official MCP Server Integration

### 3.0 Supabase Official MCP Server Setup
- [ ] 3.1 **Install Supabase CLI**: Ensure the Supabase CLI is installed and configured.
- [ ] 3.2 **Download/Clone Official Supabase MCP Server**: Obtain the official Supabase MCP server (e.g., from its GitHub repository).
- [ ] 3.3 **Configure Supabase MCP Server**:
    - [ ] 3.3.1 Set up environment variables for the Supabase MCP server (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
    - [ ] 3.3.2 Configure any necessary database connection strings or API keys within the Supabase MCP server's configuration.
- [ ] 3.4 **Run Supabase MCP Server**: Start the Supabase MCP server, ensuring it's accessible by the Gemini CLI (e.g., running on a specific port).

### 3.5 Integrate Supabase MCP Server with Gemini CLI
- [ ] 3.5.1 Update `.gemini/settings.json` to include the Supabase MCP server configuration.
    - Example configuration:
    ```json
    {
      "mcpServers": {
        "supabaseMcp": {
          "httpUrl": "http://localhost:8080/mcp", // Replace with actual URL/port
          "timeout": 30000,
          "trust": false
        }
      }
    }
    ```
- [ ] 3.5.2 Verify that the Gemini CLI can discover and interact with the Supabase MCP server's tools.

### Relevant Files:
- `mcp-servers/supabase-mcp/` (new directory for official server, if cloned into project)
- `.gemini/settings.json` (modified file)
- Supabase MCP Server's own configuration files (e.g., `.env`, `config.json`)
- `docs/adr/003-supabase-database.md` (for reference on Supabase setup)
- `docs/adr/006-clerk-supabase-jwt-integration.md` (for reference on Supabase credentials)
- `GEMINI.md` (will be updated with configuration details)
- `.github/instructions/create-prd.instructions.md` (will be updated with guidance)

## 🛡️ PHASE 4: Clerk MCP Server Implementation

### 4.0 Clerk Integration
- [ ] 4.1 Install Clerk SDK: `npm install @clerk/backend` (or relevant client-side SDK if preferred for read-only).
- [ ] 4.2 Configure Clerk client with credentials (e.g., `CLERK_SECRET_KEY`).

### 4.3 Expose Tools for Clerk Users
- [ ] 4.3.1 Create a tool to retrieve user information by `userId`.
- [ ] 4.3.2 Ensure the tool returns `userId`, `emailAddresses`, `firstName`, `lastName`, and `publicMetadata`.

### Relevant Files:
- `mcp-servers/clerk-mcp/src/index.ts`
- `mcp-servers/clerk-mcp/src/tools/clerk-user-reader.ts` (new file)

## 🏳️ PHASE 5: Flagsmith MCP Server Implementation

### 5.0 Flagsmith Integration
- [ ] 5.1 Install Flagsmith SDK: `npm install flagsmith`
- [ ] 5.2 Configure Flagsmith client with credentials (e.g., `FLAGSMITH_ENVIRONMENT_ID`).

### 5.3 Expose Tools for Flagsmith
- [ ] 5.3.1 Create a tool to check the status (`isEnabled`) and value of a specific feature flag by its `flagName`.

### Relevant Files:
- `mcp-servers/flagsmith-mcp/src/index.ts`
- `mcp-servers/flagsmith-mcp/src/tools/flagsmith-reader.ts` (new file)
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
