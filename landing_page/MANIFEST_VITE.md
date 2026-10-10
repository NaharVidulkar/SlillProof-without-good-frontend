# Before-Login Pack: VITE conversion manifest (USE THIS ONE)

The target project is **React + Vite + Express** (the AI Studio template), NOT Next.js. The files under `source/` are unchanged v0 originals (`CHECKSUMS.txt`). Next.js appears in only a handful of places, so the port is small and mechanical. Edits E3 (brand spelling), E4 (link targets) and E5 (preview animation switch) from `MANIFEST_NEXT.md` still apply. Ignore E1 and E2 there; V1 and V7 below replace them. Make NO other change.

## V1. Placement (public site = its own HTML entry)
| Original | New location |
|---|---|
| `app/layout.tsx` | not a file. Split it: lang, title, description, theme-color and icon go into a new `landing.html`; `<Providers>` is mounted in `src/landing/main.tsx`; fonts see V3; Analytics removed (V5) |
| `app/page.tsx` | `src/before-login/pages/home.tsx` |
| `app/privacy/page.tsx` | `src/before-login/pages/privacy.tsx` |
| `app/passport/demo/page.tsx` | `src/before-login/pages/sample-passport.tsx` |
| `app/globals.css` | `src/before-login/styles/globals.css` |
| `components/**` | `src/before-login/components/**` |
| `lib/**` | `src/before-login/lib/**` |
| `public/icon.svg`, `public/apple-icon.png` | `public/` (tell me before overwriting an existing file) |

New files (small): `landing.html`, `src/landing/main.tsx`, `src/landing/router.tsx` (renders the right page from `window.location.pathname`: `/` home, `/privacy`, `/sample-passport`, plus the auth pages built later: `/login`, `/signup`, `/forgot-password`). The existing app keeps its own `index.html` and entry untouched.

## V2. `next/link` (8 files, 15 usages)
Files: `brand/logo.tsx`, `landing/site-footer.tsx`, `landing/site-nav.tsx`, `landing/final-cta.tsx`, `landing/demo/step-passport.tsx`, `landing/passport-showcase.tsx`, `landing/hero.tsx`, `passport/passport-profile.tsx`.
Create `src/before-login/lib/link.tsx` exporting `Link`, which renders a plain `<a>` and forwards `href`, `className`, `onClick`, `children` and every other anchor prop. Replace `import Link from 'next/link'` with `import { Link } from '@bl/lib/link'`. Plain full-page navigation is intended (the public site and the app are separate documents).

## V3. Fonts (`next/font/google` in layout.tsx)
Geist and Geist Mono: install `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`, import them in `src/landing/main.tsx`, and add a NEW file `src/before-login/styles/fonts.css` that sets `--font-geist: "Geist Variable"` and `--font-geist-mono: "Geist Mono Variable"` on `:root` (the original globals.css already reads these two variables). Do not edit globals.css for this. Confirm the glyphs really render (no fallback font).

## V4. Metadata
Remove the `Metadata` and `Viewport` imports and exports (3 files). Use a `<title>` element inside the page component (React 19 hoists it), and put the description and theme-color in `landing.html`.

## V5. Analytics
Remove `@vercel/analytics` usage. Do not install it.

## V6. `'use client'`
Leave the 17 directives as they are (harmless in Vite).

## V7. Alias and imports
Alias `@bl/*` to `src/before-login/*` in BOTH tsconfig and vite.config. In moved files change only the specifier text: `@/components/` to `@bl/components/`, `@/lib/` to `@bl/lib/`, and the layout CSS import to `@bl/styles/globals.css` (imported from `landing/main.tsx`).

## V8. Tailwind and CSS isolation
The project must use Tailwind 4 with `@tailwindcss/vite`. Install `tw-animate-css` and `shadcn` (the v0 CSS imports `tw-animate-css` and `shadcn/tailwind.css`). `landing/main.tsx` imports ONLY the before-login CSS; the existing app entry imports ONLY its own CSS. Prove that each built HTML references only its own stylesheet.

## V9. Build
Add `landing.html` as a second Rollup input next to the app's `index.html` in vite.config (`build.rollupOptions.input`). Make dev mode serve it too.

## Packages (see REQUIRED_PACKAGES.json)
motion, lucide-react, recharts, clsx, tailwind-merge, tw-animate-css, sonner, shadcn, plus `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`. Do not install `@vercel/analytics` or `next`.
