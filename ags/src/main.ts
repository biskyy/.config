import WindowHandler from "./windowHandler";

// main scss file
const scss = `${App.configDir}/src/style.scss`;

// target css file
const css = `/tmp/ags/style.css`;

Utils.readFileAsync("css").catch((err) => {
  console.error(err);
  Utils.exec(`sudo sass ${scss} ${css}`);
  App.resetCss();
  App.applyCss(css);
});

Utils.monitorFile(
  // directory that contains the scss files
  `${App.configDir}/src`,

  // reload function
  function () {
    // compile, reset, apply
    Utils.exec(`sudo sass ${scss} ${css}`);
    App.resetCss();
    App.applyCss(css);
  },
  { recursive: true }
);

App.config({
  // style: css,
  windows: [WindowHandler.spawnBar()],
});
