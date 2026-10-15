import {Building2, ChevronDown, CircleCheck, UserRound} from 'lucide-react';
import logoUrl from '@/assets/brand/logo.svg';
import type {ComparisonVersion} from '@/types/domain.ts';

export function Header({versionName, versions, versionId, onVersionChange}: {
  versionName: string;
  versions: ComparisonVersion[];
  versionId: string;
  onVersionChange: (id: string) => void
}) {
  return <header
    className="h-[50px] shrink-0 border-b border-slate-200 bg-white px-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center justify-between">
    <div className="flex min-w-0 items-center gap-4">
      <img src={logoUrl} alt="宝通 BOTON" className="h-7 w-auto shrink-0" />
      <div className="h-6 w-px bg-slate-200" />
      <div className="min-w-0"><h1
        className="truncate text-[16px] font-semibold leading-[18px] text-slate-900">合同用印前后差异核验</h1><p
        className="text-[12px] leading-[14px] text-slate-400">Document verification workspace</p></div>
      <span
        className="ml-2 inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700"><CircleCheck
        size={11} /> 系统正常</span><label
      className="relative inline-flex h-7 items-center rounded bg-slate-100 pl-2.5 pr-7 text-xs text-slate-500">对比版本：<select
      aria-label="对比版本" className="appearance-none bg-transparent font-medium text-slate-600 outline-none"
      value={versionId} onChange={e => onVersionChange(e.target.value)}>{versions.length ? versions.map(
        v => <option key={v.id} value={v.id}>{v.name}</option>) :
      <option value="">{versionName}</option>}</select><ChevronDown size={12}
      className="pointer-events-none absolute right-2" /></label></div>
    <div className="flex shrink-0 items-center gap-4 text-[14px] text-slate-600">
      <span className="hidden items-center gap-1.5 lg:inline-flex">
      <Building2 size={14} className="text-blue-600" /> 无锡宝通科技股份有限公司</span>
      <span className="inline-flex items-center gap-1.5">
        <UserRound size={14} className="text-blue-600" /> 张小风 </span>
    </div>
  </header>
}
