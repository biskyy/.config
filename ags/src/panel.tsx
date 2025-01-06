import { Astal, Gdk, Widget } from "astal/gtk3";
import { BoxProps, WindowProps } from "astal/gtk3/widget";

export enum PanelID {
  BAR = "bar",
  POWERMENU = "powermenu",
  GLANCE = "glance",
  AUDIO = "audio",
  PLAYER = "player",
  OVERLAY = "overlay",
}

interface PanelProps
  extends Omit<
    WindowProps,
    | "name"
    | "className"
    | "anchor"
    | "layer"
    | "exclusivity"
    | "child"
    | "children"
  > {
  name: PanelID;
  className?: WindowProps["className"];
  anchor: WindowProps["anchor"];
  layer?: WindowProps["layer"];
  exclusivity?: WindowProps["exclusivity"];
  child?: JSX.Element;
  children?: Array<JSX.Element>;
  box?: BoxProps;
}

export default function Panel({
  name,
  className,
  anchor,
  layer,
  exclusivity,
  child,
  children,
  box,
  ...otherProps
}: PanelProps) {
  return (
    <window
      name={name}
      className={className ?? `${name} create panel`}
      anchor={anchor}
      layer={layer ?? Astal.Layer.TOP}
      exclusivity={exclusivity ?? Astal.Exclusivity.IGNORE}
      {...otherProps}
      keymode={Astal.Keymode.ON_DEMAND}
      onKeyPressEvent={(self, event) => {
        if (
          event.get_keyval()[1] === Gdk.KEY_Escape &&
          !self.className.includes("destroy")
        )
          PanelManager.closePanel(name);
      }}
    >
      <box className="content" {...box}>
        {child ?? children}
      </box>
    </window>
  ) as Widget.Window;
}
