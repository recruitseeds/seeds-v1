import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { HighlighterIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function ColorHighlightButton({
  editor,
  className,
  highlightColor,
}: {
  editor: Editor | null
  className?: string
  highlightColor?: string
}) {
  const isActive = highlightColor
    ? editor?.isActive('highlight', { color: highlightColor }) ?? false
    : editor?.isActive('highlight') ?? false

  const handleClick = () => {
    if (highlightColor) {
      editor?.chain().focus().toggleHighlight({ color: highlightColor }).run()
    } else {
      editor?.chain().focus().toggleHighlight().run()
    }
  }

  return (
    <EditorButton
      icon={<HighlighterIcon className="size-4" />}
      aria-label="Highlight"
      tooltip="Highlight"
      shortcut="mod+shift+h"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={isActive}
      onClick={handleClick}
    />
  )
}
