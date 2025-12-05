'use client'

import { BlockquoteButton } from '@seeds/editor/components/blockquote-button'
import { BoldButton } from '@seeds/editor/components/bold-button'
import { BulletListButton } from '@seeds/editor/components/bullet-list-button'
import { CodeBlockButton } from '@seeds/editor/components/code-block-button'
import { CodeButton } from '@seeds/editor/components/code-button'
import { ColorHighlightPopover } from '@seeds/editor/components/color-highlight-popover'
import { HeadingDropdown } from '@seeds/editor/components/heading-dropdown'
import { ItalicButton } from '@seeds/editor/components/italic-button'
import { LinkPopover } from '@seeds/editor/components/link-popover'
import { OrderedListButton } from '@seeds/editor/components/ordered-list-button'
import { RedoButton } from '@seeds/editor/components/redo-button'
import { StrikethroughButton } from '@seeds/editor/components/strikethrough-button'
import { TaskListButton } from '@seeds/editor/components/task-list-button'
import {
  AlignCenterButton,
  AlignJustifyButton,
  AlignLeftButton,
  AlignRightButton,
} from '@seeds/editor/components/text-align-button'
import { UnderlineButton } from '@seeds/editor/components/underline-button'
import { UndoButton } from '@seeds/editor/components/undo-button'
import { Button } from '@seeds/ui/button'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function EditorTestPage() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
    ],
    content: '<p>Hello World! Start typing here...</p>',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground max-w-none focus:outline-none min-h-[400px] p-4 border rounded-lg',
      },
    },
  })

  const handleSave = () => {
    if (editor) {
      const content = editor.getHTML()
      console.log('Editor content:', content)
      alert('Content saved to console!')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-4">
        <div className="flex border rounded-lg overflow-x-auto no-scrollbar">
          {/* History */}
          <UndoButton editor={editor} className="rounded-r-none" />
          <RedoButton editor={editor} className="rounded-none border-r" />

          {/* Block Type */}
          <HeadingDropdown editor={editor} className="rounded-none border-r" />

          {/* Text Formatting */}
          <BoldButton editor={editor} className="rounded-none" />
          <ItalicButton editor={editor} className="rounded-none" />
          <UnderlineButton editor={editor} className="rounded-none" />
          <StrikethroughButton editor={editor} className="rounded-none" />
          <CodeButton editor={editor} className="rounded-none border-r" />

          {/* Lists */}
          <BulletListButton editor={editor} className="rounded-none" />
          <OrderedListButton editor={editor} className="rounded-none" />
          <TaskListButton editor={editor} className="rounded-none border-r" />

          {/* Blocks */}
          <BlockquoteButton editor={editor} className="rounded-none" />
          <CodeBlockButton editor={editor} className="rounded-none border-r" />

          {/* Alignment */}
          <AlignLeftButton editor={editor} className="rounded-none" />
          <AlignCenterButton editor={editor} className="rounded-none" />
          <AlignRightButton editor={editor} className="rounded-none" />
          <AlignJustifyButton editor={editor} className="rounded-none border-r" />

          {/* Insert & Extras */}
          <LinkPopover editor={editor} className="rounded-none" />
          <ColorHighlightPopover editor={editor} className="rounded-none" />
        </div>

        <EditorContent editor={editor} />

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Content</Button>
        </div>
      </div>
    </div>
  )
}
