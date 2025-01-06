import { exec } from "astal";
import { Astal, Gdk } from "astal/gtk3";

export const isPrimaryClick = (event: Astal.ClickEvent): boolean =>
  event.button === Gdk.BUTTON_PRIMARY;

export const isSecondaryClick = (event: Astal.ClickEvent): boolean =>
  event.button === Gdk.BUTTON_SECONDARY;

export const isMiddleClick = (event: Astal.ClickEvent): boolean =>
  event.button === Gdk.BUTTON_MIDDLE;

export const isScrollUp = (event: Astal.ScrollEvent): boolean => {
  if (event.delta_y > 0) {
    return true;
  }
  return false;
};

export const isScrollDown = (event: Astal.ScrollEvent): boolean => {
  if (event.delta_y < 0) {
    return true;
  }

  return false;
};

export function symbolicStrength(value: number, array: any[], max = 100) {
  const interp = Math.floor((value / max) * array.length);
  return array[Math.min(interp, array.length - 1)];
}

export function getPlayerGlyph(name: string) {
  switch (name) {
    case "firefox":
      return "";
    case "spotify":
      return "";
    case "discord":
      return "";
    default:
      return "";
  }
}

export function toTimestamp(value: number) {
  const hour = Math.round(value / 3600)
    .toString()
    .padStart(2, "0");
  const minute = Math.round((value / 60) % 60)
    .toString()
    .padStart(2, "0");
  const second = Math.round(value % 60)
    .toString()
    .padStart(2, "0");

  if (value > 3600) return `${hour}:${minute}:${second}`;
  else return `${minute}:${second}`;
}

export function truncate(value: string, limit: number) {
  if (value.length < limit) return value;

  return `${value.slice(0, limit - 3).trim()}...`;
}
