import { cn } from '@/utils/mergeClassName'
import { forwardRef, HTMLAttributes } from 'react'

export const LoadingHeader = forwardRef<
  HTMLDivElement,
  {
    isLoading: boolean
    hasMore: boolean
  } & HTMLAttributes<HTMLDivElement>
>(({ isLoading, hasMore, className, ...props }, ref) => (
  <div className={cn('text-center', className)} ref={ref} {...props}>
    {isLoading ? 'Loading...' : hasMore ? 'Load more' : 'Loaded all!'}
  </div>
))
LoadingHeader.displayName = 'LoadingHeader'
