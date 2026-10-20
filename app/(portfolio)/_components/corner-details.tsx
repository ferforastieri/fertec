'use client'

import {useTranslations} from 'next-intl'
import {TypedText} from '@/app/components/ui/typed-text'
import {HomePillLink} from '@/app/components/ui/home-pill-link'
import {projects} from '@/messages/project-data'
import {siteContent} from '@/messages/site-content'

export function CornerDetails(){
  const metrics=useTranslations('Metrics')
  const home=useTranslations('Home')

  const mobileMetric='block font-display text-[clamp(30px,9vw,38px)] leading-none text-paper'
  const mobileLabel='mt-1 block text-[9px] leading-[1.3] font-[760] tracking-[.12em] uppercase text-[color-mix(in_srgb,var(--paper)_72%,transparent)]'

  return <>
    <aside className="corner-metrics scene-item static order-3 z-12 mx-auto block w-full max-w-[320px] self-center text-center md:hidden" aria-label={metrics('aria')}>
      <div className="grid grid-cols-2 border-y border-[color-mix(in_srgb,var(--paper)_22%,transparent)]">
        <div className="px-2 py-3">
          <span className={mobileMetric}>{siteContent.metrics.years}</span>
          <span className={mobileLabel}>{metrics('years')}</span>
        </div>
        <div className="border-l border-[color-mix(in_srgb,var(--paper)_22%,transparent)] px-2 py-3">
          <span className={mobileMetric}>{projects.length}</span>
          <span className={mobileLabel}>{metrics('projects')}</span>
        </div>
      </div>
      <HomePillLink className="mx-auto mt-3.5 min-h-11! w-[min(100%,220px)]!" href="/projetos" label={home('mobileProjectsCta')} tone="solid"/>
    </aside>

    <aside className="corner-metrics home-scroll-fade scene-item absolute right-[4.5vw] bottom-[3.5vh] z-12 hidden w-[min(21vw,250px)] text-right text-[color-mix(in_srgb,var(--paper)_82%,transparent)] md:block md:max-[1100px]:w-[210px] md:will-change-[transform,opacity]" aria-label={metrics('aria')}>
      <p className="m-0 origin-right -rotate-2 font-display text-[clamp(29px,min(2.45vw,4.4vh),40px)] leading-[.92] italic"><TypedText text={`${siteContent.metrics.years} ${metrics('years').toLocaleLowerCase()}`}/></p>
      <TypedText className="mt-4 ml-auto block max-w-[34ch] text-small leading-[1.5] font-[560] text-[color-mix(in_srgb,var(--paper)_92%,transparent)]" text={`${projects.length} ${metrics('projects').toLocaleLowerCase()}`}/>
      <HomePillLink className="mt-4" href="/projetos" label={home('projectsCta')}/>
    </aside>
  </>
}
