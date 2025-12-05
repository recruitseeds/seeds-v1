import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { BoldIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function BoldButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<BoldIcon className="size-4" />}
      aria-label="Bold"
      tooltip="Bold"
      shortcut="mod+b"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('bold') ?? false}
      onClick={() => editor?.chain().focus().toggleBold().run()}
    />
  )
}
