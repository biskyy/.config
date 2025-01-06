import {
  exec,
  execAsync,
  GObject,
  monitorFile,
  property,
  readFileAsync,
  register,
} from "astal";

const get = (args: string): number => Number(exec(`brightnessctl ${args}`));
const screen = exec(`bash -c "ls -w1 /sys/class/backlight | head -1"`);
const kbd = exec(
  `bash -c "ls -w1 /sys/class/leds | grep '::kbd_backlight$' | head -1"`,
);

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
  static instance: Brightness;

  static get_default(): Brightness {
    if (!Brightness.instance) {
      Brightness.instance = new Brightness();
    }
    return Brightness.instance;
  }

  #kbdMax = kbd?.length ? get(`--device ${kbd} max`) : 0;
  #kbd = kbd?.length ? get(`--device ${kbd} get`) : 0;
  #screenMax = screen?.length ? get(`--device ${screen} max`) : 0;
  #screen = screen?.length
    ? (get(`--device ${screen} get`) / (get(`--device ${screen} max`) || 1)) *
      100
    : 0;

  @property(Number)
  get kbd(): number {
    return this.#kbd;
  }

  @property(Number)
  get screen(): number {
    return this.#screen;
  }

  set kbd(value: number) {
    if (value < 0 || value > this.#kbdMax || !kbd?.length) return;

    execAsync(`brightnessctl -d ${kbd} s ${value} -q`).then(() => {
      this.#kbd = value;
      this.notify("kbd");
    });
  }

  set screen(percent: number) {
    if (!screen?.length) return;

    percent = Math.floor(percent);

    if (percent < 0) percent = 0;

    if (percent > 100) percent = 100;

    execAsync(`brightnessctl set ${percent}% -d ${screen} -q`).then(() => {
      this.#screen = percent;
      this.notify("screen");
    });
  }

  constructor() {
    super();

    const screenPath = `/sys/class/backlight/${screen}/brightness`;
    const kbdPath = `/sys/class/leds/${kbd}/brightness`;

    monitorFile(screenPath, async (f) => {
      const v = await readFileAsync(f);
      this.#screen = (Number(v) / this.#screenMax) * 100;
      this.notify("screen");
    });

    monitorFile(kbdPath, async (f) => {
      const v = await readFileAsync(f);
      this.#kbd = Number(v) / this.#kbdMax;
      this.notify("kbd");
    });
  }
}
