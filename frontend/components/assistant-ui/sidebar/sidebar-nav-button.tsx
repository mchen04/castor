import { PlusIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

interface SidebarNavButtonProps {
  onClick: () => void
}

/**
 * New Thread button with locked height structure
 * - Outer div locks height at 44px (prevents any vertical movement)
 * - Icon and text containers both h-11 for perfect symmetry
 * - py-0 ensures no extra vertical padding
 * - flex-shrink-0 prevents squeezing during width transitions
 */
export function SidebarNavButton({ onClick }: SidebarNavButtonProps) {
  const { state } = useSidebar()

  const button = (
    <div
      className="flex items-center h-11 w-full rounded-lg hover:bg-secondary/50 transition-colors"
      style={{
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      <button
        onClick={onClick}
        className="flex items-center h-full w-full py-0 pl-0 pr-3 group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:w-11 rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Icon container: 44x44px, flex-shrink-0 prevents squeezing */}
        <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
          <PlusIcon className="w-5 h-5" />
        </div>

        {/* Text container: hardware accelerated to prevent shifting during width transition */}
        <span
          className="text-sm font-normal whitespace-nowrap block max-w-[12rem]"
          style={{
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        >
          New Thread
        </span>
      </button>
    </div>
  )

  // Wrap in tooltip when collapsed
  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right">New Thread</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
