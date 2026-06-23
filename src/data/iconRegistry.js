import {
  ArrowUpRight, BoundingBox, Buildings, CalendarBlank, CaretDown, Check,
  Cursor, EnvelopeSimple, FolderSimple, InstagramLogo, LinkedinLogo, Notepad,
  PenNib, PencilSimpleLine, Square, SquaresFour, TiktokLogo, UsersThree,
  VideoCamera, WarningCircle, XLogo, MegaphoneSimple, ChartLineUp, Star,
  Lightning, Palette, Globe, Camera, Microphone, ChatCircle,
} from "@phosphor-icons/react";

// Ícones expostos ao seletor do editor. Nome (string) é o que vai no JSON.
export const iconRegistry = {
  ArrowUpRight, BoundingBox, Buildings, CalendarBlank, CaretDown, Check,
  Cursor, EnvelopeSimple, FolderSimple, InstagramLogo, LinkedinLogo, Notepad,
  PenNib, PencilSimpleLine, Square, SquaresFour, TiktokLogo, UsersThree,
  VideoCamera, WarningCircle, XLogo, MegaphoneSimple, ChartLineUp, Star,
  Lightning, Palette, Globe, Camera, Microphone, ChatCircle,
};

export const iconNames = Object.keys(iconRegistry);

export function getIcon(name) {
  return iconRegistry[name] || iconRegistry.Square;
}
