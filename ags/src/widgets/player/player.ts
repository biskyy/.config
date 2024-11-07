import WindowHandler from "src/windowHandler";
import Gtk from "gi://Gtk?version=3.0";
import App from "resource:///com/github/Aylur/ags/app.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";

import * as MprisState from "src/lib/mpris";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import { getPlayerGlyph, toTimestamp, truncate } from "src/lib/utils";

const PlayerLeft = () =>
  Widget.Box({
    className: "left",
    children: [
      Widget.Box({
        className: "image",
        setup: (widget) => {
          widget.hook(
            Mpris,
            (widget) => {
              if (
                MprisState.PlayerSelected.value < 0 ||
                !Mpris.players[MprisState.PlayerSelected.value].cover_path
              )
                widget.css = `background: url('${
                  App.configDir + "/assets/playerart.png"
                }'); background-size: 180px 180px;`;
              else
                widget.css = `background: url('${
                  Mpris.players[MprisState.PlayerSelected.value].cover_path
                }'); background-size: 180px 180px;`;
            },
            "player-changed"
          );
        },
      }),
      Widget.Box({
        className: "controls",
        orientation: Gtk.Orientation.VERTICAL,
        // spacing: 40,
        children: [
          Widget.Button({
            className: "previous",
            vexpand: true,
            onPrimaryClick: () => {
              if (
                MprisState.PlayerSelected.value < 0 ||
                !Mpris.players[MprisState.PlayerSelected.value].can_go_prev
              )
                return;

              Mpris.players[MprisState.PlayerSelected.value].previous();
            },
            child: Widget.Icon({ icon: "media-skip-backward-symbolic" }),
          }),
          Widget.Button({
            className: "pause",
            vexpand: true,
            onPrimaryClick: () => {
              if (
                MprisState.PlayerSelected.value < 0 ||
                !Mpris.players[MprisState.PlayerSelected.value].can_play
              )
                return;

              Mpris.players[MprisState.PlayerSelected.value].playPause();
            },
            child: Widget.Icon().hook(
              Mpris,
              (widget) => {
                widget.icon =
                  Mpris.players[MprisState.PlayerSelected.value]
                    ?.play_back_status === "Paused"
                    ? "media-playback-start-symbolic"
                    : "media-playback-pause-symbolic";
              },
              "player-changed"
            ),
          }),
          Widget.Button({
            className: "next",
            vexpand: true,
            onPrimaryClick: () => {
              if (
                MprisState.PlayerSelected.value < 0 ||
                !Mpris.players[MprisState.PlayerSelected.value].can_go_next
              )
                return;

              Mpris.players[MprisState.PlayerSelected.value].next();
            },
            child: Widget.Icon({ icon: "media-skip-forward-symbolic" }),
          }),
        ],
      }),
    ],
  });

const PlayerRight = () =>
  Widget.Box({
    className: "right",
    spacing: 10,
    orientation: Gtk.Orientation.VERTICAL,
    children: [
      Widget.Box({
        spacing: 10,
        children: [
          Widget.Label({
            className: "icon",
          }).poll(1000, (widget) => {
            if (MprisState.PlayerSelected.value < 0) {
              widget.label = getPlayerGlyph("");
              return;
            }

            const player = Mpris.players[MprisState.PlayerSelected.value];
            widget.label = getPlayerGlyph(player.name);
          }),
          Widget.Label({
            className: "name",
          }).poll(1000, (widget) => {
            if (MprisState.PlayerSelected.value < 0) {
              widget.label = "No players";
              return;
            }

            const player = Mpris.players[MprisState.PlayerSelected.value];
            if (player.length < 0) widget.label = player.name;
            else
              widget.label = `${player.name} (${toTimestamp(
                player.position
              )} / ${toTimestamp(player.length)})`;
          }),
          // Widget.Label({ className: "name" }).hook(Mpris, (widget) => {
          //   if (MprisState.PlayerSelected.value < 0) {
          //     widget.label = "No players";
          //     return;
          //   }

          //   const player = Mpris.players[MprisState.PlayerSelected.value];
          //   if (player.length < 0) widget.label = player.name;
          //   else
          //     widget.label = `${player.name} (${toTimestamp(
          //       player.position
          //     )} / ${toTimestamp(player.length)})`;
          // }),
        ],
      }),
      Widget.Box({
        orientation: Gtk.Orientation.VERTICAL,
        valign: Gtk.Align.CENTER,
        vexpand: true,
        children: [
          Widget.Label({
            className: "title",
            halign: Gtk.Align.START,
            // label: "Fetching title",
            setup: (widget) => {
              widget.label = "Fetching title";
              widget.hook(Mpris, (widget) => {
                if (
                  MprisState.PlayerSelected.value < 0 ||
                  !Mpris.players[MprisState.PlayerSelected.value].track_title
                ) {
                  widget.label = "No Title";
                  return;
                }

                widget.label = truncate(
                  Mpris.players[MprisState.PlayerSelected.value].track_title,
                  28
                );
              });
            },
          }),
          Widget.Label({
            className: "artist",
            halign: Gtk.Align.START,
            setup: (widget) => {
              widget.hook(Mpris, (widget) => {
                widget.label = "Fetching artist";
                if (
                  MprisState.PlayerSelected.value < 0 ||
                  !Mpris.players[MprisState.PlayerSelected.value].track_artists
                    .length ||
                  !Mpris.players[MprisState.PlayerSelected.value]
                    .track_artists[0].length
                ) {
                  widget.label = "No Artist";
                  return;
                }

                widget.label = truncate(
                  Mpris.players[
                    MprisState.PlayerSelected.value
                  ].track_artists.join(", "),
                  38
                );
              });
            },
          }),
          Widget.ProgressBar().poll(1000, (widget) => {
            if (MprisState.PlayerSelected.value < 0) return 0;

            const player = Mpris.players[MprisState.PlayerSelected.value];
            widget.value = player.position / player.length;
          }),
        ],
      }),
    ],
  });

const Player = () =>
  Widget.Window({
    name: "player",
    className: "player",
    layer: "overlay",
    exclusivity: "normal",
    anchor: ["top"],
    child: Widget.Box({
      className: "layout-box",
      children: [PlayerLeft(), PlayerRight()],
    }),
  });

export default Player;
