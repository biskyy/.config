import BarModule from "./bar-module";
import AstalWp from "gi://AstalWp?version=0.1";
import { bind } from "astal";
import {
  isMiddleClick,
  isPrimaryClick,
  isScrollDown,
  isScrollUp,
} from "src/lib/utils";
import { Astal, Gdk, Gtk } from "astal/gtk3";
import { PanelID } from "src/panel";
import { microphoneIcon, speakerIcon } from "src/lib/audio";

export default function BarAudio() {
  const wp = AstalWp.get_default()!;

  //const microphoneIcon = Variable.derive(
  //  [
  //    bind(wp.audio.defaultMicrophone, "volume"),
  //    bind(wp.audio.defaultMicrophone, "mute")j
  //  ]
  //)

  const handleVolumeScroll = (
    event: Astal.ScrollEvent,
    endpoint: AstalWp.Endpoint,
  ) => {
    const x = 0.015;
    if (isScrollUp(event)) endpoint.volume += x;
    else if (isScrollDown(event))
      if (endpoint.volume <= x) endpoint.volume = 0;
      else endpoint.volume -= x;
  };

  return (
    <BarModule
      className="audio"
      box={{
        spacing: 12,
      }}
    >
      <button
        onScroll={(_, event) =>
          handleVolumeScroll(event, wp.audio.defaultSpeaker)
        }
        onClick={(_, event) => {
          if (isPrimaryClick(event)) PanelManager.togglePanel(PanelID.AUDIO);
          else if (isMiddleClick(event))
            wp.audio.defaultSpeaker.mute = !wp.audio.defaultSpeaker.mute;
        }}
      >
        <box>
          <label
            className={bind(wp.audio.defaultSpeaker, "mute").as((mute) =>
              mute ? "icon danger" : "icon",
            )}
            label={speakerIcon()}
          />
          <label
            label={bind(wp.audio.defaultSpeaker, "volume").as(
              (volume) =>
                ` ${String(Math.floor(volume * 100)).padStart(2, "0")}`,
            )}
          />
          <label className="icon icon-pad-l" label="" />
        </box>
      </button>
      <button
        onScroll={(_, event) =>
          handleVolumeScroll(event, wp.audio.defaultMicrophone)
        }
        onClick={(_, event) => {
          if (isPrimaryClick(event)) PanelManager.togglePanel(PanelID.AUDIO);
          else if (isMiddleClick(event))
            wp.audio.defaultMicrophone.mute = !wp.audio.defaultMicrophone.mute;
        }}
      >
        <box>
          <label
            className={bind(wp.audio.defaultMicrophone, "mute").as((mute) =>
              mute ? "icon danger" : "icon",
            )}
            label={microphoneIcon()}
          />
          <label
            label={bind(wp.audio.defaultMicrophone, "volume").as(
              (volume) =>
                ` ${String(Math.floor(volume * 100)).padStart(2, "0")}`,
            )}
          />
          <label className="icon icon-pad-l" label="" />
        </box>
      </button>
    </BarModule>
  );
}
