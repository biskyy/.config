import Bar from "./widgets/bar/bar";
import Player from "./widgets/player/player";
import Media from "./widgets/media/media";
import PowerMenu from "./widgets/powermenu/powermenu";
import Glance from "./widgets/glance/glance";

import AgsWindow from "resource:///com/github/Aylur/ags/widgets/window.js";
import Gdk from "types/@girs/gdk-3.0/gdk-3.0";

class windowHandler {
  private windowRegistry: Map<string, (...args: any[]) => AgsWindow<any, any>> =
    new Map();
  private currentVisibleWindow: string | null = null;

  constructor() {
    this.windowRegistry.set("bar", Bar);
    this.windowRegistry.set("player", Player);
    this.windowRegistry.set("media", Media);
    this.windowRegistry.set("powermenu", PowerMenu);
    this.windowRegistry.set("glance", Glance);
    this.windowRegistry.set("overlay", Overlay);
  }

  spawnBar = () => {
    const bar = this.windowRegistry.get("bar");
    if (!bar) {
      console.log("Bar not found");
      App.quit();
      throw new Error("Bar not found");
    }
    return bar();
  };

  toggleWindow = (window: string, args = {}) => {
    const windowToBeSpawned = this.windowRegistry.get(window);
    if (!windowToBeSpawned) {
      console.log("Window not found");
      App.quit();
      throw new Error("Window not found");
    }

    const windowsAlreadySpawned = App.windows.map((w) => w.name);

    // If the target window is already spawned, remove it and its overlay
    if (windowsAlreadySpawned.includes(window)) {
      this.despawnWindow(window);
      return;
    }

    // Remove current visible window (if any) and its overlay
    if (
      this.currentVisibleWindow &&
      windowsAlreadySpawned.includes(this.currentVisibleWindow)
    ) {
      this.despawnWindow(this.currentVisibleWindow);
    }

    // Add the new window and its overlay
    App.addWindow(windowToBeSpawned(args));
    this.toggleOverlay(window);
    this.currentVisibleWindow = window;
  };

  despawnWindow = (window: string) => {
    App.removeWindow(window);
    this.toggleOverlay(window);
    if (this.currentVisibleWindow === window) {
      this.currentVisibleWindow = null;
    }
  };

  toggleOverlay = (window: string) => {
    const monitors = Gdk.Display.get_default()?.get_n_monitors();
    if (!monitors) {
      console.log(
        "Monitor count not found. Make sure you have at least one monitor =)"
      );
      return;
    }

    if (App.windows.some((w) => w.name && w.name.match(/overlay-\d+/)))
      for (let i = 0; i < monitors; i++) App.removeWindow(`overlay-${i}`);
    else for (let i = 0; i < monitors; i++) App.addWindow(Overlay(window, i));
  };
}

export const Overlay = (window: string, monitor = 0) =>
  Widget.Window({
    name: `overlay-${monitor}`,
    monitor: monitor,
    layer: "top",
    anchor: ["top", "left", "right", "bottom"],
    css: "background-color: transparent;",
    exclusivity: "exclusive",
    child: Widget.EventBox({
      hexpand: true,
      vexpand: true,
      css: "background-color: rgba(0, 0, 0, 0);",
      onPrimaryClick: () => WindowHandler.despawnWindow(window),
    }),
  });

const WindowHandler = new windowHandler();
export default WindowHandler;
