import { bind, execAsync, Variable } from "astal";
import GlancePage, { GlanceHeader, GlancePageID } from "./glance-page";
import AstalBattery from "gi://AstalBattery?version=0.1";
import TLP, { TLPMode } from "src/services/tlp";
import Brightness from "src/services/brightness";
import { batteryIcon, BatteryState } from "src/lib/battery";

enum ModeLabel {
  BATTERY = "  battery  ",
  SELECT_BATTERY = "> battery  ",
  AC = "    ac    ",
  SELECT_AC = "  > ac    ",
  AUTO = "   auto   ",
  SELECT_AUTO = " > auto   ",
  MANUAL = "  manual  ",
  SELECT_MANUAL = "> manual  ",
}

export default function GlanceBattery() {
  const Battery = AstalBattery.get_default();
  const brightness = Brightness.get_default();
  const tlp = TLP.get_default();
  const tlpMode = bind(tlp, "mode");

  const headerLabel = Variable.derive(
    [bind(Battery, "state"), bind(Battery, "percentage")],
    (state: AstalBattery.State, percentage: number) =>
      `battery is currently ${Object.values(BatteryState)[state]} at ${Math.floor(percentage * 100)}`,
  );

  const batteryLabel = Variable.derive([bind(tlp, "mode")], (mode: TLPMode) =>
    mode === TLPMode.BATTERY ? ModeLabel.SELECT_BATTERY : ModeLabel.BATTERY,
  );

  const autoLabel = Variable.derive([bind(tlp, "manual")], (manual: boolean) =>
    manual ? ModeLabel.MANUAL : ModeLabel.AUTO,
  );

  const autoHoveredLabel = Variable.derive(
    [bind(tlp, "manual")],
    (manual: boolean) =>
      manual ? ModeLabel.SELECT_MANUAL : ModeLabel.SELECT_AUTO,
  );

  const acLabel = Variable.derive([bind(tlp, "mode")], (mode: TLPMode) =>
    mode === TLPMode.AC ? ModeLabel.SELECT_AC : ModeLabel.AC,
  );

  const screenBrightness = bind(brightness, "screen");

  return (
    <GlancePage
      name={GlancePageID.BATTERY}
      onDestroy={() => {
        headerLabel.drop();
        batteryLabel.drop();
        autoLabel.drop();
        autoHoveredLabel.drop();
        acLabel.drop();
      }}
    >
      <GlanceHeader
        icon={batteryIcon()}
        label={headerLabel()}
        trailingIcon=""
      />
      <box className="power-modes" vertical spacing={5}>
        <GlanceHeader icon="" label="power modes" />
        <box className="segmented-slider" hexpand>
          <button
            hexpand
            label={ModeLabel.BATTERY}
            onHover={(self) => (self.label = ModeLabel.SELECT_BATTERY)}
            onHoverLost={(self) => (self.label = batteryLabel.get())}
            className={bind(tlp, "mode").as((mode) =>
              mode === TLPMode.BATTERY ? "active" : "inactive",
            )}
            setup={(self) => {
              self.label = batteryLabel.get();
              self.hook(batteryLabel, (self) => {
                self.label = batteryLabel.get();
              });
            }}
            onClick={() => execAsync("sudo tlp bat")}
          />
          <button
            hexpand
            label={ModeLabel.AUTO}
            onHover={(self) => (self.label = autoHoveredLabel.get())}
            onHoverLost={(self) => (self.label = autoLabel.get())}
            setup={(self) => {
              self.label = autoLabel.get();
              self.hook(autoLabel, (self) => {
                self.label = autoLabel.get();
              });
            }}
            onClick={() => execAsync("sudo tlp start")}
          />
          <button
            hexpand
            label={ModeLabel.AC}
            onHover={(self) => (self.label = ModeLabel.SELECT_AC)}
            onHoverLost={(self) => (self.label = acLabel.get())}
            className={bind(tlp, "mode").as((mode) =>
              mode === TLPMode.AC ? "active" : "inactive",
            )}
            setup={(self) => {
              self.label = acLabel.get();
              self.hook(tlpMode, (self) => {
                self.label = acLabel.get();
              });
            }}
            onClick={() => execAsync("sudo tlp ac")}
          />
        </box>
      </box>
      <box className="brightness" vertical spacing={5}>
        <GlanceHeader
          icon=""
          label="brightness"
          trailingLabel={screenBrightness.as((value) => `${Math.floor(value)}`)}
          trailingIcon=""
        />
        <slider
          drawValue={false}
          min={0}
          max={100}
          value={screenBrightness.as((value) => Math.floor(value))}
          step={1}
          setup={(self) => {
            self.value = Math.floor(screenBrightness.get());
            self.connect(
              "value-changed",
              (self) => (brightness.screen = self.value),
            );
          }}
        />
      </box>
    </GlancePage>
  );
}
