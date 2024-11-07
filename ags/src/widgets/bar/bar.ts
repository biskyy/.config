import WindowHandler from "src/windowHandler";
import { BoxProps } from "types/widgets/box";
import { EventBoxProps } from "types/widgets/eventbox";
import { getPlayerGlyph, truncate, symbolicStrength } from "src/lib/utils";

import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
// import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import Battery, { BatteryState } from "src/services/battery";
import Brightness from "src/services/brightness";

import * as MprisState from "src/lib/mpris";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

interface BarWidgetProps {
  className: string;
  eventbox?: EventBoxProps;
  box?: BoxProps;
}

const BarWidget = ({ className, eventbox, box }: BarWidgetProps) => {
  return Widget.EventBox({
    className: className,
    ...eventbox,
    child: Widget.Box({
      className: "widget",
      ...box,
    }),
  });
};

const BarLauncherHandler = () => {
  const LauncherRevealerState = {
    hovered: false,
    revelearHovered: false,
  };

  const LauncherRevealer = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    className: "launcher-revealer",
    css: "padding-left: 10px;",
    child: Widget.Label("launcher"),
  });

  const BarLauncher = BarWidget({
    className: "launcher",
    eventbox: {
      onPrimaryClick: () =>
        Utils.execAsync(["pkill", "tofi-run"])
          .catch(() =>
            Utils.execAsync([
              "bash",
              "-c",
              "tofi-run | xargs hyprctl dispatch exec --",
            ])
          )
          .catch((err) => console.log(err)),
    },
    box: {
      children: [
        // Widget.Icon({
        //   icon: "/home/biskyy/.config/ags/src/assets/launcher.png",
        //   size: 7,
        // }),
        Widget.Label({
          label: "   ",
          className: "icon",
        }),
        LauncherRevealer,
      ],
    },
  });

  // Event connections for hover states
  BarLauncher.connect("enter-notify-event", (_, event) => {
    LauncherRevealerState.hovered = true;
    LauncherRevealer.reveal_child = true;
  });

  LauncherRevealer.connect("enter-notify-event", (_, event) => {
    LauncherRevealerState.revelearHovered = true;
    LauncherRevealerState.hovered = true;
    LauncherRevealer.reveal_child = true;
  });

  BarLauncher.connect("leave-notify-event", (_, event) => {
    LauncherRevealerState.hovered = false;
    if (!LauncherRevealerState.revelearHovered)
      LauncherRevealer.reveal_child = false;
  });

  LauncherRevealer.connect("leave-notify-event", (_, event) => {
    LauncherRevealerState.revelearHovered = false;
    if (!LauncherRevealerState.hovered) LauncherRevealer.reveal_child = false;
  });

  return BarLauncher;
};

const BarWorkspaces = BarWidget({
  className: "workspaces",
  box: {
    spacing: 20,
    setup: (widget) => {
      widget.hook(Hyprland, (widget) => {
        // persistent workspaces
        const workspaces = [
          { id: 1, glyph: " " },
          { id: 2, glyph: "     " },
          { id: 3, glyph: " " },
          { id: 4, glyph: "    " },
        ];

        Hyprland.workspaces
          .sort((a, b) => a.id - b.id)
          // named workspaces have negative indices
          .filter((ws) => ws.id > workspaces[workspaces.length - 1].id)
          .forEach((ws) => workspaces.push({ id: ws.id, glyph: "     " })); // https://www.compart.com/en/unicode/U+200A

        widget.children = workspaces.map((ws) =>
          Widget.Button({
            className:
              Hyprland.active.workspace.id === ws.id ? "active" : "inactive",
            child: Widget.CenterBox({
              centerWidget: Widget.Label({
                className: "icon",
                label: ws.glyph,
              }),
            }),
            onPrimaryClick: () =>
              Utils.execAsync(`hyprctl dispatch workspace ${ws.id}`),
          })
        );
      });
    },
  },
});

const BarSysInfo = BarWidget({
  className: "sysinfo",
  eventbox: {
    onPrimaryClick: () => (BarSysTray.reveal_child = !BarSysTray.reveal_child),
    onMiddleClick: () => App.Inspector(),
  },
  box: {
    spacing: 12,
    children: [
      Widget.Box({
        children: [
          Widget.Label({ label: " ", className: "icon" }),
          Widget.Label("0.0G").poll(2500, (widget) =>
            Utils.execAsync([
              "bash",
              "-c",
              "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'",
            ]).then((out) => (widget.label = `${out}`))
          ),
        ],
      }),
      Widget.Box({
        children: [
          Widget.Label({ label: "          ", className: "icon" }),
          Widget.Label("0.0%").poll(2500, (widget) =>
            Utils.execAsync([
              "bash",
              "-c",
              "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//' | awk '{printf(\"%02d\\n\", $0)}'",
            ]).then((out) => (widget.label = `${out}%`))
          ),
        ],
      }),
    ],
  },
});

const BarSysTray = Widget.Revealer({
  transition: "slide_left",
  transitionDuration: 500,
  child: BarWidget({
    className: "systray",
    box: {
      spacing: 14,
      children: SystemTray.bind("items").transform((items) => {
        return items.map((item) =>
          Widget.Button({
            // @ts-ignore
            onPrimaryClick: () => item.openMenu(null),
            child: Widget.Icon({
              icon: item.bind("icon"),
              size: 7,
              setup: (self) => (self.size = 7),
            }),
          })
        );
      }),
    },
  }),
});

const BarPlayer = BarWidget({
  className: "player",
  eventbox: {
    visible: MprisState.PlayerSelected.bind().transform(
      (selected) => <number>selected >= 0
    ),
    onPrimaryClick: () => WindowHandler.toggleWindow("player"),
    onSecondaryClick: () => {
      if (Mpris.players[MprisState.PlayerSelected.value]?.can_go_next)
        Mpris.players[MprisState.PlayerSelected.value].next();
    },
    onMiddleClick: () => {
      if (Mpris.players[MprisState.PlayerSelected.value]?.can_play)
        Mpris.players[MprisState.PlayerSelected.value].playPause();
    },
  },
  box: {
    spacing: 20,
    setup: (widget) => {
      widget.hook(
        Mpris,
        (widget) => {
          if (MprisState.PlayerSelected.value < 0) return;

          const player = Mpris.players[MprisState.PlayerSelected.value];
          const title = player.track_title;
          const artists = player.track_artists;

          widget.visible = !(title.length || artists.join("").length);

          // display string
          let playerString = title;
          if (artists.length > 0 && artists[0].length > 0)
            playerString = `${truncate(artists[0], 30)} - ${truncate(
              title,
              30
            )}`;

          widget.children = [
            Widget.Label({
              className: "icon",
              label: getPlayerGlyph(player.name),
            }),
            Widget.Label(playerString),
          ];
        },
        "player-changed"
      );
    },
  },
});

const BarMedia = BarWidget({
  className: "media",
  eventbox: {
    setup: (widget) => {
      widget.hook(Bluetooth, (widget) => {
        let connected = false;
        Bluetooth.devices.forEach(
          (element) => (connected ||= element.connected)
        );

        connected
          ? widget.get_style_context().add_class("bluetooth")
          : widget.get_style_context().remove_class("bluetooth");
      });

      widget.hook(
        Audio,
        (widget) => {
          Audio.speaker?.is_muted
            ? widget.get_style_context().add_class("muted")
            : widget.get_style_context().remove_class("muted");
        },
        "speaker-changed"
      );
    },
    onPrimaryClick: () => WindowHandler.toggleWindow("media"),
  },
  box: {
    spacing: 10,
    children: [
      Widget.EventBox({
        onScrollUp: () => {
          const speaker = Audio.speaker;
          if (speaker) speaker.volume -= 0.05;
        },
        onScrollDown: () => {
          const speaker = Audio.speaker;
          if (speaker) speaker.volume += 0.05;
        },
        onMiddleClick: () => {
          const speaker = Audio.speaker;
          if (speaker) speaker.is_muted = !speaker.is_muted;
        },
        child: Widget.Box({
          className: "sink",
          spacing: 6,
          children: [
            Widget.Label({ className: "icon" }).hook(
              Audio,
              (widget) => {
                if (!Audio.speaker) widget.label = " ";
                else if (Audio.speaker.is_muted) widget.label = " ";
                else if (
                  Audio.speaker.stream?.port === "headphone-output" ||
                  Audio.speaker.stream?.port === "analog-output-headphones"
                )
                  widget.label = " ";
                else
                  widget.label = symbolicStrength({
                    value: Audio.speaker.volume,
                    max: 1,
                    array: ["", " ", " "],
                  });
              },
              "speaker-changed"
            ),

            Widget.Label().hook(
              Audio,
              (widget) => {
                if (!Audio.speaker) return;

                widget.label = `${Math.ceil(Audio.speaker.volume * 100)}%`;
              },
              "speaker-changed"
            ),
          ],
        }),
      }),
      Widget.EventBox({
        onScrollUp: () => {
          const microphone = Audio.microphone;
          if (microphone) microphone.volume -= 0.05;
        },
        onScrollDown: () => {
          const microphone = Audio.microphone;
          if (microphone) microphone.volume += 0.05;
        },
        onMiddleClick: () => {
          const microphone = Audio.microphone;
          if (microphone) microphone.is_muted = !microphone.is_muted;
        },
        child: Widget.Box({
          className: "source",
          spacing: 1,
          children: [
            Widget.Label({ className: "icon" }).hook(
              Audio,
              (widget) => {
                if (!Audio.microphone || Audio.microphone.is_muted)
                  widget.label = "        ";
                else widget.label = "  ";
              },
              "microphone-changed"
            ),

            Widget.Label().hook(
              Audio,
              (widget) => {
                if (!Audio.microphone) return;

                widget.label = `${Math.ceil(Audio.microphone.volume * 100)}%`;
              },
              "microphone-changed"
            ),
          ],
        }),
      }),
    ],
  },
});

const batteryRevealer = Widget.Revealer({
  transition: "slide_left",
  transitionDuration: 500,
  css: "padding-left: 5px;", // add padding when shown
  child: Widget.Label({
    label: Battery.bind("percentage").transform(
      (percent) => `${percent.toString()}%`
    ),
  }),
});

const BarBattery = () => {
  let state = Battery.bind("state");

  return Widget.EventBox({
    // button doesnt work here because for some reason :hover won't work in css :DDDDDDDDDDDDDDD
    class_name: "battery-info button",
    onScrollUp: () => (Brightness.screen_brightness += 0.1),
    onScrollDown: () => (Brightness.screen_brightness -= 0.1),
    onHover: () =>
      state.emitter.state !== BatteryState.Charging
        ? (batteryRevealer.reveal_child = true)
        : null,
    onHoverLost: () =>
      state.emitter.state !== BatteryState.Charging
        ? (batteryRevealer.reveal_child = false)
        : null,
    onPrimaryClick: () => WindowHandler.toggleWindow("glance", "battery-and-power"),
    child: Widget.Box({
      hexpand: true,
      vexpand: true,
      children: [
        Widget.Label({
          class_name: "icon",
          label: " ",
        })
          .hook(
            Battery,
            (self) => {
              if (
                Battery.state === BatteryState.NotCharging &&
                Battery.pluggedIn // which means it's at the threshold of 80%
              ) {
                self.label = " ";
              } else if (Battery.state === BatteryState.Charging) {
                self.label = "";
                batteryRevealer.reveal_child = true;
              } else self.label = Battery.icon;
            },
            "battery-changed"
          )
          .hook(
            Battery,
            () => {
              if (
                batteryRevealer.reveal_child &&
                (Battery.state === BatteryState.Discharging ||
                  Battery.state === BatteryState.NotCharging)
              )
                batteryRevealer.reveal_child = false;
            },
            "state-changed"
          ), // additional hook to hide the revealer once battery stops charges
        batteryRevealer,
      ],
    }),
  });
};

const BarNetwork = () =>
  Widget.Button({
    className: "network-info button",
    onPrimaryClick: () => WindowHandler.toggleWindow("glance", "internet"),
    child: Widget.Label({
      classNames: ["icon", "disconnected"], // disconnected initially
    }).hook(Network, (widget) => {
      if (!Network.wifi || !Network.wired) return;

      widget.class_names = ["icon", `${Network.wifi.internet}`];

      if (Network.primary === "wired") widget.label = " ";
      else if (Network.wifi.internet === "connected")
        widget.label = symbolicStrength({
          value: Network.wifi.strength,
          array: ["󰤯    ", "󰤟    ", "󰤢    ", "󰤥    ", "󰤨    "],
        });
      else if (Network.wifi.internet === "connecting") {
        widget.label =
          symbolicStrength({
            value: Network.wifi.strength ?? -1,
            array: ["󰤫    ", "󰤠    ", "󰤣    ", "󰤦    ", "󰤩    "],
          }) ?? "󰤫    ";
        /**  reason for ?? is to prevent an error log:
         * if you disconnect from cellular and reconnect
         * then for some reason symbolicStrength
         * will return undefined(?????) */
      } else widget.label = "󰤭    ";
    }),
  });

const currentTime = Variable("", {
  poll: [
    1000,
    () =>
      new Date()
        .toLocaleTimeString("ro-RO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/ (a.m.|p.m.)/i, ""),
  ],
});

const BarTime = () =>
  Widget.Button({
    className: "time-info button",
    child: Widget.Label({
      className: "time",
      label: currentTime.bind(),
    }),
  });

const BarInfo = BarWidget({
  className: "info",
  box: {
    spacing: 10,
    children: [BarBattery(), BarNetwork(), BarTime()],
  },
});

const BarPower = BarWidget({
  className: "power",
  eventbox: {
    onPrimaryClick: () => WindowHandler.toggleWindow("powermenu"),
  },
  box: {
    children: [Widget.Label({ label: "  " })],
  },
});

// const BarRevealer = Widget.Revealer({
//   transition: "slide_down",
//   transitionDuration: 500,
//   child: Widget.CenterBox({
//     className: "bar",
//     startWidget: Widget.Box({
//       hpack: "start",
//       children: [BarLauncherHandler(), BarWorkspaces, BarSysInfo, BarSysTray],
//     }),
//     centerWidget: Widget.Box({
//       hpack: "center",
//       children: [BarPlayer],
//     }),
//     endWidget: Widget.Box({
//       hpack: "end",
//       children: [BarMedia, BarInfo, BarPower],
//     }),
//   }),
// });

// const BarRevealerState = {
//   hovered: false,
//   revelearHovered: false,
// };

// const BarThing = Widget.EventBox({
//   onHover: () => (BarRevealer.reveal_child = true),
//   onHoverLost: () => (BarRevealer.reveal_child = false),
//   child: Widget.Box({
//     className: "box-revealer",
//     css: "background-color: transparent; padding: 1px",
//     children: [BarRevealer],
//   }),
// });

// BarThing.connect("enter-notify-event", (_, event) => {
//   BarRevealerState.hovered = true;
//   BarRevealer.reveal_child = true;
// });

// BarRevealer.connect("enter-notify-event", (_, event) => {
//   BarRevealerState.revelearHovered = true;
//   BarRevealerState.hovered = true;
//   BarRevealer.reveal_child = true;
// });

// BarThing.connect("leave-notify-event", (_, event) => {
//   BarRevealerState.hovered = false;
//   if (!BarRevealerState.revelearHovered) BarRevealer.reveal_child = false;
// });

// BarRevealer.connect("leave-notify-event", (_, event) => {
//   BarRevealerState.revelearHovered = false;
//   if (!BarRevealerState.hovered) BarRevealer.reveal_child = false;
// });

const Bar = (monitor = 0) =>
  Widget.Window({
    name: "bar",
    monitor: monitor,
    layer: "top",
    exclusivity: "exclusive",
    css: "background-color: transparent; margin: 5px;",
    anchor: ["top", "left", "right"],
    child: Widget.CenterBox({
      className: "bar",
      startWidget: Widget.Box({
        hpack: "start",
        children: [BarLauncherHandler(), BarWorkspaces, BarSysInfo, BarSysTray],
      }),
      centerWidget: Widget.Box({
        hpack: "center",
        children: [BarPlayer],
      }),
      endWidget: Widget.Box({
        hpack: "end",
        children: [BarMedia, BarInfo, BarPower],
      }),
    }),
  });

export default Bar;
