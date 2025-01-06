import { bind, Variable } from "astal";
import BarModule from "./bar-module";
import { Gtk } from "astal/gtk3";
import AstalTray from "gi://AstalTray?version=0.1";

export default function BarSysInfo() {
  const Tray = AstalTray.get_default();

  const revealTray = Variable(false);

  const ramUsage = Variable("0.0G").poll(2500, [
    "bash",
    "-c",
    "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'",
  ]);
  const cpuUsage = Variable("0.0%").poll(2500, [
    "bash",
    "-c",
    `top -bn1 | grep "Cpu(s)" | awk '{printf("%02d\\n", 100 - $8)}'`,
  ]);

  return (
    <box>
      <BarModule
        className="sysinfo"
        eventbox={{
          onClick: () => revealTray.set(!revealTray.get()),
        }}
        box={{
          spacing: 12,
          onDestroy: () => {
            ramUsage.drop();
            cpuUsage.drop();
          },
        }}
      >
        <box>
          <label className="icon" label="" />
          <label label={ramUsage((value) => ` ${value}`)} />
        </box>
        <box>
          <label className="icon" label="" />
          <label label={cpuUsage((value) => ` ${value}`)} />
          <label className="icon icon-pad-l" label="" />
        </box>
      </BarModule>
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
        transitionDuration={350}
        revealChild={bind(revealTray).as(Boolean)}
      >
        <BarModule className="systray">
          {bind(Tray, "items").as((items) =>
            items.map((item) => {
              return (
                <menubutton
                  // @ts-ignore
                  tooltipMarkup={bind(item, "tooltipMarkup").as(String)}
                  usePopover={false}
                  // @ts-ignore
                  actionGroup={bind(item, "action-group").as((ag) => [
                    "dbusmenu",
                    ag,
                  ])}
                  // @ts-ignore
                  menuModel={bind(item, "menu-model")}
                >
                  <icon gicon={bind(item, "gicon")} />
                </menubutton>
              );
            }),
          )}
        </BarModule>
      </revealer>
    </box>
  );
}
