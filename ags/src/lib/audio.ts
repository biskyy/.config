import { bind, Variable } from "astal";
import AstalWp from "gi://AstalWp?version=0.1";
import { symbolicStrength } from "./utils";

const wp = AstalWp.get_default();

export const speakerIcon = Variable.derive(
  [
    bind(wp?.audio.defaultSpeaker!, "volume"),
    bind(wp?.audio.defaultSpeaker!, "mute"),
  ],
  (volume, mute) => {
    if (mute) return "";
    return symbolicStrength(volume * 100, ["", "", ""]);
  },
);

export const microphoneIcon = Variable.derive(
  [bind(wp?.audio.defaultMicrophone!, "mute")],
  (mute) => {
    if (mute) return "";
    return "";
  },
);
