import {Search, PanelLeftClose} from 'lucide-react';
import {useState} from 'react';
import type {ContractRecord} from '../../types/domain';
import {useWorkspaceStore} from '../../store/workspaceStore';

export function ContractSidebar({contracts}: { contracts: ContractRecord[] }) {
  const [keyword, setKeyword] = useState('');
  const selected = useWorkspaceStore(s => s.contractId), select = useWorkspaceStore(s => s.setContract),
    hide = useWorkspaceStore(s => s.setShowContracts);
  return <aside
    className="w-[260px] shrink-0 overflow-auto rounded-lg border border-slate-200 bg-white p-3 shadow-sm flex flex-col gap-3">
    <div className="flex h-7 items-center justify-between">
      <h2 className="text-base font-semibold">合同管理</h2>
      <div className="flex items-center gap-2">
        <span
          className="rounded bg-blue-600 px-2 py-1 text-[10px] font-medium text-white">{contracts.length} 个合同</span>
        <button className="rounded p-1 hover:bg-slate-100" aria-label="隐藏合同管理" title="隐藏侧栏"
          onClick={() => hide(false)}><PanelLeftClose size={15} className="text-slate-500" />
        </button>
      </div>
    </div>
    <label
      className="flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-2.5 focus-within:border-blue-400"><Search
      size={14} className="text-slate-400" /><input value={keyword} onChange={e => setKeyword(e.target.value)}
      className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="搜索合同名称或编号" /></label>
    <div className="flex flex-col gap-2">{contracts.filter(
        c => `${c.name}${c.contractNo}`.toLowerCase().includes(keyword.toLowerCase()))
      .map(c => <button key={c.id} onClick={() => select(c.id, c.versions.at(-1)?.id || c.versions[0].id)}
        className={`min-h-[78px] rounded-lg border p-3 text-left transition ${selected ===
        c.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}>
        <div className="flex items-center justify-between gap-2"><strong
          className={`text-sm ${selected === c.id ? 'text-blue-700' : ''}`}>{c.name}</strong><span
          className="rounded bg-white px-2 py-1 text-[10px] font-medium text-slate-500">{c.versions.at(
          -1)?.diffs.length || 0} 处差异</span></div>
        <p className="mt-2.5 text-[11px] text-slate-400">{c.contractNo} · 已完成核验</p></button>)}</div>
  </aside>
}
