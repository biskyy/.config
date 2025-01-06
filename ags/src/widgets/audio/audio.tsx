import { bind, Binding, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import AstalWp from "gi://AstalWp?version=0.1";
import { microphoneIcon, speakerIcon } from "src/lib/audio";
import { isPrimaryClick, symbolicStrength, truncate } from "src/lib/utils";
import Panel, { PanelID } from "src/panel";

const wp = AstalWp.get_default();
const speaker = wp?.audio.defaultSpeaker!;
const microphone = wp?.audio.defaultMicrophone!;

interface DeviceButtonProps {
  main?: boolean | Binding<boolean | undefined> | undefined;
  icon: string | Binding<string | undefined> | undefined;
  endpoint?: AstalWp.Endpoint;
  mediaClass?: AstalWp.MediaClass;
  callback: (self: Widget.Button, event: Astal.ClickEvent) => void;
}

const MediaHeader = ({
  main,
  icon,
  endpoint,
  mediaClass,
  callback,
}: DeviceButtonProps) => {
  const isSpeaker = mediaClass === AstalWp.MediaClass.AUDIO_SPEAKER;
  const isMicrophone = mediaClass === AstalWp.MediaClass.AUDIO_MICROPHONE;
  const isStream = mediaClass === AstalWp.MediaClass.AUDIO_STREAM;
  const isRecorder = mediaClass === AstalWp.MediaClass.AUDIO_RECORDER;

  //const endpoints = isSpeaker
  //  ? wp?.audio.streams!
  //  : isMicrophone && wp?.audio.recorders!;
  //
  //if (!endpoints) return <label label="error getting list of endpoints" />;

  return (
    <box vertical spacing={5}>
      <box className="header">
        <centerbox
          css="min-width: 1.5em; padding-right: 0.5em;"
          centerWidget={
            <button
              onClick={(_, event) =>
                isPrimaryClick(event) && (endpoint!.mute = !endpoint!.mute)
              }
              className={bind(endpoint!, "mute").as((mute) =>
                mute ? "icon danger" : "icon",
              )}
              label={icon}
            />
          }
        />
        <button
          label={bind(endpoint!, "description").as((desc) =>
            truncate(desc, 50),
          )}
        />
        <box expand />
        <box>
          <label
            label={bind(endpoint!, "volume").as((vol) =>
              Math.floor(vol * 100).toString(),
            )}
          />
          <label className="icon icon-pad-l" label="" />
        </box>
        {(isSpeaker || isMicrophone) && (
          <button
            css="margin-left: 0.5rem;"
            className="icon"
            label=""
            onClick={callback}
          />
        )}
      </box>
      <slider
        className="slider"
        drawValue={false}
        value={bind(endpoint!, "volume")}
        onDragged={({ value }) => (endpoint!.volume = value)}
      />
    </box>
  );
};

interface AudioDeviceProps extends DeviceButtonProps {
  showRevealer: Variable<boolean>;
}

const AudioDevice = ({
  icon,
  endpoint,
  mediaClass,
  callback,
  showRevealer,
}: AudioDeviceProps) => {
  const isSpeaker = mediaClass === AstalWp.MediaClass.AUDIO_SPEAKER;
  const isMicrophone = mediaClass === AstalWp.MediaClass.AUDIO_MICROPHONE;
  let endpoints: keyof AstalWp.Audio;

  switch (mediaClass) {
    case AstalWp.MediaClass.AUDIO_SPEAKER:
      endpoint = wp?.audio.defaultSpeaker!;
      endpoints = "streams";
      break;

    case AstalWp.MediaClass.AUDIO_MICROPHONE:
      endpoint = wp?.audio.defaultMicrophone!;
      endpoints = "recorders";
      break;

    case AstalWp.MediaClass.AUDIO_STREAM:
      break;

    case AstalWp.MediaClass.AUDIO_RECORDER:
      break;

    default:
      break;
  }

  return (
    <box
      vertical
      className={showRevealer((show) =>
        show ? "device active" : "device inactive",
      )}
      spacing={5}
    >
      <MediaHeader
        main
        icon={icon}
        endpoint={endpoint}
        mediaClass={mediaClass}
        callback={callback}
      />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={500}
        revealChild={showRevealer()}
      >
        <box vertical spacing={5}>
          {bind(wp?.audio!, endpoints).as((streams) => {
            if (streams.length === 0)
              return <label label="there are no recorders" />;

            return streams.map((stream: AstalWp.Endpoint) => {
              const streamIcon = Variable.derive(
                [bind(stream, "volume"), bind(stream, "mute")],
                (vol, mute) => {
                  if (mute) return "";
                  return symbolicStrength(vol * 100, ["", "", ""]);
                },
              );
              return (
                <MediaHeader
                  icon={streamIcon()}
                  endpoint={stream}
                  callback={() => {}}
                />
              );
            });
          })}
        </box>
      </revealer>
    </box>
  );
};

export default function Audio() {
  //const speakerRevealerReveal = Variable(true);
  const revealStreams = Variable(false);
  const revealRecorders = Variable(false);

  return (
    <Panel
      name={PanelID.AUDIO}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      box={{
        spacing: 12,
        vertical: true,
      }}
    >
      <AudioDevice
        icon={speakerIcon()}
        mediaClass={speaker.mediaClass}
        callback={(_, event) => revealStreams.set(!revealStreams.get())}
        showRevealer={revealStreams}
      />
      <AudioDevice
        icon={microphoneIcon()}
        mediaClass={microphone.mediaClass}
        callback={(_, event) => revealRecorders.set(!revealRecorders.get())}
        showRevealer={revealRecorders}
      />
    </Panel>
  ) as Widget.Window;
}
