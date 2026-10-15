import type {PDFPageProxy, PageViewport} from 'pdfjs-dist';
import type {PageRect, PdfLocation} from '../types/domain';
/** 旧的 PDF 左下角 point 坐标归一化工具，保留给已有调用方。 */
export function pdfPointsToNormalized(rect:PageRect,pageWidth:number,pageHeight:number):PageRect {
 return {x:rect.x/pageWidth,y:(pageHeight-rect.y-rect.height)/pageHeight,width:rect.width/pageWidth,height:rect.height/pageHeight};
}
/** Normalized top-left locations are rotation independent ONLY if server already maps to displayed page orientation. */
export function normalizedToPixels(rect:PageRect,width:number,height:number):PageRect {
 return {x:rect.x*width,y:rect.y*height,width:rect.width*width,height:rect.height*height};
}

/** 将兼容领域坐标转换到当前 PDF.js viewport；Canvas 的 DPR 不参与 Overlay 尺寸。 */
export function locationToViewportRect(
  location: PdfLocation,
  page: PDFPageProxy,
  viewport: PageViewport
): PageRect {
  const {rect} = location;
  if (!location.coordinateSpace || location.coordinateSpace === 'normalized-top-left') {
    return normalizedToPixels(rect, viewport.width, viewport.height);
  }

  const [viewLeft, viewBottom, , viewTop] = page.view;
  let pdfRect: [number, number, number, number];
  if (location.coordinateSpace === 'pdf-points-top-left') {
    pdfRect = [
      viewLeft + rect.x,
      viewTop - rect.y,
      viewLeft + rect.x + rect.width,
      viewTop - rect.y - rect.height
    ];
  } else {
    pdfRect = [
      viewLeft + rect.x,
      viewBottom + rect.y,
      viewLeft + rect.x + rect.width,
      viewBottom + rect.y + rect.height
    ];
  }
  const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(pdfRect);
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1)
  };
}
