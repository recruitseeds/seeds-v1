interface MenuItemType {
  type: "item";
  id: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  kbd?: string;
  label: React.ReactNode;
  destructive?: boolean;
  onSelect?: (event: Event) => void | Promise<void>;
  onMouseOver?: () => void;
  disabled?: boolean;
  url?: string;
  external?: boolean;
  download_as?: string;
  className?: string;
}

interface MenuSubType {
  type: "sub";
  id: string;
  leftSlot?: React.ReactNode;
  label: React.ReactNode;
  disabled?: boolean;
  items: MenuItem[];
}

interface MenuSeparatorType {
  type: "separator";
  id: string;
}

interface MenuHeadingType {
  type: "heading";
  id: string;
  label: React.ReactNode;
}

interface MenuTextType {
  type: "text";
  id: string;
  label: React.ReactNode;
}

type MenuItem =
  | MenuItemType
  | MenuSubType
  | MenuSeparatorType
  | MenuHeadingType
  | MenuTextType;

type MenuWidth = `w-[${number}px]` | `w-${number}`;

export type {
  MenuHeadingType,
  MenuItem,
  MenuItemType,
  MenuSeparatorType,
  MenuSubType,
  MenuTextType,
  MenuWidth,
};
