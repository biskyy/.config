import { bind, Binding } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalBattery from "gi://AstalBattery?version=0.1";
import { WindowProps } from "../../../astal/lang/gjs/src/gtk3/widget";
import { BoxProps } from "astal/gtk3/widget";

export enum GlancePageID {
  NETWORK = "network",
  BATTERY = "battery",
  TIME = "time",
}

type LabelProp = string | Binding<string | undefined> | undefined;

interface HeaderProps {
  icon: LabelProp;
  label: LabelProp;
  trailingLabel?: LabelProp;
  trailingIcon?: LabelProp;
}

export function GlanceContainer() {}

export function GlanceHeader({
  icon,
  label,
  trailingLabel,
  trailingIcon,
}: HeaderProps) {
  return (
    <box className="header">
      <centerbox
        css="min-width: 1.5em; padding-right: 0.5em;"
        centerWidget={<label className="icon" label={icon} />}
      />
      <label label={label} />
      <label
        halign={Gtk.Align.END}
        hexpand
        hexpandSet={trailingLabel ? true : false}
        label={trailingLabel}
      />
      <label className="icon" css="margin-left: 0.2rem;" label={trailingIcon} />
    </box>
  );
}

interface PageProps extends Omit<BoxProps, "name"> {
  name: GlancePageID;
  child?: JSX.Element;
  children?: Array<JSX.Element>;
}

export default function GlancePage({
  name,
  child,
  children,
  ...otherProps
}: PageProps) {
  return (
    <box
      name={name}
      className={`page ${name}`}
      vertical
      valign={Gtk.Align.START}
      spacing={12}
      {...otherProps}
    >
      {child ?? children}
    </box>
  );
}
