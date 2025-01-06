import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { timeout, Variable } from "astal";
import { PanelID } from "src/panel";

import Bar from "src/widgets/bar/bar";
import Glance from "./widgets/glance/glance";
import PowerMenu from "./widgets/powermenu/powermenu";
import Audio from "./widgets/audio/audio";

class _PanelManager {
  private panelRegistry = new Map<
    PanelID,
    (...args: any[]) => Widget.Window | boolean
  >();
  public activePanel: Variable<PanelID | null> = Variable(null);

  constructor() {
    this.registerDefaultPanels();
  }

  /**
   * Register default panels during initialization.
   */
  private registerDefaultPanels() {
    this.panelRegistry.set(PanelID.BAR, Bar);
    this.panelRegistry.set(PanelID.POWERMENU, PowerMenu);
    this.panelRegistry.set(PanelID.GLANCE, Glance);
    this.panelRegistry.set(PanelID.AUDIO, Audio);
  }

  /**
   * Spawns a panel for the bar on the specified monitor.
   */
  spawnBar(monitor: number = 0) {
    const bar = this.panelRegistry.get(PanelID.BAR);
    if (!bar) {
      this.logAndExit("Bar panel not registered in the registry.");
    }
    return bar(monitor);
  }

  /**
   * Toggles the visibility of the specified panel.
   * If the panel is already visible, it will be removed.
   * If a different panel is visible, it will replace that panel.
   */
  togglePanel(panelID: PanelID, args: any = undefined) {
    const windowToSpawn = this.panelRegistry.get(panelID);
    if (!windowToSpawn) {
      this.logAndExit(`PanelID "${panelID}" not found in registry.`);
    }

    /* - If the same panel is already active:
     *   - Check if arguments (args) are provided:
     *     - If args are provided, pass them to the window function.
     *       - If the window function returns true (args haven’t changed), destroy the panel.
     *       - Otherwise, keep the panel open (args have changed).
     *     - If no args are provided, close the panel.
     * - If a different panel is currently active, close that panel first.
     */
    if (this.activePanel.get() === panelID) {
      if (args) {
        const shouldDestroy = windowToSpawn(args);
        if (shouldDestroy) this.closePanel(panelID);
        return;
      }
      this.closePanel(panelID);
      return;
    } else if (this.activePanel.get() !== null)
      this.closePanel(this.activePanel.get() as PanelID);

    this.toggleOverlayFor(panelID);
    App.add_window(windowToSpawn(args) as Widget.Window);
    this.activePanel.set(panelID);
  }

  /**
   * Removes the specified panel by name.
   */
  closePanel(panelID: PanelID) {
    const windowToRemove = App.get_window(panelID);
    if (!windowToRemove) {
      this.logAndExit(`PanelID "${panelID}" not found for removal.`);
    }

    this.toggleOverlayFor(panelID);
    this.destroyWindow(windowToRemove);

    if (this.activePanel.get() === panelID) {
      this.activePanel.set(null);
    }
  }

  destroyWindow(window: Gtk.Window, name?: PanelID) {
    window.set({ className: `${name ?? window.name} destroy panel` });
    App.remove_window(window);
    timeout(250, () => window.destroy());
  }

  /**
   * Toggles the overlay for a panel.
   */
  toggleOverlayFor(panelID: PanelID) {
    const monitorCount = Gdk.Display.get_default()?.get_n_monitors();
    if (!monitorCount) {
      console.error(
        "Monitor count not found. Ensure at least one monitor is connected.",
      );
      return;
    }

    const overlayPanels = App.get_windows().filter((w) =>
      w.name?.match(/overlay-\d+/),
    );

    if (overlayPanels.length > 0) {
      overlayPanels.forEach((overlay) =>
        this.destroyWindow(overlay, PanelID.OVERLAY),
      );
    } else {
      for (let monitor = 0; monitor < monitorCount; monitor++) {
        App.add_window(this.createOverlay(panelID, monitor));
      }
    }
  }

  /**
   * Creates an overlay panel for the specified monitor.
   */
  private createOverlay(panelID: PanelID, monitor: number) {
    return (
      <window
        name={`overlay-${monitor}`}
        className="overlay create"
        monitor={monitor}
        layer={Astal.Layer.TOP}
        anchor={
          Astal.WindowAnchor.TOP |
          Astal.WindowAnchor.LEFT |
          Astal.WindowAnchor.RIGHT |
          Astal.WindowAnchor.BOTTOM
        }
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.ON_DEMAND}
        onKeyPressEvent={(self, event) => {
          if (
            event.get_keyval()[1] === Gdk.KEY_Escape &&
            !self.className.includes("destroy")
          )
            this.closePanel(panelID);
        }}
      >
        <button
          className="content"
          hexpand
          vexpand
          onClick={(self) => {
            const parent = self.get_parent() as Widget.Window;
            if (!parent.className.includes("destroy")) this.closePanel(panelID);
          }}
          css="background-color: rgba(0,0,0,0.0)"
        />
      </window>
    ) as Widget.Window;
  }

  /**
   * Logs an error message and exits the application.
   */
  private logAndExit(message: string): never {
    console.error(`Error: ${message}`);
    App.quit();
    throw new Error(message);
  }
}

// Initialize and export the PanelManager instance.
const PanelManager = new _PanelManager();
export default PanelManager;
