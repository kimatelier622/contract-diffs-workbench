# 合同用印前后差异核验工作台 V0.4

**React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn-style Base UI + Zustand + TanStack Query + PDF.js**。

## 安装运行

推荐 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
npm run build
```

浏览器打开 http://localhost:5173 。默认使用 `src/mock` 中的数据及 `public/mock` 的示例合同。

## UI 说明

`src/components/ui/switch.tsx` 和 `slider.tsx` 是**基于 Base UI 编写的本地 shadcn 风格组件**，不引入 Radix；可通过配置好的 `components.json` 后续使用 shadcn CLI 添加更多组件。Tailwind 使用 v4 的 `@import "tailwindcss"` 与 `@tailwindcss/vite`，无 v3 的 tailwind.config.js。

## 已包含

- 左侧合同列表、版本选择、右侧差异明细
- 双 PDF.js 查看器 + SVG 差异标注
- 同步滚动开关、60%~200% 缩放
- “上一处 / 差异 n / N / 下一处”联动双 PDF 跳转
- Mock 数据及 API 适配入口

## 注意

本工程已经过结构/文件与 ZIP 校验；由于当前运行环境网络依赖安装不可用，尚未执行成功的 `npm run build`，请在本地安装依赖后验证。后端真实 PDF 和差异 API 需要在联调时替换 Mock。
