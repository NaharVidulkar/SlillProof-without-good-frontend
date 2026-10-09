# Before-Login Pack (from the v0 SkillProof frontend)

This pack contains ONLY the files needed by the public "before login" website. Every file under `source/` is a byte-for-byte copy of the v0 original, in its original relative path. `CHECKSUMS.txt` has the SHA-256 of each file so you can prove the copy is identical before you edit anything.

What it renders: landing page (`/`), privacy page, and a public sample passport page. Nothing here uses Firebase, a database or an API.

## Contents (31 files)

- app: `layout.tsx`, `page.tsx`, `globals.css`, `privacy/page.tsx`, `passport/demo/page.tsx`
- components: `landing/*` (14 files incl. `demo/*`), `brand/logo.tsx`, `shared/{bits,motion,passport-card}.tsx`, `passport/passport-profile.tsx`, `providers.tsx`
- lib: `data.ts`, `ui.ts`, `utils.ts`
- public: `icon.svg`, `apple-icon.png`
- Packages needed: see `REQUIRED_PACKAGES.json`

## The ONLY edits allowed after copying (list every change you make)

**E1. Move into an isolated namespace** (so nothing collides with the after-login app):

| Original                                   | New location                                                                        |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `app/layout.tsx`                           | `app/(before-login)/layout.tsx` (this becomes a ROOT layout with its own html/body) |
| `app/page.tsx`                             | `app/(before-login)/page.tsx`                                                       |
| `app/privacy/page.tsx`                     | `app/(before-login)/privacy/page.tsx`                                               |
| `app/passport/demo/page.tsx`               | `app/(before-login)/sample-passport/page.tsx`                                       |
| `app/globals.css`                          | `before-login/styles/globals.css`                                                   |
| `components/**`                            | `before-login/components/**`                                                        |
| `lib/**`                                   | `before-login/lib/**`                                                               |
| `public/icon.svg`, `public/apple-icon.png` | `public/` (if a file with that name already exists, tell me before overwriting)     |

**E2. Import specifiers only.** Add the path alias `@bl/*` -> `./before-login/*` in tsconfig. In the moved files change `@/components/` to `@bl/components/`, `@/lib/` to `@bl/lib/`, and the layout's `./globals.css` import to `@bl/styles/globals.css`. Change nothing else on those lines.

**E3. Brand spelling.** The v0 code says "SkillProf" in 16 places. Change to "SkillProof" (text only):
`app/layout.tsx` (3), `app/passport/demo/page.tsx` (1), `app/privacy/page.tsx` (2), `components/brand/logo.tsx` (2), `components/landing/demo/interactive-demo.tsx` (1), `components/landing/demo/step-role.tsx` (1), `components/landing/hero-visual.tsx` (1), `components/landing/product-preview.tsx` (3), `components/landing/site-footer.tsx` (1), `components/shared/passport-card.tsx` (1).

**E4. Link targets (href values only):**

| File                                                                                    | Old                | New                |
| --------------------------------------------------------------------------------------- | ------------------ | ------------------ |
| `components/landing/site-nav.tsx` (desktop and mobile menu)                             | `/dashboard`       | `/login`           |
| `components/landing/site-nav.tsx` (desktop and mobile menu)                             | `/assessment/demo` | `/signup`          |
| `components/landing/hero.tsx`                                                           | `/assessment/demo` | `/signup`          |
| `components/landing/final-cta.tsx`                                                      | `/assessment/demo` | `/signup`          |
| `components/landing/demo/step-passport.tsx`, `components/landing/passport-showcase.tsx` | `/passport/demo`   | `/sample-passport` |

Anchor links (`#demo`, `#how-it-works`, `#product`, `#passport`) stay as they are.

**E5. Preview-only animation switch (default OFF).** In `components/shared/motion.tsx` (`Reveal`) and `components/landing/hero.tsx`, skip the hidden starting state (`initial={false}`) ONLY when `process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"`. When the variable is not set, behaviour must be exactly the original. Comment it "preview-only workaround".

## Not included on purpose

The v0 demo `/dashboard`, `/assessment/demo` and the v0 `components/dashboard`, `components/assessment`, `components/ui` folders. They would clash with the real after-login app.
