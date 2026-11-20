import {ResumePage} from './_components/resume-page'
import {JsonLd} from '@/app/components/seo/json-ld'
import {getSite} from '@/lib/content/store'
import {breadcrumbJsonLd,pageMetadata} from '@/app/seo'

export async function generateMetadata(){const site=await getSite();return pageMetadata(site.metadata.titles.resume,site.metadata.resume,'/curriculo/',site)}
const breadcrumbs=breadcrumbJsonLd([{name:'Início',path:'/'},{name:'Currículo',path:'/curriculo/'}])

export default function Page(){return <><JsonLd data={breadcrumbs}/><ResumePage/></>}
