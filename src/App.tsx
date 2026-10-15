import {useQuery} from '@tanstack/react-query';
import {fetchContracts} from './api/comparisonApi';
import {Header} from './components/layout/Header';
import {ContractSidebar} from './components/contracts/ContractSidebar';
import {ComparisonWorkspace} from './components/comparison/ComparisonWorkspace';
import {useWorkspaceStore} from './store/workspaceStore';

export default function App() {
  const {data: contracts = [], isLoading, isError} = useQuery({queryKey: ['contracts'], queryFn: fetchContracts});
  const cid = useWorkspaceStore(s => s.contractId), vid = useWorkspaceStore(s => s.versionId),
    showContracts = useWorkspaceStore(s => s.showContracts), setVersion = useWorkspaceStore(s => s.setVersion);
  const contract = contracts.find(c => c.id === cid) || contracts[0];
  const version = contract?.versions.find(v => v.id === vid) || contract?.versions.at(-1);
  return <div className="h-screen min-h-[600px] flex flex-col bg-slate-100 text-slate-900"><Header
    versionName={version?.name || '--'} versions={contract?.versions || []} versionId={version?.id || ''}
    onVersionChange={setVersion} />{isLoading ? <div className="p-8">正在加载合同...</div> : isError ?
    <div className="p-8 text-red-600">合同接口获取失败，请检查 VITE_API_BASE_URL</div> : version ?
      <div className="flex flex-1 min-h-0 gap-3 p-3">{showContracts && <ContractSidebar contracts={contracts} />}
        <main className="flex flex-1 min-w-0 flex-col"><ComparisonWorkspace key={version.id} version={version} /></main>
      </div> : <div className="p-8">暂无合同</div>}</div>
}
