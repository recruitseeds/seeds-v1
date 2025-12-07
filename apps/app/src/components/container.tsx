import { cn } from '@seeds/ui/cn'

export function Container({
  children,
  className,
  fullWidth = false,
}: {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}) {
  return (
    <div
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8 md:ml-[15rem] py-8',
        fullWidth ? 'max-w-full' : 'container mx-auto',
        className,
      )}
    >
      {children}
    </div>
  )
}
