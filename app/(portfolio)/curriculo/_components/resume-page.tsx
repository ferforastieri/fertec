'use client'

import {useRef,useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import {useScrollReveal} from '@/app/hooks/use-scroll-reveal'
import {useProjects,useSite} from '@/app/components/providers/content-provider'
import {SocialIcon} from '@/app/components/ui/social-icon'

function splitRole(role:string){
  const [position,...progressionParts]=role.split(' · ')
  return {position,progression:progressionParts.join(' · ')}
}

export function ResumePage(){
  const site=useSite()
  const allProjects=useProjects()
  const t=useTranslations('Resume')
  const featured=allProjects.filter(project=>project.id==='miraj'||project.id==='mimelie')
  const featuredProjects=(featured.length?featured:allProjects.filter(project=>project.group==='personal').slice(0,2)).sort((a,b)=>Number(b.id==='miraj')-Number(a.id==='miraj'))
  const root=useRef<HTMLElement>(null)
  const [exporting,setExporting]=useState(false)
  useScrollReveal(root,'.resume-reveal')
  const download=async()=>{
    if(exporting)return
    setExporting(true)
    try{
      const {jsPDF}=await import('jspdf')
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'})
      const pageWidth=pdf.internal.pageSize.getWidth()
      const pageHeight=pdf.internal.pageSize.getHeight()
      const margin=18
      const contentWidth=pageWidth-margin*2
      const bottom=pageHeight-18
      let y=margin
      const nextPage=()=>{pdf.addPage();y=margin}
      const ensureSpace=(height:number)=>{if(y+height>bottom)nextPage()}
      const line=(offset=0)=>{ensureSpace(6);pdf.setDrawColor(185,185,185);pdf.setLineWidth(.25);pdf.line(margin,y+offset,pageWidth-margin,y+offset)}
      const paragraph=(text:string,size=10,leading=4.5)=>{
        pdf.setFont('helvetica','normal')
        pdf.setFontSize(size)
        pdf.setTextColor(45,45,45)
        const lines=pdf.splitTextToSize(text,contentWidth)
        ensureSpace(lines.length*leading+2)
        pdf.text(lines,margin,y)
        y+=lines.length*leading+2
      }
      const section=(title:string)=>{
        ensureSpace(13)
        if(y>margin)line()
        y+=6
        pdf.setFont('helvetica','bold')
        pdf.setFontSize(11)
        pdf.setTextColor(25,25,25)
        pdf.text(title.toUpperCase(),margin,y)
        y+=7
      }
      const item=(title:string,subtitle:string,detail:string)=>{
        ensureSpace(18)
        pdf.setFont('helvetica','bold')
        pdf.setFontSize(10.5)
        pdf.setTextColor(30,30,30)
        pdf.text(title,margin,y)
        y+=4.8
        pdf.setFont('helvetica','normal')
        pdf.setFontSize(9.5)
        pdf.setTextColor(85,85,85)
        const subtitleLines=pdf.splitTextToSize(subtitle,contentWidth)
        ensureSpace(subtitleLines.length*4.2)
        pdf.text(subtitleLines,margin,y)
        y+=subtitleLines.length*4.2
        paragraph(detail,9.5,4.2)
        y+=3
      }

      pdf.setProperties({title:`${site.identity.name} - ${site.copy.resumeRole}`,author:site.identity.name,subject:site.copy.resumeEyebrow})
      pdf.setFont('helvetica','bold')
      pdf.setFontSize(22)
      pdf.setTextColor(25,25,25)
      pdf.text(site.identity.name,margin,y)
      y+=8
      pdf.setFont('helvetica','normal')
      pdf.setFontSize(11)
      pdf.setTextColor(75,75,75)
      pdf.text(site.copy.resumeRole,margin,y)
      y+=5
      pdf.setFontSize(9)
      pdf.text(`${site.copy.resumeLocation}  |  ${site.contacts.email}`,margin,y)
      y+=4.5
      pdf.text(`${site.contacts.linkedin}  |  ${site.contacts.github}`,margin,y)
      y+=8

      section(t('summaryEyebrow'))
      paragraph(site.copy.resumeSummary)

      section(t('experience'))
      site.experience.forEach(entry=>{
        const {position,progression=''}=splitRole(entry.role)
        const pdfRole=progression?`${position} | ${progression.replace(/\s*→\s*/,' a ')}`:position
        item(
          pdfRole,
          `${entry.company} | ${entry.location} | ${entry.period}`,
          entry.description,
        )
      })

      section(t('education'))
      site.education.forEach(entry=>item(
        entry.course,
        [entry.school,entry.period,entry.note??''].filter(Boolean).join(' | '),
        '',
      ))

      section(t('skills'))
      Object.entries(site.resumeSkills).forEach(([group,items])=>{
        ensureSpace(11)
        pdf.setFont('helvetica','bold')
        pdf.setFontSize(9.5)
        pdf.setTextColor(45,45,45)
        pdf.text(`${t(`skillGroups.${group}`)}:`,margin,y)
        const labelWidth=pdf.getTextWidth(`${t(`skillGroups.${group}`)}: `)
        pdf.setFont('helvetica','normal')
        const skillLines=pdf.splitTextToSize(items.join(' · '),contentWidth-labelWidth)
        pdf.text(skillLines,margin+labelWidth,y)
        y+=Math.max(1,skillLines.length)*4.5+2
      })

      section(t('projects'))
      featuredProjects.forEach(project=>item(
        project.title,
        project.tags.join(' · '),
        project.description,
      ))

      section(t('languages'))
      site.resumeLanguages.forEach(language=>item(
        language.name,
        `${language.level} | ${language.cefr}`,
        '',
      ))

      const pages=pdf.getNumberOfPages()
      for(let page=1;page<=pages;page++){
        pdf.setPage(page)
        pdf.setFont('helvetica','normal')
        pdf.setFontSize(8)
        pdf.setTextColor(120,120,120)
        pdf.text(`${site.identity.name} · ${page}/${pages}`,pageWidth-margin,pageHeight-10,{align:'right'})
      }
      pdf.save(site.copy.downloadFileName||t('downloadFileName'))
    }catch(error){console.error('Não foi possível gerar o currículo em PDF.',error)}finally{setExporting(false)}
  }
  const pill='group inline-flex min-h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[color-mix(in_srgb,var(--paper)_34%,transparent)] bg-transparent px-2.5 text-center text-[10px] leading-none font-bold tracking-[.09em] text-inherit uppercase no-underline transition-[background,color,border-color] duration-200 hover:border-paper hover:bg-paper hover:text-ink'
  const contactIcon='h-3.5 w-3.5 flex-none transition-transform duration-200 group-hover:scale-110'
  const sectionClass='resume-section grid grid-cols-1 justify-items-center gap-6 border-t border-[color-mix(in_srgb,var(--paper)_22%,transparent)] py-10 md:grid-cols-[minmax(180px,.4fr)_1fr] md:justify-items-stretch md:gap-10 md:py-6'
  const sectionHeaderClass='resume-section-title resume-reveal opacity-0 motion-reduce:opacity-100 motion-reduce:transform-none'
  const sectionTitleClass='mx-auto mt-3 mb-0 max-w-none font-display text-[clamp(32px,min(3.6vw,5.2vh),46px)] leading-[.9] font-normal md:mx-0 md:max-w-[8ch]'
  const timelineClass='relative grid w-full before:absolute before:top-[7px] before:bottom-[7px] before:left-[5px] before:w-px before:bg-[color-mix(in_srgb,var(--paper)_24%,transparent)]'
  const timelineItemClass='resume-reveal relative grid grid-cols-[11px_minmax(0,1fr)] gap-x-5 pb-10 text-left opacity-0 last:pb-0 motion-reduce:opacity-100 motion-reduce:transform-none'
  const timelineMarker=<span className="relative z-10 mt-1.5 block h-[11px] w-[11px] rounded-full border-2 border-paper bg-ink shadow-[0_0_0_5px_var(--ink)]" aria-hidden="true"/>
  return <main ref={root} className="editorial-page resume-page pt-4 text-center md:text-left" data-resume-document>
    <header className="resume-header resume-reveal grid grid-cols-1 [grid-template-areas:'eyebrow'_'title'_'photo'_'meta'_'links'] justify-items-center gap-x-[18px] gap-y-3 border-b border-[color-mix(in_srgb,var(--paper)_28%,transparent)] pb-9 opacity-0 motion-reduce:opacity-100 motion-reduce:transform-none md:grid-cols-[minmax(0,1fr)_190px] md:[grid-template-areas:'eyebrow_eyebrow'_'title_photo'_'meta_photo'_'links_links'] md:items-start md:justify-items-stretch md:gap-x-12 md:gap-y-3 md:pb-6">
      <p className="m-0 [grid-area:eyebrow] text-caption font-[750] tracking-[.2em] uppercase opacity-55">{site.copy.resumeEyebrow}</p>
      <h1 className="m-0 max-w-[12ch] [grid-area:title] font-display text-[clamp(44px,12vw,58px)] leading-[.9] font-normal tracking-[-.04em] md:max-w-none md:whitespace-nowrap md:text-[clamp(48px,min(5vw,7vh),66px)]">{site.copy.resumeTitle}</h1>
      <div className="resume-photo-frame pointer-events-none relative w-[min(48vw,180px)] [grid-area:photo] aspect-square overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--paper)_28%,transparent)] shadow-[0_20px_55px_rgba(0,0,0,.24)] md:w-[190px] md:self-start md:rounded-3xl"><Image className="block h-full w-full object-cover" src="/assets/fernando.png" alt={t('portraitAlt')} width={320} height={320} priority/></div>
      <div className="grid [grid-area:meta] gap-1.5"><strong className="font-display text-[25px] font-normal">{site.copy.resumeRole}</strong><span className="text-label tracking-[.11em] uppercase opacity-55">{site.copy.resumeLocation}</span></div>
      <nav className="mt-1 flex flex-wrap justify-center gap-2.5 [grid-area:links] md:justify-start" aria-label={t('contact')}><a className={pill} href={`mailto:${site.contacts.email}`}><SocialIcon network="email" className={contactIcon}/>{t('email')} ↗</a><a className={pill} href={site.contacts.linkedin} target="_blank" rel="noreferrer"><SocialIcon network="linkedin" className={contactIcon}/>{t('linkedin')} ↗</a><a className={pill} href={site.contacts.github} target="_blank" rel="noreferrer"><SocialIcon network="github" className={contactIcon}/>{t('github')} ↗</a><button className="resume-download mx-auto mt-1 inline-flex min-h-9 w-full max-w-[270px] items-center justify-center gap-2 rounded-lg border border-paper bg-paper px-3.5 text-caption font-bold tracking-[.09em] text-ink uppercase shadow-[0_12px_30px_rgba(0,0,0,.18)] transition-[transform,box-shadow] duration-240 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,.25)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_16px_36px_rgba(0,0,0,.25)] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55 md:mr-0 md:ml-auto md:w-auto" type="button" onClick={download} disabled={exporting} data-html2canvas-ignore>{t(exporting?'generating':'download')} <svg className="h-[15px] w-[15px] flex-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10"/></svg></button></nav>
    </header>

    <section className={sectionClass} aria-labelledby="resume-objective">
      <header className={sectionHeaderClass}><p className="editorial-number m-0 text-caption tracking-[.18em] uppercase">{site.sectionNumbers.objective}</p><h2 className={sectionTitleClass} id="resume-objective">{t('summaryEyebrow')}</h2></header>
      <p className="resume-reveal m-0 w-full text-center font-display text-[clamp(20px,5.6vw,25px)] leading-[1.36] font-normal tracking-[-.01em] opacity-0 motion-reduce:opacity-100 motion-reduce:transform-none md:text-left md:text-[clamp(20px,min(1.9vw,2.7vh),23px)]">{site.copy.resumeSummary}</p>
    </section>

    <section className={sectionClass} aria-labelledby="resume-experience">
      <header className={sectionHeaderClass}><p className="editorial-number m-0 text-caption tracking-[.18em] uppercase">{site.sectionNumbers.experience}</p><h2 className={sectionTitleClass} id="resume-experience">{t('experience')}</h2></header>
      <div className={`resume-experience-list ${timelineClass}`}>{site.experience.map(entry=>{const {position,progression}=splitRole(entry.role);const [previousRole,nextRole]=progression.split('→').map(value=>value.trim());return <article className={`resume-experience ${timelineItemClass}`} key={entry.id}>{timelineMarker}<div><div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1"><p className="m-0 text-caption font-[750] tracking-[.15em] uppercase opacity-58">{entry.company}</p><span className="font-display text-base leading-none opacity-62">{entry.period}</span></div><h3 className="m-0 font-display text-[26px] leading-[.98] font-normal"><span>{position}</span>{progression&&<span className="hidden md:inline"> · {progression}</span>}</h3>{previousRole&&nextRole&&<div className="mt-3 grid grid-cols-[auto_minmax(28px,1fr)_auto] items-center gap-2 md:hidden" aria-label={progression}><span className="content-chip rounded-lg px-3 py-2 text-caption leading-none">{previousRole}</span><i className="relative h-px bg-[color-mix(in_srgb,var(--paper)_38%,transparent)] after:absolute after:top-1/2 after:right-0 after:h-1.5 after:w-1.5 after:-translate-y-1/2 after:rotate-45 after:border-t after:border-r after:border-current after:content-['']" aria-hidden="true"/><span className="content-chip rounded-lg px-3 py-2 text-caption leading-none">{nextRole}</span></div>}<small className="mt-2 block font-sans text-caption tracking-[.1em] uppercase opacity-46">{entry.location}</small><p className="mt-3.5 mb-0 text-body-sm leading-[1.7] opacity-68">{entry.description}</p></div></article>})}</div>
    </section>

    <section className={sectionClass} aria-labelledby="resume-education">
      <header className={sectionHeaderClass}><p className="editorial-number m-0 text-caption tracking-[.18em] uppercase">{site.sectionNumbers.education}</p><h2 className={sectionTitleClass} id="resume-education">{t('education')}</h2></header>
      <div className={`resume-education-list ${timelineClass}`}>{site.education.map(entry=><article className={timelineItemClass} key={entry.id}>{timelineMarker}<div><div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1"><p className="m-0 text-caption font-[750] tracking-[.15em] uppercase opacity-58">{entry.school}</p>{entry.period?<span className="font-display text-base leading-none opacity-62">{entry.period}</span>:null}</div><h3 className="m-0 font-display text-[26px] leading-[.98] font-normal">{entry.course}</h3>{entry.note&&<p className="mt-2 mb-0 flex items-center gap-2 text-caption font-semibold tracking-[.04em] opacity-58"><i className="h-px w-5 shrink-0 bg-current" aria-hidden="true"/>{entry.note}</p>}</div></article>)}</div>
    </section>

    <section className={sectionClass} aria-labelledby="resume-skills">
      <header className={sectionHeaderClass}><p className="editorial-number m-0 text-caption tracking-[.18em] uppercase">{site.sectionNumbers.skills}</p><h2 className={sectionTitleClass} id="resume-skills">{t('skills')}</h2></header>
      <div className="resume-skills grid grid-cols-1 justify-items-center gap-x-9 gap-y-7 md:grid-cols-2 md:justify-items-stretch">{Object.entries(site.resumeSkills).map(([group,items])=><article className="resume-reveal opacity-0 last:md:col-span-2 motion-reduce:opacity-100 motion-reduce:transform-none" key={group}><h3 className="m-0 mb-3 text-caption tracking-[.15em] uppercase opacity-74">{t(`skillGroups.${group}`)}</h3><ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0 md:justify-start">{items.map(item=><li className="content-chip rounded-lg px-3 py-2 text-caption" key={item}>{item}</li>)}</ul></article>)}</div>
    </section>

    <section className={sectionClass} aria-labelledby="resume-projects">
      <header className={sectionHeaderClass}><p className="editorial-number m-0 text-caption tracking-[.18em] uppercase">{site.sectionNumbers.projects}</p><h2 className={sectionTitleClass} id="resume-projects">{t('projects')}</h2></header>
      <div className="resume-project-list grid w-full">{featuredProjects.map((project,index)=><Link className={`resume-reveal group relative grid grid-cols-1 border-t border-[color-mix(in_srgb,var(--paper)_24%,transparent)] py-6 text-left text-inherit no-underline opacity-0 motion-reduce:opacity-100 motion-reduce:transform-none md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-5 md:py-7 ${index===0?'border-t-0 pt-0':''}`} href={`/projetos/${project.id}`} key={project.id}><div className="pr-10 md:pr-0"><p className="m-0 mb-2 max-w-full text-caption leading-[1.55] font-[750] tracking-[.12em] uppercase opacity-52">{project.tags.join(' · ')}</p><h3 className="m-0 font-display text-[clamp(28px,7vw,32px)] leading-none font-normal">{project.title}</h3><p className="mt-3 mb-0 max-w-[54ch] text-body-sm leading-[1.65] opacity-68">{project.description}</p></div><span className="absolute top-0 right-0 grid h-8 w-8 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--paper)_30%,transparent)] font-display text-lg transition-[transform,background,color] duration-200 group-hover:translate-x-1 group-hover:bg-paper group-hover:text-ink md:static md:mt-6 md:block md:h-auto md:w-auto md:rounded-none md:border-0 md:text-2xl" aria-hidden="true">→</span></Link>)}</div>
    </section>

    <section className={sectionClass} aria-labelledby="resume-languages"><header className={sectionHeaderClass}><p className="editorial-number m-0 text-caption tracking-[.18em] uppercase">{site.sectionNumbers.languages}</p><h2 className={sectionTitleClass} id="resume-languages">{t('languages')}</h2></header><ul className="m-0 grid w-full list-none gap-px bg-[color-mix(in_srgb,var(--paper)_18%,transparent)] p-0 sm:grid-cols-2">{site.resumeLanguages.map(language=><li className="grid gap-2 bg-[color-mix(in_srgb,var(--ink)_95%,transparent)] p-5 text-center sm:text-left" key={language.id}><strong className="font-display text-2xl font-normal">{language.name}</strong><span className="text-label opacity-64">{language.level}</span><span className="text-caption font-[750] tracking-[.14em] uppercase opacity-48">CEFR · {language.cefr}</span></li>)}</ul></section>
  </main>
}
