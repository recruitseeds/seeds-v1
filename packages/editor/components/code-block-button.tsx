import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { FileCodeIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function CodeBlockButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<FileCodeIcon className="size-4" />}
      aria-label="Code Block"
      tooltip="Code Block"
      shortcut="mod+alt+c"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('codeBlock') ?? false}
      onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
    />
  )
}
