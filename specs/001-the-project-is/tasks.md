# Tasks: Apple Live Translation Meme Generator

**Input**: Design documents from `/workspaces/troll-translation/specs/001-the-project-is/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TanStack Start, React, TypeScript, Tailwind, Cloudflare Workers
   → Libraries: meme-generator, text-processor, share-utils
   → Structure: Option 2 (Web application) - Frontend + Backend
2. Load optional design documents:
   → data-model.md: 6 entities → model tasks
   → contracts/: 2 files → contract test tasks
   → research.md: TanStack Start + CF Workers → setup tasks
3. Generate tasks by category: Setup, Tests, Core, Integration, Polish
4. Apply task rules: Different files = [P], same file = sequential, TDD enforced
5. Number tasks sequentially (T001-T031)
6. Generate dependency graph and parallel execution examples
7. Validate task completeness: All requirements covered
8. Return: SUCCESS (31 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included in descriptions

## Path Conventions
Web application structure:
- **Frontend**: `/src/` (TanStack Start React app)
- **Backend**: `/functions/` (Cloudflare Workers edge functions)  
- **Libraries**: `/src/lib/` (reusable modules with CLI)
- **Tests**: `/tests/` (contract, integration, unit)

## Phase 3.1: Setup
- [ ] T001 Initialize TanStack Start project with TypeScript and Tailwind CSS
- [ ] T002 Configure Cloudflare Workers development environment with Wrangler
- [ ] T003 [P] Set up ESLint, Prettier, and TypeScript configuration
- [ ] T004 [P] Configure Vitest testing framework with browser testing support
- [ ] T005 Create project directory structure for libraries and functions

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Contract test GET / endpoint in tests/contract/test_main_page.ts
- [ ] T007 [P] Contract test GET /api/og-image endpoint in tests/contract/test_og_image.ts
- [ ] T008 [P] Contract test GET /api/health endpoint in tests/contract/test_health.ts
- [ ] T009 [P] Integration test meme generation flow in tests/integration/test_meme_generation.ts
- [ ] T010 [P] Integration test image download in tests/integration/test_image_download.ts
- [ ] T011 [P] Integration test X sharing in tests/integration/test_x_sharing.ts
- [ ] T012 [P] Integration test OG image generation in tests/integration/test_og_generation.ts

## Phase 3.3: Core Libraries (ONLY after tests are failing)
- [ ] T013 [P] MemeContent type definitions in src/lib/types/meme-content.ts
- [ ] T014 [P] ImageConfig type definitions in src/lib/types/image-config.ts
- [ ] T015 [P] Validation utilities in src/lib/text-processor/validation.ts
- [ ] T016 [P] Text processing CLI in src/lib/text-processor/cli.ts
- [ ] T017 [P] Canvas renderer in src/lib/meme-generator/canvas-renderer.ts
- [ ] T018 [P] Image generation service in src/lib/meme-generator/image-service.ts
- [ ] T019 [P] Meme generator CLI in src/lib/meme-generator/cli.ts
- [ ] T020 [P] URL utilities in src/lib/share-utils/url-utils.ts
- [ ] T021 [P] X sharing service in src/lib/share-utils/x-service.ts
- [ ] T022 [P] Share utilities CLI in src/lib/share-utils/cli.ts

## Phase 3.4: Frontend Components
- [ ] T023 React text input components in src/components/text-inputs.tsx
- [ ] T024 Canvas preview component in src/components/meme-preview.tsx  
- [ ] T025 Action buttons component in src/components/action-buttons.tsx
- [ ] T026 Main page component using all libraries in src/pages/index.tsx
- [ ] T027 Custom hooks for meme state management in src/hooks/use-meme-generator.ts

## Phase 3.5: Backend Functions
- [ ] T028 Main page handler in functions/index.ts
- [ ] T029 OG image generation handler in functions/api/og-image.ts
- [ ] T030 Health check handler in functions/api/health.ts

## Phase 3.6: Polish
- [ ] T031 [P] Run manual testing scenarios from quickstart.md

## Dependencies
**Critical Path**: Setup → Tests → Libraries → Components → Functions → Polish
- Tests (T006-T012) before any implementation (T013-T030)
- T013-T014 (types) before T015-T022 (library implementations)
- T015-T022 (libraries) before T023-T027 (components)
- T020-T022 (share utilities) before T028-T030 (backend functions)
- All implementation before T031 (manual testing)

## Parallel Execution Examples

### Contract Tests (can run simultaneously)
```bash
# Launch T006-T008 together:
Task: "Contract test GET / endpoint in tests/contract/test_main_page.ts"
Task: "Contract test GET /api/og-image endpoint in tests/contract/test_og_image.ts" 
Task: "Contract test GET /api/health endpoint in tests/contract/test_health.ts"
```

### Integration Tests (can run simultaneously)
```bash
# Launch T009-T012 together:
Task: "Integration test meme generation flow in tests/integration/test_meme_generation.ts"
Task: "Integration test image download in tests/integration/test_image_download.ts"
Task: "Integration test X sharing in tests/integration/test_x_sharing.ts"
Task: "Integration test OG image generation in tests/integration/test_og_generation.ts"
```

### Core Libraries (can run simultaneously)
```bash
# Launch T013-T022 together (all different files):
Task: "MemeContent type definitions in src/lib/types/meme-content.ts"
Task: "ImageConfig type definitions in src/lib/types/image-config.ts"
Task: "Validation utilities in src/lib/text-processor/validation.ts"
Task: "Text processing CLI in src/lib/text-processor/cli.ts"
Task: "Canvas renderer in src/lib/meme-generator/canvas-renderer.ts"
Task: "Image generation service in src/lib/meme-generator/image-service.ts"
Task: "Meme generator CLI in src/lib/meme-generator/cli.ts"
Task: "URL utilities in src/lib/share-utils/url-utils.ts"
Task: "X sharing service in src/lib/share-utils/x-service.ts"
Task: "Share utilities CLI in src/lib/share-utils/cli.ts"
```

## Task Generation Rules Applied

### From Contracts (meme-api.yaml, frontend-contracts.ts):
- GET / → T006 contract test + T028 implementation
- GET /api/og-image → T007 contract test + T029 implementation  
- GET /api/health → T008 contract test + T030 implementation
- Frontend interfaces → T013-T014 type definitions

### From Data Model (6 entities):
- MemeContent → T013 model creation
- ImageConfig → T014 model creation
- GradientConfig → included in T014
- SilhouetteConfig → included in T014
- ShareableLink → T020 URL utilities
- DownloadableImage → T017 canvas renderer

### From User Stories (quickstart.md scenarios):
- Basic meme generation → T009 integration test
- Image download → T010 integration test  
- X sharing → T011 integration test
- OG preview → T012 integration test

### From Libraries (plan.md architecture):
- meme-generator → T017-T019 (renderer, service, CLI)
- text-processor → T015-T016 (validation, CLI)
- share-utils → T020-T022 (URL utils, X service, CLI)

## Validation Checklist
*GATE: Checked before task list completion*

- [x] All contracts have corresponding tests (T006-T008)
- [x] All entities have model tasks (T013-T014)
- [x] All tests come before implementation (T006-T012 before T013-T030)
- [x] Parallel tasks truly independent (different files confirmed)
- [x] Each task specifies exact file path (all paths included)
- [x] No task modifies same file as another [P] task (verified)
- [x] All user stories covered (4 integration tests for 4 stories)
- [x] All libraries have CLI interfaces (T016, T019, T022)
- [x] TDD workflow enforced (tests must fail before implementation)

## Notes
- [P] tasks = different files, no shared dependencies
- Contract and integration tests MUST fail before implementing
- Each library must export both programmatic API and CLI
- Follow constitutional TDD: RED-GREEN-Refactor cycle
- Commit after completing each task
- Libraries in `src/lib/` structure support independent development
- All paths use `/workspaces/troll-translation/` as repository root

## Success Criteria
- All 31 tasks completed in dependency order
- Contract tests fail initially, then pass after implementation
- Integration tests validate complete user workflows  
- Libraries work both programmatically and via CLI
- Manual testing scenarios from quickstart.md all pass
- Ready for production deployment to Cloudflare Workers