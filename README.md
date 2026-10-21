# BetterBugs Frontend

The refresh of the BetterBugs web app (`bb-app`), built on **Next.js 16 (App Router) + React 19 + Tailwind CSS v4**.
It keeps bb-app's folder structure and conventions so features can be ported over one at a time.

> Next 16 has breaking changes from the Next 15 that bb-app runs on. Read the bundled docs in
> `node_modules/next/dist/docs/` before porting a feature (see [Porting from bb-app](#porting-from-bb-app)).

## Getting started

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Project structure

```
@hooks/                         Shared React hooks (e.g. use-mobile)                → @hooks/*
types/                          Ambient *.d.ts for untyped third-party modules
public/
  fonts/  images/  videos/      Static assets                                       → @public/*
app/
  _component/                   All UI that isn't a route                           → @components/*
    base_shadcn/                Stock shadcn primitives (button, dialog, field.ts …)
      custom/                   bb* wrappers (BbButton, BBDialog …) — what feature code imports
    common/                     App-wide widgets (route preloader, carousels …)
    contexts/                   React contexts (layout, theme, settings, onboarding)
    providers/                  Client providers and side-effect "gates" (PostHog …)
    patterns/                   Composed UI patterns (EmptyState, PageHeader, ErrorState …)
    reusable/                   Small reusable components (avatar, badges, SafeImage …)
    icons/                      One SVG icon component per file                     → @components/icons/*
    newIcons/                   Integration / brand icons
    modals/                     One folder per modal, each with index.tsx
    login/                      Login-flow components
    loading_screens/lotties/    Full-screen loaders and their Lottie JSON
    layouts/
      authLayout/               Login / onboarding shell
      mainLayout/sidebar/       App shell: sidebar …
      mainLayout/topBar/        … and top bar
      settingsLayout/           Settings shell (profile / workspace / project tabs)
      screenLayout/             Session detail screen
      mobileLayout/             Mobile-only shell
      homeDashboardLayout/      Dashboard shell and filters
  _libs/                        Non-UI code                                         → @lib/*
    auth/                       Auth cookie, token refresh, axios auth interceptors
    customHooks/                Generic hooks (useList, useHotkeys, useOutsideClick …)
    schemas/                    yup form schemas
    server/                     Server-only helpers (never import from client code)
    socket/                     socket.io client and event subscriptions
    types/                      Shared enums / types
  _redux/                       Redux Toolkit store                                 → @redux/*
    models/                     <domain>.d.ts — request/response interfaces only
    services/                   <domain>.api.ts — API calls
    slices/                     <domain>/index.ts — one slice per folder
  api/                          Route handlers
  (SidebarHolders)/             Routes rendered inside the main app shell
    workspace/[workspaceId]/
      (SecondarySidebarHolders)/settings/                    Workspace settings tabs
      (SecondarySidebarHolders)/project/[projectId]/settings/ Project settings tabs
      @modal/                   Parallel slot for settings opened as a modal (intercepting routes)
      project/[projectId]/      Session list for a project
      get-started/
      recording-link/[recordingLinkId]/
  login/  session/[sessionId]/  join/[token]/  workspace/onboarding/  user/onboarding/
```

Folders prefixed with `_` are private (not routed). Empty folders hold a `.gitkeep`; delete it once the folder has real files.

### Path aliases

| Alias                 | Points to                |
| --------------------- | ------------------------ |
| `@components/*`       | `app/_component/*`       |
| `@components/icons/*` | `app/_component/icons/*` |
| `@redux/*`            | `app/_redux/*`           |
| `@lib/*`              | `app/_libs/*`            |
| `@hooks/*`            | `@hooks/*`               |
| `@public/*`           | `public/*`               |
| `@/*`                 | project root             |

Always import through an alias, not a bare `app/...` path or a long `../../..` chain.

## Conventions

### Routes
- `page.tsx` stays thin and renders a controller.
- `<feature>.controller.tsx` (`'use client'`) owns state, API calls and dispatches, then renders the view.
- `<feature>.view.tsx` is presentational and gets everything through props.
- `loading.tsx` renders a skeleton that matches the view; `error.tsx` renders `RouteError`.
- Route groups are PascalCase in parentheses (`(SidebarHolders)`); URL segments are kebab-case (`project-settings`).
- Every parallel slot (`@modal`) needs a `default.tsx`. When you add a page under `[workspaceId]`, add a matching empty page in `@modal` that re-exports `default`.

### Components
- Feature code imports the `base_shadcn/custom/bb*` wrappers, not the raw primitives. Add behaviour in the wrapper; keep visual states in the primitive's `cva` variants.
- Component folders are camelCase with an `index.tsx`. Patterns use named exports plus an exported `*Props` type and accept `className`.
- Icons: UI icons come from `@components/icons/material` (generated, see Design system). Custom SVGs (brand logos, illustrations) go one per file in `icons/` or `newIcons/`, PascalCase, take `React.SVGProps<SVGSVGElement>`, spread props onto `<svg>`, and use `currentColor`.
- Use semantic Tailwind tokens (`bg-background`, `text-muted-foreground`, `border-border` …), never raw palette classes or hex values.

### Data layer (Redux Toolkit + axios)
- `_libs/axiosConfig` exports a shared `fetch(config)` that returns `response.data` and throws a normalized `Error` carrying `responseStatus` / `responseData`.
- `services/<domain>.api.ts`: plain async functions named `<verb><Entity>API`, taking one destructured object argument.
- `slices/<domain>/index.ts`: state `{ data, isLoading, error }`, actions `<x>Started / <x>Success / <x>Update / <x>Fail / <x>Reset`, plus hand-written thunks that call the services.
- `models/<domain>.d.ts`: exported interfaces only.
- `_redux/reducers.ts` combines the slices and exports `RootState`; `_redux/provider.tsx` creates the store once (`useState(() => createStore())`), not on every render.

### Forms
- yup schemas live in `_libs/schemas/<feature>FormSchema.ts` and export `<X>FormInputs` and `<X>ValidationSchema`. Shared copy goes in `_libs/schemas/messages.ts`.

### Formatting
Prettier config is in `.prettierrc`: 4 spaces, single quotes, semicolons, print width 100, no trailing commas. Run `npx prettier --write <files>`.

## Design system (v2)

`app/globals.css` implements *BetterBugs Design System v2*: Google Sans everywhere, zinc neutrals, green for the main action only, light and dark themes.

- **Theme:** Light / Dark / System (System follows the OS and is the default). `ThemeProvider` (`@components/contexts/themeContext`) is mounted in `app/layout.tsx`. A pre-paint script (`@lib/themeInit`) applies the stored choice before the page renders, so there's no flash. Read or change it with `useTheme()` → `{ preference, resolvedTheme, setPreference }`, or drop in `<ThemeSwitcher />` (`@components/common/themeSwitcher`). Tokens switch under `.dark` (set on `<html>`) or `[data-theme="dark"]` on any ancestor.
- **Icons:** Material Symbols Outlined, weight 300, as React SVG components from `@components/icons/material` (`<SearchIcon />`, `<HomeIcon filled />` for the active nav item). They use `currentColor` and size with `size-*`. To add one, put its name in `ICONS` in `scripts/generate-icons.mjs` and run `npm run icons`. Don't add lucide or another icon set.
- **Tokens** keep the design-system names (`--primary`, `--bg`, `--fg`, `--d100`, `--sel`, `--blue-bg` …) and are exposed as utilities:

| Need | Use |
| --- | --- |
| Surfaces | `bg-background` · `bg-card` · `bg-side` (sidebar) · `bg-canvas` · `bg-overlay` · `bg-spot` |
| Neutrals | `bg-d100` (hover, chips) · `border-d200` · `bg-d300` · `bg-sel` (selected row) · `bg-seg` |
| Text | `text-foreground` · `text-muted-foreground` |
| Status | `bg-info-subtle text-info` (open) · `warning` (in progress) · `success` (done) · `danger` (urgent) |
| Labels / avatars | `bg-label-{green,amber,purple,pink,blue,gray,ink}` · `bg-avatar-{1..5}` |
| Type (7 sizes) | `text-2xs` 11 · `text-xs` 12 · `text-sm` 13 · `text-md` 14 (body, default) · `text-lg` 16 · `text-xl` 20 · `text-2xl` 28 · `text-overline` |
| Radius | `rounded-sm` 4 · `rounded-md` 6 (controls) · `rounded-lg` 8 (cards, dialogs) · `rounded-full` |
| Shadows | `shadow-sh` (resting ring) · `shadow-sh-lg` (menus) · `shadow-modal` · `shadow-hairline` · `shadow-focus` · `shadow-error` |
| Motion | `duration-fast/base/slow` · `ease-out` · `ease-spring` · `animate-pulse-sk` · `animate-reveal` |
| Layout | `page-container` (breakpoint padding + 1280px max, centred) · `page-padding` · `grid-cards` (auto-fit, min 240px) · `hit-area` |

Borders are 1px rings drawn with `box-shadow` (`shadow-hairline`, `shadow-sh`), not `border`.

### Responsive

Tailwind breakpoints are renamed so **the prefix is the design name**. Mobile-first: unprefixed classes are Mobile.

| Design | Width | Prefix | Page padding | Layout |
| --- | --- | --- | --- | --- |
| Mobile | < 640 | — | 16 | Sidebar is a drawer; one column; tables scroll sideways; dialogs full width − 32px |
| Tablet | 640 – 1023 | `sm:` | 24 | Sidebar is a 64px icon rail (tooltips); card grids 2-up |
| Desktop | 1024 – 1279 | `md:` | 24 | Sidebar 240px, collapsible |
| LG | 1280 – 1439 | `lg:` | 32 | 3-up stat cards, all table columns |
| XL | 1440 – 1919 | `xl:` | 32 | Content max 1280px, centred; 4-up stat cards |
| 2XL | 1920 – 2199 | `2xl:` | 40 | Same sizes; extra width goes to the preview/editor canvas |
| 3XL / 4XL | ≥ 2200 | `3xl:` / `4xl:` | 40 | Same sizes; content stays centred at max width |

**Text sizes are fixed on every screen (industry standard).** The 7 sizes (11 → 28px) are the same on a phone, a laptop, a 4K monitor and a TV, as in Linear, Notion, Jira and GitHub. The app does no screen-based scaling. Big screens are handled by:

- **OS display scaling.** A 4K monitor or TV at Windows' recommended 150–300% makes everything physically larger.
- **Browser zoom (Ctrl + / −).** Any level from 25% to 500% scales the whole UI evenly.
- **The browser font-size setting.** Sizes are in `rem` against a 100% root, so it's respected (accessibility).

Rules:
- Don't write breakpoint text classes like `md:text-lg`, and don't add viewport-based font sizes (`vw`, `clamp()`) or CSS `zoom`.
- Write sizes in rem or Tailwind steps (`h-9`, `size-[1.125rem]`), not `px`, so browser font-size settings scale them too. Only 1–3px hairlines, rings and nudges stay in px.
- Below Desktop, every `Button` has a ≥ 44px hit area and `icon-md` buttons grow from 32 to 40px.
- `<Sidebar collapsible="icon">` handles drawer → rail → full sidebar on its own. In JS use `useIsMobile()`, `useIsTablet()` or `useMediaQuery()` from `@hooks/use-mobile` (`BREAKPOINTS` there must match `globals.css`).
- Hover-only UI must also show on touch screens: use `can-hover:` / `touch:` variants.

**Components** (`app/_component/base_shadcn`) are shadcn/ui (new-york, Radix) restyled to the spec:

- `Button`: variants `default` (primary) · `secondary` (`outline` is an alias) · `soft` · `ghost` · `dark` · `destructive` (solid red) · `destructive-outline` · `link`; sizes `sm` 28 · `md` 32 · `default` 36 · `xl` 44, plus `icon-*`.
- `Input` / `Textarea` / `Select` / `InputGroup`: 36px, hairline ring, green focus ring + glow, red ring when `aria-invalid`. `Select size="lg"` is the 44px dropdown field.
- `Badge`: status pill with `dot`; `size="sm"` for counts (`variant="dark"` for "New").
- `Tabs`: `TabsList` default = segmented control, `variant="line"` = underline tabs.
- `Card interactive`, `Alert` (`info` / `warning` / `destructive` / `success`), `Skeleton tone="subtle"`, `Spinner`, inverted `Tooltip` and `Toaster`.
- Menus (`DropdownMenu`, `Menubar`, `Select`, `Command`): 32px items, green check on the right for the selected item, destructive items in red after a separator.
- `PaginationBar`: the table footer ("1–3 of 128 · Page 1 of 43" with prev/next).
- `Empty` (`bordered`) with `EmptyMedia variant="brand" | "icon" | "danger"`: icon tile, title, one sentence, one action.
- `Toggle`: `default` (toolbar) · `primary` (annotation tool) · `outline` (filter / tag chip). `AlertDialogMedia` is the 44px icon tile above the title.
- `Field`: label 12/500 muted, help and error text 12px below.
- Selected toggles use the `on:` variant (keyed on `aria-pressed` / `aria-checked`) and selected tabs use `aria-selected:`, not `data-state`. A tooltip wrapped around a trigger overwrites `data-state`.

**Component layers** (what feature code should import):

| Layer | Where | What's there |
| --- | --- | --- |
| bb wrappers (bb-app API) | `base_shadcn/custom/bb*.tsx` | `BbButton` (`loading`), `BBDialog` (`size`), `BBTooltip` (`content`, `shortcut`), `BBDropdown` (bottom sheet on mobile), `BbPopconfirm`, `BbInput`, `BbSelect`, `BbCombobox`, `MultiSelect`, `TagsInputField`, `BbSearchBar`, `BbDateInput`, `BbTable`, `BbPagination`, `BBTabs`, `BBCard`, `BBHeader`, `BBSidebar`, … (34 files; `field-variants.ts` holds the shared field styles) |
| Patterns | `patterns/` | `PageHeader`, `EmptyState`, `ErrorState`, `FormField`, `SettingsSection`, `UsageMeter`, `CopyButton`, `KeyboardShortcutsDialog`, `KeyHint`, `GatedState`, `PropertyList`, `SaveStatus`, `Reveal`, `InviteCard`, `useGoToShortcuts` |
| BetterBugs components | `reusable/` | `UserAvatar` / `AvatarStack`, `StatusPill`, `Priority`, `TagChip`, `TagsField`, `PropertyRow(s)`, `StatCard`, `SearchInput`, `IntegrationTile`, `AnnotationToolbar` / `AnnotationColorPicker`, `LogRow` / `LogList`, `SessionRow` / `CommentItem`, plus bb-app's generic `RouteError`, `SafeImage`, `CopyToClipboard`, `DisplayLocalDate`, `NoPermission`, … |
| Shell | `layouts/mainLayout/topBar` · `common/themeSwitcher` | `TopBar`, `WorkspaceSwitcherButton`, `ThemeSwitcher` |
| Hooks | `_libs/customHooks` · `@hooks/use-mobile` | `useHotkeys`, `useLatch`, `useList`, `useOutsideClick`, `useFullscreenElement`, `useScrollToHash`, `useResizer`, `useFirstEffect` · `useIsMobile`, `useIsTablet`, `useMediaQuery` |

Add more with `npx shadcn@latest add <name>`. Afterwards:
1. Check that the import says `@lib/utils` (the CLI sometimes writes `"cn"` and installs an unrelated `cn` package).
2. Replace the `lucide-react` icons it adds with `@components/icons/material` and uninstall `lucide-react` again.
3. Restyle the component with the tokens above.

## Porting from bb-app

Next 16 differences to handle when moving code over:

- `middleware.ts` is now `proxy.ts` at the project root, exporting `proxy` (Node runtime only).
- `params`, `searchParams`, `cookies()` and `headers()` are async; always `await` them.
- `cacheComponents` is on, so route segment exports `revalidate`, `dynamic`, `fetchCache` and `runtime` throw. Use `'use cache'` / `<Suspense>` instead.
- `images.domains` is gone; use `images.remotePatterns`.
- Turbopack is the default bundler. `next-pwa` and the Sentry webpack wrapper break the build; use Serwist and Sentry's Turbopack setup.
- Client-visible env vars must be `NEXT_PUBLIC_*` (see `.env.example`). Don't use the `env` block in `next.config.ts`; bb-app leaked secrets to the browser that way.
- Tailwind v4 has no `tailwind.config.js`. Port bb-app's tokens into an `@theme` block in `app/globals.css`.

Don't carry over these bb-app issues:

- `ReduxProvider` creating a new store on every render.
- The unused `redux-persist` setup and the `serverData` request-id map.
- The `bbbuton.tsx` filename typo (use `bbbutton.tsx`).
- Mixed camelCase / PascalCase icon filenames.
