import type {ReactNode} from 'react'
import {redirect} from 'next/navigation'
import {currentAdmin, countAdmins} from '@/lib/auth'
import {getDb} from '@/lib/db'

export const dynamic='force-dynamic'

export default async function PanelLayout({children}:{children:ReactNode}){
  const admin=await currentAdmin()
  if(!admin){
    if((await countAdmins())===0){
      const db=await getDb()
      const setup=db?await db.prepare('SELECT COUNT(*) AS total FROM setup_state').first<{total:number}>():null
      if(!setup?.total)redirect('/admin/setup')
    }
    redirect('/admin/login')
  }
  return <>{children}</>
}
