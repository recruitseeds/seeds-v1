import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { ListOrderedIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function OrderedListButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<ListOrderedIcon className="size-4" />}
      aria-label="Ordered List"
      tooltip="Ordered List"
      shortcut="mod+shift+7"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('orderedList') ?? false}
      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
    />
  )
}
