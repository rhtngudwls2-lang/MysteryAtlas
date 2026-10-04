"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/schema";
import { LocaleSwitch } from "./LocaleSwitch";
import { ReaderSettings } from "./ReaderSettings";
import { SaveButton } from "./SaveButton";
import { ShareButton } from "./ShareButton";
export function ArticleToolbar({id,title,locale}:{id:string;title:string;locale:Locale}) {
 return <div className="article-toolbar"><div className="article-toolbar-inner"><LocaleSwitch locale={locale} article/><ReaderSettings locale={locale}/><SaveButton slug={id} locale={locale}/><ShareButton title={title} locale={locale}/></div></div>;
}
const entries=[['narrative','이야기','Story'],['evidence','근거','Evidence'],['fact-boundary','확인된 범위','Fact boundary'],['sources','출처','Sources'],['rabbit-hole','다음 이야기','Read next']];
export function ArticleContents({locale}:{locale:Locale}){
 const [active,setActive]=useState('narrative');
 useEffect(()=>{let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const offset=(document.querySelector('.site-header')?.getBoundingClientRect().height??0)+(document.querySelector('.article-toolbar')?.getBoundingClientRect().height??0)+80;const sections=entries.map(([id])=>document.getElementById(id)).filter((n):n is HTMLElement=>!!n);setActive(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-8?sections.at(-1)?.id??'narrative':sections.filter(n=>n.getBoundingClientRect().top<=offset).at(-1)?.id??'narrative')})};update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}},[]);
 return <nav className="abc-contents" aria-label={locale==='ko'?'이야기의 흐름':'In this story'}>{entries.map(([id,ko,en])=><a key={id} href={'#'+id} onClick={()=>{const node=document.getElementById(id);if(node instanceof HTMLDetailsElement)node.open=true;setActive(id)}} aria-current={active===id?'location':undefined}>{locale==='ko'?ko:en}</a>)}</nav>;
}
export function ArticleEnd({locale,children}:{locale:Locale;children?:React.ReactNode}) {return <section id="rabbit-hole" className="abc-next"><h2>{locale==='ko'?'다음 이야기':'Read next'}</h2>{children}<div className="reader-exit"><Link href={`/${locale}/`}>{locale==='ko'?'홈으로':'Home'}</Link><Link href={`/${locale}/explore/`}>{locale==='ko'?'다른 이야기 찾기':'Explore more stories'}</Link></div></section>}
