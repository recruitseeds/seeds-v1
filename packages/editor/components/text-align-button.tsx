import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

const alignConfig = {
  left: {
    icon: AlignLeftIcon,
    label: 'Align left',
    shortcut: 'mod+shift+l',
  },
  center: {
    icon: AlignCenterIcon,
    label: 'Align center',
    shortcut: 'mod+shift+e',
  },
  right: {
    icon: AlignRightIcon,
    label: 'Align right',
    shortcut: 'mod+shift+r',
  },
  justify: {
    icon: AlignJustifyIcon,
    label: 'Align justify',
    shortcut: 'mod+shift+j',
  },
} as const

export function TextAlignButton({
  editor,
  align,
  className,
}: {
  editor: Editor | null
  align: TextAlign
  className?: string
}) {
  const config = alignConfig[align]
  const Icon = config.icon

  return (
    <EditorButton
      icon={<Icon className="size-4" />}
      aria-label={config.label}
      tooltip={config.label}
      shortcut={config.shortcut}
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive({ textAlign: align }) ?? false}
      onClick={() => editor?.chain().focus().setTextAlign(align).run()}
    />
  )
}

// Convenience exports for each alignment
export function AlignLeftButton({ editor, className }: { editor: Editor | null; className?: string }) {
  return <TextAlignButton editor={editor} align="left" className={className} />
}

export function AlignCenterButton({ editor, className }: { editor: Editor | null; className?: string }) {
  return <TextAlignButton editor={editor} align="center" className={className} />
}

export function AlignRightButton({ editor, className }: { editor: Editor | null; className?: string }) {
  return <TextAlignButton editor={editor} align="right" className={className} />
}

export function AlignJustifyButton({ editor, className }: { editor: Editor | null; className?: string }) {
  return <TextAlignButton editor={editor} align="justify" className={className} />
}
