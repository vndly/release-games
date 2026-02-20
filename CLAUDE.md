# CLAUDE.md

# Critical Instructions

## Planning

- **Context First**: Before proposing any change, read and understand the problem and all relevant files. If a file or path is referenced, you MUST open and inspect it. Do not speculate.
- **Ambiguity Handling**: If any requirement is infeasible, ambiguous, risky, or unclear, state your assumptions explicitly and ask for confirmation before proceeding. If ambiguity, risk, or rule violations remain, refuse to proceed and explain why.
- **Plan & Pause**: Propose a clear, step-by-step plan before making any code changes. Stop after planning and proceed only after I verify.

## Implementation

- **Strict Scope**: Stick to the requested task. Do not add features, refactor, optimize, rename, rewrite, or reorganize code beyond what was explicitly requested or strictly necessary for correctness. Do not design for hypothetical future requirements.
- **Analytical Rigor**: Thoroughly review the codebase for relevant facts, styles, conventions, and abstractions. Before implementation, clearly identify what will change and what will remain untouched.
- **Minimalist Approach**: Prioritize extreme simplicity. Impact only the code strictly necessary for the task to avoid complexity and prevent breaking existing functionality.
- **Maintainability Check**: Ensure the solution is readable, consistent, maintainable, simple, robust, and strictly follows the requested requirements.
- **Centralized Constants**: Declare numeric balancing values (costs, rates, formulas, initial state) in `src/js/engine/balancing.js` and structural constants (class maps, enums, sets, factory functions) in `src/js/engine/constants.js`. Do not hardcode values directly in other files.
- **Asset Paths**: All image paths from `public/` are centralized in `src/js/engine/assets.js`. This file is auto-generated — run `npm run generate-assets` after adding or removing files in `public/`. Do not edit `assets.js` manually.
- **Localization**: All user-facing text goes in every locale file under `src/js/i18n/`. Use the `t(key)` helper to reference strings. Keys use flat dot-notation with lowerCamelCase segments (e.g. `'resource.idleWorkers'`).
- **Imports**: Always use the `@` path alias (mapped to `src/`) for imports. Do not use relative paths (`./`, `../`).
- **Shared Styles**: When a CSS rule or value is repeated across `.vue` files, extract it into `src/assets/styles.css` (as a CSS variable, shared class, or both). Component-specific overrides stay in scoped `<style>` blocks.
- **Root Cause Fixes**: If a bug exists, identify and fix the root cause. Do not apply temporary or partial fixes.
- **Async Patterns**: Prefer `async` and `await` over `Promise` and `then` calls.
- **UI/UX**: Always use the `frontend-design` skill when changing the UI.

## Verification

- **Mental Execution**: Before finalizing your response, simulate the code path mentally and identify edge cases, failure modes, and race conditions.
- **Code Review Policy**: After completing all code changes for a task, and before responding to the user, run /review-code.
- **Lint**: After editing code, run `npm run lint -- --fix` and fix any remaining errors before considering the task complete.
- **Maintenance**: Always check if the files `CLAUDE.md`, `docs/architecture.md`, and `docs/specs.md` are up-to-date after making changes. If not, update them accordingly.
