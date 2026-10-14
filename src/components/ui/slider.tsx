import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { cn } from '../../lib/utils';
import type { ComponentProps } from 'react';
/** Single value shadcn-style slider, powered by Base UI. */
export function Slider({className,...props}: ComponentProps<typeof SliderPrimitive.Root>) {
  return <SliderPrimitive.Root className={cn('relative flex w-full touch-none select-none items-center',className)} {...props}>
    <SliderPrimitive.Control className="flex w-full items-center py-2">
      <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-slate-200">
        <SliderPrimitive.Indicator className="absolute h-full rounded-full bg-blue-600" />
        <SliderPrimitive.Thumb aria-label="PDF 缩放比例" className="block size-4 rounded-full border-2 border-blue-600 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-blue-500" />
      </SliderPrimitive.Track>
    </SliderPrimitive.Control>
  </SliderPrimitive.Root>;
}
