import {useEffect,useRef,useState} from 'react';
import {getDocument,GlobalWorkerOptions,type PDFDocumentProxy} from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type {DiffItem,Side,ContractFile} from '../../types/domain';
import {PdfPage} from './PdfPage';
import {useWorkspaceStore} from '../../store/workspaceStore';
GlobalWorkerOptions.workerSrc=workerSrc;
export interface ViewerHandle { root:HTMLDivElement|null; goto:(page:number,rectY?:number)=>void; pageCount:number }
export function PdfViewer({file,side,diffs,onScroll,onLoaded,onPageVisible,viewerRef}:{file:ContractFile;side:Side;diffs:DiffItem[];onScroll:(side:Side,top:number,max:number)=>void;onLoaded:(side:Side,pages:number)=>void;onPageVisible:(side:Side,page:number)=>void;viewerRef:React.MutableRefObject<ViewerHandle>}){
 const root=useRef<HTMLDivElement>(null),pdfRef=useRef<PDFDocumentProxy|null>(null);const [pdf,setPdf]=useState<PDFDocumentProxy|null>(null);const [err,setErr]=useState('');const scale=useWorkspaceStore(s=>s.scale);const target=useWorkspaceStore(s=>s.scrollTarget);const request=useRef(0);
 useEffect(()=>{let active=true;let loadingTask:ReturnType<typeof getDocument>|null=null;setPdf(null);setErr('');(async()=>{try{loadingTask=getDocument({url:file.pdfUrl,withCredentials:false});const next=await loadingTask.promise;if(!active){await next.destroy();return;}pdfRef.current=next;setPdf(next);onLoaded(side,next.numPages);}catch(e){if(active)setErr(`PDF 加载失败：${String(e)}`)}})();return()=>{active=false;loadingTask?.destroy();pdfRef.current=null}},[file.pdfUrl,side,onLoaded]);
 const go=(page:number,rectY=0)=>{const node=root.current?.querySelector<HTMLElement>(`[data-pdf-page="${page}"]`);if(node&&root.current){root.current.scrollTo({top:node.offsetTop-root.current.offsetTop+rectY*node.offsetHeight-48,behavior:'smooth'});}};
 viewerRef.current={root:root.current,goto:go,pageCount:pdf?.numPages||1};
 useEffect(()=>{if(!target||!pdf||target.side!==side)return;const timer=window.setTimeout(()=>go(target.page,target.rect?.y??0),60);return()=>clearTimeout(timer)},[target,pdf,side,scale]);
 const handleScroll=()=>{const el=root.current;if(!el)return;if(request.current)cancelAnimationFrame(request.current);request.current=requestAnimationFrame(()=>{onScroll(side,el.scrollTop,Math.max(1,el.scrollHeight-el.clientHeight));const pages=[...el.querySelectorAll<HTMLElement>('[data-pdf-page]')];const top=el.getBoundingClientRect().top;let closest=1,best=Infinity;for(const p of pages){const delta=Math.abs(p.getBoundingClientRect().top-top);if(delta<best){best=delta;closest=Number(p.dataset.pdfPage)}}onPageVisible(side,closest)})};
 return <div ref={root} onScroll={handleScroll} className="relative h-full w-full overflow-auto bg-slate-100 scroll-smooth">{err?<div className="m-5 text-red-600 text-sm">{err}</div>:!pdf?<div className="p-8 text-sm text-slate-500 text-center">正在加载 PDF ...</div>:<div className="flex flex-col items-center min-w-max px-3 pb-8">{Array.from({length:pdf.numPages},(_,idx)=><PdfPage key={`${file.id}-${idx+1}`} pdf={pdf} page={idx+1} side={side} scale={scale} diffs={diffs}/>)}</div>}</div>
}
