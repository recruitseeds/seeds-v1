'use client'

import { cn } from '@seeds/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@seeds/ui/dropdown-menu'
import { Tooltip } from '@seeds/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { BanIcon, HighlighterIcon } from 'lucide-react'

export const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: 'var(--highlight-yellow)' },
  { label: 'Green', value: 'var(--highlight-green)' },
  { label: 'Blue', value: 'var(--highlight-blue)' },
  { label: 'Purple', value: 'var(--highlight-purple)' },
  { label: 'Pink', value: 'var(--highlight-pink)' },
  { label: 'Orange', value: 'var(--highlight-orange)' },
  { label: 'Red', value: 'var(--highlight-red)' },
  { label: 'Gray', value: 'var(--highlight-gray)' },
] as const

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]

export function ColorHighlightPopover({
  editor,
  className,
  colors = HIGHLIGHT_COLORS,
}: {
  editor: Editor | null
  className?: string
  colors?: readonly HighlightColor[]
}) {
  const isActive = editor?.isActive('highlight') ?? false

  const handleColorSelect = (color: string) => {
    editor?.chain().focus().toggleHighlight({ color }).run()
  }

  const handleRemoveHighlight = () => {
    editor?.chain().focus().unsetHighlight().run()
  }

  return (
    <DropdownMenu>
      <Tooltip label="Highlight" side="bottom">
        <span className="inline-flex">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center justify-center p-2 h-7.5 w-7.5 rounded-md text-sm font-medium transition-colors',
                'hover:bg-black/[0.06] dark:hover:bg-white/[0.08]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive && 'bg-black/5 dark:bg-white/10',
                className
              )}
              aria-label="Highlight"
              aria-pressed={isActive}
              data-active-state={isActive ? 'on' : 'off'}
            >
              <HighlighterIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </span>
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        <div className="grid grid-cols-4 gap-1 p-1">
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorSelect(color.value)}
              className={cn(
                'size-6 rounded-md border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                editor?.isActive('highlight', { color: color.value }) && 'ring-2 ring-ring'
              )}
              style={{ backgroundColor: color.value }}
              aria-label={`${color.label} highlight`}
              title={color.label}
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemoveHighlight}>
          <BanIcon className="size-4" />
          <span>Remove highlight</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
