import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ProjectDetailPage} from '../_components/project-detail-page'
import {JsonLd} from '@/app/components/seo/json-ld'
import {getProjectsWithTrees,getSite} from '@/lib/content/store'
import {breadcrumbJsonLd,pageMetadata} from '@/app/seo'

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const [project,site]=await Promise.all([(await getProjectsWithTrees()).find(item=>item.id===slug),getSite()]);if(!project)return{};return pageMetadata(project.title,project.description,`/projetos/${project.id}/`,site)}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const projects=await getProjectsWithTrees();const project=projects.find(item=>item.id===slug);if(!project)notFound();const breadcrumbs=breadcrumbJsonLd([{name:'Início',path:'/'},{name:'Projetos',path:'/projetos/'},{name:project.title,path:`/projetos/${project.id}/`}]);return <><JsonLd data={breadcrumbs}/><ProjectDetailPage project={project}/></>}
