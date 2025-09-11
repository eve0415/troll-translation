# Implementation Plan: Apple Live Translation Meme Generator

**Branch**: `001-the-project-is` | **Date**: 2025-09-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/workspaces/troll-translation/specs/001-the-project-is/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
A web-based meme generator that creates Apple Live Translation style images with user-input text. Users enter left and right text, and the system generates high-quality images featuring black text on left, gradient text (purple-to-pink-to-red) on right, centered AirPods-like silhouette, on white background. Includes real-time preview, download functionality, X sharing, and Open Graph image generation for social media.

## Technical Context
**Language/Version**: TypeScript/JavaScript with Node.js runtime  
**Primary Dependencies**: TanStack Start (React SSR framework), Rolldown-Vite (build tool), Tailwind CSS, Satori (OG image generation)  
**Storage**: Stateless (no persistent storage - URL-based state)  
**Testing**: TanStack Start testing utilities, Vitest  
**Target Platform**: Cloudflare Workers (edge deployment)
**Project Type**: web - single-page application with frontend and backend integration  
**Performance Goals**: <100ms image generation, real-time text preview updates  
**Constraints**: License-safe fonts only, no Apple trademarks, mobile responsive, accessibility compliant  
**Scale/Scope**: Public web tool, viral sharing capability, Open Graph support

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (frontend SPA + edge functions - within limit)
- Using framework directly? (TanStack Start direct usage, minimal abstractions)
- Single data model? (Meme text state only - no DTOs needed)
- Avoiding patterns? (No Repository pattern - direct React state + URL params)

**Architecture**:
- EVERY feature as library? (Image generation, text processing, sharing utilities as libs)
- Libraries listed: 
  - meme-generator: Canvas-based image generation with Apple styling
  - text-processor: Input validation and formatting
  - share-utils: X integration and permalink generation
- CLI per library: (image-gen --text-left="Hi" --text-right="Salut" --output=image.png)
- Library docs: llms.txt format planned? (Yes, for each library)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (Yes, contract tests fail first)
- Git commits show tests before implementation? (Required workflow)
- Order: Contract→Integration→E2E→Unit strictly followed? (Yes)
- Real dependencies used? (Cloudflare Workers local dev environment)
- Integration tests for: Canvas API, Satori OG generation, X share API
- FORBIDDEN: Implementation before test, skipping RED phase (Enforced)

**Observability**:
- Structured logging included? (Console + Cloudflare Workers logs)
- Frontend logs → backend? (Client errors sent to edge functions)
- Error context sufficient? (User action context + technical details)

**Versioning**:
- Version number assigned? (1.0.0 for initial release)
- BUILD increments on every change? (Yes, automated via CI)
- Breaking changes handled? (URL schema versioning for backward compat)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Frontend React SPA + Backend Cloudflare Workers edge functions

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved
- [x] No complexity deviations (within constitutional limits)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*