import {useCallback, useEffect, useRef} from 'react';
import type {ComparisonVersion, Side} from '../../types/domain';
import {useWorkspaceStore} from '../../store/workspaceStore';
import {CompareColumn} from './CompareColumn';
import {CompareToolbar} from './CompareToolbar';
import {DiffSummaryPanel} from '../diff/DiffSummaryPanel';
import type {ViewerHandle} from '../pdf/PdfViewer';

const emptyHandle = (): ViewerHandle => ({root: null, goto: () => {}, pageCount: 1});

export function ComparisonWorkspace({version}: { version: ComparisonVersion }) {
  const before = useRef<ViewerHandle>(emptyHandle()), after = useRef<ViewerHandle>(emptyHandle()),
    lock = useRef<Side | null>(null), unlockTimer = useRef<number | undefined>(undefined);
  const sync = useWorkspaceStore(s => s.syncScroll), showDiffs = useWorkspaceStore(s => s.showDiffs),
    active = useWorkspaceStore(s => s.activeDiffId), target = useWorkspaceStore(s => s.scrollTarget);
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
        className="rounded border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-medium text-green-700">● 已完成</span>
    </div>
    <section
      className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-1 min-h-0 min-w-0">
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
        {showDiffs && <DiffSummaryPanel diffs={version.diffs} report={version.report} />}</div>
      <CompareToolbar diffs={version.diffs} />
    </section>
  </div>;
}
