'use client'

import {useState} from 'react'

export default function LoginPage(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault()
    setLoading(true)
    setError('')
    const response=await fetch('/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})})
    const data=(await response.json()) as {error?:string}
    if(response.ok)window.location.href='/admin'
    else{setError(data.error??'Falha ao entrar.');setLoading(false)}
  }
  const input='w-full rounded-lg border border-[color-mix(in_srgb,var(--paper)_24%,transparent)] bg-[color-mix(in_srgb,var(--paper)_6%,transparent)] px-3 py-2.5 text-paper outline-none focus:border-paper'
  return <div className="mx-auto grid min-h-[70svh] w-full max-w-[380px] content-center gap-5">
    <div><p className="m-0 text-caption font-bold tracking-[.2em] uppercase opacity-55">Fertec</p><h1 className="mt-2 mb-0 font-display text-4xl font-normal">Entrar no painel</h1></div>
    <form className="grid gap-3" onSubmit={submit}>
      <input className={input} type="email" name="email" autoComplete="username" placeholder="E-mail" value={email} onChange={event=>setEmail(event.target.value)} required/>
      <input className={input} type="password" name="password" autoComplete="current-password" placeholder="Senha" value={password} onChange={event=>setPassword(event.target.value)} required/>
      {error&&<p className="m-0 text-body-sm text-red-300">{error}</p>}
      <button className="rounded-lg bg-paper px-4 py-2.5 text-caption font-bold tracking-[.1em] text-ink uppercase disabled:opacity-50" type="submit" disabled={loading}>{loading?'Entrando…':'Entrar'}</button>
    </form>
  </div>
}
