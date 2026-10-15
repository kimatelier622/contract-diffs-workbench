/** 后端比对结果 DTO。字段名保持与接口一致，禁止在 UI 中直接使用。 */
export interface CompareResponseDto {
  status: 'success';
  message: string;
  report: DiffReportDto;
}

export interface DiffReportDto {
  summary: DiffSummaryDto;
  changes: ChangeDto[];
  pre_highlighted: string;
  post_highlighted: string;
}

export interface DiffSummaryDto {
  total_changes: number;
  text_changes: number;
  table_changes: number;
  stamps_found: number;
  suspicious_additions: number;
  comparison_time_ms: number;
}

export interface ChangeDto {
  id: string;
  /** 完整枚举待后端 2.3 契约确认，适配器会保留未知值。 */
  type: string;
  /** 完整枚举待后端 2.4 契约确认。 */
  risk_level: string;
  pre_location: DiffLocationDto | null;
  post_location: DiffLocationDto | null;
  pre_text: string;
  post_text: string;
  diff: CharDiffDto[];
  table_changes: TableCellChangeDto[];
  description: string;
}

export interface DiffLocationDto {
  page: number;
  /** [x0, y0, x1, y1]；当前按最终 PDF CropBox 的左上角 point 坐标接入。 */
  bbox: [number, number, number, number];
  block_index: number;
}

export interface CharDiffDto {
  /** 完整枚举待后端 2.6 契约确认，当前兼容 equal/insert/delete/replace。 */
  op: string;
  text?: string;
  pre_text?: string;
  post_text?: string;
  /** 兼容早期 Mock，正式接口应使用 pre_text/post_text。 */
  pre?: string;
  post?: string;
}

export interface TableCellChangeDto {
  /** 比对配对后的表格坐标，0-based。 */
  row: number;
  col: number;
  pre_value?: string;
  post_value?: string;
  diff?: CharDiffDto[];
  /** 兼容早期 Mock，正式接口应使用 pre_value/post_value/diff。 */
  pre?: string;
  post?: string;
  char_diffs?: CharDiffDto[];
}
