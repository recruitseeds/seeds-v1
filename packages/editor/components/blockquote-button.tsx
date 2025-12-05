import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { QuoteIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function BlockquoteButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<QuoteIcon className="size-4" />}
      aria-label="Blockquote"
      tooltip="Blockquote"
      shortcut="mod+shift+b"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('blockquote') ?? false}
      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
    />
  )
}
