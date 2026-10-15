import {ArrowLeft,ArrowRight,Minus,Plus,PanelLeftOpen,PanelRightOpen} from 'lucide-react';
import {useEffect,useState} from 'react';
import {useWorkspaceStore} from '../../store/workspaceStore';
import {Switch} from '../ui/switch';
import {Slider} from '../ui/slider';
import type {DiffItem} from '../../types/domain';

/** 底部操作栏：左侧同步滚动与 PDF 缩放，右侧按差异逐条跳转。 */
export function CompareToolbar({diffs}:{diffs:DiffItem[]}){
 const scale=useWorkspaceStore(s=>s.scale),setScale=useWorkspaceStore(s=>s.setScale);
 const sync=useWorkspaceStore(s=>s.syncScroll),setSync=useWorkspaceStore(s=>s.setSyncScroll);
 const activeDiffId=useWorkspaceStore(s=>s.activeDiffId),selectDiff=useWorkspaceStore(s=>s.selectDiff);
 const showContracts=useWorkspaceStore(s=>s.showContracts),setContracts=useWorkspaceStore(s=>s.setShowContracts);
 const showDiffs=useWorkspaceStore(s=>s.showDiffs),setDiffs=useWorkspaceStore(s=>s.setShowDiffs);
 const percent=Math.round(scale*100);
 const [draftPercent,setDraftPercent]=useState(percent);
 useEffect(()=>setDraftPercent(percent),[percent]);
 const activeIndex=diffs.findIndex(d=>d.id===activeDiffId);
 const readSliderPercent=(value:number|readonly number[])=>typeof value==='number'?value:value[0]??percent;
 const applyScale=(nextScale:number)=>{
   const nextPercent=Math.round(Math.min(2,Math.max(.6,nextScale))*100);
   setDraftPercent(nextPercent);
   setScale(nextPercent/100);
 };
 const jumpTo=(index:number)=>{
   const item=diffs[index];
   if(item)selectDiff(item.id,{before:item.before,after:item.after});
 };
 return <div className="flex min-h-[48px] shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200 bg-white px-3 py-1.5 text-xs">
   <div className="flex items-center gap-4 min-w-0">
     <div className="flex items-center gap-2">
       <Switch id="sync-scroll" checked={sync} onCheckedChange={setSync} aria-label="同步滚动"/>
       <label htmlFor="sync-scroll" className="text-slate-600 cursor-pointer whitespace-nowrap">同步滚动</label>
     </div>
     <div className="h-5 w-px bg-slate-200 hidden sm:block"/>
     <div className="flex items-center gap-2">
       <span className="text-slate-600 whitespace-nowrap">缩放 {draftPercent}%</span>
       <button className="tool-btn" onClick={()=>applyScale(scale-0.1)} aria-label="缩小 PDF"><Minus size={15}/></button>
       <Slider className="w-[115px] sm:w-[160px]" min={60} max={200} step={5} value={draftPercent} onValueChange={value=>setDraftPercent(readSliderPercent(value))} onValueCommitted={value=>applyScale(readSliderPercent(value)/100)} aria-label="PDF 缩放比例"/>
       <button className="tool-btn" onClick={()=>applyScale(scale+0.1)} aria-label="放大 PDF"><Plus size={15}/></button>
     </div>
   </div>
   <div className="flex items-center gap-2.5 text-slate-600">
     <button className="tool-btn" title={showContracts?'收起合同管理':'展开合同管理'} aria-label="切换合同管理" onClick={()=>setContracts(!showContracts)}><PanelLeftOpen size={17}/></button>
     <button className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={activeIndex<=0} onClick={()=>jumpTo(activeIndex-1)}><ArrowLeft size={14}/> 上一处</button>
     <span className="inline-flex h-8 min-w-[92px] items-center justify-center rounded border border-blue-100 bg-blue-50 px-2.5 font-medium text-blue-600 tabular-nums">差异 {activeIndex>=0?activeIndex+1:0} / {diffs.length}</span>
     <button className="inline-flex h-8 items-center gap-1.5 rounded bg-blue-600 px-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40" disabled={!diffs.length||activeIndex===diffs.length-1} onClick={()=>jumpTo(activeIndex+1)}>下一处 <ArrowRight size={14}/></button>
     <button className="tool-btn" title={showDiffs?'收起差异明细':'展开差异明细'} aria-label="切换差异明细" onClick={()=>setDiffs(!showDiffs)}><PanelRightOpen size={17}/></button>
   </div>
 </div>;
}
