export type Side = 'before' | 'after';
export type ComparisonStatus = 'processing' | 'completed' | 'failed' | 'partial';
export type DiffType = 'TEXT_MODIFY' | 'TEXT_ADD' | 'TEXT_DELETE' | 'TABLE_CHANGE' | 'SEAL_ADD' |
  'SEAL_DELETE' | 'DATE_CHANGE' | 'FORMAT_CHANGE' | 'UNKNOWN';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type PdfCoordinateSpace = 'normalized-top-left' | 'pdf-points-top-left' | 'pdf-points-bottom-left';
export type PageRect = { x:number; y:number; width:number; height:number };
export interface PdfLocation {
  page:number;
  rect:PageRect;
  /** 旧数据未提供该字段时，按 normalized-top-left 处理。 */
  coordinateSpace?:PdfCoordinateSpace;
  blockIndex?:number;
}
export interface CharDiff { operation:string; text:string; beforeText:string; afterText:string }
export interface TableCellChange {
  row:number;
  column:number;
  beforeValue:string;
  afterValue:string;
  charDiffs:CharDiff[];
}
export interface DiffItem {
  id:string;
  type:DiffType;
  title:string;
  description:string;
  before?:PdfLocation;
  after?:PdfLocation;
  riskLevel?:RiskLevel;
  beforeText?:string;
  afterText?:string;
  charDiffs?:CharDiff[];
  tableChanges?:TableCellChange[];
  originalType?:string;
  source?:'legacy'|'backend';
}
export interface DiffSummary {
  totalChanges:number;
  textChanges:number;
  tableChanges:number;
  stampsFound:number;
  suspiciousAdditions:number;
  comparisonTimeMs:number;
}
export interface ComparisonReport {
  message:string;
  summary:DiffSummary;
  diffs:DiffItem[];
  /** Markdown 中可能包含 span；渲染前必须先做 HTML 白名单过滤。 */
  beforeHighlighted:string;
  afterHighlighted:string;
}
export interface ContractFile { id:string; fileName:string; pdfUrl:string; pageCount?:number; role:Side }
export interface ComparisonVersion { id:string; name:string; createdAt:string; status:ComparisonStatus; before:ContractFile; after:ContractFile; diffs:DiffItem[]; report?:ComparisonReport }
export interface ContractRecord { id:string; name:string; contractNo:string; versions:ComparisonVersion[] }
export interface ComparisonDocument { id:string; name:string; contractNo:string; comparison:ComparisonVersion }
export interface ComparisonBatch {
  id:string;
  name:string;
  createdAt:string;
  status:ComparisonStatus;
  failCount:number;
  riskCount:number;
  successCount:number;
  totalCount:number;
  documents:ComparisonDocument[];
}
export interface ContractWorkspace {
  id:string;
  name:string;
  contractNo:string;
  currentVersion:string;
  versions:ComparisonBatch[];
}
