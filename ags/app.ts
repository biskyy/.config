import { App } from "astal/gtk3";
import style from "src/style.scss";
import { exec, monitorFile } from "astal";
import PanelManager from "src/panel-manager";
import { PanelID } from "src/panel";

globalThis.PanelManager = PanelManager;

// recompile scss on file change //
const scssFile = `${SRC}/src/style.scss`;
const cssFile = `${SRC}/style.css`;
const sassCommand = `sass -I ${SRC}/src ${scssFile} ${cssFile}`;

const recompileCSS = () => {
  try {
    exec(sassCommand);
    App.apply_css(cssFile, true);
  } catch (error) {
    console.error(error);
  }
};

monitorFile(scssFile, () => recompileCSS());

monitorFile(`${SRC}/src/widgets/bar/bar.scss`, () => recompileCSS());
monitorFile(`${SRC}/src/widgets/powermenu/powermenu.scss`, () =>
  recompileCSS(),
);
monitorFile(`${SRC}/src/widgets/glance/glance.scss`, () => recompileCSS());
monitorFile(`${SRC}/src/widgets/audio/audio.scss`, () => recompileCSS());

// ---- //

exec(sassCommand);

App.start({
  css: style,
  main() {
    PanelManager.spawnBar();
  },
});
