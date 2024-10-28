import Gtk from "gi://Gtk?version=3.0";
import WindowHandler from "src/windowHandler";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import { truncate } from "src/lib/utils";

import Audio from "resource:///com/github/Aylur/ags/service/audio.js";

import { SliderProps } from "types/widgets/slider.js";
import { LabelProps } from "types/widgets/label.js";
import { ButtonProps } from "types/widgets/button.js";

interface MediaSliderProps {
  label: LabelProps["label"];
  mute: ButtonProps;
  otherDevices: Gtk.Box;
  slider: SliderProps;
}

interface DeviceButtonProps {
  eventbox?: object;
  box?: object;
  children?: any[];
}

const DeviceButton = ({
  eventbox = {},
  box = {},
  children = [],
}: DeviceButtonProps) =>
  Widget.EventBox({
    className: "device",
    ...eventbox,
    child: Widget.Box({
      ...box,
      children,
    }),
  });

const MediaSlider = ({
  label,
  mute,
  otherDevices: otherDevices,
  slider,
}: MediaSliderProps) => {
  const device_revealer = Widget.Revealer({
    transition: "slide_down",
    transitionDuration: 500,
    css: "padding-top: 10px;",
    child: otherDevices,
  });

  return Widget.Box({
    className: "volume-box",
    orientation: Gtk.Orientation.VERTICAL,
    children: [
      Widget.Box({
        spacing: 10,
        children: [
          DeviceButton({
            children: [
              Widget.Button({
                classNames: ["mute", "icon"],
                ...mute,
              }),
              Widget.Button({
                classNames: ["name", "icon"],
                hexpand: true,
                hpack: "start",
                label,
                onPrimaryClick: () =>
                  (device_revealer.reveal_child =
                    !device_revealer.reveal_child),
              }),
            ],
          }),
          Widget.Button({
            className: "list",
            onPrimaryClick: () =>
              (device_revealer.reveal_child = !device_revealer.reveal_child),
            child: Widget.Label({ className: "icon", label: " " }),
          }),
        ],
      }),
      device_revealer,
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
      spacing: 10,
      orientation: Gtk.Orientation.VERTICAL,
      children: [
        MediaSlider({
          label: Audio.bind("speaker").transform((speaker) =>
            truncate(speaker?.description ?? "Invalid Device", 38)
          ),
          mute: {
            onPrimaryClick: () => {
              const speaker = Audio.speaker;
              if (speaker) speaker.is_muted = !speaker.is_muted;
            },
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) =>
                  (widget.label = Audio.speaker?.is_muted ? "󰖁 " : "sadas "),
                "speaker-changed"
              );
            },
          },
          slider: {
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) => (widget.value = (Audio.speaker?.volume || 0) * 100),
                "speaker-changed"
              );
            },
            on_change: ({ value }) => {
              if (!Audio.speaker) return;

              Audio.speaker.volume = value / 100;
            },
          },
          otherDevices: Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            hpack: "start",
            setup: (widget) => {
              widget.hook(
                Audio,
                (widget) => {
                  widget.children = Audio.speakers
                    .filter((speaker) => speaker.name !== Audio.speaker?.name)
                    .map((speaker) =>
                      DeviceButton({
                        eventbox: {
                          onPrimaryClick: () => (Audio.speaker = speaker),
                        },
                        children: [
                          Widget.Label({
                            hpack: "start",
                            hexpand: true,
                            label: truncate(
                              speaker.description ?? "Invalid Device",
                              44
                            ),
                          }),
                        ],
                      })
                    );
                },
                "speaker-changed"
              );
            },
          }),
        }),
        MediaSlider({
          label: Audio.bind("microphone").transform((microphone) =>
            truncate(microphone?.description ?? "Invalid Device", 38)
          ),
          mute: {
            onPrimaryClick: () => {
              const microphone = Audio.microphone;
              if (microphone) microphone.is_muted = !microphone.is_muted;
            },
            child: Widget.Label().hook(
              Audio,
              (widget) => {
                widget.label = Audio.microphone?.is_muted ? " " : " ";
              },
              "microphone-changed"
            ),
          },
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
            spacing: 10,
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
