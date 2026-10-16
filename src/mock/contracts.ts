import type {ContractRecord} from '../types/domain';
import {adaptCompareResponse} from '../api/compareResponseAdapter';
import {mockData} from './test';

const mockReport = adaptCompareResponse(mockData);
const mockAssetUrl = (fileName: string) => `${import.meta.env.BASE_URL}mock/${fileName}`;

function version(contract: number, number: number) {
  const id = `contract-${contract}-v${number}`;
  return {
    id,
    name: `V${number}`,
    createdAt: '2026-10-14 10:00',
    status: 'completed' as const,
    before: {
      id: `${id}-before`,
      role: 'before' as const,
      fileName: `合同${contract}_用印前.pdf`,
      pdfUrl: mockAssetUrl('before.pdf')
    },
    after: {
      id: `${id}-after`,
      role: 'after' as const,
      fileName: `合同${contract}_用印后.pdf`,
      pdfUrl: mockAssetUrl('after.pdf')
    },
    diffs: mockReport.diffs,
    report: mockReport
  };
}

export const mockContracts: ContractRecord[] = [1, 2, 3].map(contract => ({
  id: `contract-${contract}`,
  name: `合同${contract}`,
  contractNo: `HT-2026-00${contract}`,
  versions: contract === 1 ? [version(contract, 1), version(contract, 2)] : [version(contract, 1)]
}));
