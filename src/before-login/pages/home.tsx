import { Features } from '@bl/components/landing/features'
import { FinalCta } from '@bl/components/landing/final-cta'
import { Hero } from '@bl/components/landing/hero'
import { HowItWorks } from '@bl/components/landing/how-it-works'
import { InteractiveDemo } from '@bl/components/landing/demo/interactive-demo'
import { PassportShowcase } from '@bl/components/landing/passport-showcase'
import { ProductPreview } from '@bl/components/landing/product-preview'
import { SiteFooter } from '@bl/components/landing/site-footer'
import { SiteNav } from '@bl/components/landing/site-nav'
import { SkillGap } from '@bl/components/landing/skill-gap'

export function HomePage() {
  return (
    <>
      <SiteNav />
      <main className="overflow-x-clip">
        <Hero />
        <ProductPreview />
        <InteractiveDemo />
        <HowItWorks />
        <Features />
        <SkillGap />
        <PassportShowcase />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}

export default HomePage
