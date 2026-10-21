import {adaptCompareResponse} from './compareResponseAdapter';
import {toProxiedBackendUrl} from './backendUrl';
import type {CompareResponseDto, ContractAttachmentDto, ContractDetailWithVersionsDto} from '../types/api';
import type {ComparisonReport, ComparisonVersion, ContractWorkspace} from '../types/domain';

function adaptVersionStatus(status: number): ComparisonVersion['status'] {
  if (status === 1) return 'completed';
  if (status === 2) return 'failed';
  if (status === 3) return 'partial';
  return 'processing';
}

function isCompareResponseDto(value: unknown): value is CompareResponseDto {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.status !== 'success' || typeof candidate.message !== 'string') return false;
  const report = candidate.report;
  if (!report || typeof report !== 'object') return false;
  const reportRecord = report as Record<string, unknown>;
  return Array.isArray(reportRecord.changes) && typeof reportRecord.summary === 'object' &&
    typeof reportRecord.pre_highlighted === 'string' && typeof reportRecord.post_highlighted === 'string';
}

function parseReport(rawJson: string | null | undefined): ComparisonReport | undefined {
  if (!rawJson?.trim()) return undefined;
  try {
    const parsed: unknown = JSON.parse(rawJson);
    // 真实 AI 结果页码为 0-based；前端 PDF.js 页面统一使用 1-based。
    return isCompareResponseDto(parsed) ? adaptCompareResponse(parsed, {pageBase: 0}) : undefined;
  } catch {
    return undefined;
  }
}

function adaptAttachmentVersion(
  source: ContractAttachmentDto,
  batch: ContractDetailWithVersionsDto['versions'][number]
): ComparisonVersion {
  const report = parseReport(source.rawJson ?? source.rowJson);
  const fileName = source.name.replace(/\.pdf$/i, '');
  return {
    id: `${batch.versionId}:${source.id}`,
    name: batch.version,
    createdAt: batch.compareTime,
    status: adaptVersionStatus(source.status),
    before: {
      id: source.preId,
      fileName: `${fileName}_用印前.pdf`,
      pdfUrl: toProxiedBackendUrl(source.preUrl),
      role: 'before'
    },
    after: {
      id: source.postId,
      fileName: `${fileName}_用印后.pdf`,
      pdfUrl: toProxiedBackendUrl(source.postUrl),
      role: 'after'
    },
    diffs: report?.diffs ?? [],
    report
  };
}

/** 保留后端“合同流程 -> 批次版本 -> 合同附件”的层级，避免跨版本错误合并附件。 */
export function adaptContractDetail(detail: ContractDetailWithVersionsDto): ContractWorkspace {
  return {
    id: detail.flowInfo.flowId,
    name: detail.flowInfo.title || detail.flowInfo.flowName,
    contractNo: detail.flowInfo.flowNo,
    currentVersion: detail.flowInfo.currentVersion,
    versions: detail.versions.map(batch => ({
      id: batch.versionId,
      name: batch.version,
      createdAt: batch.compareTime,
      status: adaptVersionStatus(batch.status),
      failCount: batch.failCount,
      riskCount: batch.riskCount,
      successCount: batch.successCount,
      totalCount: batch.totalCount,
      documents: (batch.sourceList ?? []).map(source => ({
        id: source.id,
        name: source.name,
        contractNo: source.no || detail.flowInfo.flowNo,
        comparison: adaptAttachmentVersion(source, batch)
      }))
    }))
  };
}
