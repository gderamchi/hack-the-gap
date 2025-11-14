# universal blackbox guidelines

## file maintenance

* keep the project context document updated after every change.
* update architecture, feature lists, known issues, and recent changes when code changes.
* remove confidential files before pushing.
* commit frequently with clear messages.

## version control

* use clear, descriptive commit messages.
* push after every meaningful change.
* never ignore core source directories.

## environment variables

* store all secrets in environment files.
* never hardcode api keys.
* keep example env files updated.

## code practices

* respect naming conventions.
* separate ui, state, services, and data layers.
* isolate business logic from ui.
* use a unified error handling pattern.
* avoid duplicating logic.

## state management

* use a single state management pattern consistently.
* always notify observers after state changes.
* avoid storing ui-specific logic in state classes.

## feature development flow

* break large tasks into phases.
* complete phases sequentially.
* test after each phase.
* commit after each completed phase.
* document changes in the context file.

## subagent strategy

* use parallel subagents for independent subtasks.
* ensure no interdependencies before spawning subagents.
* define each subtask clearly.
* integrate and test after all subagents finish.

## documentation discipline

* update all related docs when adding or modifying features.
* keep a changelog of updates.
* ensure setup guides match the current architecture.

## security rules

* isolate all user data.
* validate all fields.
* protect immutable fields.
* validate file types and sizes.
* never deploy rules without testing.

## api usage

* centralize api interactions through services.
* handle errors gracefully.
* avoid redundant network calls.

## navigation and ux

* use consistent navigation patterns.
* ensure platform-consistent gestures.
* avoid blocking native gestures.

## performance

* remove unused assets.
* clean build caches when needed.
* avoid heavy operations on the main thread.

## testing

* maintain unit, widget, and integration tests.
* run static analysis regularly.
* test all flows after major changes.

## storage and file handling

* validate filenames, types, and sizes.
* respect user scope isolation.
* ensure cleanup routines exist for temporary files.

## error handling

* use a unified error result type.
* log errors clearly for debugging.
* surface clean, user-friendly messages.

## scalability

* design services stateless where possible.
* cache repeated expensive computations.
* isolate heavy logic for easy refactoring.

## task management

* break complex user requests into explicit phases.
* run phases sequentially.
* only proceed when previous work is validated.

## commit discipline

* commit only working states.
* avoid large, mixed commits.
* include documentation updates in the same commit.

## general constraints

* never introduce hardcoded secrets.
* never add architecture-breaking shortcuts.
* always keep documentation aligned with reality.
* keep the project context file as a single source of truth.
