import type {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {currentAdmin, countAdmins} from '@/lib/auth'

export const dynamic='force-dynamic'

export default async function PanelLayout({children}:{children:ReactNode}){
  const admin=await currentAdmin()
  if(!admin){
    if((await countAdmins())===0)redirect('/admin/setup')
    redirect('/admin/login')
  }
  return <>{children}</>
}
