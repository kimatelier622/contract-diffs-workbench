import {useEffect, useRef, useState, type RefObject} from 'react';
import type {PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask} from 'pdfjs-dist';
import type {DiffItem, Side} from '@/types/domain.ts';
import {DiffOverlay} from './DiffOverlay';

interface PdfPageProps {
  pdf: PDFDocumentProxy;
  page: number;
  side: Side;
  scale: number;
  availableWidth: number;
  scrollRoot: RefObject<HTMLDivElement | null>;
  diffs: DiffItem[];
}

const DEFAULT_PAGE_SIZE = {width: 595, height: 842};

export function PdfPage({pdf, page, side, scale, availableWidth, scrollRoot, diffs}: PdfPageProps) {
  const pageRootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfPage, setPdfPage] = useState<PDFPageProxy | null>(null);
  const [viewport, setViewport] = useState<PageViewport | null>(null);
  const [size, setSize] = useState(() => {
    const width = Math.min(DEFAULT_PAGE_SIZE.width, availableWidth);
    return {width, height: width * (DEFAULT_PAGE_SIZE.height / DEFAULT_PAGE_SIZE.width)}
  });
  const [isNearViewport, setIsNearViewport] = useState(page <= 2);
  const [loading, setLoading] = useState(page <= 2);

  useEffect(() => {
    let active = true;
    let loadedPage: PDFPageProxy | undefined;
    void pdf.getPage(page).then(nextPage => {
      loadedPage = nextPage;
      if (active) setPdfPage(nextPage);
    }).catch(error => console.error(`PDF page ${page} load failed`, error));
    return () => {
      active = false;
      loadedPage?.cleanup()
    };
  }, [pdf, page]);

  useEffect(() => {
    const element = pageRootRef.current;
    const root = scrollRoot.current;
    if (!element || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting), {root, rootMargin: '800px 0px', threshold: 0});
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!pdfPage) return;
    const baseViewport = pdfPage.getViewport({scale: 1});
    const fitScale = Math.min(1, availableWidth / baseViewport.width);
    const viewport = pdfPage.getViewport({scale: fitScale * scale});
    setViewport(viewport);
    setSize({width: viewport.width, height: viewport.height});
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!isNearViewport) {
      canvas.width = 1;
      canvas.height = 1;
      setLoading(false);
      return
    }

    let renderTask: RenderTask | undefined;
    let cancelled = false;
    setLoading(true);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
    canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    const context = canvas.getContext('2d');
    if (!context) return;
    renderTask = pdfPage.render(
      {canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0]});
    void renderTask.promise.then(() => {if (!cancelled) setLoading(false)}).catch(error => {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') console.error(
        'PDF render failed', error);
    });
    return () => {
      cancelled = true;
      renderTask?.cancel()
    };
  }, [pdfPage, availableWidth, scale, isNearViewport]);

  return <div ref={pageRootRef} data-pdf-page={page}
    className="relative mx-auto my-3 shrink-0 border border-slate-200 bg-white shadow-sm"
    style={{width: size.width, height: size.height}}>
    <canvas ref={canvasRef} className="absolute inset-0" />
    {loading && isNearViewport &&
      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
        正在渲染第 {page} 页...</div>}
    {pdfPage && viewport &&
      <DiffOverlay items={diffs} side={side} pageNumber={page} pdfPage={pdfPage} viewport={viewport} />}
  </div>;
}
