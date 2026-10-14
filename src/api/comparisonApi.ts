import axios from 'axios';
import type { ContractRecord } from '../types/domain';
import { mockContracts } from '../mock/contracts';
const http=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || '/api',timeout:20000});
/** Configure backend to return same types. PDF endpoints may be signed URL or authorized blob URL. */
export async function fetchContracts():Promise<ContractRecord[]> {
 if(import.meta.env.VITE_USE_API !== 'true') return mockContracts;
 const {data}=await http.get<ContractRecord[]>('/comparison/contracts');
 return data;
}
/** Resolves secured PDF blob when backend requires bearer/cookie access; object URL must be revoked by caller. */
export async function fetchPdfBlobUrl(fileId:string):Promise<string>{
 const {data}=await http.get<Blob>(`/comparison/files/${encodeURIComponent(fileId)}/pdf`,{responseType:'blob'});
 return URL.createObjectURL(data);
}
