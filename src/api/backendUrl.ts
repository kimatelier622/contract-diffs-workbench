const PROXIED_PATH_PREFIXES = ['/ai-api/', '/filebase/'];

/**
 * 后端有时返回 UAT/Prod 的绝对资源地址。转成同源路径后，开发环境由 Vite、部署环境由网关代理，
 * 避免 PDF.js 直接跨域请求文件服务。
 */
export function toProxiedBackendUrl(value: string) {
  const url = value.trim();
  if (!url || url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (PROXIED_PATH_PREFIXES.some(prefix => parsed.pathname.startsWith(prefix))) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // 非绝对 URL 保持原值，由调用方按原有规则处理。
  }
  return url;
}
