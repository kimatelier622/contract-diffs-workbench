import type {PageRect} from '../types/domain';
/** Backend coordinates MUST be declared: PDF points, bottom-left origin, unrotated CropBox. */
export function pdfPointsToNormalized(rect:PageRect,pageWidth:number,pageHeight:number):PageRect {
 return {x:rect.x/pageWidth,y:(pageHeight-rect.y-rect.height)/pageHeight,width:rect.width/pageWidth,height:rect.height/pageHeight};
}
/** Normalized top-left locations are rotation independent ONLY if server already maps to displayed page orientation. */
export function normalizedToPixels(rect:PageRect,width:number,height:number):PageRect {
 return {x:rect.x*width,y:rect.y*height,width:rect.width*width,height:rect.height*height};
}
