'use client'

import {useSite} from '@/app/components/providers/content-provider'
import {TechMonogram} from './tech-monogram'

export function Logo({withName=true}:{withName?:boolean}){const site=useSite();return <span className="inline-flex items-center gap-2.5" aria-label={site.identity.brand}>
  <TechMonogram className="h-[30px] w-[45px] overflow-visible text-current"/>
  {withName&&<strong className="text-small font-bold tracking-[.12em] uppercase">{site.identity.brand}</strong>}
</span>}
