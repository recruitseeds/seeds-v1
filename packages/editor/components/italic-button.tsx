import { cn } from "@seeds/ui/cn";
import type { Editor } from "@tiptap/react";
import { ItalicIcon } from "lucide-react";
import { EditorButton } from "../primitives/button";

export function ItalicButton({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  return (
    <EditorButton
      icon={<ItalicIcon className="size-4" />}
      aria-label="Italic"
      tooltip="Italic"
      shortcut="mod+i"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive("italic") ?? false}
      onClick={() => editor?.chain().focus().toggleItalic().run()}
    />
  );
}
