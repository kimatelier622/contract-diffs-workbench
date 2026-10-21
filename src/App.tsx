import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchContractWorkspace, mockContractWorkspace} from './api/comparisonApi';
import {Header} from './components/layout/Header';
import {ContractSidebar} from './components/contracts/ContractSidebar';
import {ComparisonWorkspace} from './components/comparison/ComparisonWorkspace';
import {useWorkspaceStore} from './store/workspaceStore';

export default function App() {
  const flowId = new URLSearchParams(window.location.search).get('flowId')?.trim() || '';
  const {data, isError, error, refetch} = useQuery({
    queryKey: ['contract-detail', flowId || 'missing-flow-id'],
    queryFn: ({signal}) => fetchContractWorkspace(flowId, signal),
    refetchInterval: query => query.state.data?.versions.some(version =>
      version.status === 'processing' || version.documents.some(
        document => document.comparison.status === 'processing')) ? 5000 : false
  });
  const workspace = data ?? mockContractWorkspace;
  const apiError = isError ? error instanceof Error ? error.message : '未知错误' : undefined;
  const cid = useWorkspaceStore(s => s.contractId), vid = useWorkspaceStore(s => s.versionId),
    showContracts = useWorkspaceStore(s => s.showContracts), setContract = useWorkspaceStore(s => s.setContract),
    setVersion = useWorkspaceStore(s => s.setVersion);
  const batch = workspace?.versions.find(version => version.id === vid) || workspace?.versions[0];
  const document = batch?.documents.find(item => item.id === cid) || batch?.documents[0];
  const comparison = document?.comparison;

  useEffect(() => {
    if (batch && document && (document.id !== cid || batch.id !== vid)) {
      setContract(document.id, batch.id);
    }
  }, [batch, cid, document, setContract, vid]);

  return (
    <div className="h-screen min-h-[600px] flex flex-col bg-slate-100 text-slate-900">
      <Header versionName={batch?.name || '--'} versions={workspace?.versions || []} versionId={batch?.id || ''}
        onVersionChange={setVersion} />
      {comparison && batch ?
          <div className="flex flex-1 min-h-0 gap-3 p-3">
            {showContracts && <ContractSidebar documents={batch.documents} batchId={batch.id}
              errorMessage={apiError} onRetry={() => void refetch()} />}
            <main className="flex flex-1 min-w-0 flex-col">
              <ComparisonWorkspace key={comparison.id} version={comparison} />
            </main>
          </div> :
          <div className="p-8">{batch ? '当前版本暂无合同文件' : '暂无对比版本'}</div>
      }
    </div>
  )
}
