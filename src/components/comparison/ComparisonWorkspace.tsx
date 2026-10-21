import {useCallback, useEffect, useRef} from 'react';
import {CircleX, LoaderCircle, TriangleAlert} from 'lucide-react';
import type {ComparisonStatus, ComparisonVersion, Side} from '@/types/domain.ts';
import {useWorkspaceStore} from '@/store/workspaceStore.ts';
import {CompareColumn} from './CompareColumn';
import {CompareToolbar} from './CompareToolbar';
import {DiffSummaryPanel} from '../diff/DiffSummaryPanel';
import type {ViewerHandle} from '../pdf/PdfViewer';

const emptyHandle = (): ViewerHandle => ({root: null, goto: () => {}, pageCount: 1});

const STATUS_META: Record<ComparisonStatus, {label:string; message:string; className:string}> = {
  processing: {
    label: '处理中',
    message: 'AI 正在生成对比结果，页面会自动刷新',
    className: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  completed: {
    label: '已完成',
    message: '',
    className: 'border-green-200 bg-green-50 text-green-700'
  },
  failed: {
    label: '比对失败',
    message: '当前合同文件未生成完整对比结果',
    className: 'border-red-200 bg-red-50 text-red-700'
  },
  partial: {
    label: '部分成功',
    message: '已展示当前可用的 PDF 和差异结果',
    className: 'border-amber-200 bg-amber-50 text-amber-700'
  }
};

export function ComparisonWorkspace({version}: { version: ComparisonVersion }) {
  const before = useRef<ViewerHandle>(emptyHandle()), after = useRef<ViewerHandle>(emptyHandle()),
    lock = useRef<Side | null>(null), unlockTimer = useRef<number | undefined>(undefined);
  const sync = useWorkspaceStore(s => s.syncScroll), showDiffs = useWorkspaceStore(s => s.showDiffs),
    active = useWorkspaceStore(s => s.activeDiffId), target = useWorkspaceStore(s => s.scrollTarget);
  const statusMeta = STATUS_META[version.status];
  const onScroll = useCallback((side: Side, top: number, max: number) => {
    if (!sync || lock.current && lock.current !== side) return;
    const other = side === 'before' ? after.current.root : before.current.root;
    if (!other) return;
    lock.current = side;
    other.scrollTop = (top / max) * Math.max(0, other.scrollHeight - other.clientHeight);
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => lock.current = null, 100);
  }, [sync]);
  const onLoaded = useCallback((_side: Side, _pages: number) => {}, []);
  const onPageVisible = useCallback((_side: Side, _page: number) => {}, []);

  useEffect(() => {
    if (!active || !target) return;
    const item = version.diffs.find(diff => diff.id === active);
    if (!item) return;
    const handle = window.setTimeout(() => {
      if (item.before) before.current.goto(item.before.page, item.id);
      if (item.after) after.current.goto(item.after.page, item.id);
    }, 110);
    return () => clearTimeout(handle);
  }, [active, target, version]);

  return <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
    <div className="mb-2 flex h-[54px] shrink-0 items-center justify-between px-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-semibold">{version.before.fileName.split('_')[0]}</h2>
          <span className="rounded bg-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500">
            对比版本：{version.name}
          </span>
        </div>
        <p
          className="mt-1 truncate text-xs text-slate-500">正在核验 {version.before.fileName} 与 {version.after.fileName}</p>
      </div>
      <span
        className={`rounded border px-2.5 py-1 text-[10px] font-medium ${statusMeta.className}`}>● {
          statusMeta.label}</span>
    </div>
    <section
      className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-1 min-h-0 min-w-0">
        <div className="relative flex min-h-0 min-w-0 flex-1">
          <CompareColumn
            file={version.before}
            side="before"
            diffs={version.diffs}
            onScroll={onScroll}
            onLoaded={onLoaded}
            onPageVisible={onPageVisible}
            viewerRef={before}
          />
          <CompareColumn
            file={version.after}
            side="after"
            diffs={version.diffs}
            onScroll={onScroll}
            onLoaded={onLoaded}
            onPageVisible={onPageVisible}
            viewerRef={after}
          />
          {version.status !== 'completed' && <div
            className="pointer-events-none absolute left-1/2 top-[48px] z-30 -translate-x-1/2">
          <div className={`flex max-w-[360px] items-center gap-2 rounded-lg border px-3 py-2 text-xs shadow-lg ${
            statusMeta.className}`}>
            {version.status === 'processing' ? <LoaderCircle size={16} className="shrink-0 animate-spin" /> :
              version.status === 'failed' ? <CircleX size={16} className="shrink-0" /> :
                <TriangleAlert size={16} className="shrink-0" />}
            <span><strong>{statusMeta.label}</strong>：{statusMeta.message}</span>
          </div>
          </div>}
        </div>
        {showDiffs && <DiffSummaryPanel diffs={version.diffs} report={version.report} />}
      </div>
      <CompareToolbar diffs={version.diffs} />
    </section>
  </div>;
}
