import Link from 'next/link'
import type {MouseEventHandler} from 'react'

type HomePillLinkProps={
  href:string
  label:string
  arrow?:'external'|'down'
  tone?:'outline'|'solid'
  className?:string
  external?:boolean
  onClick?:MouseEventHandler<HTMLAnchorElement>
}

export function HomePillLink({href,label,arrow='external',tone='outline',className='',external=false,onClick}:HomePillLinkProps){
  const classes=`group inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border ${tone==='solid'?'border-paper bg-paper text-ink hover:bg-transparent hover:text-paper':'border-[color-mix(in_srgb,var(--paper)_54%,transparent)] text-inherit hover:bg-paper hover:text-ink'} px-3 py-1.5 text-[10px] font-[760] tracking-[.12em] whitespace-nowrap uppercase no-underline transition-[background,color,transform] duration-250 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:bg-paper focus-visible:text-ink focus-visible:outline-none md:min-h-8 md:px-3 md:text-[11px] ${className}`
  const content=<>
    <span>{label}</span>
    {arrow==='down'
      ?<span className="mr-1 inline-grid h-4 w-4 shrink-0 place-items-center overflow-hidden" aria-hidden="true"><svg className="home-pill-link__down-arrow block h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"><path d="M8 2.25v10.5m0 0 3.5-3.5M8 12.75l-3.5-3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
      :<span className="font-display text-sm font-normal transition-transform duration-250 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true">↗</span>}
  </>

  return external
    ?<a className={classes} href={href} target="_blank" rel="noreferrer" onClick={onClick}>{content}</a>
    :<Link className={classes} href={href} onClick={onClick}>{content}</Link>
}
