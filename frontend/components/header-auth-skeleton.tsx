import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for the header authentication section.
 * Prevents layout shift by reserving space during auth state transitions.
 * Matches the approximate size of both the UserMenu avatar and Login button.
 */
export function HeaderAuthSkeleton() {
  return (
    <div className="flex items-center">
      <Skeleton className="h-10 w-20 rounded-md" />
    </div>
  )
}
