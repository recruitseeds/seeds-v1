import { Button } from '@seeds/ui/button'
import { cn } from '@seeds/ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@seeds/ui/dropdown-menu'
import { KeyboardShortcut } from '@seeds/ui/keyboard-shortcut'
import { Tooltip } from '@seeds/ui/tooltip'
import type { Editor } from '@tiptap/react'
import {
  ChevronDownIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  TypeIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const headingIcons = {
  1: Heading1Icon,
  2: Heading2Icon,
  3: Heading3Icon,
  4: Heading4Icon,
  5: Heading5Icon,
  6: Heading6Icon,
} as const

const headingShortcuts: Record<HeadingLevel, string> = {
  1: 'mod+alt+1',
  2: 'mod+alt+2',
  3: 'mod+alt+3',
  4: 'mod+alt+4',
  5: 'mod+alt+5',
  6: 'mod+alt+6',
}

const paragraphShortcut = 'mod+alt+0'

const menuItemStyles = 'flex w-full justify-between'

interface HeadingDropdownProps {
  editor: Editor | null
  levels?: HeadingLevel[]
  className?: string
}

export function HeadingDropdown({ editor, levels = [1, 2, 3], className }: HeadingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeLevel = useMemo(() => {
    if (!editor) return null
    for (const level of levels) {
      if (editor.isActive('heading', { level })) {
        return level
      }
    }
    return null
  }, [editor, levels])

  const isParagraphActive = editor?.isActive('paragraph') ?? false

  const ActiveIcon = useMemo(() => {
    if (activeLevel) {
      return headingIcons[activeLevel]
    }
    return TypeIcon
  }, [activeLevel])

  const handleParagraphClick = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setParagraph().run()
    setIsOpen(false)
  }, [editor])

  const handleHeadingClick = useCallback(
    (level: HeadingLevel) => {
      if (!editor) return
      if (editor.isActive('heading', { level })) {
        editor.chain().focus().setParagraph().run()
      } else {
        editor.chain().focus().toggleHeading({ level }).run()
      }
      setIsOpen(false)
    },
    [editor],
  )

  const isAnyActive = activeLevel !== null || isParagraphActive

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip label="Text style" side="bottom">
        <span className="inline-flex">
          <DropdownMenuTrigger asChild>
            <Button
              variant="plain"
              size="base"
              className={cn('flex-row items-center gap-0.5 px-2', className)}
              accessibilityLabel="Text format"
            >
              <span className="flex items-center gap-0.5">
                <ActiveIcon className="size-4" />
                <ChevronDownIcon className="size-3 opacity-60" />
              </span>
            </Button>
          </DropdownMenuTrigger>
        </span>
      </Tooltip>

      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuGroup className="space-y-1">
          <DropdownMenuItem onSelect={handleParagraphClick} className={menuItemStyles}>
            <span className="flex items-center gap-2">
              <TypeIcon className="size-4" />
              <span>Text</span>
            </span>
            <KeyboardShortcut shortcut={paragraphShortcut} />
          </DropdownMenuItem>

          {levels.map((level) => {
            const Icon = headingIcons[level]
            const isActive = editor?.isActive('heading', { level }) ?? false

            return (
              <DropdownMenuItem
                key={level}
                onSelect={() => handleHeadingClick(level)}
                className={cn(menuItemStyles, isActive && 'font-medium')}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>Heading {level}</span>
                </span>
                <KeyboardShortcut shortcut={headingShortcuts[level]} />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
