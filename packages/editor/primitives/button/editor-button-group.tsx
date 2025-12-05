import { cn } from "@seeds/ui/cn";
import { forwardRef } from "react";

export interface EditorButtonGroupProps {
  /** Button elements to group together */
  children: React.ReactNode;

  /**
   * Orientation of the button group
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Gap between buttons
   * - `none` - No gap, buttons touch (useful with dividers)
   * - `tight` - 2px gap
   * - `normal` - 4px gap
   * @default 'tight'
   */
  gap?: "none" | "tight" | "normal";

  /** Additional CSS classes */
  className?: string;
}

const gapStyles = {
  none: "gap-0",
  tight: "gap-0.5",
  normal: "gap-1",
} as const;

/**
 * Groups editor buttons together visually.
 * Typically used to group related formatting options in a toolbar.
 *
 * @example
 * // Text formatting group
 * <EditorButtonGroup>
 *   <EditorButton icon={<BoldIcon />} aria-label="Bold" ... />
 *   <EditorButton icon={<ItalicIcon />} aria-label="Italic" ... />
 *   <EditorButton icon={<UnderlineIcon />} aria-label="Underline" ... />
 * </EditorButtonGroup>
 *
 * @example
 * // Vertical group (for dropdown menus)
 * <EditorButtonGroup orientation="vertical" gap="none">
 *   <EditorButton icon={<H1Icon />} aria-label="Heading 1" ... />
 *   <EditorButton icon={<H2Icon />} aria-label="Heading 2" ... />
 *   <EditorButton icon={<H3Icon />} aria-label="Heading 3" ... />
 * </EditorButtonGroup>
 */
export const EditorButtonGroup = forwardRef<
  HTMLDivElement,
  EditorButtonGroupProps
>(({ children, orientation = "horizontal", gap = "tight", className }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation}
      className={cn(
        "flex items-center",
        orientation === "vertical" && "flex-col",
        gapStyles[gap],
        className,
      )}
    >
      {children}
    </div>
  );
});

EditorButtonGroup.displayName = "EditorButtonGroup";

export default EditorButtonGroup;
