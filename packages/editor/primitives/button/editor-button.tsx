import { Button } from '@seeds/ui/button'
import { cn } from '@seeds/ui/cn'
import { forwardRef } from 'react'

const activeStyles = {
  default: 'bg-black/10 dark:bg-white/15 text-gray-900 dark:text-gray-50',
  emphasized: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  subdued: 'bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300',
} as const

/**
 * Maps EditorButton variants to Seeds UI Button variants.
 */
const variantMap = {
  ghost: 'plain',
  default: 'flat',
} as const

export interface EditorButtonProps {
  /** Icon element - editor buttons are always icon-only */
  icon: React.ReactNode

  /** Accessibility label (required for icon-only buttons) */
  'aria-label': string

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => void

  /** Disabled state */
  disabled?: boolean

  /** Active/pressed state for toggles (bold, italic, etc.) */
  active?: boolean

  /**
   * Active state intensity
   * - `default` - Standard active state with medium contrast
   * - `emphasized` - High contrast, uses brand color (for important toggles)
   * - `subdued` - Low contrast, subtle indication
   * @default 'default'
   */
  appearance?: keyof typeof activeStyles

  /** Tooltip text shown on hover */
  tooltip?: string

  /**
   * Keyboard shortcut displayed in tooltip.
   * Uses format: "mod+b", "mod+shift+x"
   * - `mod` renders as ⌘ on Mac, Ctrl on Windows
   * - `alt` renders as ⌥ on Mac, Alt on Windows
   */
  shortcut?: string

  /**
   * Button size
   * - `sm` - 26px, compact for dense toolbars
   * - `base` - 30px, default
   * - `large` - 40px, for prominent actions
   * @default 'sm'
   */
  size?: 'sm' | 'base' | 'large'

  /**
   * Visual style
   * - `ghost` - Transparent until hovered (default for toolbars)
   * - `default` - Subtle background
   * @default 'ghost'
   */
  variant?: keyof typeof variantMap

  /** Additional CSS classes */
  className?: string

  /** HTML button type */
  type?: 'button' | 'submit' | 'reset'
}

/**
 * A button primitive for TipTap editor toolbars.
 * Wraps @seeds/ui/button with editor-specific defaults and active state support.
 *
 * @example
 * // Basic formatting button
 * <EditorButton
 *   icon={<BoldIcon className="h-4 w-4" />}
 *   aria-label="Bold"
 *   tooltip="Bold"
 *   shortcut="mod+b"
 *   active={editor.isActive('bold')}
 *   onClick={() => editor.chain().focus().toggleBold().run()}
 * />
 *
 * @example
 * // With emphasized active state
 * <EditorButton
 *   icon={<LinkIcon className="h-4 w-4" />}
 *   aria-label="Insert link"
 *   tooltip="Insert link"
 *   shortcut="mod+k"
 *   active={editor.isActive('link')}
 *   appearance="emphasized"
 *   onClick={openLinkDialog}
 * />
 */
export const EditorButton = forwardRef<HTMLButtonElement & HTMLAnchorElement, EditorButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      onClick,
      disabled = false,
      active = false,
      appearance = 'default',
      tooltip,
      shortcut,
      size = 'sm',
      variant = 'ghost',
      className,
      type = 'button',
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        variant={variantMap[variant]}
        size={size}
        iconOnly={icon}
        accessibilityLabel={ariaLabel}
        tooltip={tooltip}
        tooltipShortcut={shortcut}
        disabled={disabled}
        onClick={onClick}
        data-active-state={active ? 'on' : 'off'}
        aria-pressed={active}
        className={cn('p-2', active && activeStyles[appearance], className)}
      />
    )
  },
)

EditorButton.displayName = 'EditorButton'

export default EditorButton
