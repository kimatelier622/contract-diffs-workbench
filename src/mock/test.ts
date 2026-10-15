import type {CompareResponseDto} from '../types/api';

/** 由 docs/legacy-diff-mock.json 的 5 条旧差异转换得到的后端结构 Mock。 */
export const mockData = {
  status: 'success',
  message: '比对完成，发现 6 处差异',
  report: {
    summary: {
      total_changes: 6,
      text_changes: 3,
      table_changes: 4,
      stamps_found: 1,
      suspicious_additions: 0,
      comparison_time_ms: 1860
    },
    changes: [
      {
        id: 'change_000',
        type: 'text_modified',
        risk_level: 'high',
        pre_location: {page: 1, bbox: [48, 240, 518, 290], block_index: -1},
        post_location: {page: 1, bbox: [48, 240, 518, 290], block_index: -1},
        pre_text: '付款期限为30日',
        post_text: '付款期限为45日',
        diff: [
          {op: 'equal', text: '付款期限为', pre_text: '', post_text: ''},
          {op: 'replace', text: '', pre_text: '30', post_text: '45'},
          {op: 'equal', text: '日', pre_text: '', post_text: ''}
        ],
        table_changes: [],
        description: '付款期限由 30 日调整为 45 日'
      },
      {
        id: 'change_001',
        type: 'stamp_added',
        risk_level: 'medium',
        pre_location: null,
        post_location: {page: 1, bbox: [274, 463, 458, 623], block_index: -1},
        pre_text: '',
        post_text: '乙方公司公章',
        diff: [
          {op: 'insert', text: '乙方公司公章', pre_text: '', post_text: ''}
        ],
        table_changes: [],
        description: '乙方签章区域新增公司公章'
      },
      {
        id: 'change_002',
        type: 'text_deleted',
        risk_level: 'medium',
        pre_location: {page: 1, bbox: [48, 657, 214, 695], block_index: -1},
        post_location: null,
        pre_text: '传真',
        post_text: '',
        diff: [
          {op: 'delete', text: '传真', pre_text: '', post_text: ''}
        ],
        table_changes: [],
        description: '“传真”字段已删除'
      },
      {
        id: 'change_003',
        type: 'date_changed',
        risk_level: 'high',
        pre_location: {page: 1, bbox: [48, 530, 256, 573], block_index: -1},
        post_location: {page: 1, bbox: [48, 530, 256, 573], block_index: -1},
        pre_text: '签署日期：2026年10月13日',
        post_text: '签署日期：2026年10月14日',
        diff: [
          {op: 'equal', text: '签署日期：2026年10月1', pre_text: '', post_text: ''},
          {op: 'replace', text: '', pre_text: '3', post_text: '4'},
          {op: 'equal', text: '日', pre_text: '', post_text: ''}
        ],
        table_changes: [],
        description: '签署日期发生变化'
      },
      {
        id: 'change_004',
        type: 'format_changed',
        risk_level: 'low',
        pre_location: {page: 1, bbox: [48, 760, 452, 800], block_index: -1},
        post_location: {page: 1, bbox: [48, 760, 452, 800], block_index: -1},
        pre_text: '合同编号：HT-2026-001',
        post_text: '合同编号：HT-2026-001',
        diff: [
          {op: 'equal', text: '合同编号：HT-2026-001', pre_text: '', post_text: ''}
        ],
        table_changes: [],
        description: '页脚合同编号位置变化'
      },
      {
        id: 'change_005',
        type: 'table_cell_changed',
        risk_level: 'medium',
        pre_location: {page: 4, bbox: [55, 210, 540, 498], block_index: -1},
        post_location: {page: 4, bbox: [55, 210, 540, 498], block_index: -1},
        pre_text: '第2行：数量2、合计80000；第3行：单价120000、合计120000',
        post_text: '第2行：数量3、合计120000；第3行：单价80000、合计80000',
        diff: [
          {
            op: 'replace',
            text: '',
            pre_text: '第2行：数量2、合计80000；第3行：单价120000、合计120000',
            post_text: '第2行：数量3、合计120000；第3行：单价80000、合计80000'
          }
        ],
        table_changes: [
          {
            row: 1,
            col: 2,
            pre_value: '2',
            post_value: '3',
            diff: [
              {op: 'replace', text: '', pre_text: '2', post_text: '3'}
            ]
          },
          {
            row: 1,
            col: 4,
            pre_value: '80000',
            post_value: '120000',
            diff: [
              {op: 'replace', text: '', pre_text: '80000', post_text: '120000'}
            ]
          },
          {
            row: 2,
            col: 3,
            pre_value: '120000',
            post_value: '80000',
            diff: [
              {op: 'replace', text: '', pre_text: '120000', post_text: '80000'}
            ]
          },
          {
            row: 2,
            col: 4,
            pre_value: '120000',
            post_value: '80000',
            diff: [
              {op: 'replace', text: '', pre_text: '120000', post_text: '80000'}
            ]
          }
        ],
        description: '设备清单中 4 个单元格发生变化'
      }
    ],
    pre_highlighted: '付款期限为<span class="hl-mod">30</span>日\n\n传真\n\n签署日期：2026年10月13日\n\n合同编号：HT-2026-001',
    post_highlighted: '付款期限为<span class="hl-mod">45</span>日\n\n签署日期：2026年10月14日\n\n乙方公司公章\n\n合同编号：HT-2026-001'
  }
} satisfies CompareResponseDto;
