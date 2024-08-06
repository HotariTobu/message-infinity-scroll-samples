import { cn } from '@/utils/mergeClassName'
import { forwardRef, HTMLAttributes } from 'react'

export const LoadingHeader = forwardRef<
  HTMLDivElement,
  {
    isLoading: boolean
    hasMore: boolean
  } & HTMLAttributes<HTMLDivElement>
>(({ hasMore, isLoading, className, ...props }, ref) => (
  <div className={cn('absolute inset-x-0 top-0', className)} ref={ref} {...props}>
    <img
      className={cn(
        'mx-auto transition-opacity',
        isLoading && 'animate-spin',
        hasMore || 'opacity-0'
      )}
      src="spinner.svg"
      alt="loading spinner"
    />
  </div>
))
LoadingHeader.displayName = 'LoadingHeader'
