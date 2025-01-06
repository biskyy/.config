import { execAsync, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import Panel, { PanelID } from "src/panel";

interface PowerButtonProps {
  icon: string;
  action: PowerButtonAction;
  command: string | string[];
}

enum PowerButtonAction {
  SHUTDOWN = "Shutdown",
  RESTART = "Restart",
  LOG_OUT = "Log Out",
  SLEEP = "Sleep",
}

const iconButtonMap = new Map<PowerButtonAction, Widget.Button>();
const currentSelection = Variable<PowerButtonAction | null>(null);

const PowerButton = ({ icon, action, command }: PowerButtonProps) => {
  const iconButton = (
    <button
      className="power-icon"
      name="selected"
      onClicked={(self) => {
        // ^ can't use onClick because double clicking actually send 3 click events instead of two
        if (currentSelection.get() === action) {
          self.className = "power-icon";
          currentSelection.set(null);
          PanelManager.togglePanel(PanelID.POWERMENU);
          execAsync(command).catch((err) => console.log(err));
        } else {
          iconButtonMap.forEach((button) =>
            button.set({ className: "power-icon" }),
          );
          self.className = "power-icon selected";
          currentSelection.set(action);
        }
      }}
      onHoverLost={() => {
        currentSelection.set(null);
        iconButtonMap.forEach((button) =>
          button.set({ className: "power-icon" }),
        );
      }}
    >
      <label className="icon" label={icon} />
    </button>
  ) as Widget.Button;

  iconButtonMap.set(action, iconButton);

  return (
    <eventbox className="power-button">
      <box halign={Gtk.Align.END}>
        <label className="transition-text" label={action} />
        {iconButton}
      </box>
    </eventbox>
  );
};

export default function PowerMenu(): Widget.Window {
  const powerButtonData: PowerButtonProps[] = [
    {
      icon: "",
      action: PowerButtonAction.SHUTDOWN,
      command: "systemctl poweroff",
    },
    {
      icon: "",
      action: PowerButtonAction.RESTART,
      command: "systemctl reboot",
    },
    { icon: "", action: PowerButtonAction.LOG_OUT, command: "hyprlock" },
    {
      icon: "",
      action: PowerButtonAction.SLEEP,
      command: "systemctl suspend",
    },
  ];

  return (
    <Panel
      name={PanelID.POWERMENU}
      layer={Astal.Layer.TOP}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.RIGHT}
      onDestroy={() => currentSelection.set(null)}
      css="background-color: transparent;"
      widthRequest={325}
      box={{
        vertical: true,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.END,
        spacing: 2,
      }}
    >
      {/* ^ widthRequest helps the flyin animation because the space
       * is already allocated and it doesn't waste time calculating the width
       */}
      {/* Pro Tip: please try to avoid a long label as it will break animations.
       * If you still proceed with a long label try changing the min-width
       * of powermenu class.
       */}
      {powerButtonData.map(({ icon, action, command }) => (
        <PowerButton icon={icon} action={action} command={command} />
      ))}
    </Panel>
  ) as Widget.Window;
}
