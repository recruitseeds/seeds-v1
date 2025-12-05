import { NodeSelection } from "@tiptap/pm/state";
// import { Link } from '@/editor/extensions/link' // TODO: Fix extension import
import type { Editor } from "@tiptap/react";
// import { CodeBlock } from '@/editor/extensions/code-block' // TODO: Fix extension import
// import { Figcaption } from '@/editor/extensions/figcaption' // TODO: Fix extension import
// import { HorizontalRule } from '@/editor/extensions/horizontal-rule' // TODO: Fix extension import
import { ImageBlock } from "../editor/extensions/image-block";
import { ImageUpload } from "../editor/extensions/image-upload";

// import { TableOfContentsNode } from '@/extensions/TableOfContentsNode'

export const isTableGripSelected = (node: HTMLElement) => {
  let container = node;

  while (container && !["TD", "TH"].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn =
    container &&
    container.querySelector &&
    container.querySelector("a.grip-column.selected");
  const gripRow =
    container &&
    container.querySelector &&
    container.querySelector("a.grip-row.selected");

  if (gripColumn || gripRow) {
    return true;
  }

  return false;
};

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    // HorizontalRule.name, // TODO: Fix extension import
    ImageBlock.name,
    ImageUpload.name,
    // CodeBlock.name, // TODO: Fix extension import
    // Link.name, // TODO: Fix extension import
    // Figcaption.name, // TODO: Fix extension import
    // TableOfContentsNode.name,
  ];

  return (
    customNodes.some((type) => editor.isActive(type)) ||
    isTableGripSelected(node)
  );
};

/**
 * Checks if the current selection in the editor is a node selection of specified types
 * @param editor The Tiptap editor instance
 * @param types An array of node type names to check against
 * @returns boolean indicating if the selected node matches any of the specified types
 */
export function isNodeTypeSelected(
  editor: Editor | null,
  types: string[] = [],
): boolean {
  if (!editor || !editor.state.selection) return false;

  const { state } = editor;
  const { selection } = state;

  if (selection.empty) return false;

  if (selection instanceof NodeSelection) {
    const node = selection.node;
    return node ? types.includes(node.type.name) : false;
  }

  return false;
}
