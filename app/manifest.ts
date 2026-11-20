import type {MetadataRoute} from 'next'
import {getSite} from '@/lib/content/store'

export const dynamic='force-dynamic'

export default async function manifest():Promise<MetadataRoute.Manifest>{const siteContent=await getSite();return{
  name:`${siteContent.identity.brand} — ${siteContent.identity.name}`,
  short_name:siteContent.identity.brand,
  description:siteContent.metadata.description,
  start_url:'/',
  scope:'/',
  display:'standalone',
  background_color:'#181714',
  theme_color:'#181714',
  orientation:'portrait-primary',
  categories:['portfolio','technology','design'],
  icons:[
    {src:'/pwa-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},
    {src:'/pwa-maskable.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'},
  ],
}}
