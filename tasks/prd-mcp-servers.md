# PRD: Read-Only MCP Servers for Supabase, Clerk, and Flagsmith

## 1. Introduction/Overview

This PRD outlines the implementation of read-only Model Context Protocol (MCP) servers to expose data and status information from Supabase, Clerk, and Flagsmith to the Gemini CLI. The primary goal is to enhance the developer experience by providing quick and easy access to critical application data and configuration states directly from the command line.

## 2. Goals

*   Allow quick inspection of Supabase data (e.g., RSVPs, trivia questions).
*   Enable easy retrieval of Clerk user information.
*   Provide real-time status of Flagsmith feature flags.
*   Provide a simple and maintainable implementation for initial read-only access.

## 3. User Stories

*   **As a developer,** I want to quickly view the contents of Supabase tables (e.g., `rsvps`, `trivia_questions`) from the CLI so that I can debug or understand data states without leaving my terminal.
*   **As a developer,** I want to retrieve specific user information (e.g., email, name, metadata) from Clerk via the CLI so that I can quickly verify user details.
*   **As a developer,** I want to check the status and value of Flagsmith feature flags from the CLI so that I can verify feature configurations in real-time.

## 4. Functional Requirements

### General
1.  The system must provide separate MCP servers for Supabase, Clerk, and Flagsmith functionalities.
2.  Each MCP server must expose its functionalities as callable tools to the Gemini CLI.
3.  The implementation should prioritize simplicity and ease of maintenance for this initial read-only phase.

### Supabase MCP Server
1.  The Supabase MCP server must expose tools to read data from the following tables:
    *   `rsvps`
    *   `contact_submissions`
    *   `trivia_questions`
    *   `user_trivia_scores`
    *   `matches`
2.  The tools must allow basic querying (e.g., by ID or simple filters) to retrieve specific records or a list of records.

### Clerk MCP Server
1.  The Clerk MCP server must expose tools to retrieve user information.
2.  The tools must allow fetching user details based on `userId`.
3.  The retrieved user information must include:
    *   `userId`
    *   `emailAddresses`
    *   `firstName`
    *   `lastName`
    *   `publicMetadata`

### Flagsmith MCP Server
1.  The Flagsmith MCP server must expose tools to retrieve feature flag information.
2.  The tools must allow checking the status (`isEnabled`) and value of a specific feature flag by its `flagName`.

## 5. Non-Goals (Out of Scope)

*   Write, update, or delete operations for any of the integrated services (Supabase, Clerk, Flagsmith).
*   Complex filtering or advanced querying capabilities beyond basic lookups (e.g., joins, aggregations).
*   Implementing advanced authentication or authorization mechanisms within the MCP server itself; existing service security (e.g., Supabase RLS, Clerk API keys) will be relied upon.
*   Real-time streaming or long-lived connections beyond the scope of a single tool call.

## 6. Design Considerations

*   **Technology Stack:** Given the project's existing stack, the MCP servers should be implemented using Node.js/TypeScript.
*   **SDK Usage:** Leverage the existing `@supabase/supabase-js`, `@clerk/nextjs` (or `@clerk/backend`), and Flagsmith JavaScript SDKs.
*   **Error Handling:** Implement basic error handling to provide informative messages to the CLI user if a tool call fails.
*   **Configuration:** MCP server configurations (e.g., API keys, URLs) should be managed securely, likely via environment variables or `.gemini/settings.json`.

## 7. Technical Considerations

*   **Node.js/TypeScript Implementation:** Each MCP server will be a separate Node.js/TypeScript application that adheres to the Model Context Protocol.
*   **Tool Definition:** Each exposed functionality will require a clear tool definition (name, description, parameters, return type) for the Gemini CLI to understand and utilize.
*   **Security:** Ensure that API keys and sensitive information are handled securely and not exposed in the tool definitions or logs.

## 8. Success Metrics

*   The Gemini CLI can successfully call the exposed read-only tools for Supabase, Clerk, and Flagsmith.
*   The tools return accurate and expected data from the respective services.
*   The implementation is simple, easy to understand, and maintainable by developers familiar with the project's existing codebase.

## 9. Open Questions

*   What are the specific API keys or credentials required for each service that the MCP servers will need to access?
*   Are there any specific rate limits or usage quotas for the read-only operations that need to be considered during implementation?