import { cn } from "@seeds/ui/cn";
import type { Editor } from "@tiptap/react";
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
} from "lucide-react";
import { EditorButton } from "../primitives/button";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const headingIcons = {
  1: Heading1Icon,
  2: Heading2Icon,
  3: Heading3Icon,
  4: Heading4Icon,
  5: Heading5Icon,
  6: Heading6Icon,
} as const;

const headingShortcuts: Record<HeadingLevel, string> = {
  1: "mod+alt+1",
  2: "mod+alt+2",
  3: "mod+alt+3",
  4: "mod+alt+4",
  5: "mod+alt+5",
  6: "mod+alt+6",
};

export function HeadingButton({
  editor,
  level,
  className,
}: {
  editor: Editor | null;
  level: HeadingLevel;
  className?: string;
}) {
  const Icon = headingIcons[level];
  const shortcut = headingShortcuts[level];
  const label = `Heading ${level}`;

  return (
    <EditorButton
      icon={<Icon className="size-4" />}
      aria-label={label}
      tooltip={label}
      shortcut={shortcut}
      appearance="subdued"
      className={cn(className)}
      size="base"
      active={editor?.isActive("heading", { level }) ?? false}
      onClick={() => {
        if (!editor) return;
        if (editor.isActive("heading", { level })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().toggleHeading({ level }).run();
        }
      }}
    />
  );
}
