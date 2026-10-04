"use client";
import {useEffect,useState} from 'react';
import type {Locale} from '@/content/schema';
export function ReaderThemeNotice({locale}:{locale:Locale}){
 const [old,setOld]=useState('');
 useEffect(()=>{try{const key='mystery-atlas-reader-v1',saved=JSON.parse(localStorage.getItem(key)||'{}');const previous=['dark','dim','warm'].includes(saved.tone)?saved.tone:saved.previousTone;if(previous){if(['dark','dim','warm'].includes(saved.tone)){document.documentElement.dataset.readerTone='ivory';localStorage.setItem(key,JSON.stringify({...saved,previousTone:previous,tone:'ivory'}));}else if(['ivory','warmgray','midnight'].includes(saved.tone))document.documentElement.dataset.readerTone=saved.tone;queueMicrotask(()=>setOld(previous));}else if(['ivory','warmgray','midnight'].includes(saved.tone))document.documentElement.dataset.readerTone=saved.tone}catch{/* Keep the bright default. */}},[]);
 return old?<aside className="reader-theme-notice" role="status"><span>{locale==='ko'?'이전 어두운 테마 설정을 보존하고, 개편된 아이보리 읽기로 전환했습니다. Aa에서 화면 색을 선택할 수 있습니다.':'Your previous dark preference is retained; reading now starts in Ivory. Choose a theme with Aa.'}</span><button type="button" onClick={()=>{document.documentElement.dataset.readerTone='ivory';window.dispatchEvent(new CustomEvent('reader-theme-change',{detail:'ivory'}));try{const k='mystery-atlas-reader-v1',s=JSON.parse(localStorage.getItem(k)||'{}');localStorage.setItem(k,JSON.stringify({...s,tone:'ivory'}))}catch{}setOld('')}}>{locale==='ko'?'아이보리로 읽기':'Read in Ivory'}</button></aside>:null;
}
