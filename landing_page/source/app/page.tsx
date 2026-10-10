import { Features } from '@/components/landing/features'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { InteractiveDemo } from '@/components/landing/demo/interactive-demo'
import { PassportShowcase } from '@/components/landing/passport-showcase'
import { ProductPreview } from '@/components/landing/product-preview'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteNav } from '@/components/landing/site-nav'
import { SkillGap } from '@/components/landing/skill-gap'

export default function Page() {
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
