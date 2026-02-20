# CLAUDE.md

## Project Overview

A vanilla single-page canvas game. No libraries, no build tools, no frameworks.

## File Structure

- `index.html` — HTML only (structure, links to CSS/JS)
- `style.css` — All CSS styles
- `script.js` — All JavaScript logic (canvas rendering, game state, input handling)

## Conventions

- **No libraries or frameworks** — everything is vanilla HTML, CSS, and JS.
- **Separation of concerns** — HTML in `index.html`, styles in `style.css`, logic in `script.js`.
- **Canvas-based rendering** — the game draws on a `<canvas>` element. No DOM-based UI elements for game visuals.
- **Constants at the top** — declare tuning values (sizes, colors, ratios) as constants at the top of `script.js`.
- **Responsive** — the canvas fills the viewport and redraws on resize.

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
- **Root Cause Fixes**: If a bug exists, identify and fix the root cause. Do not apply temporary or partial fixes.
- **Async Patterns**: Prefer `async` and `await` over `Promise` and `then` calls.
- **UI/UX**: Always use the `frontend-design` skill when changing the UI.

## Verification

- **Mental Execution**: Before finalizing your response, simulate the code path mentally and identify edge cases, failure modes, and race conditions.
- **Code Review Policy**: After completing all code changes for a task, and before responding to the user, run /review-code.
- **Lint**: After editing code, run `npm run lint -- --fix` and fix any remaining errors before considering the task complete.
- **Maintenance**: Always check if the file `CLAUDE.md` is up-to-date after making changes. If not, update it accordingly.
