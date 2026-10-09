import type { Metadata } from 'next'
import { PassportProfile } from '@/components/passport/passport-profile'

export const metadata: Metadata = {
  title: 'Alex Morgan · Skill Passport',
  description: 'A sample SkillProf Skill Passport with evidence-backed, verified skills.',
}

export default function PassportDemoPage() {
  return <PassportProfile />
}
