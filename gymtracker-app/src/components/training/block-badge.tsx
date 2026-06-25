import { getBlockColorConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BlockBadgeProps {
  color: string
  name: string
  className?: string
}

export function BlockBadge({ color, name, className }: BlockBadgeProps) {
  const config = getBlockColorConfig(color)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border',
        config.border,
        config.text,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', config.bg)} />
      {name}
    </span>
  )
}
