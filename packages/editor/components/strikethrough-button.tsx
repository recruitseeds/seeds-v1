import { cn } from "@seeds/ui/cn";
import type { Editor } from "@tiptap/react";
import { StrikethroughIcon } from "lucide-react";
import { EditorButton } from "../primitives/button";

export function StrikethroughButton({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  return (
    <EditorButton
      icon={<StrikethroughIcon className="size-4" />}
      aria-label="Strikethrough"
      tooltip="Strikethrough"
      shortcut="mod+shift+s"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive("strike") ?? false}
      onClick={() => editor?.chain().focus().toggleStrike().run()}
    />
  );
}
