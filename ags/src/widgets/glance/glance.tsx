import { Astal, Gtk, Widget } from "astal/gtk3";
import Panel, { PanelID } from "src/panel";
import GlanceNetwork from "./network";
import { bind, timeout, Variable } from "astal";
import GlanceTime from "./time";
import GlanceBattery from "./battery";
import { GlancePageID } from "./glance-page";
import { batteryIcon } from "src/lib/battery";

export const currentPage = Variable<GlancePageID[number] | undefined>(
  undefined,
);

const GlancePages = () => {
  return (
    <stack
      name="pages"
      className="pages"
      transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
      transitionDuration={500}
      //valign={Gtk.Align.START}
      expand
      shown={bind(currentPage)}
    >
      <GlanceTime />
      <GlanceNetwork />
      <GlanceBattery />
    </stack>
  );
};

const GlanceColumn = () => {
  return (
    <box className="column" vertical valign={Gtk.Align.START} spacing={10}>
      <button
        onClick={() => currentPage.set(GlancePageID.TIME)}
        className={currentPage((page) =>
          page === GlancePageID.TIME ? "active icon" : "inactive icon",
        )}
        label=""
      />
      <button
        onClick={() => currentPage.set(GlancePageID.NETWORK)}
        className={currentPage((page) =>
          page === GlancePageID.NETWORK ? "active icon" : "inactive icon",
        )}
        label="󰤨"
      />
      <button
        onClick={() => currentPage.set(GlancePageID.BATTERY)}
        className={currentPage((page) =>
          page === GlancePageID.BATTERY ? "active icon" : "inactive icon",
        )}
        label={batteryIcon((icon) => icon)}
      />
      <button className="icon" label="" />
    </box>
  );
};

export default function Glance(pageToShow: GlancePageID) {
  if (PanelManager.activePanel.get() !== null) {
    if (pageToShow !== currentPage.get()) {
      currentPage.set(pageToShow);
      return false; // args have changed, should not destroy window
    } else return true; // args have not changed, should destroy window
  }

  currentPage.set(pageToShow);

  return (
    <Panel
      name={PanelID.GLANCE}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      box={{
        valign: Gtk.Align.END,
        spacing: 10,
      }}
    >
      <GlancePages page={pageToShow} />
      <GlanceColumn />
    </Panel>
  ) as Widget.Window;
}
