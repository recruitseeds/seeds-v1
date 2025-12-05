import { cn } from "@seeds/ui/cn";
import type { Editor } from "@tiptap/react";
import { CodeIcon } from "lucide-react";
import { EditorButton } from "../primitives/button";

export function CodeButton({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  return (
    <EditorButton
      icon={<CodeIcon className="size-4" />}
      aria-label="Code"
      tooltip="Code"
      shortcut="mod+e"
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive("code") ?? false}
      onClick={() => editor?.chain().focus().toggleCode().run()}
    />
  );
}
