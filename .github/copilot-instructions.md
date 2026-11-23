# Jekyll MCP VS Code Extension

## Build and validation

- Install dependencies with `npm install`.
- Compile TypeScript to `out/`: `npm run compile`
- Keep TypeScript compiling during development: `npm run watch`
- The extension entrypoint is `out/extension.js`, so run the compile step before launching or packaging the extension.
- There is currently no test runner, test script, linter, formatter, or packaging script. Do not report a test or lint command that does not exist.
- Run `npm run compile` as the repository's available validation check.

## Architecture

- This is a VS Code extension with one implementation file, `src/extension.ts`, and a CommonJS TypeScript build targeting ES2022.
- `package.json` contributes two commands:
  - `jekyll-mcp.restart`
  - `jekyll-mcp.showLogs`
- The extension activates on `onStartupFinished`.
- `activate()` creates the `Jekyll MCP` output channel and status bar item, registers commands, and starts the MCP server.
- The server is not implemented in this repository. `startServer()` launches `npx -y jekyll-component-mcp@1.5.0 --root <workspace-root>` through `StdioClientTransport`.
- It connects with `@modelcontextprotocol/sdk`'s `Client`, calls `listTools()`, and dynamically registers each remote tool with VS Code's Language Model Tools API.
- Registered VS Code tool names are prefixed with `jekyll_` plus the original MCP tool name. For example, MCP tool `jekyll_build` is exposed as `jekyll_jekyll_build`; `callTool()` receives the original MCP tool name.
- Tool results are converted from MCP content arrays to newline-separated text and returned as `vscode.LanguageModelTextPart` values.
- The status bar and output channel provide the primary user-facing lifecycle feedback.

## Copilot guidance for Jekyll beginners

The extension connects Copilot to `jekyll-component-mcp`, an MCP server for inspecting, creating, validating, and building Jekyll components. `thicket-ui` is a Liquid/SCSS/JavaScript component framework for Jekyll. Treat the user's open workspace as the site root; do not assume every Jekyll site uses Thicket.

- Respond in Indonesian when the user writes in Indonesian; otherwise follow the user's language. Assume the user may be new to Jekyll, Liquid, SCSS, npm, and MCP. Explain unfamiliar terms briefly and use short, numbered steps for setup or troubleshooting.
- Use the currently available MCP tools and their descriptions rather than guessing tool names or arguments. The extension discovers tools at runtime and prefixes exposed names with `jekyll_`; the package's original tool names may already start with `jekyll_`.
- For a Jekyll task, first inspect the project with `jekyll_project_info`; use `jekyll_project_scan` when you need to locate files or understand the site's structure. Inspect the existing component, include, layout, styles, or configuration before proposing or changing it. Follow the actual project paths and conventions instead of assuming default directories.
- For a new reusable component, prefer the package's component creation tool over hand-writing separate files. Preview its `dry_run` and diffs first, explain which files will change, then apply only the requested change. Afterward validate the component and, when Ruby/Bundler/Jekyll are available, build the site. Report warnings and failures plainly; never claim an unconfirmed change or build succeeded.
- For an existing Thicket UI site, confirm its structure before using Thicket-specific conventions. The MCP recognizes a Thicket-style SCSS setup when its configured SCSS root contains both `_framework.scss` and `_tokens.scss`. Preserve the site's existing Liquid include API and documented parameters; generated component classes use the `c-` prefix and SCSS is registered with `@use "components/<name>";` in `_framework.scss` when the supported entry point is present.
- Prefer Thicket's existing Liquid includes and design tokens over a new dependency or a parallel component system. Use semantic HTML, accessible labels and keyboard behavior, and preserve the site's `baseurl`-aware links. Do not replace framework entry points, global JavaScript initialization, or theme tokens wholesale.
- Explain the difference between the tools: `jekyll-component-mcp` is the MCP server the extension runs with `npx` (Node.js 20+); it is not the Jekyll theme. `thicket-ui` is the Jekyll component framework. Jekyll builds require the site's Ruby, Bundler, and Jekyll setup; do not treat an unavailable build environment as a successful validation.
- Do not install or upgrade packages, change MCP write modes, or perform destructive actions unless the user asks. Keep the MCP server's safe-write defaults and confirmation requirements; preview supported writes and require explicit user intent for deletes.
- Use the official references when package behavior or component APIs are unclear: [jekyll-component-mcp](https://www.npmjs.com/package/jekyll-component-mcp), [Thicket UI on npm](https://www.npmjs.com/package/thicket-ui), [Thicket UI documentation](https://daffadevhosting.github.io/jekyll-component-framework/docs/), and [MCP agent instructions](https://unpkg.com/jekyll-component-mcp@latest/skills/SKILL.md). Prefer the project's installed version and source files when they differ from the latest online documentation.

## Repository conventions

- Use strict TypeScript settings and retain explicit `unknown` handling for caught errors.
- `startServer()` is workspace-dependent and uses only the first entry in `vscode.workspace.workspaceFolders`.
- Server startup failures are expected to be surfaced in the status bar and `Jekyll MCP` output channel rather than thrown to the activation caller.
- Keep dynamic tool lifecycle cleanup centralized:
  - dispose all VS Code tools in `toolDisposables` before closing or restarting;
  - close `mcpClient` and set it back to `null`;
  - restart by stopping first and starting again with the extension context.
- Preserve the MCP package's dynamic discovery model: new or removed tools should be reflected by reconnecting or restarting, rather than by hard-coding tool registrations in `package.json` or source.
- The MCP server is resolved via `npx` at runtime and pinned to `jekyll-component-mcp@1.5.0`; keep the runtime version consistent with the README unless intentionally updating the supported server version.
- Keep `out/` and `node_modules/` generated rather than editing or committing build artifacts; source changes belong in `src/`.
