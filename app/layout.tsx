import type {Metadata,Viewport} from 'next'
import {PreferencesProvider} from '@/app/components/ui/preferences-provider'
import {PwaRegistration} from '@/app/components/ui/pwa-registration'
import {ContentProvider} from '@/app/components/providers/content-provider'
import {getProjects, getSite} from '@/lib/content/store'
import {siteUrl} from './seo'
import './globals.css'

const socialImage='/opengraph-image.png'

export async function generateMetadata():Promise<Metadata>{
  const site=await getSite()
  const socialTitle=`${site.identity.name} — ${site.identity.jobTitle}`
  const defaultTitle=`${site.identity.name} | ${site.identity.jobTitle}`
  return {
    metadataBase:siteUrl,
    title:{default:defaultTitle,template:`%s | ${site.identity.name}`},
    description:site.metadata.description,
    applicationName:site.identity.brand,
    authors:[{name:site.identity.name,url:site.contacts.linkedin}],
    creator:site.identity.name,
    publisher:site.identity.name,
    category:'technology',
    keywords:['Fernando Forastieri','Engenheiro de Software','Desenvolvedor Fullstack','Next.js','React','Inteligência Artificial'],
    alternates:{canonical:'/'},
    manifest:'/manifest.webmanifest',
    icons:{icon:[{url:'/favicon.svg',type:'image/svg+xml',sizes:'any'},{url:'/icon.png',type:'image/png',sizes:'128x128'}],shortcut:'/favicon.svg',apple:'/pwa-icon.svg'},
    appleWebApp:{capable:true,title:site.identity.brand,statusBarStyle:'black-translucent'},
    openGraph:{type:'website',locale:'pt_BR',url:'/',siteName:site.identity.brand,title:socialTitle,description:site.metadata.description,images:[{url:socialImage,width:1200,height:630,alt:`${site.identity.name}, ${site.identity.jobTitle}`}]},
    twitter:{card:'summary_large_image',title:socialTitle,description:site.metadata.description,images:[socialImage]},
    robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  }
}

export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: dark)',color:'#181714'},{media:'(prefers-color-scheme: light)',color:'#e9e1d4'}]}

export default async function Layout({children}:{children:React.ReactNode}){
  const [site,projects]=await Promise.all([getSite(),getProjects()])
  const socialTitle=`${site.identity.name} — ${site.identity.jobTitle}`
  const defaultTitle=`${site.identity.name} | ${site.identity.jobTitle}`
  const person={
    '@type':'Person','@id':new URL('/#person',siteUrl).href,name:site.identity.name,url:siteUrl.href,image:new URL('/assets/fernando.png',siteUrl).href,jobTitle:site.identity.jobTitle,address:{'@type':'PostalAddress',addressLocality:'Sorocaba',addressRegion:'SP',addressCountry:'BR'},sameAs:[site.contacts.linkedin,site.contacts.github,site.contacts.x],email:`mailto:${site.contacts.email}`,knowsAbout:['Next.js','React','TypeScript','Node.js','Inteligência Artificial','Design Systems','Infraestrutura de software'],
  }
  const website={'@type':'WebSite','@id':new URL('/#website',siteUrl).href,name:site.identity.brand,alternateName:`Portfólio de ${site.identity.name}`,url:siteUrl.href,description:site.metadata.description,inLanguage:'pt-BR',publisher:{'@id':person['@id']}}
  const profilePage={'@type':'ProfilePage','@id':new URL('/#webpage',siteUrl).href,url:siteUrl.href,name:defaultTitle,description:site.metadata.description,inLanguage:'pt-BR',isPartOf:{'@id':website['@id']},mainEntity:{'@id':person['@id']}}
  const navigation={'@type':'ItemList','@id':new URL('/#navigation',siteUrl).href,name:'Navegação principal',itemListElement:[['Início','/'],['Projetos','/projetos/'],['Currículo','/curriculo/']].map(([name,path],index)=>({'@type':'ListItem',position:index+1,name,url:new URL(path,siteUrl).href}))}
  const structuredData={'@context':'https://schema.org','@graph':[person,website,profilePage,navigation]}
  return <html lang="pt-BR" data-theme="dark" className="min-h-full min-w-80 bg-ink scroll-smooth font-sans"><body className="min-h-full bg-ink font-sans" suppressHydrationWarning><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,'\\u003c')}}/><ContentProvider site={site} projects={projects}><PreferencesProvider><PwaRegistration/>{children}</PreferencesProvider></ContentProvider></body></html>
}
