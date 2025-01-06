import { PanelID } from "src/panel";
import BarModule from "./bar-module";
import { bind } from "astal";

export default function BarPower() {
  return (
    <BarModule
      className={bind(PanelManager.activePanel).as((panel) =>
        panel === PanelID.POWERMENU ? "active power" : "inactive power",
      )}
      eventbox={{
        onClick: () => PanelManager.togglePanel(PanelID.POWERMENU),
      }}
    >
      <label className="icon" label="" />
    </BarModule>
  );
}
