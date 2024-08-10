import { cn } from '@/utils/mergeClassName'
import { forwardRef, HTMLAttributes } from 'react'

export const FollowingTrigger = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('h-32 absolute bottom-0', className)}
    ref={ref}
    {...props}
  />
))
FollowingTrigger.displayName = 'FollowingTrigger'
