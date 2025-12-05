import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { ListIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function BulletListButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<ListIcon className="size-4" />}
      aria-label="Bullet List"
      tooltip="Bullet List"
      shortcut="mod+shift+8"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('bulletList') ?? false}
      onClick={() => editor?.chain().focus().toggleBulletList().run()}
    />
  )
}
