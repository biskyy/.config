const entry = App.configDir + "/src/main.ts";
const outdir = "/tmp/ags/";

try {
  await Utils.execAsync([
    "bun",
    "build",
    entry,
    "--outdir",
    outdir,
    "--external",
    "resource://*",
    "--external",
    "gi://*",
  ]);
  await import(`file://${outdir}/main.js`);
} catch (error) {
  console.error(error);
}

// const main = await import(`file://${outdir}/main.js`);
// export default main.default;
