import { cn } from "@seeds/ui/cn";
import type { Editor } from "@tiptap/react";
import { Undo2Icon } from "lucide-react";
import { EditorButton } from "../primitives/button";

export function UndoButton({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  return (
    <EditorButton
      icon={<Undo2Icon className="size-4" />}
      aria-label="Undo"
      tooltip="Undo"
      shortcut="mod+z"
      appearance="subdued"
      className={cn(className)}
      size="base"
      disabled={!editor?.can().undo()}
      onClick={() => editor?.chain().focus().undo().run()}
    />
  );
}
