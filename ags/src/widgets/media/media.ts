import Gtk from "gi://Gtk?version=3.0";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import { truncate } from "src/lib/utils";

const MediaDevice = ({
  icon,
  iconEventbox = {},
  deviceName,
  deviceNameEventbox = {},
  slider,
  otherDevices,
}) => {
  const devicesRevealer = Widget.Revealer({
    transition: "slide_down",
    transitionDuration: 500,
    css: "padding-top: 10px;",
    child: otherDevices,
  });

  return Widget.Box({
    className: "media-device",
    orientation: Gtk.Orientation.VERTICAL,
    children: [
      Widget.Box({
        children: [
          Widget.Button({
            ...iconEventbox,
            className: "icon-button",
            child: Widget.Label({
              label: icon,
              className: "icon",
            }),
          }),
          Widget.Button({
            ...deviceNameEventbox,
            onPrimaryClick: () =>
              (devicesRevealer.reveal_child = !devicesRevealer.reveal_child),
            className: "device-name",
            child: Widget.Label({ label: deviceName, className: "name" }),
          }),
          Widget.Button({
            className: "list-devices-button",
            onPrimaryClick: () =>
              (devicesRevealer.reveal_child = !devicesRevealer.reveal_child),
            child: Widget.Label({ label: " ", className: "icon" }),
          }),
        ],
      }),
      devicesRevealer,
      Widget.Slider({
        drawValue: false,
        min: 0,
        max: 100,
        ...slider,
      }),
    ],
  });
};

const Media = () =>
  Widget.Window({
    name: "media",
    className: "media",
    layer: "overlay",
    exclusivity: "normal",
    anchor: ["top", "right"],
    child: Widget.Box({
      className: "layout-box",
      // spacing: 10,
      orientation: Gtk.Orientation.VERTICAL,
      children: [
        MediaDevice({
          icon: " ",
          iconEventbox: {
            onPrimaryClick: () => {
              const speaker = Audio.speaker;
              if (speaker) speaker.is_muted = !speaker.is_muted;
            },
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) =>
                  (widget.child.label = Audio.speaker?.is_muted ? " " : " "),
                "speaker-changed"
              );
            },
          },
          deviceName: Audio.bind("speaker").transform((speaker) =>
            truncate(speaker?.description ?? "Invalid Device", 38)
          ),
          slider: {
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) => (widget.value = (Audio.speaker?.volume || 0) * 100),
                "speaker-changed"
              );
            },
            onChange: ({ value }) => {
              if (!Audio.speaker) return;

              Audio.speaker.volume = value / 100;
            },
          },
          otherDevices: Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            hpack: "start",
            setup: (widget) =>
              widget.hook(
                Audio,
                (widget) =>
                  (widget.children = Audio.speakers
                    .filter((speaker) => speaker.name !== Audio.speaker?.name)
                    .map((speaker) =>
                      Widget.Button({
                        onPrimaryClick: () => (Audio.speaker = speaker),
                        child: Widget.Label({
                          hpack: "start",
                          hexpand: true,
                          label: truncate(
                            speaker.description ?? "Invalid Device",
                            38
                          ),
                        }),
                      })
                    )),
                "speaker-changed"
              ),
          }),
        }),
        MediaDevice({
          icon: " ",
          iconEventbox: {
            onPrimaryClick: () => {
              const microphone = Audio.microphone;
              if (microphone) microphone.is_muted = !microphone.is_muted;
            },
            setup: (widget) =>
              widget.hook(
                Audio,
                (widget) => {
                  widget.child.label = Audio.microphone?.is_muted
                    ? "    "
                    : " ";
                },
                "microphone-changed"
              ),
          },
          deviceName: Audio.bind("microphone").transform((microphone) =>
            truncate(microphone?.description ?? "Invalid Device", 38)
          ),
          slider: {
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) => {
                  widget.value = (Audio.microphone?.volume || 0) * 100;
                },
                "microphone-changed"
              );
            },
            onChange: ({ value }) => {
              if (!Audio.microphone) return;
              Audio.microphone.volume = value / 100;
            },
          },
          otherDevices: Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            // spacing: 10,
            hpack: "start",
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) => {
                  widget.children = Audio.microphones
                    .filter(
                      (microphone) => microphone.name !== Audio.microphone?.name
                    )
                    .map((microphone) => {
                      const label = "  " + microphone.description;

                      return Widget.Button({
                        className: "name",
                        onPrimaryClick: () => (Audio.microphone = microphone),
                        child: Widget.Label({
                          hpack: "start",
                          hexpand: true,
                          label: truncate(label, 46),
                        }),
                      });
                    });
                },
                "microphone-changed"
              );
            },
          }),
        }),
      ],
    }),
  });

export default Media;
