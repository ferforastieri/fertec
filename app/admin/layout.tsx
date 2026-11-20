import type {ReactNode} from 'react'
import {CustomCursor} from '@/app/components/ui/custom-cursor'

export const metadata={title:'Painel | Fertec',robots:{index:false,follow:false}}

export default function AdminLayout({children}:{children:ReactNode}){
  return <div className="admin-shell min-h-svh bg-ink"><CustomCursor/><main className="mx-auto w-full max-w-[1180px] px-5 pt-8 pb-16 text-paper md:px-8">{children}</main></div>
}
