import type { FC } from 'react'

/**
 * Loading dots animation component
 * Displays three bouncing dots for loading states
 */
export const LoadingDots: FC = () => {
  return (
    <div className="flex items-center gap-1" aria-label="Loading">
      <span
        className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: '0ms', animationDuration: '1s' }}
      />
      <span
        className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: '150ms', animationDuration: '1s' }}
      />
      <span
        className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: '300ms', animationDuration: '1s' }}
      />
    </div>
  )
}
