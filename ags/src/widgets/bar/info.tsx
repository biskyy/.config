import { bind, Variable } from "astal";
import AstalBattery from "gi://AstalBattery?version=0.1";
import { Gtk } from "astal/gtk3";

import { PanelID } from "src/panel";
import BarModule from "./bar-module";
import { GlancePageID } from "src/widgets/glance/glance-page";
import { batteryIcon } from "src/lib/battery";
import { currentPage } from "../glance/glance";
import { currentSeconds, currentTime } from "src/lib/time";

const Battery = () => {
  const battery = AstalBattery.get_default();
  const batteryActive = Variable.derive(
    [currentPage, PanelManager.activePanel],
    (page, panel) =>
      page === GlancePageID.BATTERY && panel === PanelID.GLANCE
        ? "active battery"
        : panel !== PanelID.GLANCE
          ? "battery"
          : "inactive battery",
  );

  return (
    <button
      className={batteryActive()}
      onClick={() =>
        PanelManager.togglePanel(PanelID.GLANCE, GlancePageID.BATTERY)
      }
      onDestroy={() => {
        batteryActive.drop();
      }}
    >
      <box>
        <label className="icon" label={batteryIcon()} />
        <label
          className="label"
          label={bind(battery, "percentage").as(
            (p) => ` ${Math.floor(p * 100)}`,
          )}
        />
        <label className="icon icon-pad-l" label="" />
      </box>
    </button>
  );
};

const Network = () => {
  const networkActive = Variable.derive(
    [currentPage, PanelManager.activePanel],
    (page, panel) =>
      page === GlancePageID.NETWORK && panel === PanelID.GLANCE
        ? "active network"
        : panel !== PanelID.GLANCE
          ? "network"
          : "inactive network",
  );

  return (
    <button
      className={networkActive()}
      onClick={() =>
        PanelManager.togglePanel(PanelID.GLANCE, GlancePageID.NETWORK)
      }
      onDestroy={() => {
        networkActive.drop();
      }}
    >
      <box>
        <label className="icon" label="󰤨" />
      </box>
    </button>
  );
};

const Time = () => {
  const timeActive = Variable.derive(
    [currentPage, PanelManager.activePanel],
    (page, panel) =>
      page === GlancePageID.TIME && panel === PanelID.GLANCE
        ? "active time"
        : panel !== PanelID.GLANCE
          ? "time"
          : "inactive time",
  );

  const revealSeconds = Variable(false);

  return (
    <button
      className={timeActive()}
      onClick={() =>
        PanelManager.togglePanel(PanelID.GLANCE, GlancePageID.TIME)
      }
      onHover={() => revealSeconds.set(true)}
      onHoverLost={() => revealSeconds.set(false)}
    >
      <box>
        <label
          className="label"
          label={currentTime((time) => time.slice(0, time.length - 3))}
        />
        <revealer
          transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
          transitionDuration={500}
          revealChild={bind(revealSeconds).as(Boolean)}
        >
          <label
            className="label"
            label={bind(currentSeconds).as((s) => `:${s}`)}
          />
        </revealer>
      </box>
    </button>
  );
};

export default function BarInfo() {
  return (
    <BarModule
      className="info"
      box={{
        spacing: 12,
      }}
    >
      <Battery />
      <Network />
      <Time />
    </BarModule>
  );
}
