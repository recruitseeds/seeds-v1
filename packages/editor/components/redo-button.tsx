import { cn } from "@seeds/ui/cn";
import type { Editor } from "@tiptap/react";
import { Redo2Icon } from "lucide-react";
import { EditorButton } from "../primitives/button";

export function RedoButton({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  return (
    <EditorButton
      icon={<Redo2Icon className="size-4" />}
      aria-label="Redo"
      tooltip="Redo"
      shortcut="mod+shift+z"
      appearance="subdued"
      className={cn(className)}
      size="base"
      disabled={!editor?.can().redo()}
      onClick={() => editor?.chain().focus().redo().run()}
    />
  );
}
