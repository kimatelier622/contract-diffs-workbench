import axios from 'axios';
import type {ComparisonBatch, ContractRecord, ContractWorkspace} from '../types/domain';
import type {ApiResponseDto, ContractDetailWithVersionsDto} from '../types/api';
import { mockContracts } from '../mock/contracts';
import {adaptContractDetail} from './contractDetailAdapter';
const http=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || '/',timeout:20000});
const CONTRACT_DETAIL_PATH = '/ai-api/api/contract/attach/compare/flow';

export async function fetchContractDetailWithVersions(
 flowId:string,
 signal?:AbortSignal
):Promise<ContractDetailWithVersionsDto>{
 const normalizedFlowId=flowId.trim();
 if(!normalizedFlowId) throw new Error('缺少合同流程 ID（flowId）');
 const path=`${CONTRACT_DETAIL_PATH}/${encodeURIComponent(normalizedFlowId)}/detail-with-versions`;
 const {data}=await http.get<ApiResponseDto<ContractDetailWithVersionsDto>>(path,{signal});
 if(data.success!==1||!data.data) throw new Error(data.errorMsg||`合同详情获取失败（${data.errorCode||'UNKNOWN'}）`);
 return data.data;
}

/** 本地环境返回 Mock；UAT/Prod 使用合同详情接口并转换为页面领域模型。 */
function adaptMockWorkspace(contracts: ContractRecord[]): ContractWorkspace {
 const versionCount=Math.max(0,...contracts.map(contract=>contract.versions.length));
 const versions:ComparisonBatch[]=Array.from({length:versionCount},(_,index)=>{
  const reference=contracts.find(contract=>contract.versions[index])?.versions[index];
  const documents=contracts.flatMap(contract=>{
   const comparison=contract.versions[index];
   return comparison?[{id:contract.id,name:contract.name,contractNo:contract.contractNo,comparison}]:[];
  });
  return {
   id:`mock-batch-${index+1}`,
   name:reference?.name??`V${index+1}`,
   createdAt:reference?.createdAt??'',
   status:reference?.status??'processing',
   failCount:documents.filter(document=>document.comparison.status==='failed').length,
   riskCount:documents.reduce((count,document)=>count+document.comparison.diffs.filter(
    diff=>diff.riskLevel==='HIGH').length,0),
   successCount:documents.filter(document=>document.comparison.status==='completed').length,
   totalCount:documents.length,
   documents
  };
 });
 return {
  id:'mock-flow',
  name:'合同用印核验示例',
  contractNo:'MOCK-FLOW',
  currentVersion:versions.at(-1)?.name??'',
  versions:versions.reverse()
 };
}

export const mockContractWorkspace=adaptMockWorkspace(mockContracts);

export async function fetchContractWorkspace(flowId?:string,signal?:AbortSignal):Promise<ContractWorkspace> {
 if(import.meta.env.VITE_USE_API === 'false') return mockContractWorkspace;
 const detail=await fetchContractDetailWithVersions(flowId??'',signal);
 return adaptContractDetail(detail);
}
