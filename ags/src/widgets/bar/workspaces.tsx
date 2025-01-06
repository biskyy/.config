import { bind, execAsync } from "astal";
import BarModule from "./bar-module";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Gtk } from "astal/gtk3";

export default function BarWorkspaces() {
  const Hyprland = AstalHyprland.get_default();

  return (
    <BarModule
      className="workspaces"
      box={{
        spacing: 12,
      }}
    >
      {bind(Hyprland, "workspaces").as((wss) => {
        // persistent workspaces
        // make sure to make these workspaces persistent in the hypr config too(if an inactive workspaces is selected it resets the buttons and their class names which makes the transition start from scratch, breaking animations)
        const workspaces = [
          { id: 1, glyph: "" },
          { id: 2, glyph: "" },
          { id: 3, glyph: "" },
          { id: 4, glyph: "" },
        ];

        wss
          .sort((a, b) => a.id - b.id)
          // named workspaces have negative indices
          .filter((ws) => ws.id > workspaces[workspaces.length - 1].id)
          .forEach((ws) => workspaces.push({ id: ws.id, glyph: "" })); // https://www.compart.com/en/unicode/U+200A

        return workspaces.map((ws) => (
          <button
            className={bind(Hyprland, "focusedWorkspace").as((fw) =>
              fw.id === ws.id ? "active" : "inactive",
            )}
            onClick={() => execAsync(`hyprctl dispatch workspace ${ws.id}`)}
          >
            <label
              className="icon"
              halign={Gtk.Align.CENTER}
              label={ws.glyph}
            />
          </button>
        ));
      })}
    </BarModule>
  );
}
