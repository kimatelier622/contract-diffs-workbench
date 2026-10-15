# 合同用印前后差异核验工作台 V0.4

企业级合同用印前后 AI 差异核验工作台前端原型。

技术栈：React 18、TypeScript、Vite、Tailwind CSS v4、shadcn 风格 Base UI、Zustand、TanStack Query、PDF.js、SVG Overlay。

> 当前状态：主要页面和基础交互已经搭建，正式 TypeScript 构建已通过；PDF 坐标、复杂文档支持、同步滚动和真实 API 生命周期仍需完善，暂不能视为 P0 完成。

## 安装运行

推荐 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
npm run build
```

浏览器打开 <http://localhost:5173>。默认使用 `src/mock` 中的数据及 `public/mock` 中的示例合同。

环境变量示例见 `.env.example`：

- `VITE_USE_API=false`：使用本地 Mock 数据。
- `VITE_USE_API=true`：请求业务后端。
- `VITE_API_BASE_URL=/api`：配置业务 API 根路径。

## 技术栈一致性

| 项目 | 当前版本或实现 | 检查结论 |
| --- | --- | --- |
| React | 18.3.1 | 符合 React 18 约束 |
| TypeScript | 5.6.3，`strict: true` | 配置与类型检查均通过 |
| Vite | 6.4.4 | 符合 |
| Tailwind CSS | 4.3.3 + `@tailwindcss/vite` | 符合 v4 CSS-first 方案 |
| shadcn/ui 风格 | `components.json` + 本地 UI 组件 | 基础结构符合 |
| Base UI | `@base-ui/react` 1.9.0 | 符合，未发现 Radix UI 依赖 |
| Zustand | 5.0.15 | 已使用，状态边界尚未按领域拆分 |
| TanStack Query | 5.104.2 | 已用于合同服务器数据 |
| PDF.js | 4.10.38 | 已用于 Canvas 渲染及独立 worker |
| SVG Overlay | 已实现 | 兼容旧归一化坐标与后端绝对 bbox，并通过 PDF.js viewport 转换 |
| lucide-react | 0.468.0 | 符合 |

### Tailwind v4 与 Base UI

- `src/styles.css` 使用 `@import "tailwindcss"` 和 `@theme`。
- `vite.config.ts` 使用 `@tailwindcss/vite`。
- 仓库没有 Tailwind v3 风格的 `tailwind.config.js` 或旧 PostCSS 配置。
- `src/components/ui/switch.tsx` 和 `slider.tsx` 直接使用 Base UI，不依赖 Radix UI。
- Base UI 的 `data-checked` 状态与当前 `data-[checked]` 样式匹配，Vite 构建产物可生成对应 CSS。

目前 UI 基础组件只有 `Switch` 和 `Slider`。按钮、状态标签和输入框仍存在重复业务样式；主题也只有少量 token，大量颜色直接使用 Tailwind `blue-*`、`slate-*` 工具类。后续通过 shadcn CLI 新增组件时，需要检查生成结果是否继续使用 Base UI。

## 当前功能完成度

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| 单页工作台布局 | 部分完成 | 已有 Header、合同侧栏、双 PDF、差异面板和底部工具栏 |
| 合同与版本选择 | 已有原型 | 支持 Mock 合同搜索、合同切换和版本切换 |
| 双侧 PDF.js Viewer | 基础完成 | 两侧复用同一个 `PdfViewer` |
| Canvas + SVG 标注 | 基础完成 | 当前运行时 Mock 使用后端绝对 bbox；转换层仍兼容旧归一化坐标 |
| 差异列表联动 | 部分完成 | 共用 `activeDiffId`，可以触发双侧跳转 |
| 上一处/下一处 | 基础完成 | 复用 activeDiffId，未选中时显示 0/N，下一处从第一条开始 |
| 同步/独立滚动 | 基础完成 | 可开关，当前使用全文档滚动百分比同步 |
| PDF 缩放 | 基础完成 | 100% 为栏宽适配基准，默认不产生横向滚动 |
| 单侧差异 | 部分完成 | 能定位有坐标的一侧，没有缺失位置提示 |
| 加载与错误态 | 基础完成 | 有合同查询和 PDF 加载错误文本 |
| 大 PDF 按需渲染 | 基础完成 | 仅渲染视口附近页面，远离视口时释放 Canvas backing store |
| 旋转页/CropBox | 部分完成 | Overlay 已使用 viewport 变换，仍缺三类 PDF 的完整验证 |
| 真实 API 联调 | 部分完成 | 已有 CompareResponse DTO、adapter 和可取消的报告请求入口，版本/文件接口仍待确认 |
| 请求取消和 object URL 生命周期 | 未完成 | Blob 方法未接入 Viewer，也没有 revoke 流程 |
| 核心交互测试 | 未实现 | 当前没有测试脚本或自动化用例 |

## 已知问题

### P0：PDF 坐标协议尚未闭环

当前运行时标注统一来自 `src/mock/test.ts` 的 `CompareResponse`。`bbox` 暂按 `[x0, y0, x1, y1]`、1-based 页码、最终 PDF CropBox 左上角 point 坐标解释，并通过 `page.view` 和 `viewport.convertToViewportRectangle` 映射到 SVG。转换层仍保留 `[0..1]` 左上角归一化坐标兼容能力，旧数据已归档到 `docs/legacy-diff-mock.json`，不再参与渲染。

以下契约仍须后端最终确认，否则复杂 PDF 仍可能偏移：

- 页面包含旋转；
- CropBox 与 MediaBox 不同；
- 后端提供 PDF point，而不是已经映射到显示方向的归一化坐标；
- 两侧页面尺寸不同；
- 坐标来自转换前文件而非最终 PDF。

现有 `PdfLocation` 仍只有一个 `rect`，也缺少 `fileId` 和多个 `rects`，不足以完整表达跨行或多区域差异。`table_changes` 没有单元格 bbox，因此当前能展示行列和值变化，但只能使用顶层差异位置标注表格区域。

### P0：同步滚动精度和稳定性不足

当前同步算法是：

```text
另一侧 scrollTop =
当前侧 scrollTop / 当前侧最大滚动距离 × 另一侧最大滚动距离
```

实现中使用 `lock + 100ms timer` 初步防止相互触发，但仍存在以下风险：

- 两侧页数或页面高度不同时，语义位置会逐渐错开；
- 页面渲染或缩放改变 `scrollHeight` 时可能跳动；
- 差异定位的双侧平滑滚动可能与同步逻辑竞争；
- 固定 100ms 不能代表程序触发的滚动已经结束；
- Viewer 已计算可见页，但上层 `onPageVisible` 当前为空实现。

建议采用“页码 + 页内比例”映射，并区分用户滚动、同步写入和差异定位。

### P0：差异导航和定位状态不稳定

- 页面定位现已优先使用实际 SVG 标注元素的位置，仍依赖页面元数据先完成加载。
- 定位依赖 60ms 和 110ms 两组定时器，加载较慢或大 PDF 时可能失败。
- Store 的 `scrollTarget` 只保存一侧，双侧定位又由工作区 effect 补做，职责重复。
- 单侧无坐标时没有明确的用户提示。

### P0：真实 API 仍是演示入口

已增加独立 `CompareResponseDto` 与 adapter，能够映射 snake_case、风险等级、字符 diff、表格单元格变化、双侧位置和统计摘要；运行时 Mock 已统一使用正式的 `pre_value/post_value/diff` 字段。当前仍缺少：

- 按业务单号获取比对版本；
- 独立版本详情；
- 独立差异列表与统计；
- CompareResponse 的运行时 schema 校验；
- 授权头、cookie 或临时地址刷新策略；
- Blob URL 接入和 `URL.revokeObjectURL()`；
- 后端 `type`、`risk_level`、CharDiff 完整枚举及坐标协议的最终确认。

`fetchPdfBlobUrl` 已存在，但尚未被 Viewer 使用。

### 已修复：PDF 渲染性能与缩放基准

Viewer 通过 `ResizeObserver` 读取每栏可用宽度，将工具栏的 100% 定义为该栏的适宽基准。PDF.js viewport 不再包含隐藏的 `1.12` 系数，因此默认进入时不会产生横向滚动；放大超过 100% 时才按实际需要出现横向滚动。

缩放 Slider 在拖动过程中只更新滑块位置和百分比，松手后通过 `onValueCommitted` 一次性提交 PDF 缩放，避免连续重建 Canvas 和滚动条宽度变化造成页面抖动。缩放按钮及轨道点击仍会立即提交。

每页使用 `IntersectionObserver` 和上下 800px 缓冲区控制 Canvas 渲染。页面离开缓冲区后取消渲染并释放 Canvas backing store，保留页面尺寸占位以维持滚动位置。当前仍会预取页面元数据以计算占位尺寸，后续可继续评估超大文件下的元数据分页策略。

### P1：状态边界需要整理

合同选择、Viewer、差异、布局开关和缩放都集中在 `workspaceStore`。服务器数据由 TanStack Query 管理，这一点符合约束；继续加入页码、每侧状态、定位请求和过滤条件前，应逐步拆分 comparison、viewer 和 diff 状态边界。

### P1：视觉还原仍是近似实现

当前代码已经具备 `docs/img.png` 的三栏工作台骨架，但品牌区、顶部版本信息、面板尺寸、工具栏布局、状态标签和部分间距仍有差异。细化前应先确认 `docs/img.png` 是否仍是最新验收基准，同时保留 AGENTS.md 明确要求的同步滚动 Switch。

### 可访问性

大部分按钮已有文本或 `aria-label`，但 SVG 差异框只能鼠标点击，无法通过键盘聚焦和触发。后续还需要检查焦点顺序、错误提示关联和颜色对比度。

## 验证记录

2026-10-15 执行结果：

- `npm ls --depth=0`：通过，依赖安装完整。
- `npx tsc --noEmit`：通过。
- `npm run build`：通过。
- 主 JavaScript 产物约 655 KB，Vite 仍给出超过 500 KB 的体积警告。
- PDF worker 产物约 1.38 MB。
- 当前没有测试脚本，尚未执行浏览器端自动化验证。

## 开发计划

### P0：正确性和可交付

1. 与后端确认页码基数、单位、坐标原点、页面宽高、CropBox/MediaBox、旋转和转换后 PDF `fileId`。
2. 根据最终接口枚举收紧已增加的 API DTO 与 adapter，并加入运行时 schema 校验。
3. 用旋转/CropBox 样本验证现有 PDF.js viewport 坐标转换，并扩展多矩形位置。
4. 重做差异定位状态，移除双重定时器和单侧 `scrollTarget` 偏好。
5. 增加单侧缺失坐标提示。
6. 将同步滚动改为页码加页内比例映射，防止程序滚动互相触发。
7. 在缩放后保持视口中心。
8. 完成真实 PDF 获取、请求取消、鉴权和 object URL 释放。
9. 根据确认后的截图完成 P0 视觉还原和基础响应式检查。

### P1：性能和复杂 PDF

1. 使用普通文档、旋转页、不同尺寸/CropBox 文档验证坐标。
2. 逐步拆分 comparison、viewer 和 diff 状态边界。
3. 增加坐标转换、差异导航、同步循环和版本切换测试。
4. 优化主包与 PDF worker 的加载策略。
5. 完善空 PDF、损坏文件、网络失败和授权过期状态。

### P2：待确认扩展

在 P0/P1 稳定后再评估导出报告、AI 解释和忽略差异等功能，不将其作为当前一期强制范围。
