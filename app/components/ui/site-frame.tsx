import type {ReactNode} from 'react'
import Link from 'next/link'
import {FloatingNavigation} from './floating-navigation'
import {Logo} from './logo'
import {SceneShell} from './scene-shell'
import {GlobalFooter,GlobalProfileCorner} from './global-profile'
import {PageNavigation} from './page-navigation'
import {getSite} from '@/lib/content/store'

export async function SiteFrame({children,className=''}:{children:ReactNode;className?:string}){const site=await getSite();return <SceneShell className={className}>
  <FloatingNavigation/>
  <PageNavigation/>
  <Link className="corner-logo scene-item fixed top-[26px] left-[4.5vw] z-30 text-paper no-underline will-change-[transform,opacity] max-md:hidden" href="/" aria-label={site.identity.name}><Logo/></Link>
  <div className="route-view relative z-1 min-h-svh min-w-0">{children}<GlobalFooter hideOnHome/></div>
  <GlobalProfileCorner/>
</SceneShell>}
