import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '../../lib/utils';
import type { ComponentProps } from 'react';
/** shadcn-style local component using Base UI, not Radix. */
export function Switch({className,...props}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return <SwitchPrimitive.Root className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-slate-200 transition-colors data-[checked]:bg-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50', className)} {...props}>
    <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-[22px]" />
  </SwitchPrimitive.Root>;
}
