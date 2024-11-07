import Service from "resource:///com/github/Aylur/ags/service.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

class BrightnessService extends Service {
  // every subclass of GObject.Object has to register itself
  static {
    // takes three arguments
    // the class itself
    // an object defining the signals
    // an object defining its properties
    Service.register(
      this,
      {
        // 'name-of-signal': [type as a string from GObject.TYPE_<type>],
        "brightness-changed": ["float"],
      },
      {
        // 'kebab-cased-name': [type as a string from GObject.TYPE_<type>, 'r' | 'w' | 'rw']
        // 'r' means readable
        // 'w' means writable
        // guess what 'rw' means
        "screen-brightness": ["float", "rw"],
      }
    );
  }

  // this Service assumes only one device with backlight
  #interface = Utils.exec("sh -c 'ls -w1 /sys/class/backlight | head -1'");

  // # prefix means private in JS
  #screenBrightness = 0;
  #max = Number(Utils.exec("brightnessctl max"));

  // the getter has to be in snake_case
  get screen_brightness() {
    return this.#screenBrightness;
  }

  // the setter has to be in snake_case too
  set screen_brightness(percent) {
    percent = Math.min(100, Math.max(0, percent));

    Utils.execAsync(`brightnessctl set ${percent}% -q`);
    // the file monitor will handle the rest
  }

  constructor() {
    super();

    // setup monitor
    const brightness = `/sys/class/backlight/${this.#interface}/brightness`;
    Utils.monitorFile(brightness, () => this.#onChange());

    // initialize
    this.#onChange();
  }

  #onChange() {
    this.#screenBrightness =
      (Number(Utils.exec("brightnessctl get")) / this.#max) * 100;

    // signals have to be explicity emitted
    this.emit("changed"); // emits "changed"
    this.notify("screen-brightness"); // emits "notify::screen-brightness"

    // or use Service.changed(propName: string) which does the above two
    // this.changed('screen-brightness');

    // emit brightness-changed with the percent as a parameter
    this.emit("brightness-changed", this.#screenBrightness);
  }

  // overwriting the connect method, let's you
  // change the default event that widgets connect to
  connect(event = "brightness-changed", callback) {
    return super.connect(event, callback);
  }
}

// the singleton instance
const service = new BrightnessService();

// export to use in other modules
export default service;
