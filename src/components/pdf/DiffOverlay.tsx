import type {PDFPageProxy, PageViewport} from 'pdfjs-dist';
import type {DiffItem, Side} from '../../types/domain';
import {useWorkspaceStore} from '../../store/workspaceStore';
import {locationToViewportRect} from '../../utils/pdfCoordinates';

const styles: Record<DiffItem['type'], { stroke: string; fill: string }> = {
  TEXT_MODIFY: {
    stroke: '#2563eb',
    fill: '#2563eb13'
  },
  TEXT_ADD: {stroke: '#16a34a', fill: '#16a34a15'},
  TEXT_DELETE: {stroke: '#ef4444', fill: '#ef444416'},
  TABLE_CHANGE: {stroke: '#7c3aed', fill: '#7c3aed16'},
  SEAL_ADD: {stroke: '#f59e0b', fill: '#f59e0b14'},
  SEAL_DELETE: {stroke: '#ea580c', fill: '#ea580c14'},
  DATE_CHANGE: {stroke: '#9333ea', fill: '#9333ea16'},
  FORMAT_CHANGE: {stroke: '#0ea5e9', fill: '#0ea5e914'},
  UNKNOWN: {stroke: '#64748b', fill: '#64748b14'}
};

export function DiffOverlay({items, pageNumber, side, pdfPage, viewport}: {
  items: DiffItem[];
  pageNumber: number;
  side: Side;
  pdfPage: PDFPageProxy;
  viewport: PageViewport;
}) {
  const selected = useWorkspaceStore(s => s.activeDiffId), select = useWorkspaceStore(s => s.selectDiff),
    only = useWorkspaceStore(s => s.showOnlyDiffs);
  return <svg className="absolute inset-0 pointer-events-none" width={viewport.width} height={viewport.height}
    viewBox={`0 0 ${viewport.width} ${viewport.height}`} aria-label="PDF差异标注层">{items.filter(
      d => d[side]?.page === pageNumber)
    .map(d => {
      const loc = d[side]!;
      const r = locationToViewportRect(loc, pdfPage, viewport);
      const style = styles[d.type];
      return <rect key={d.id} x={r.x} y={r.y} width={r.width} height={r.height} rx="5" data-diff-id={d.id}
        fill={selected === d.id ? `${style.stroke}30` : only ? 'transparent' : style.fill} stroke={style.stroke}
        strokeWidth={selected === d.id ? 3 : 2} className="pointer-events-auto cursor-pointer"
        onClick={() => select(d.id, {before: d.before, after: d.after})}><title>{d.description}</title></rect>
    })}</svg>
}
