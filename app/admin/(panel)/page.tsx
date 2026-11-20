import {currentAdmin} from '@/lib/auth'
import {Editor} from '../_components/editor'

export const dynamic='force-dynamic'

export default async function AdminPage(){
  const admin=await currentAdmin()
  return <Editor email={admin?.email??''}/>
}
