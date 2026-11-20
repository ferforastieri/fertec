'use client'

import {useEffect,useRef} from 'react'

/** Branded cursor shared by the portfolio scene and the admin panel. */
export function CustomCursor(){
  const cursor=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if(!matchMedia('(pointer: fine)').matches)return
    const state={x:innerWidth/2,y:innerHeight/2,targetX:innerWidth/2,targetY:innerHeight/2,scale:1,targetScale:1,rotation:0,targetRotation:0,opacity:0,targetOpacity:0}
    const interactiveSelector='a[href],button:not(:disabled),summary,[role="button"],[role="menuitemradio"],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),label[for]'
    let raf=0
    const render=()=>{const element=cursor.current;if(element){state.x+=(state.targetX-state.x)*.38;state.y+=(state.targetY-state.y)*.38;state.scale+=(state.targetScale-state.scale)*.24;state.rotation+=(state.targetRotation-state.rotation)*.24;state.opacity+=(state.targetOpacity-state.opacity)*.3;element.style.transform=`translate3d(${state.x}px,${state.y}px,0) scale(${state.scale}) rotate(${state.rotation}deg)`;element.style.opacity=String(state.opacity)}raf=requestAnimationFrame(render)}
    const move=(event:PointerEvent)=>{state.targetX=event.clientX;state.targetY=event.clientY;state.targetOpacity=1}
    const exit=()=>{state.targetOpacity=0}
    const setInteractive=(interactive:boolean)=>{if(cursor.current)cursor.current.dataset.variant=interactive?'pointer':'default';state.targetScale=1;state.targetRotation=0}
    const over=(event:PointerEvent)=>{if((event.target as Element).closest(interactiveSelector))setInteractive(true)}
    const out=(event:PointerEvent)=>{const next=event.relatedTarget;setInteractive(next instanceof Element&&Boolean(next.closest(interactiveSelector)))}
    const down=()=>{state.targetScale=.78}
    const up=()=>{state.targetScale=1;state.targetRotation=0}
    raf=requestAnimationFrame(render)
    window.addEventListener('pointermove',move,{passive:true})
    document.addEventListener('pointerover',over)
    document.addEventListener('pointerout',out)
    window.addEventListener('pointerdown',down)
    window.addEventListener('pointerup',up)
    document.documentElement.addEventListener('pointerleave',exit)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('pointermove',move);document.removeEventListener('pointerover',over);document.removeEventListener('pointerout',out);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);document.documentElement.removeEventListener('pointerleave',exit)}
  },[])

  return <div ref={cursor} className="custom-cursor pointer-events-none fixed top-[-2px] left-[-2px] z-80 h-[30px] w-6 origin-[2px_2px] opacity-0 will-change-[transform,opacity] max-md:hidden" data-variant="default" aria-hidden="true">
    <span className="custom-cursor__arrow absolute inset-0 before:absolute before:inset-0 before:bg-ink before:content-[''] before:[clip-path:polygon(0_0,100%_61%,61%_66%,49%_100%,35%_94%,47%_64%,17%_78%)] after:absolute after:inset-0.5 after:bg-paper after:content-[''] after:[clip-path:polygon(0_0,100%_61%,61%_66%,49%_100%,35%_94%,47%_64%,17%_78%)]"/>
    <svg className="custom-cursor__pointer absolute top-0 left-[-6px] h-6 w-6 overflow-visible" viewBox="0 0 24 24" fill="var(--paper)" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M22 14a8 8 0 0 1-8 8H9c-2.8 0-4.2-1.4-5.6-3.2L.6 15.2c-.7-.9-.5-2.3.4-3s2.3-.5 3 .4L6 15V4a2 2 0 0 1 4 0v7-1a2 2 0 0 1 4 0v1-1a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0Z" stroke="var(--ink)" strokeWidth="3.5"/>
      <path d="M22 14a8 8 0 0 1-8 8H9c-2.8 0-4.2-1.4-5.6-3.2L.6 15.2c-.7-.9-.5-2.3.4-3s2.3-.5 3 .4L6 15V4a2 2 0 0 1 4 0v7-1a2 2 0 0 1 4 0v1-1a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0Z" stroke="var(--paper)" strokeWidth="1.2"/>
    </svg>
  </div>
}
