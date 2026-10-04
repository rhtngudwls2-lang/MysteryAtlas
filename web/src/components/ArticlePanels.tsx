"use client";
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Locale} from '@/content/schema';
import {articlePanelIds,type ArticlePanelId} from '@/lib/article-panel-contract';
export function ArticlePanels({locale,caseId,panels}:{locale:Locale;caseId:string;panels:Record<ArticlePanelId,ReactNode>}){
 const [active,setActive]=useState<ArticlePanelId>('story');
 const positions=useRef<Partial<Record<ArticlePanelId,number>>>({});
 const activeRef=useRef<ArticlePanelId>('story');
 const refs=useRef<Partial<Record<ArticlePanelId,HTMLDivElement|null>>>({});
 const frame=useRef<HTMLDivElement|null>(null);
 const labels=locale==='ko'?['이야기','증거','반론','현재','출처']:['Story','Evidence','Counterarguments','Current','Sources'];
 function reserve(){if(frame.current)frame.current.style.minHeight=frame.current.getBoundingClientRect().height+'px'}
 function place(y:number){
  const node=frame.current;if(!node)return;
  const top=node.getBoundingClientRect().top+window.scrollY;
  const footer=document.querySelector('footer')?.getBoundingClientRect().height??0;
  node.style.minHeight=Math.max(0,y+window.innerHeight-top-footer-59)+'px';
  window.scrollTo({top:y,behavior:'instant'});
 }
 useEffect(()=>{const restore=()=>{
  const url=new URL(location.href),query=url.searchParams.get('panel');
  let selected:ArticlePanelId=articlePanelIds.includes(query as ArticlePanelId)?query as ArticlePanelId:'story';
  const anchor=decodeURIComponent(url.hash.slice(1)),target=anchor?document.getElementById(anchor):null;
  const targetPanel=target?.closest<HTMLElement>('[data-article-panel]')?.dataset.articlePanel;
  if(articlePanelIds.includes(targetPanel as ArticlePanelId))selected=targetPanel as ArticlePanelId;
  let savedY=window.scrollY;
  try{const saved=JSON.parse(localStorage.getItem('mystery-atlas-reading-v1')??'null');if(query&&saved?.canonicalId===caseId&&saved.panel===selected)savedY=saved.panelScroll??savedY}catch{}
  reserve();activeRef.current=selected;setActive(selected);
  requestAnimationFrame(()=>{
   if(target){for(let n=target.parentElement;n;n=n.parentElement)if(n instanceof HTMLDetailsElement)n.open=true;
    const toolbar=document.querySelector<HTMLElement>('.article-toolbar');
    place(Math.max(0,target.getBoundingClientRect().top+window.scrollY-Math.max(160,(toolbar?.getBoundingClientRect().bottom??0)+24)));
    target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
   }else place(positions.current[selected]??savedY);
  });
 };restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);return()=>{window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore)}},[caseId,locale]);
 function select(id:ArticlePanelId,focusTab=false,fromNext=false){
  if(id===activeRef.current)return;
  const y=window.scrollY;positions.current[activeRef.current]=y;reserve();
  const nextY=fromNext?Math.max(0,(frame.current?.getBoundingClientRect().top??0)+y-128):(positions.current[id]??y);
  activeRef.current=id;setActive(id);const url=new URL(location.href);url.searchParams.set('panel',id);url.hash='';history.pushState({...history.state},'',url);
  requestAnimationFrame(()=>{place(nextY);if(focusTab)document.getElementById(`tab-${caseId}-${id}`)?.focus({preventScroll:true});else refs.current[id]?.focus({preventScroll:true});window.dispatchEvent(new Event('scroll'))});
 }
 return <div ref={frame} className="article-tabs-frame"><div role="tablist" aria-label={locale==='ko'?'기사 본문':'Article content'} aria-orientation="horizontal" className="article-tabs">{articlePanelIds.map((id,i)=><button type="button" role="tab" key={id} id={`tab-${caseId}-${id}`} aria-controls={`panel-${caseId}-${id}`} aria-selected={active===id} tabIndex={active===id?0:-1} onClick={()=>select(id)} onKeyDown={e=>{let next:number|undefined;if(e.key==='ArrowRight')next=(i+1)%5;if(e.key==='ArrowLeft')next=(i+4)%5;if(e.key==='Home')next=0;if(e.key==='End')next=4;if(next!==undefined){e.preventDefault();select(articlePanelIds[next],true)}}}>{labels[i]}</button>)}</div>{articlePanelIds.map((id,i)=><div key={id} id={`panel-${caseId}-${id}`} data-article-panel={id} role="tabpanel" aria-labelledby={`tab-${caseId}-${id}`} tabIndex={0} hidden={active!==id} ref={node=>{refs.current[id]=node}} className="article-tab-panel">{panels[id]}{i<4&&<button type="button" className="next-panel-button" onClick={()=>select(articlePanelIds[i+1],false,true)}>{locale==='ko'?`다음: ${labels[i+1]}`:`Next: ${labels[i+1]}`} →</button>}</div>)}</div>;
}
