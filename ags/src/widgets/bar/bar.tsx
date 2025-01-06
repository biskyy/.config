import { App, Astal, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, Variable } from "astal";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

import { PanelID } from "src/panel";
import BarLauncher from "./launcher";
import BarWorkspaces from "./workspaces";
import BarSysInfo from "./sys-info";
import BarAudio from "./audio";
import BarInfo from "./info";
import BarPower from "./power";

const userRevealBar = Variable(false);

export default function Bar(monitor: number = 0): Widget.Window {
  const Hyprland = AstalHyprland.get_default();

  const isHovered = Variable(false);
  // BUG: if you hyprlock and unlock then focusedClient will be null
  // until you change focus or workspace.
  // not sure if it's fixable
  const focusedClient = bind(Hyprland, "focusedClient");
  const activePanel = PanelManager.activePanel;

  const revealBar = Variable.derive(
    [isHovered, focusedClient, activePanel, userRevealBar],
    (isHovered, focusedClient, activePanel, userRevealBar) =>
      isHovered ||
      focusedClient === null ||
      activePanel !== null ||
      userRevealBar,
  );

  const barLayer = Variable.derive([activePanel], (activePanel) =>
    activePanel !== null ? Astal.Layer.OVERLAY : Astal.Layer.TOP,
  );

  return (
    <window
      name={PanelID.BAR}
      monitor={monitor}
      layer={bind(barLayer)}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      application={App}
      onDestroy={() => {
        revealBar.drop();
        barLayer.drop();
      }}
      keymode={Astal.Keymode.ON_DEMAND}
      onKeyPressEvent={(self, event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          isHovered.set(false);
          if (PanelManager.activePanel.get() !== null)
            PanelManager.togglePanel(PanelManager.activePanel.get() as PanelID);
        }
      }}
    >
      <eventbox
        onHover={() => isHovered.set(true)}
        onHoverLost={() => isHovered.set(false)}
        clickThrough
      >
        <box className="bar" hexpand vexpand>
          <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            transitionDuration={350}
            revealChild={bind(revealBar).as(Boolean)}
          >
            <centerbox
              hexpand
              vexpand
              startWidget={
                <box css="background-color: transparent;">
                  <BarLauncher />
                  <BarWorkspaces />
                  <BarSysInfo />
                </box>
              }
              //centerWidget={
              //  <box css="background-color: transparent;">
              //    <BarLauncher />
              //    <BarLauncher />
              //    <BarLauncher />
              //  </box>
              //}
              endWidget={
                <box
                  css="background-color: transparent;"
                  hexpand
                  halign={Gtk.Align.END}
                >
                  <BarAudio />
                  <BarInfo />
                  <BarPower />
                </box>
              }
            />
          </revealer>
        </box>
      </eventbox>
    </window>
  ) as Widget.Window; // TODO: report jsx always returning Gtk.Window instead of actual type
}
