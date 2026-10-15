import {PanelRightClose} from 'lucide-react';
import type {ComparisonReport, DiffItem, DiffType, RiskLevel, TableCellChange} from '../../types/domain';
import {useWorkspaceStore} from '../../store/workspaceStore';

const palette: Record<DiffType, string> = {
  TEXT_MODIFY: 'text-blue-600 bg-blue-50',
  TEXT_ADD: 'text-green-600 bg-green-50',
  TEXT_DELETE: 'text-red-600 bg-red-50',
  TABLE_CHANGE: 'text-violet-600 bg-violet-50',
  SEAL_ADD: 'text-amber-600 bg-amber-50',
  SEAL_DELETE: 'text-orange-600 bg-orange-50',
  DATE_CHANGE: 'text-purple-600 bg-purple-50',
  FORMAT_CHANGE: 'text-sky-600 bg-sky-50',
  UNKNOWN: 'text-slate-600 bg-slate-100'
};

const riskLabels: Record<RiskLevel, {label: string; className: string}> = {
  HIGH: {label: '高风险', className: 'border-red-200 bg-red-50 text-red-600'},
  MEDIUM: {label: '中风险', className: 'border-amber-200 bg-amber-50 text-amber-600'},
  LOW: {label: '低风险', className: 'border-green-200 bg-green-50 text-green-600'},
  UNKNOWN: {label: '风险未知', className: 'border-slate-200 bg-slate-50 text-slate-500'}
};

function valueLabel(change: TableCellChange) {
  if (!change.beforeValue && change.afterValue) return `新增“${change.afterValue}”`;
  if (change.beforeValue && !change.afterValue) return `删除“${change.beforeValue}”`;
  return `${change.beforeValue || '空'} → ${change.afterValue || '空'}`;
}

export function DiffSummaryPanel({diffs, report}: {diffs: DiffItem[]; report?: ComparisonReport}) {
  const active = useWorkspaceStore(s => s.activeDiffId), select = useWorkspaceStore(s => s.selectDiff),
    hide = useWorkspaceStore(s => s.setShowDiffs);
  return <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden bg-white">
    <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-slate-200 px-3">
      <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">差异明细</h3><span
        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{diffs.length} 处差异</span></div>
      <button className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50"
        onClick={() => hide(false)}><PanelRightClose size={12}/> 收起</button>
    </div>
    {report && <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500"
      title={report.message}>
      <div className="flex items-center justify-between gap-2"><span>后端报告 {report.summary.totalChanges} 处</span><span
        className="tabular-nums">{report.summary.comparisonTimeMs} ms</span></div>
      <div className="mt-1 flex gap-3"><span>文本 {report.summary.textChanges}</span><span>表格 {report.summary.tableChanges}</span><span>印章 {report.summary.stampsFound}</span><span>可疑新增 {report.summary.suspiciousAdditions}</span></div>
    </div>}
    <div className="flex flex-col gap-2 overflow-auto p-2">{diffs.map((diff, index) => {
      const risk = diff.riskLevel ? riskLabels[diff.riskLevel] : undefined;
      return <button key={diff.id} onClick={() => select(diff.id, {before: diff.before, after: diff.after})}
        className={`h-auto min-h-[88px] shrink-0 whitespace-normal break-words rounded-lg border p-2.5 text-left transition ${active === diff.id
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
          : 'border-slate-200 bg-white hover:border-blue-300'}`}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5"><span
            className="grid size-4 shrink-0 place-items-center rounded-full bg-slate-100 text-[9px] text-slate-500">{index + 1}</span><strong
            className={`truncate rounded px-1.5 py-0.5 text-[10px] ${palette[diff.type]}`}>{diff.title}</strong>{risk && <span
            className={`shrink-0 rounded border px-1 py-0.5 text-[9px] ${risk.className}`}>{risk.label}</span>}</div>
          <span className="shrink-0 text-[10px] text-slate-400">第 {diff.after?.page ?? diff.before?.page ?? '--'} 页</span>
        </div>
        <div className="pl-6 text-xs leading-5 text-slate-700">{diff.description}</div>
        {(diff.beforeText || diff.afterText) && <div className="mt-1.5 space-y-1 pl-6 text-[10px] leading-4 text-slate-500">
          {diff.beforeText && <div className="[overflow-wrap:anywhere]"><span className="text-slate-400">原：</span>{diff.beforeText}</div>}
          {diff.afterText && <div className="[overflow-wrap:anywhere]"><span className="text-slate-400">新：</span>{diff.afterText}</div>}
        </div>}
        {!!diff.tableChanges?.length && <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 pl-6 text-[10px] text-slate-600 [overflow-wrap:anywhere]">
          {diff.tableChanges.map(cell => <div key={`${cell.row}-${cell.column}`}><span
            className="font-medium text-violet-600">第 {cell.row + 1} 行，第 {cell.column + 1} 列：</span>{valueLabel(cell)}</div>)}
        </div>}
      </button>;
    })}</div>
  </aside>;
}
