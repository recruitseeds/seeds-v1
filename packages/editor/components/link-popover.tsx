'use client'

import { cn } from '@seeds/ui/cn'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@seeds/ui/dropdown-menu'
import { Tooltip } from '@seeds/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { ExternalLinkIcon, Link2Icon, Link2OffIcon } from 'lucide-react'
import * as React from 'react'
import { EditorButton } from '../primitives/button'

export function LinkPopover({
  editor,
  className,
}: {
  editor: Editor | null
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isActive = editor?.isActive('link') ?? false

  React.useEffect(() => {
    if (open && editor) {
      const { href } = editor.getAttributes('link')
      setUrl(href || '')
      // Focus input after a brief delay to ensure it's mounted
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open, editor])

  const setLink = () => {
    if (!editor || !url) return

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()

    setOpen(false)
    setUrl('')
  }

  const removeLink = () => {
    if (!editor) return

    editor.chain().focus().extendMarkRange('link').unsetLink().run()

    setOpen(false)
    setUrl('')
  }

  const openLink = () => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setLink()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip label="Link" side="bottom">
        <span className="inline-flex">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center justify-center p-2 h-7.5 w-7.5 rounded-md text-sm font-medium transition-colors',
                'hover:bg-black/[0.06] dark:hover:bg-white/[0.08]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive && 'bg-black/5 dark:bg-white/10',
                className,
              )}
              aria-label="Link"
              aria-pressed={isActive}
              data-active-state={isActive ? 'on' : 'off'}
            >
              <Link2Icon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </span>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-72 p-2">
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="url"
            placeholder="Paste a link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <div className="flex items-center gap-1">
            <EditorButton
              icon={<Link2Icon className="size-4" />}
              aria-label="Apply link"
              tooltip="Apply link"
              appearance="subdued"
              size="base"
              onClick={setLink}
              disabled={!url}
              className="flex-1"
            />
            <EditorButton
              icon={<ExternalLinkIcon className="size-4" />}
              aria-label="Open link"
              tooltip="Open in new tab"
              appearance="subdued"
              size="base"
              onClick={openLink}
              disabled={!url}
            />
            <EditorButton
              icon={<Link2OffIcon className="size-4" />}
              aria-label="Remove link"
              tooltip="Remove link"
              appearance="subdued"
              size="base"
              onClick={removeLink}
              disabled={!isActive}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
