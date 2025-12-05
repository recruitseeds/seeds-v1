import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { UnderlineIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function UnderlineButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<UnderlineIcon className="size-4" />}
      aria-label="Underline"
      tooltip="Underline"
      shortcut="mod+u"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('underline') ?? false}
      onClick={() => editor?.chain().focus().toggleUnderline().run()}
    />
  )
}
