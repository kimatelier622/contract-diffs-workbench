import type {ChangeDto, CharDiffDto, CompareResponseDto, DiffLocationDto} from '../types/api';
import type {
  CharDiff,
  ComparisonReport,
  DiffItem,
  DiffType,
  PdfCoordinateSpace,
  PdfLocation,
  RiskLevel,
  TableCellChange
} from '../types/domain';

export interface CompareResponseAdapterOptions {
  /** 待后端确认；样例使用 1-based 页码。 */
  pageBase?: 0 | 1;
  /** 待后端确认；样例 bbox 当前按最终 PDF CropBox 左上角 point 坐标解释。 */
  coordinateSpace?: Exclude<PdfCoordinateSpace, 'normalized-top-left'>;
}

const typeMap: Record<string, {type: DiffType; title: string}> = {
  text_modified: {type: 'TEXT_MODIFY', title: '文本修改'},
  text_added: {type: 'TEXT_ADD', title: '文本新增'},
  text_deleted: {type: 'TEXT_DELETE', title: '文本删除'},
  table_cell_changed: {type: 'TABLE_CHANGE', title: '表格变化'},
  stamp_added: {type: 'SEAL_ADD', title: '印章新增'},
  seal_added: {type: 'SEAL_ADD', title: '印章新增'},
  stamp_deleted: {type: 'SEAL_DELETE', title: '印章删除'},
  seal_deleted: {type: 'SEAL_DELETE', title: '印章删除'},
  date_changed: {type: 'DATE_CHANGE', title: '日期变化'},
  format_changed: {type: 'FORMAT_CHANGE', title: '格式变化'}
};

function adaptRiskLevel(value: string): RiskLevel {
  const normalized = value.toLowerCase();
  if (normalized === 'high') return 'HIGH';
  if (normalized === 'medium') return 'MEDIUM';
  if (normalized === 'low') return 'LOW';
  return 'UNKNOWN';
}

function adaptCharDiff(item: CharDiffDto): CharDiff {
  return {
    operation: item.op,
    text: item.text ?? '',
    beforeText: item.pre_text ?? item.pre ?? '',
    afterText: item.post_text ?? item.post ?? ''
  };
}

function adaptLocation(location: DiffLocationDto | null, options: Required<CompareResponseAdapterOptions>): PdfLocation | undefined {
  if (!location) return undefined;
  const [left, top, right, bottom] = location.bbox;
  const x = Math.min(left, right);
  const y = Math.min(top, bottom);
  return {
    page: location.page + (options.pageBase === 0 ? 1 : 0),
    rect: {x, y, width: Math.abs(right - left), height: Math.abs(bottom - top)},
    coordinateSpace: options.coordinateSpace,
    blockIndex: location.block_index
  };
}

function adaptTableChange(item: ChangeDto['table_changes'][number]): TableCellChange {
  return {
    row: item.row,
    column: item.col,
    beforeValue: item.pre_value ?? item.pre ?? '',
    afterValue: item.post_value ?? item.post ?? '',
    charDiffs: (item.diff ?? item.char_diffs ?? []).map(adaptCharDiff)
  };
}

function adaptChange(change: ChangeDto, options: Required<CompareResponseAdapterOptions>): DiffItem {
  const mapped = typeMap[change.type] ?? {type: 'UNKNOWN' as const, title: change.type || '未知差异'};
  return {
    id: change.id,
    type: mapped.type,
    title: mapped.title,
    description: change.description,
    before: adaptLocation(change.pre_location, options),
    after: adaptLocation(change.post_location, options),
    riskLevel: adaptRiskLevel(change.risk_level),
    beforeText: change.pre_text,
    afterText: change.post_text,
    charDiffs: change.diff.map(adaptCharDiff),
    tableChanges: change.table_changes.map(adaptTableChange),
    originalType: change.type,
    source: 'backend'
  };
}

export function adaptCompareResponse(
  response: CompareResponseDto,
  options: CompareResponseAdapterOptions = {}
): ComparisonReport {
  const resolvedOptions: Required<CompareResponseAdapterOptions> = {
    pageBase: options.pageBase ?? 1,
    coordinateSpace: options.coordinateSpace ?? 'pdf-points-top-left'
  };
  const {summary} = response.report;
  const diffs = response.report.changes.map(change => adaptChange(change, resolvedOptions));
  return {
    message: response.message,
    summary: {
      totalChanges: summary.total_changes,
      textChanges: summary.text_changes,
      tableChanges: summary.table_changes,
      stampsFound: summary.stamps_found,
      suspiciousAdditions: summary.suspicious_additions,
      comparisonTimeMs: summary.comparison_time_ms
    },
    diffs,
    beforeHighlighted: response.report.pre_highlighted,
    afterHighlighted: response.report.post_highlighted
  };
}
