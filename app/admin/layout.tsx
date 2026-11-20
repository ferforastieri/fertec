import type {ReactNode} from 'react'

export const metadata={title:'Painel | Fertec',robots:{index:false,follow:false}}

export default function AdminLayout({children}:{children:ReactNode}){
  return <main className="mx-auto min-h-svh w-full max-w-[1180px] px-5 pt-8 pb-16 text-paper md:px-8">{children}</main>
}
