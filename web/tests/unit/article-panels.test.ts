import {describe,expect,it} from 'vitest';
import {articlePanelIds,panelForBlock} from '../../src/lib/article-panel-contract';
describe('shared article panel contract',()=>{
 it('preserves the approved panel order',()=>expect(articlePanelIds).toEqual(['story','evidence','counterarguments','current','sources']));
 it('places existing evidence, counterargument and fact-boundary blocks in their own panels',()=>{
  expect(panelForBlock({type:'EVIDENCE_NARRATIVE'})).toBe('evidence');
  expect(panelForBlock({type:'COUNTER_EVIDENCE'})).toBe('counterarguments');
  expect(panelForBlock({type:'FACT_BOUNDARY'})).toBe('current');
 });
 it('retains unknown narrative blocks instead of discarding or inventing a conclusion',()=>expect(panelForBlock({type:'UNRECOGNIZED_ORIGINAL_TYPE'})).toBe('story'));
});
