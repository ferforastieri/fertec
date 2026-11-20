import {ProjectsPage} from './_components/projects-page'
import {JsonLd} from '@/app/components/seo/json-ld'
import {getSite} from '@/lib/content/store'
import {breadcrumbJsonLd,pageMetadata} from '@/app/seo'

export async function generateMetadata(){const site=await getSite();return pageMetadata(site.metadata.titles.projects,site.metadata.projects,'/projetos/',site)}
const breadcrumbs=breadcrumbJsonLd([{name:'Início',path:'/'},{name:'Projetos',path:'/projetos/'}])
export default function Page(){return <><JsonLd data={breadcrumbs}/><ProjectsPage/></>}
