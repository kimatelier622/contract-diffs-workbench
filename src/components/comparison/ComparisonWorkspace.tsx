import {useCallback,useEffect,useRef} from 'react';
import type {ComparisonVersion,Side} from '../../types/domain';
import {useWorkspaceStore} from '../../store/workspaceStore';
import {CompareColumn} from './CompareColumn';
import {CompareToolbar} from './CompareToolbar';
import {DiffSummaryPanel} from '../diff/DiffSummaryPanel';
import type {ViewerHandle} from '../pdf/PdfViewer';
const emptyHandle=():ViewerHandle=>({root:null,goto:()=>{},pageCount:1});
export function ComparisonWorkspace({version}:{version:ComparisonVersion}){
 const before=useRef<ViewerHandle>(emptyHandle()),after=useRef<ViewerHandle>(emptyHandle()),lock=useRef<Side|null>(null),unlockTimer=useRef<number|undefined>(undefined);const sync=useWorkspaceStore(s=>s.syncScroll),showDiffs=useWorkspaceStore(s=>s.showDiffs),active=useWorkspaceStore(s=>s.activeDiffId),target=useWorkspaceStore(s=>s.scrollTarget);
 const onScroll=useCallback((side:Side,top:number,max:number)=>{if(!sync||lock.current&&lock.current!==side)return;const other=side==='before'?after.current.root:before.current.root;if(!other)return;lock.current=side;other.scrollTop=(top/max)*Math.max(0,other.scrollHeight-other.clientHeight);if(unlockTimer.current)clearTimeout(unlockTimer.current);unlockTimer.current=window.setTimeout(()=>lock.current=null,100)},[sync]);
 const onLoaded=useCallback((_side:Side,_n:number)=>{},[]);const onPageVisible=useCallback((_side:Side,_n:number)=>{},[]);
 
 useEffect(()=>{if(!active||!target)return;const item=version.diffs.find(d=>d.id===active);if(!item)return;const handle=window.setTimeout(()=>{if(item.before)before.current.goto(item.before.page,item.before.rect.y);if(item.after)after.current.goto(item.after.page,item.after.rect.y)},110);return()=>clearTimeout(handle)},[active,target,version]);
 return <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden p-4"><div className="flex justify-between items-start shrink-0 mb-4"><div className="flex items-center gap-2"><div><h2 className="text-xl font-bold">{version.before.fileName.split('_')[0]} <span className="text-slate-500 bg-slate-100 px-2 py-1 text-sm rounded-lg font-normal">{version.name}</span></h2><p className="text-sm text-slate-500 mt-1">正在核验 {version.before.fileName} 与 {version.after.fileName}</p></div></div><span className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-2">已完成</span></div><div className="flex flex-1 min-h-0 min-w-0 gap-3"><CompareColumn file={version.before} side="before" diffs={version.diffs} onScroll={onScroll} onLoaded={onLoaded} onPageVisible={onPageVisible} viewerRef={before}/><CompareColumn file={version.after} side="after" diffs={version.diffs} onScroll={onScroll} onLoaded={onLoaded} onPageVisible={onPageVisible} viewerRef={after}/>{showDiffs&&<DiffSummaryPanel diffs={version.diffs}/>}</div><div className="mt-3 shrink-0 rounded-xl border border-slate-200 overflow-hidden"><CompareToolbar diffs={version.diffs}/></div></div>
}
