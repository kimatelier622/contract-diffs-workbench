export type Side = 'before' | 'after';
export type DiffType = 'TEXT_MODIFY' | 'TEXT_ADD' | 'TEXT_DELETE' | 'SEAL_ADD' | 'DATE_CHANGE' | 'FORMAT_CHANGE';
export type PageRect = { x:number; y:number; width:number; height:number }; // normalized top-left PDF page, [0..1]
export interface PdfLocation { page:number; rect:PageRect }
export interface DiffItem { id:string; type:DiffType; title:string; description:string; before?:PdfLocation; after?:PdfLocation }
export interface ContractFile { id:string; fileName:string; pdfUrl:string; pageCount?:number; role:Side }
export interface ComparisonVersion { id:string; name:string; createdAt:string; status:'completed'|'processing'|'failed'; before:ContractFile; after:ContractFile; diffs:DiffItem[] }
export interface ContractRecord { id:string; name:string; contractNo:string; versions:ComparisonVersion[] }
