import { cn } from '@seeds/ui/cn'
import type { Editor } from '@tiptap/react'
import { ListTodoIcon } from 'lucide-react'
import { EditorButton } from '../primitives/button'

export function TaskListButton({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  return (
    <EditorButton
      icon={<ListTodoIcon className="size-4" />}
      aria-label="Task List"
      tooltip="Task List"
      shortcut="mod+shift+9"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive('taskList') ?? false}
      onClick={() => editor?.chain().focus().toggleList('taskList', 'taskItem').run()}
    />
  )
}
