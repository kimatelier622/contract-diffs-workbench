import type { ContractRecord, DiffItem } from '../types/domain';
const diffs:DiffItem[] = [
 {id:'d1',type:'TEXT_MODIFY',title:'文本修改',description:'付款期限由 30 日调整为 45 日',before:{page:1,rect:{x:.08,y:.285,width:.79,height:.060}},after:{page:1,rect:{x:.08,y:.285,width:.79,height:.060}}},
 {id:'d2',type:'SEAL_ADD',title:'印章新增',description:'乙方签章区域新增公司公章',after:{page:1,rect:{x:.46,y:.61,width:.31,height:.19}}},
 {id:'d3',type:'TEXT_DELETE',title:'文本删除',description:'“传真”字段已删除',before:{page:1,rect:{x:.08,y:.81,width:.28,height:.045}}},
 {id:'d4',type:'DATE_CHANGE',title:'日期变化',description:'签署日期发生变化',before:{page:1,rect:{x:.08,y:.69,width:.38,height:.05}},after:{page:1,rect:{x:.08,y:.69,width:.38,height:.05}}},
 {id:'d5',type:'FORMAT_CHANGE',title:'格式变化',description:'页脚合同编号位置变化',before:{page:1,rect:{x:.26,y:.92,width:.50,height:.04}},after:{page:1,rect:{x:.26,y:.92,width:.50,height:.04}}}
];
function version(contract:number,number:number){const id=`contract-${contract}-v${number}`;return {id,name:`V${number}`,createdAt:'2026-10-14 10:00',status:'completed' as const,before:{id:`${id}-before`,role:'before' as const,fileName:`合同${contract}_用印前.pdf`,pdfUrl:'/mock/before.pdf'},after:{id:`${id}-after`,role:'after' as const,fileName:`合同${contract}_用印后.pdf`,pdfUrl:'/mock/after.pdf'},diffs:contract===1?diffs:diffs.slice(0,contract===2?2:3)};}
export const mockContracts:ContractRecord[] = [1,2,3].map(i=>({id:`contract-${i}`,name:`合同${i}`,contractNo:`HT-2026-00${i}`,versions:i===1?[version(i,1),version(i,2)]:[version(i,1)]}));
