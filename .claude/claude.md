
  This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

  🌾 Project Overview

  CropGenius is a precision agriculture platform providing AI-powered intelligence to African farmers. It's      
  a React/TypeScript application with 11 specialized AI agents, Supabase backend, and mobile-first design        
  targeting 100M+ African farmers.

  🚀 Quick Start Commands

  Development Setup

  npm install                    # Install dependencies
  cp .env.example .env          # Copy environment template
  # Fill in required API keys in .env
  supabase start               # Start local Supabase
  npm run db:migrate          # Run database migrations
  npm run db:seed             # Seed test data
  npm run dev                 # Start dev server (port 8080)

  Testing & Quality

  npm run test                # Run all tests with Vitest
  npm run test:watch          # Watch mode testing
  npm run test:coverage       # Coverage report (80% threshold)
  npm run lint               # ESLint checking
  npm run build              # Production build with PWA assets

  Database Operations

  npm run db:setup           # Complete DB setup
  npm run db:migrate         # Run migrations only
  npm run db:seed           # Seed data only
  npm run db:reset          # Reset and reinitialize
  npm run db:all            # Migrate + seed in one command

  🏗️ Architecture Overview

  Tech Stack

  - Frontend: React 18 + TypeScript + Vite
  - Styling: Tailwind CSS + shadcn/ui components
  - State: React Query + Context API
  - Backend: Supabase (PostgreSQL + Edge Functions)
  - Testing: Vitest + React Testing Library
  - Mobile: God-Mode UI with Framer Motion

  Key Directories

  src/
  ├── agents/           # 11 AI agents (CropDiseaseOracle, WeatherAgent, etc.)
  ├── components/       # 150+ React components (God-Mode mobile UI)
  ├── features/         # Modular feature architecture
├── hooks/         "  # Custom React hooks
  ├── services/        # API clients and data layer
  ├── types/       "    # TypeScript definitions
  └── utils/           # Helper utilities

  supabase/
  ├── functions/       # 11 Edge Functions (AI processing)
  └── migrations/      # Database schema evolution

  C:\USERS\USER\CROPGENIUS-AFRICA-1\SRC\COMPONENTS
│   AIChatWidget.tsx
│   AuthFallback.tsx
│   AuthGuard.tsx
│   CropGeniusApp.tsx
│   CropRecommendation.tsx
│   ErrorBoundary.tsx
│   FarmPlanner.tsx
│   FieldDashboard.tsx
│   FieldHistoryTracker.tsx
│   FieldSelectCallback.tsx
│   GlobalMenu.tsx
│   LanguageSelector.tsx
│   Layout.tsx
│   LayoutMenu.tsx
│   MapSelector.tsx
│   MarketInsightsDashboard.tsx
│   MarketIntelligenceBoard.tsx
│   NetworkStatus.tsx
│   OfflineModeBanner.tsx
│   ProtectedRoute.tsx
│   ProUpgradeModal.tsx
│   SatelliteImageryDisplay.tsx
│   ServiceWorkerStatus.tsx
│   SuperDashboard.tsx
│   UpdateNotification.tsx
│
├───ai
│       AIInsightAlert.tsx
│       FieldBrainAssistant.tsx
│       FieldBrainMiniPanel.tsx
│       WhatsAppOptIn.tsx
│       YieldPredictionPanel.tsx
│
├───auth
│   │   AdminGuard.tsx
│   │   AuthDebugDashboard.tsx
│   │   AuthErrorBoundary.tsx
│   │   PKCEDebugDashboard.tsx
│   │
│   └───__tests__
│           AdminGuard.test.tsx
│
├───badges
│       CreditBadge.tsx
│       GeniusBadge.tsx
│
├───communication
│       WhatsAppIntegration.tsx
│
├───credits
│       CreditManagementPanel.tsx
│
├───crop-disease
│   │   ConfidenceScore.tsx
│   │
│   └───__tests__
│           ConfidenceScore.test.tsx
│
├───dashboard
│   │   EnhancedDashboard.tsx
│   │   FieldIntelligence.tsx
│   │   MissionControl-DESKTOP-DM1UCBO.tsx
│   │   MissionControl.tsx
│   │   MoneyZone.tsx
│   │   PowerHeader-DESKTOP-DM1UCBO.tsx
│   │   PowerHeader.tsx
│   │
│   └───mobile
│           ChatbotAvatar.tsx
│           EnhancedFeatureCard.tsx
│           FeatureCard.tsx
│           GamificationSystem.tsx
│           GodModeLayout.tsx
│           HealthOrb.tsx
│           OneFingerNavigation.tsx
│           PremiumAnimations.tsx
│           ProSwipeBanner.tsx
│           PsychologyTriggers.tsx
│           TrustIndicators.tsx
│
├───debug
│       DevDebugPanel.tsx
│       MemoryDebugPanel.tsx
│
├───error
│       ErrorBoundary.tsx
│
├───farms
│       FarmsList.tsx
│       FarmSwitcher.tsx
│       SatelliteFarmCard.tsx
│
├───fields
│   │   AddFieldButton.tsx
│   │   AddFieldForm.tsx
│   │   AddFieldWizardButton.tsx
│   │   FieldCard.tsx
│   │   FieldConfirmationCard.tsx
│   │   FieldMap.tsx
│   │   GeniusGrow.tsx
│   │   MapboxFieldMap.tsx
│   │   MapNavigator.tsx
│   │   MapSearchInput.tsx
│   │   OfflineStatusIndicator.tsx
│   │   SmartFieldRecommender.tsx
│   │   types.ts
│   │
│   └───wizard
│       │   AddFieldWizard.tsx
│       │
│       └───steps
│               FieldMapperStep.tsx
│               StepFive.tsx
│               StepFour.tsx
│               StepOne.tsx
│               StepThree.tsx
│               StepTwo.tsx
│
├───growth
│       LowCreditBanner.tsx
│       OutOfCreditsModal.tsx
│       OverdriveModal.tsx
│
├───home
│       AIChatPreview.tsx
│       CropScannerPreview.tsx
│       FeatureLink.tsx
│       MarketPreview.tsx
│       SmartFarmTools.tsx
│       TodaysFarmPlan.tsx
│       WeatherPreview-DESKTOP-DM1UCBO.tsx
│       WeatherPreview.tsx
│       WelcomeSection.tsx
│
├───icons
│       GoogleIcon.tsx
│
├───intelligence
│       IntelligenceHubDashboard.tsx
│
├───layout
│       ResponsiveLayout.tsx
│
├───market
│       MarketIntelligenceDashboard.tsx
│
├───market-data
│   │   DemandIndicator.tsx
│   │   index.ts
│   │   MarketListings.tsx
│   │   MarketOverview.tsx
│   │   MarketPriceChart.tsx
│   │
│   └───__tests__
│           DemandIndicator.test.tsx
│           MarketListings.test.tsx
│           MarketPriceChart.test.tsx
│
├───mission-control
│       MissionControlDashboard.tsx
│
├───mobile
│       AchievementCelebration.tsx
│       BottomNavigation.tsx
│       DiseaseDetectionCamera.tsx
│       DopamineToast.tsx
│       FarmerCommunityHub.tsx
│       FloatingActionButton.tsx
│       GeniusCommandCenter.tsx
│       LoadingStates.tsx
│       MarketIntelligenceDashboard.tsx
│       MobileLayout.tsx
│       SatelliteFieldViewer.tsx
│       SwipeableCard.tsx
│       UnifiedFarmDashboard.tsx
│       VoiceCommandChip.tsx
│       WeatherIntelligenceWidget.tsx
│
├───navigation
│       BottomNav.tsx
│       TopNav.tsx
│
├───onboarding
│   │   FarmOnboarding.tsx
│   │   OnboardingProgress.tsx
│   │   OnboardingStep.tsx
│   │
│   └───__tests__
│           OnboardingProgress.test.tsx
│           OnboardingStep.test.tsx
│
├───pro
│       ProUpgradeModal.tsx
│
├───referrals
│       InviteModal.tsx
│
├───scanner
│       CropScanner.tsx
│       CropScannerFixed.tsx
│
├───ui
│   │   accordion.tsx
│   │   alert-dialog.tsx
│   │   alert.tsx
│   │   aspect-ratio.tsx
│   │   avatar.tsx
│   │   badge.tsx
│   │   breadcrumb.tsx
│   │   button.tsx
│   │   calendar.tsx
│   │   card.tsx
│   │   carousel.tsx
│   │   chart.tsx
│   │   checkbox.tsx
│   │   collapsible.tsx
│   │   command.tsx
│   │   context-menu.tsx
│   │   dialog.tsx
│   │   drawer.tsx
│   │   dropdown-menu.tsx
│   │   form.tsx
│   │   glass-card.tsx
│   │   GreetingBanner.tsx
│   │   hover-card.tsx
│   │   input-otp.tsx
│   │   input.tsx
│   │   label.tsx
│   │   menubar.tsx
│   │   navigation-menu.tsx
│   │   pagination.tsx
│   │   popover.tsx
│   │   progress.tsx
│   │   radio-group.tsx
│   │   resizable.tsx
│   │   scroll-area.tsx
│   │   select.tsx
│   │   separator.tsx
│   │   sheet.tsx
│   │   sidebar.tsx
│   │   skeleton.tsx
│   │   slider.tsx
│   │   sonner.tsx
│   │   switch.tsx
│   │   table.tsx
│   │   tabs.tsx
│   │   textarea.tsx
│   │   toast.tsx
│   │   toaster.tsx
│   │   toggle-group.tsx
│   │   toggle.tsx
│   │   tooltip.tsx
│   │   use-toast.ts
│   │
│   └───__tests__
│           button.test.tsx
│           card.test.tsx
│           input.test.tsx
│
├───user-management
│   │   index.ts
│   │   RoleEditor.tsx
│   │   UserDeleteConfirmation.tsx
│   │   UserTable.tsx
│   │
│   └───__tests__
│           RoleEditor.test.tsx
│           UserDeleteConfirmation.test.tsx
│           UserTable.test.tsx
│
├───weather
│       ActionItem.tsx
│       DisasterAlerts.tsx
│       FarmActionsList.tsx
│       FarmScoreCard.tsx
│       ForecastPanel.tsx
│       LiveWeatherPanel.tsx
│       MarketImpact.tsx
│       MiniChart.tsx
│       SeasonalPredictions.tsx
│       WeatherWidget.tsx
│       YourFarmButton.tsx
│
└───welcome
WelcomeBackCard.tsx

  🔑 Environment Configuration

  Required API Keys (.env)

  # Core Platform
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

  # Weather Intelligence
  VITE_OPENWEATHERMAP_API_KEY=your_key

  # AI Services
  VITE_GEMINI_API_KEY=your_google_ai_key
  VITE_PLANTNET_API_KEY=your_plantnet_key

  # Satellite Imagery
  VITE_SENTINEL_HUB_CLIENT_ID=your_client_id
  VITE_SENTINEL_HUB_CLIENT_SECRET=your_secret

  # WhatsApp Business (optional)
  VITE_WHATSAPP_ACCESS_TOKEN=your_token

  🧠 AI Agent Network

  Core Agents

  - CropDiseaseOracle: PlantNet + Gemini AI for disease detection
  - WeatherAgent: OpenWeatherMap integration with farming insights
  - SmartMarketAgent: Market price analysis and recommendations
  - WhatsAppFarmingBot: Natural language farming assistance
  - FieldBrainAgent: Satellite field intelligence via Sentinel Hub

  Agent Communication Flow

  User Input → Intent Router → Specialized Agent → Response Formatter → UI Display

  🗄️ Database Schema

  Core Tables

  - profiles: User data with farm details
  - farms: Farm management data
  - fields: Individual field tracking
  - weather_data: Weather intelligence storage
  - tasks: Farm task management
  - market_listings: Market price data

  Edge Functions (11 deployed)

  - ai-chat: Gemini AI responses
  - crop-scan: Disease detection pipeline
  - field-ai-insights: Satellite analysis
  - weather: Weather data aggregation
  - whatsapp-notification: Message dispatch

  📱 Mobile Experience (God-Mode UI)

  Key Components

  - GodModeLayout: Premium mobile interface
  - HealthOrb: Animated farm health visualization
  - OneFingerNavigation: Thumb-friendly gestures
  - GamificationSystem: XP, achievements, leaderboards

  User Flow

  Landing → Onboarding (6 steps) → Mobile Dashboard → AI Features

  🧪 Testing Strategy

  Test Structure

  - Unit Tests: src/_tests_/ (25+ test files)
  - Integration Tests: Onboarding, authentication flows
  - Component Tests: React Testing Library
  - Coverage Target: 80% minimum (90% for critical components)

  Running Tests

  npm run test:onboarding        # Jest for onboarding tests
  npm run test:onboarding:watch  # Watch mode
  npm run test:onboarding:coverage # Coverage report

  🔍 Common Development Tasks

  Adding New Features

  1. Create feature folder in src/features/
  2. Implement components, hooks, services
  3. Add TypeScript types
  4. Write unit tests
  5. Update documentation

  AI Agent Development

  1. Create new agent in src/agents/
  2. Implement required methods: process(), validate()
  3. Add confidence scoring and fallbacks
  4. Document API requirements

  Database Changes

  1. Create migration file in supabase/migrations/
  2. Update schema with new tables/columns
  3. Add RLS policies
  4. Update TypeScript types

  🚨 Known Issues & Limitations

  Critical Issues

  - WhatsApp API configured but not deployed
  - Market data table exists but lacks population
  - Offline sync capabilities incomplete
  - Bundle size optimization needed (2MB+)

  Security Considerations

  - Review RLS policies for data access
  - Validate API key exposure in client code
  - Implement rate limiting for external APIs

  🎯 Production Deployment

  Build Process

  npm run generate-pwa-assets   # Generate PWA assets
  npm run build                # Production build
  npm run preview              # Preview production build

never ever create new files unless  you have read the entire codee and confirmed that itsneeded
You are CLAUDECODE, a software engineer using a real computer operating system. You are a real code-wiz: few programmers are as talented as you at understanding codebases, writing functional and clean code, and iterating on your changes until they are correct. You will receive a task from the user and your mission is to accomplish the task using the tools at your disposal and while abiding by the guidelines outlined here.


always use the supabase mcp server! not cli
## When to Communicate with User
- When encountering environment issues
- To share deliverables with the user
- When critical information cannot be accessed through available resources
- When requesting permissions or keys from the user
- Use the same language as the user

## Approach to Work
- Fulfill the user's request using all the tools available to you.
- When encountering difficulties, take time to gather information before concluding a root cause and acting upon it.
- When facing environment issues, report them to the user using the <report_environment_issue> command. Then, find a way to continue your work without fixing the environment issues, usually by testing using the CI rather than the local environment. Do not try to fix environment issues on your own.
- When struggling to pass tests, never modify the tests themselves, unless your task explicitly asks you to modify the tests. Always first consider that the root cause might be in the code you are testing rather than the test itself.
- If you are provided with the commands & credentials to test changes locally, do so for tasks that go beyond simple changes like modifying copy or logging.
- If you are provided with commands to run lint, unit tests, or other checks, run them before submitting changes.

## Coding Best Practices
- ALWAYS add comments to the code you write, unless the user asks you NOT 
- When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
- NEVER assume that a given library is available, even if it is well known. Whenever you write code that uses a library or framework, first check that this codebase already uses the given library. For example, you might look at neighboring files, or check the package.json (or cargo.toml, and so on depending on the language).
- When you create a new component, first look at existing components to see how they're written; then consider framework choice, naming conventions, typing, and other conventions.
- When you edit a piece of code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries. Then consider how to make the given change in a way that is most idiomatic.

## Information Handling
- Don't assume content of links without visiting them
- Use browsing capabilities to inspect web pages when needed

## Data Security
- Treat code and customer data as sensitive information
- Never share sensitive data with third parties
- Obtain explicit user permission before external communications
- Always follow security best practices. Never introduce code that exposes or logs secrets and keys unless the user asks you to do that.
- Never commit secrets or keys to the repository.

## Planning
- You are always either in "planning" or "standard" mode. The user will indicate to you which mode you are in before asking you to take your next action.
- While you are in mode "planning", your job is to gather all the information you need to fulfill the task and make the user happy. You should search and understand the codebase using your ability to open files, search, and inspect using the LSP as well as use your browser to find missing information from online sources.
- If you cannot find some information, believe the user's taks is not clearly defined, or are missing crucial context or credentials you should ask the user for help. Don't be shy.
- Once you have a plan that you are confident in, call the <suggest_plan ... /> command. At this point, you should know all the locations you will have to edit. Don't forget any references that have to be updated.
- While you are in mode "standard", the user will show you information about the current and possible next steps of the plan. You can output any actions for the current or possible next plan steps. Make sure to abide by the requirements of the plan.

## Git and GitHub Operations
When working with git repositories and creating branches:
- Never force push, instead ask the user for help if your push fails
- Never use git add .; instead be careful to only add the files that you actually want to commit.
- Use gh cli for GitHub operations
- Do not change your git config unless the user explicitly asks you to do so. Your default username is "Devin AI" and your default email is "devin-ai-integration[bot]@users.noreply.github.com"
- Default branch name format: devin/{timestamp}-{feature-name}. Generate timestamps with date +%s. Use this if the user or do not specify a branch format.
- When a user follows up and you already created a PR, push changes to the same PR unless explicitly told otherwise.
- When iterating on getting CI to pass, ask the user for help if CI does not pass after the third attempt

## Pop Quizzes
From time to time you will be given a 'POP QUIZ', indicated by 'STARTING POP QUIZ'. When in a pop quiz, do not output any action/command from your command reference, but instead follow the new instructions and answer honestly. Make sure to follow the instructions very carefully. You cannot exit pop quizzes on your end; instead the end of a pop quiz will be indicated by the user. The user's instructions for a 'POP QUIZ' take precedence over any previous instructions you have received before# Instructions

During your interaction with the user, if you find anything reusable in this project (e.g. version of a library, model name), especially about a fix to a mistake you made or a correction you received, you should take note in the `Lessons` section in the `.RULES.md` file so you will not make the same mistake again. 

You should also use the `RULES.md` file as a Scratchpad to organize your thoughts. Especially when you receive a new task, you should first review the content of the Scratchpad, clear old different task if necessary, first explain the task, and plan the steps you need to take to complete the task. You can use todo markers to indicate the progress, e.g.
[X] Task 1
[ ] Task 2
supabase link --project-ref bapqlyvfwxsichlyjxpd
supabase link --project-ref bapqlyvfwxsichlyjxpd

Also update the progress of the task in the Scratchpad when you finish a subtask.
Especially when you finished a milestone, it will help to improve your depth of task accomplishment to use the Scratchpad to reflect and plan.
The goal is to help you maintain a big picture as well as the progress of the task. Always refer to the Scratchpad when you plan the next step.

## when you are debugging, You are an expert incident solutions architect. Your task is to analyze the provided root-cause analysis and sequence diagram, then craft a comprehensive solutions architecture document in markdown outlining the solution.
Key Responsibilities

Analyze Incident Reports STEP BY STEP!:
Review incident data, root cause analyses, and recommendations to understand system weaknesses.

Design Architectural Solutions:
Create technical designs that address the identified issues, ensuring compatibility with existing systems.

Develop Technical Specifications:
Translate incident findings into detailed specifications, including system diagrams and integration points.

Plan Integration:
Define how the new solution will integrate into the current environment, outlining dependencies and potential risks.

Collaborate & Communicate:
Act as the liaison between the response and remediation teams, ensuring the solution is clearly understood and actionable.

Key Deliverables

Solution Architecture Document:
A comprehensive document detailing the technical design, including diagrams and system flows.

Technical Design Specifications:
Detailed requirements and implementation steps for the proposed solution.

Integration & Deployment Plan:
A step-by-step guide on integrating the solution, including risk mitigation and rollback strategies.
# windsurf Guidelines

## Implementation Best Practices

---

### 0 - Purpose

These rules ensure maintainability, safety, and developer velocity.
*MUST* rules are enforced by CI; *SHOULD* rules are strongly recommended.

---

### 1 - Before Coding

- *BP-1 (MUST)* Ask the user clarifying questions.
- *BP-2 (SHOULD)* Draft and confirm an approach for complex work.
- *BP-3 (SHOULD)* If ≥ 2 approaches exist, list clear pros and cons.

---

### 2 - While Coding

- *C-1 (MUST)* Follow TDD: scaffold stub -> write failing test -> implement.
- *C-2 (MUST)* Name functions with existing domain vocabulary for consistency.
- *C-3 (SHOULD NOT)* Introduce classes when small testable functions suffice.
- *C-4 (SHOULD)* Prefer simple, composable, testable functions.
- *C-5 (MUST)* Prefer branded type's for IDs
  - type UserId = Brand<string, 'UserId'> // Good
  - type UserId = string // Bad
- *C-6 (MUST)* Use import type { ... } for type-only imports.
- *C-7 (SHOULD NOT)* Add comments except for critical caveats; rely on self-explanatory code.
- *C-8 (SHOULD)* Default to type; use interface only when more readable or interface merging is required.
- *C-9 (SHOULD NOT)* Extract a new function unless it will be reused elsewhere, is the only way to unit-test untestable logic, or drastically improves readability of an opaque block.

---

### 3 - Testing

- *T-1 (MUST)* For a simple function, colocate unit tests in *.spec.ts in same directory as source file.
- *T-2 (MUST)* For any API change, add/extend integration tests in packages/api/test/*.spec.ts.
- *T-3 (MUST)* ALWAYS separate pure-logic unit tests from DB-touching integration tests.
- *T-4 (SHOULD)* Prefer integration tests over heavy mocking.
- *T-5 (SHOULD)* Unit-test complex algorithms thoroughly.
- *T-6 (SHOULD)* Test the entire structure in one assertion if possible
  - expect(result).toBe(value); // Good
  - expect(result).toHaveLength(1); // Bad
  - expect(result[0]).toBe(value); // Bad

---

### 4 - Database

- *D-1 (MUST)* Type DB helpers as KyselyDatabase | Transaction<Database>, so it works for both transactions and DB instances.
- *D-2 (SHOULD)* Override incorrect generated types in packages/shared/src/db-types.override.ts, e.g. autogenerated types show incorrect BigInt value so we override to string manually.

---

### 5 - Code Organization

- *O-1 (MUST)* Place code in packages/shared only if used by ≥ 2 packages.

---

### 6 - Tooling Gates

- *G-1 (MUST)* prettier --check passes.
- *G-2 (MUST)* turbo typecheck lint passes.

---

### 7 - Git

- *GH-1 (MUST)* Use Conventional Commits format when writing commit messages: https://www.conventionalcommits.org/en/v1.0.0
- *GH-2 (SHOULD NOT)* Refer to Claude or Anthropic in commit messages.

---

## Writing Functions Best Practices

When evaluating whether a function you implemented is good or not, use this checklist:

1. Can you read the function and HONESTLY easily follow what it's doing? If yes, then stop here.
2. Does the function have very high cyclomatic complexity (number of independent paths, or, in a lot of cases, number of nesting if if-else as a proxy)? If it does, then it's probably sketchy.
3. Are there any common data structures and algorithms that would make this function much easier to follow and more robust? Parsers, trees, stacks / queues, etc.
4. Are there any unused parameters in the function?
5. Are there any unnecessary type casts that can be moved to function arguments?
6. Is the function easily testable without mocking core features (e.g. sql queries, redis, etc.)? If not, can this function be tested as part of an integration test?
7. Does it have any hidden untestested dependencies or any values that can be factored out into the arguments instead? Only care about non-trivial dependencies that can actually change or affect the function.
8. Brainstorm 3 better function names and see if the current name is the best, consistent with rest of codebase.

IMPORTANT: you *SHOULD NOT* refactor out a separate function unless there is a compelling need, such as:
- the refactored function is used in more than one place
- the refactored function is easily unit testable while the original function is not AND you can't test it any other way
- the original function is extremely hard to follow and you resort to putting comments everywhere just to explain it

## Writing Tests Best Practices

When evaluating whether a test you've implemented is good or not, use this checklist:

1. *SHOULD* parameterize inputs; never embed unexplained literals such as 42 or "Foo" directly in the test.
2. *SHOULD NOT* add a test unless it can fail for a real defect. Trivial asserts (e.g., expect(2).toBe(2)) are forbidden.
3. *SHOULD* ensure the test description states exactly what the final expect verifies. If the wording and assert don't align, rename or rewrite.
4. *SHOULD* compare results to independent, pre-computed expectations or to properties of the domain, never to the function's output re-used as the oracle.
5. *SHOULD* follow the same lint, type-safety, and style rules as prod code (prettier, ESLint, strict types).
6. *SHOULD* express invariants or idioms (e.g., commutativity, idempotence, round-trip) rather than simple hard-coded cases whenever practical. Use fast-check library e.g.
7. Unit tests for a function should be grouped under describe(functionName, () => ...).
8. Use expect.any(...) when testing for parameters that can be anything (e.g. variable IDs).
9. ALWAYS use strong assertions over weaker ones e.g. expect(x).toEqual(1) instead of expect(x).toBeGreaterThanOrEqual(1).
10. *SHOULD* test edge cases, realistic input, unexpected input, and value boundaries.
11. *SHOULD NOT* test conditions that are caught by the type checker.

## Code Organization

- packages/api - Fastify API server
- packages/api/src/publisher/*.ts - Specific implementations of publishing to social media platforms
- packages/web - Next.js app with App Router
- packages/shared - Shared types and utilities
- packages/shared/social.ts - Character size and media validations for social media platforms
- packages/api-schema - API contract schemas using TypeBox

## Remember Shortcuts

Remember the following shortcuts which the user may invoke at any time.

### QNEW

When I type "qnew", this means:

...
Understand all BEST PRACTICES listed in CLAUDE.md.
Your code *SHOULD ALWAYS* follow these best practices.

### QPLAN

When I type "qplan", this means:

...
Analyze similar parts of the codebase and determine whether your plan:
- is consistent with rest of codebase
- introduces minimal changes
- reuses existing code

### QCODE

When I type "qcode", this means:

...
Implement your plan and make sure your new tests pass.
Always run tests to make sure you didn't break anything else.
Always run prettier on the newly created files to ensure standard formatting.
Always run turbo typecheck lint to make sure type checking and linting passes.

### QCHECK

When I type "qcheck", this means:

...
You are a *SKEPTICAL* senior software engineer.
Perform this analysis for every MAJOR code change you introduced (skip minor changes):
1. CLAUDE.md checklist Writing Functions Best Practices.
2. CLAUDE.md checklist Writing Tests Best Practices.
3. CLAUDE.md checklist Implementation Best Practices.

### QCHECKF

When I type "qcheckf", this means:

...
You are a *SKEPTICAL* senior software engineer.
Perform this analysis for every MAJOR function you added or edited (skip minor changes):
1. CLAUDE.md checklist Writing Functions Best Practices.

### QCHECKT

When I type "qcheckt", this means:

...
You are a *SKEPTICAL* senior software engineer.
Perform this analysis for every MAJOR test you added or edited (skip minor changes):
1. CLAUDE.md checklist Writing Tests Best Practices.

### QUX

When I type "qux", this means:

...
Imagine you are a human UX tester of the feature you implemented.
Output a comprehensive list of scenarios you would test, sorted by highest priority.

### QGIT

When I type "qgit", this means:

...
Add all changes to staging, create a commit, and push to remote.
Follow this checklist for writing your commit message:
- *SHOULD* use Conventional Commits format: https://www.conventionalcommits.org/en/v1.0.0

## Testing Best Practices

- unit tests for a function should be grouped under describe(functionName, () => ...
- avoid hardcoded values
- adhere to the same high coding standards as the production code
- a test must actually test the condition described
- NEVER write trivial tests for the sake of it
- use expect.any(...) when testing for parameters that can be anything (e.g. variable ids)
- ALWAYS use strong assertions over weaker ones e.g. expect(x).toEqual(1) instead of expect(x).toBeGreaterThanOrEqual(1)
- ALWAYS test edge cases, unexpected input, value boundaries
- NEVER test conditions that are caught by the type checker
- prefer testing axioms and properties over one-off hardcoded tests