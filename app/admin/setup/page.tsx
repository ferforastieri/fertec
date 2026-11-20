'use client'

import {useState} from 'react'

export default function SetupPage(){
  const [token,setToken]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault()
    setLoading(true)
    const response=await fetch('/api/admin/setup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,email,password})})
    const data=(await response.json()) as {error?:string}
    setLoading(false)
    if(response.ok){setMessage('Administrador criado. Indo para o login…');setTimeout(()=>{window.location.href='/admin/login'},1200)}
    else setMessage(data.error??'Falha ao configurar.')
  }
  const input='w-full rounded-lg border border-[color-mix(in_srgb,var(--paper)_24%,transparent)] bg-[color-mix(in_srgb,var(--paper)_6%,transparent)] px-3 py-2.5 text-paper outline-none focus:border-paper'
  return <div className="mx-auto grid min-h-[70svh] w-full max-w-[420px] content-center gap-5">
    <div><p className="m-0 text-caption font-bold tracking-[.2em] uppercase opacity-55">Primeiro acesso</p><h1 className="mt-2 mb-0 font-display text-4xl font-normal">Criar administrador</h1><p className="mt-2 mb-0 text-body-sm opacity-60">Use o valor de ADMIN_SETUP_TOKEN configurado no Worker.</p></div>
    <form className="grid gap-3" onSubmit={submit}>
      <input className={input} placeholder="Token de configuração" value={token} onChange={event=>setToken(event.target.value)} required/>
      <input className={input} type="email" placeholder="Seu e-mail" value={email} onChange={event=>setEmail(event.target.value)} required/>
      <input className={input} type="password" minLength={10} placeholder="Senha (mínimo 10 caracteres)" value={password} onChange={event=>setPassword(event.target.value)} required/>
      {message&&<p className="m-0 text-body-sm opacity-80">{message}</p>}
      <button className="rounded-lg bg-paper px-4 py-2.5 text-caption font-bold tracking-[.1em] text-ink uppercase disabled:opacity-50" type="submit" disabled={loading}>{loading?'Criando…':'Criar administrador'}</button>
    </form>
  </div>
}
