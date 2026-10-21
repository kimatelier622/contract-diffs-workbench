import {lazy, Suspense, type MutableRefObject} from 'react';
import type {ContractFile,DiffItem,Side} from '../../types/domain';
import type {ViewerHandle} from '../pdf/PdfViewer';

const PdfViewer = lazy(async () => {
  const module = await import('../pdf/PdfViewer');
  return {default: module.PdfViewer};
});

export function CompareColumn({side,file,diffs,onScroll,onLoaded,onPageVisible,viewerRef}:{side:Side;file:ContractFile;diffs:DiffItem[];onScroll:(side:Side,top:number,max:number)=>void;onLoaded:(side:Side,pages:number)=>void;onPageVisible:(side:Side,page:number)=>void;viewerRef:MutableRefObject<ViewerHandle>}){return <section className="min-w-0 flex flex-1 flex-col overflow-hidden border-r border-slate-200 bg-white"><div className="flex h-[42px] shrink-0 items-center justify-between border-b border-slate-200 px-3"><div className="flex items-center gap-2"><strong className="text-sm">{side==='before'?'用印前':'用印后'}</strong><span className={`rounded px-1.5 py-0.5 text-[10px] ${side==='after'?'bg-blue-50 text-blue-700':'bg-slate-100 text-slate-500'}`}>{side==='before'?'基准':'核验'}</span></div><span className="ml-2 truncate text-[11px] text-slate-400" title={file.fileName}>{file.fileName}</span></div><div className="min-h-0 flex-1"><Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">正在加载 PDF 组件...</div>}><PdfViewer key={file.id} file={file} side={side} diffs={diffs} onScroll={onScroll} onLoaded={onLoaded} onPageVisible={onPageVisible} viewerRef={viewerRef}/></Suspense></div></section>}
