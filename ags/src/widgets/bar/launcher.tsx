import { Gtk } from "astal/gtk3";
import BarModule from "./bar-module";
import { bind, Variable } from "astal";

export default function BarLauncher() {
  const revealLabel = Variable(false);

  return (
    <BarModule
      className="launcher"
      eventbox={{
        onClick: () => console.log("Hi"),
        onHover: () => revealLabel.set(true),
        onHoverLost: () => revealLabel.set(false),
      }}
    >
      <label label="󰣇" className="icon" />
      <revealer
        transitionDuration={500}
        transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
        revealChild={bind(revealLabel).as(Boolean)}
        css="padding-left: 10px;"
      >
        <label label="launcher" />
      </revealer>
    </BarModule>
  );
}
