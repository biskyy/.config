import Gtk from "gi://Gtk?version=3.0";

import WindowHandler from "src/windowHandler";

import Battery, { BatteryState } from "src/services/battery";
import Brightness from "src/services/brightness";
import PowerProfiles from "resource:///com/github/Aylur/ags/service/powerprofiles.js";

import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Cellular, { ConnectionState } from "src/services/cellular";

const GlanceBatteryAndPower = () =>
  Widget.Box({
    className: "battery-and-power glance-page",
    orientation: Gtk.Orientation.VERTICAL,
    hexpand: true,
    vpack: "start",
    spacing: 5,
    children: [
      Widget.Box({
        className: "battery-general",
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 5,
        children: [
          Widget.Box({
            children: [
              Widget.Label({
                className: "icon",
                label: " ",
                setup: (self) =>
                  self.hook(Battery, (self) => (self.label = Battery.icon)),
              }),
              Widget.Label({
                label: " battery is currently discharging at 00%",
                setup: (self) =>
                  self.hook(
                    Battery,
                    (self) =>
                      (self.label = ` battery is currently ${Battery.state.toLowerCase()}${
                        Battery.state === BatteryState.NotCharging
                          ? "(full)"
                          : ""
                      } at ${Battery.percentage}%`)
                  ),
              }),
            ],
          }),
        ],
      }),
      Widget.Box({
        className: "power-profiles",
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 5,
        children: [
          Widget.Box({
            children: [
              Widget.Label({
                label: "  ",
                className: "icon",
                hpack: "start",
              }),
              Widget.Label({
                label: "power profiles",
              }),
            ],
          }),
          Widget.Box({
            className: "segmented-slider",
            orientation: Gtk.Orientation.HORIZONTAL,
            hexpand: true,
            children: [
              Widget.Button({
                hexpand: true,
                label: "  power-saver  ",
                onHover: (self) => (self.label = "> power-saver  "),
                onHoverLost: (self) =>
                  (self.label =
                    PowerProfiles.active_profile !== "power-saver"
                      ? "  power-saver  "
                      : "> power-saver  "),
                onPrimaryClick: () =>
                  (PowerProfiles.active_profile = "power-saver"),
                setup: (self) => {
                  self.hook(PowerProfiles, (self) => {
                    if (PowerProfiles.active_profile === "power-saver") {
                      self.class_name = "button active";
                      self.label = "> power-saver  ";
                    } else {
                      self.class_name = "button inactive";
                      self.label = "  power-saver  ";
                    }
                  });
                },
              }),
              Widget.Button({
                hexpand: true,
                label: "  balanced  ",
                onHover: (self) => (self.label = "> balanced  "),
                onHoverLost: (self) =>
                  (self.label =
                    PowerProfiles.active_profile !== "balanced"
                      ? "  balanced  "
                      : "> balanced  "),
                onPrimaryClick: () =>
                  (PowerProfiles.active_profile = "balanced"),
                setup: (self) => {
                  self.hook(PowerProfiles, (self) => {
                    if (PowerProfiles.active_profile === "balanced") {
                      self.class_name = "button active";
                      self.label = "> balanced  ";
                    } else {
                      self.class_name = "button inactive";
                      self.label = "  balanced  ";
                    }
                  });
                },
              }),
              Widget.Button({
                hexpand: true,
                label: "  performance  ",
                onHover: (self) => (self.label = "> performance  "),
                onHoverLost: (self) =>
                  (self.label =
                    PowerProfiles.active_profile !== "performance"
                      ? "  performance  "
                      : "> performance  "),
                onPrimaryClick: () =>
                  (PowerProfiles.active_profile = "performance"),
                setup: (self) => {
                  self.hook(PowerProfiles, (self) => {
                    if (PowerProfiles.active_profile === "performance") {
                      self.class_name = "button active";
                      self.label = "> performance  ";
                    } else {
                      self.class_name = "button inactive";
                      self.label = "  performance  ";
                    }
                  });
                },
              }),
            ],
          }),
        ],
      }),
      Widget.Box({
        orientation: Gtk.Orientation.VERTICAL,
        hexpand: true,
        className: "brightness",
        spacing: 5,
        children: [
          Widget.Box({
            hexpand: true,
            children: [
              Widget.Label({
                label: "  ",
                className: "icon",
                hpack: "start",
              }),
              Widget.Label({
                label: "brightness",
              }),
              Widget.Label({
                hpack: "end",
                hexpand: true,
                label: "00%",
                setup: (self) =>
                  self.hook(
                    Brightness,
                    (self) =>
                      (self.label =
                        Math.floor(Brightness.screen_brightness) + "%")
                  ),
              }),
            ],
          }),

          Widget.Slider({
            drawValue: false,
            min: 0,
            max: 100,
            value: 50,
            setup: (self) => {
              self.hook(Brightness, (self) => {
                self.value = Brightness.screen_brightness;
              });
              self.connect("value-changed", (self) => {
                Brightness.screen_brightness = self.value;
              });
            },
          }),
        ],
      }),
    ],
  });

enum InterfaceState {
  CONNECTED = "",
  CONNECTING = "",
  DISCONNECTED = "",
  DISABLED = "",
  ERROR = "",
}

enum InterfaceType {
  CELLULAR = "cellular",
  WIFI = "wifi",
}

const InterfaceLabel = (icon: string, type: InterfaceType, stateSetup) =>
  Widget.Box({
    hexpand: true,
    hpack: "center",
    spacing: 10,
    children: [
      Widget.Label({
        label: icon,
        className: "icon",
      }),
      Widget.Label({
        label: type,
      }),
      Widget.Label({
        ...stateSetup,
        className: "icon",
      }),
    ],
  });

const GlanceInternet = () =>
  Widget.Box({
    className: "internet glance-page",
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 5,
    vpack: "start",
    children: [
      Widget.Box({
        className: "",
        children: [
          Widget.Label({
            className: "icon",
            label: "  ",
          }),
          Widget.Label({
            label: "connected to the internet via x",
            setup: (self) => {
              let wifi;
              let cellular;
              self.hook(Network, (self) => {
                wifi = Network.wifi.internet;
              });
              self.hook(Cellular, (self) => {
                cellular = Cellular.state;
              });

              let connected = wifi === "connected" || cellular === "connected";
              console.log(connected);
            },
          }),
        ],
      }),
      Widget.Box({
        className: "toggles",
        children: [
          Widget.Button({
            hexpand: true,
            onMiddleClick: () => (Network.wifi.enabled = !Network.wifi.enabled),
            onPrimaryClick: () => Network.toggleWifi(),
            setup: (self) =>
              self.hook(
                Network,
                (self) =>
                  (self.class_name = "button ".concat(
                    Network.wifi.enabled ? "active" : ""
                  ))
              ),
            child: InterfaceLabel("󰤨     ", InterfaceType.WIFI, {
              setup: (self) =>
                self.hook(
                  Network,
                  (self) =>
                    (self.label = !Network.wifi.enabled
                      ? InterfaceState.DISABLED
                      : Network.wifi.internet === "connected"
                      ? InterfaceState.CONNECTED
                      : Network.wifi.internet === "disconnected"
                      ? InterfaceState.DISCONNECTED
                      : Network.wifi.internet === "connecting"
                      ? InterfaceState.CONNECTING
                      : InterfaceState.ERROR)
                ),
            }),
          }),
          Widget.Button({
            hexpand: true,
            onMiddleClick: () => (Cellular.enabled = !Cellular.enabled),
            onPrimaryClick: () => Cellular.toggleInternet(),
            setup: (self) =>
              self.hook(
                Cellular,
                (self) =>
                  (self.class_name = "button ".concat(
                    Cellular.enabled ? "active" : ""
                  ))
              ),
            child: InterfaceLabel("   ", InterfaceType.CELLULAR, {
              setup: (self) =>
                self.hook(
                  Cellular,
                  (self) =>
                    (self.label = !Cellular.enabled
                      ? InterfaceState.DISABLED
                      : Cellular.state === ConnectionState.CONNECTED
                      ? InterfaceState.CONNECTED
                      : InterfaceState.DISCONNECTED)
                ),
            }),
          }),
        ],
      }),
    ],
  });

const GlanceSettings = (pageToBeShown: string) => {
  const GlancePages = Widget.Stack({
    transition: "slide_up_down",
    name: "glance-pages",
    vpack: "start",
    children: {
      ["internet"]: GlanceInternet(),
      ["battery-and-power"]: GlanceBatteryAndPower(),
    },
    setup: (self) => (self.shown = pageToBeShown),
  });

  const SettingsColumn = Widget.Box({
    className: "settings-column",
    orientation: Gtk.Orientation.VERTICAL,
    vpack: "start",
    spacing: 5,
    children: [
      Widget.Button({
        className: "settings-button icon",
        label: "    ",
      }),
      Widget.Button({
        className: "settings-button icon",
        onPrimaryClick: () => (GlancePages.shown = "internet"),
        label: "󰤨     ",
      }),
      Widget.Button({
        className: "settings-button icon",
        onPrimaryClick: () => (GlancePages.shown = "battery-and-power"),
        label: " ",
        setup: (self) =>
          self.hook(Battery, (self) => (self.label = Battery.icon)),
      }),
      Widget.Button({
        className: "settings-button icon",
        label: "   ",
      }),
    ],
  });

  return [GlancePages, SettingsColumn];
};

const Glance = (pageToBeShown: string) =>
  Widget.Window({
    name: "glance",
    className: "glance",
    anchor: ["top", "right"],
    layer: "overlay",
    exclusivity: "normal",
    child: Widget.Box({
      className: "layout-box",
      // vexpand: false,
      children: GlanceSettings(pageToBeShown),
    }),
  });

export default Glance;
