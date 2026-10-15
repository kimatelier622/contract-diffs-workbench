import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {getDocument, GlobalWorkerOptions, type PDFDocumentProxy} from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type {DiffItem, Side, ContractFile} from '@/types/domain.ts';
import {PdfPage} from './PdfPage';
import {useWorkspaceStore} from '@/store/workspaceStore.ts';

GlobalWorkerOptions.workerSrc = workerSrc;

export interface ViewerHandle {
  root: HTMLDivElement | null;
  goto: (page: number, diffId?: string) => void;
  pageCount: number
}

export function PdfViewer({file, side, diffs, onScroll, onLoaded, onPageVisible, viewerRef}: {
  file: ContractFile;
  side: Side;
  diffs: DiffItem[];
  onScroll: (side: Side, top: number, max: number) => void;
  onLoaded: (side: Side, pages: number) => void;
  onPageVisible: (side: Side, page: number) => void;
  viewerRef: React.MutableRefObject<ViewerHandle>
}) {
  const root = useRef<HTMLDivElement>(null), pdfRef = useRef<PDFDocumentProxy | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [err, setErr] = useState('');
  const [viewportWidth, setViewportWidth] = useState(0);
  const scale = useWorkspaceStore(s => s.scale);
  const target = useWorkspaceStore(s => s.scrollTarget);
  const request = useRef(0);
  useEffect(() => {
    let active = true;
    let loadingTask: ReturnType<typeof getDocument> | null = null;
    setPdf(null);
    setErr('');
    (async () => {
      try {
        loadingTask = getDocument({
          url: file.pdfUrl,
          withCredentials: false,
          cMapUrl: `${import.meta.env.BASE_URL}pdfjs/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `${import.meta.env.BASE_URL}pdfjs/standard_fonts/`,
        });
        const next = await loadingTask.promise;
        if (!active) {
          await next.destroy();
          return;
        }
        pdfRef.current = next;
        setPdf(next);
        onLoaded(side, next.numPages);
      } catch (e) {if (active) setErr(`PDF 加载失败：${String(e)}`)}
    })();
    return () => {
      active = false;
      loadingTask?.destroy();
      pdfRef.current = null
    }
  }, [file.pdfUrl, side, onLoaded]);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const viewportElement = element.parentElement ?? element;
    const update = () => setViewportWidth(viewportElement.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewportElement);
    return () => observer.disconnect()
  }, []);
  useEffect(() => () => {if (request.current) cancelAnimationFrame(request.current)}, []);
  const go = (page: number, diffId?: string) => {
    const node = root.current?.querySelector<HTMLElement>(`[data-pdf-page="${page}"]`);
    if (node && root.current) {
      const scrollToMarker = () => {
        const marker = diffId
          ? [...node.querySelectorAll<SVGGraphicsElement>('[data-diff-id]')].find(
            item => item.dataset.diffId === diffId)
          : undefined;
        const markerTop = marker ? marker.getBoundingClientRect().top - node.getBoundingClientRect().top : 0;
        root.current?.scrollTo({top: node.offsetTop + markerTop - 48, behavior: 'smooth'});
      };
      scrollToMarker();
      requestAnimationFrame(scrollToMarker);
    }
  };
  viewerRef.current = {root: root.current, goto: go, pageCount: pdf?.numPages || 1};
  useEffect(() => {
    if (!target || !pdf || target.side !== side) return;
    const timer = window.setTimeout(() => go(target.page), 60);
    return () => clearTimeout(timer)
  }, [target, pdf, side, scale]);
  const handleScroll = () => {
    const el = root.current;
    if (!el) return;
    if (request.current) cancelAnimationFrame(request.current);
    request.current = requestAnimationFrame(() => {
      onScroll(side, el.scrollTop, Math.max(1, el.scrollHeight - el.clientHeight));
      const pages = [...el.querySelectorAll<HTMLElement>('[data-pdf-page]')];
      const top = el.getBoundingClientRect().top;
      let closest = 1, best = Infinity;
      for (const p of pages) {
        const delta = Math.abs(p.getBoundingClientRect().top - top);
        if (delta < best) {
          best = delta;
          closest = Number(p.dataset.pdfPage)
        }
      }
      onPageVisible(side, closest)
    })
  };
  const availableWidth = viewportWidth > 0 ? Math.max(160, viewportWidth - 32) : 595;
  return <div ref={root} onScroll={handleScroll}
    className="relative h-full w-full overflow-auto bg-slate-100 scroll-smooth">{err ?
    <div className="m-5 text-red-600 text-sm">{err}</div> : !pdf ?
      <div className="p-8 text-sm text-slate-500 text-center">正在加载 PDF ...</div> :
      <div className="flex w-max min-w-full flex-col items-center px-3 pb-8">{Array.from(
        {length: pdf.numPages},
        (_, idx) => <PdfPage key={`${file.id}-${idx + 1}`} pdf={pdf} page={idx + 1} side={side} scale={scale}
          availableWidth={availableWidth} scrollRoot={root} diffs={diffs} />)}</div>}</div>
}
