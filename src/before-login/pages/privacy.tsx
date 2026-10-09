import { SiteFooter } from '@bl/components/landing/site-footer'
import { SiteNav } from '@bl/components/landing/site-nav'

const sections = [
  {
    title: 'What this demo stores',
    body: 'Nothing. This SkillProof experience is a demo. Assessment answers stay in your browser tab and are cleared when you leave the page.',
  },
  {
    title: 'Your Skill Passport',
    body: 'In the full product, you decide whether your Passport is public. Shared links only show the skills and evidence you choose to include.',
  },
  {
    title: 'Evidence and scores',
    body: 'Evidence is used only to verify your skills. It is never sold, and you can delete it from your account at any time.',
  },
]

export function PrivacyPage() {
  return (
    <>
      <title>Privacy · SkillProof</title>
      <SiteNav />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Privacy</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink">Your data, your proof.</h1>
        <div className="mt-12 flex flex-col gap-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold tracking-tight text-ink">{s.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default PrivacyPage
