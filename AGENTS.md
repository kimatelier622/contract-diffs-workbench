# AGENTS.md — AI 合同用印前后差异核验工作台

> 本文件是 Codex 在本项目中的长期开发约束。开始任何任务前先阅读本文件及仓库现有实现；如本文与实际代码不一致，先报告差异，不要擅自大规模重构。

## 1. 项目定位

本项目是单页企业级合同用印前后 AI 差异核验工作台。一个业务单号可有多个比对版本；**每个比对版本固定包含用印前、用印后两份 PDF**。后端从其他系统获取文档，统一转换为 PDF，执行 OCR/AI 对比并返回差异及对应 PDF 坐标。前端**只负责展示和交互**，不得在浏览器中重新实现 AI 比对、OCR 或 PDF 转换。

## 2. 技术栈约束

- React **18**、TypeScript（strict）、Vite。
- Tailwind CSS **v4**，使用 `@tailwindcss/vite` 与 CSS-first 配置。
- **shadcn/ui + Base UI**（`@base-ui/react`），禁止新增 Radix UI 依赖或 Radix 版 shadcn 组件。
- Zustand：客户端交互状态；TanStack Query：服务端数据请求与缓存。
- `pdfjs-dist`：PDF 渲染；SVG：差异标注；`lucide-react`：图标。
- 未经确认不得替换框架、引入 Redux/MobX 或升级主要依赖的大版本。

## 3. UI 规范

- 以用户确认的 Figma 截图为视觉与交互基准；无法访问设计稿时请标记不确定项并询问。
- 基础 UI 组件放 `src/components/ui/`，业务组件按领域放在 `src/components/` 下。
- 使用现有 shadcn/ui Base UI 风格和 design tokens，优先复用已存在的 `Button`、`Switch`、`Slider` 等组件。
- 不要把业务 API、Zustand 业务状态或 PDF 逻辑写进通用 UI 组件。
- 保持键盘可操作性、可见焦点、必要 aria 标签及对比度。

## 4. Tailwind v4 规范

- 使用 `@import "tailwindcss"` 和 `@theme`/CSS 变量组织主题。
- Vite 配置使用 `@tailwindcss/vite`；不要加入 Tailwind v3 风格的 `tailwind.config.js` 或旧 PostCSS 配置来替代 v4 方案。
- 优先 Tailwind utility classes；PDF Canvas/SVG 尺寸同步、坐标或运行时计算允许适量内联样式。
- 不要随意引入 CSS-in-JS、CSS Modules 或新样式体系。

## 5. 目录规范

推荐按现有工程逐步对齐，不要为了目录规范重写可用代码：

```text
src/
  api/               # API 客户端与请求方法
  components/
    ui/              # shadcn/ui Base UI 基础组件
    layout/          # Header、整体布局
    contract/        # 单号、合同、版本切换
    comparison/      # 工作台、工具栏、差异导航
    pdf/             # PdfViewer、PdfPage、Overlay
    diff/            # 统计及差异明细
  hooks/
  store/             # Zustand 交互状态
  types/             # API DTO 与领域模型
  lib/               # 通用工具
  utils/             # PDF坐标/视口计算等
  mock/              # Mock数据（若存在）
```

## 6. PDF 开发规范

- 方案：**PDF.js → Canvas 底图 + SVG Overlay 差异标注**；必要时使用 TextLayer，但不应依赖可选择文本才能绘制 AI 标注。
- PDF 渲染实例按用印前与用印后各自独立创建；使用可复用的 `PdfViewer` 组件，通过 props 指定 side/file。
- 不以 `iframe` 或浏览器原生 PDF 查看器替代 PDF.js 的交互渲染。
- 避免一次渲染全部大文件；按需渲染可视页面并正确取消 renderTask、清理订阅及释放资源。
- 考虑加载、空文件、损坏文件、网络失败、跨域/鉴权和 worker 配置。

## 7. PDF 坐标规范

- 后端提供**转换后 PDF 文件**的差异矩形及页码；前端绝不把屏幕像素作为持久化差异坐标。
- 在 API 契约中明确：页码起始值、PDF 页宽/页高、坐标原点（top-left 或 PDF bottom-left）、单位、CropBox/MediaBox、旋转方向。
- 统一通过 PDF.js `page.getViewport({ scale, rotation })` 及其变换矩阵处理缩放、旋转、坐标翻转和裁剪；**不能假设所有场景直接 `x * scale, y * scale` 都正确**。
- SVG 的 `viewBox` 与 Canvas 显示区域一致；考虑 `devicePixelRatio` 只影响 Canvas backing store，不应重复缩放 Overlay。
- 选取至少三类 PDF 进行验证：普通文档、旋转页、不同尺寸/裁剪区域文档。

## 8. Diff 数据模型

一条差异应允许用印前、用印后分别定位到**不同页码和矩形**，不能用同一页码/rect 强行适配两侧。

```ts
type DiffType = 'ADD' | 'DELETE' | 'UPDATE';
type PdfRect = { x: number; y: number; width: number; height: number };
type DiffLocation = { fileId: string; page: number; rects: PdfRect[] };
interface DiffItem {
  id: string;
  type: DiffType;
  title?: string;
  beforeText?: string;
  afterText?: string;
  before?: DiffLocation | null;
  after?: DiffLocation | null;
}
```

这只是领域模型示例；接口 DTO 应以真实后端契约为准，通过 adapter 映射，避免 UI 直接绑定外部数据结构。对新增、删除等单侧无位置的差异应优雅降级。

## 9. Zustand 状态边界

- `comparisonStore`：选中的业务单号、比对版本等客户端选择状态。
- `viewerStore`：左右 Viewer 的页码、缩放比例、滚动信息、同步开关和定位请求。
- `diffStore`：当前选中的差异 ID、过滤/导航等交互状态。
- 合同列表、PDF 元数据、差异结果等**服务器数据优先由 TanStack Query 管理**，不要复制大列表到 Zustand 造成双重状态源。
- 使用 selector 限制不必要渲染；持续高频滚动位置优先用 ref/事件同步，避免每个滚动像素都触发全局重渲染。

## 10. 组件开发原则

- 单一职责、明确 props 类型和公开接口；优先组合而不是复杂条件分支。
- 同一 `PdfViewer` 实现两侧，用 `side: 'before' | 'after'` 区分；不要复制两套渲染代码。
- 组件内部尽量不直接发散 API 请求；采用 Query hooks + API 层组合。
- 避免 `any`、隐式类型断言、魔法数字、未处理的异步异常。
- 保留已有功能与 UI，除非需求明确要求变更。

## 11. API 规范

- API 函数统一放 `src/api/`，请求缓存/状态优先使用 TanStack Query。
- 必须支持：按单号查询比对版本、读取版本详情、获取用印前和用印后 PDF、获取 AI 差异列表/统计。
- PDF 获取方式可能是授权流、Blob 或临时地址；鉴权、过期刷新、取消请求与 object URL 释放必须明确处理。
- Mock 与正式 API 接口分层；环境变量切换数据源，不在业务组件中散落 Mock 条件判断。
- 任何尚未确定的 API 字段须标注“待后端确认”，不可假装已确认。

## 12. 页面结构

```text
App
└── ContractDiffWorkspace
    ├── Header
    └── MainLayout
        ├── ContractSidebar / VersionSelector
        ├── CompareWorkspace
        │   ├── CompareHeader
        │   ├── PdfCompareArea
        │   │   ├── PdfViewer (before)
        │   │   └── PdfViewer (after)
        │   └── BottomToolbar
        │       ├── SyncScrollSwitch
        │       ├── ZoomSlider / Percent
        │       └── DiffNavigator
        └── DiffPanel
```

页面为单页工作台，按最新用户提供的截图还原布局。底部百分比是**PDF 缩放比例**，不是对比进度；右下角是**差异导航**，不是 PDF 翻页导航。

## 13. 核心交互要求

- **差异点击定位**：点击差异列表项或底部导航 → 更新唯一的 activeDiffId → 双侧分别跳转对应 PDF 页、滚动至差异位置并突出显示 SVG 框。缺失单侧坐标时保留可定位的一侧并提示。
- **上一处 / 下一处**：右下角显示 `上一处  差异 x/n  下一处`；与右侧差异列表复用同一选中状态；首尾禁用边界按钮。
- **同步滚动**：底部左侧 `Switch` 可开启/关闭；开启时两栏联动，关闭时独立浏览；避免相互触发循环，考虑页高不一致时采用合理映射。
- **PDF 缩放**：底部百分比与 Slider 控制 PDF 显示缩放，缩放后 SVG 标注保持精准；必要时围绕当前视口中心调整滚动位置。
- **版本切换**：每个比对版本固定两份 PDF；版本切换后取消过期请求、清理旧文件和无效差异选中状态。
- 保留独立滚动功能：即使关闭滚动同步，点击差异仍能双侧定位。

## 14. TypeScript 规范

- `strict: true`；定义领域类型、接口 DTO、Viewer props 与回调签名。
- 禁止使用 `any` 来规避类型问题；必要时使用 `unknown` 配合类型收窄。
- **不建议整体跳过 `src/components/ui` 的 TS 检查**。`exclude` 不会屏蔽被导入的源码；应优先修复 Base UI 组件和版本兼容性。
- 禁止通过随意加入 `// @ts-nocheck` 或关闭 strict 掩盖编译失败；特殊豁免需说明原因及后续清理任务。

## 15. 开发流程要求

每次任务应：
1. 阅读 AGENTS.md、`package.json` 和相关组件/Store/API 文件。
2. 先总结现状、具体改动文件、交互与兼容性影响。
3. 优先最小化改动，实现后做类型检查、构建与必要的手工验证。
4. 说明变更、验证结果、未完成项；无法运行的检查要明确写出原因。
5. 不删除用户数据、不擅自升级依赖、不得声称未运行的测试已通过。

## 16. 新功能开发流程

新增/变更功能时先判断：
- 哪些组件变化？
- Zustand 是否需新增状态？服务器数据是否应放 TanStack Query？
- API DTO、领域模型或 PDF 坐标协议是否变化？
- 对已实现的 PDF 缩放、同步滚动、差异定位是否有回归风险？

业务需求不明确或存在多个实质不同的方案时，简要询问关键决策；其余可合理推进。

## 17. 一期开发目标

- **P0**：按 Figma/截图还原工作台、合同与版本切换、左右 PDF、SVG 差异框、缩放、同步/独立滚动、双侧差异定位、上一处/下一处、基础错误态。
- **P1**：大 PDF 可视区域渲染、流畅滚动、旋转/不同页尺寸支持、完整 API 联调、关键交互测试。
- **P2**：导出报告、AI 解释、忽略差异等扩展功能（尚未确定，不得擅自作为一期强制范围）。

## 18. Codex 执行原则

- 优先理解现有工程和约束再编码。
- 发现技术栈冲突、组件基元冲突、PDF 坐标约定缺失等问题先说明。
- 不擅自替换 PDF.js、Zustand、Base UI 或页面设计。
- 遵循用户明确的最新要求，避免把历史方案中已废弃的设计重新引入。
- 回答使用中文，代码/接口/变量采用清晰英文命名。

## 19. Figma 还原规范

- 最新用户确认截图优先于较早原型或自行生成的示意图。
- 尽量还原布局比例、边框、间距、字号、颜色、工具栏位置、折叠与悬浮状态。
- 拆分结构性 UI 组件，不因截图看似静态而去掉实际交互。
- 不自行增加导航、面板或功能；设计信息不足时在提交说明中列出差异与待确认项。
- 特别注意底部工具栏的同步滚动 `Switch`、PDF 缩放百分比、差异导航三者职责互不混淆。

## 20. Git 提交规范

- 推荐 Conventional Commits：`feat(pdf): add viewport-aware overlay`、`fix(scroll): prevent sync loop`、`refactor(diff): unify selection state`。
- 每次提交聚焦单一目的；功能与非必要格式化分开。
- 不提交 `node_modules`、`.env.local`、临时 PDF、日志或敏感凭据。
- 未经用户要求不强制 push、不重写历史、不执行破坏性 Git 操作。

## 首次交给 Codex 的建议指令

> 请先阅读 AGENTS.md，检查现有工程结构、依赖版本及关键组件。暂时不要修改代码。输出技术栈一致性检查、当前功能完成度、潜在问题（尤其是 Tailwind v4 + shadcn/ui Base UI、PDF 坐标、同步滚动）及按优先级排序的开发计划。
