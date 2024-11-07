import { symbolicStrength } from "src/lib/utils";

export enum BatteryState {
  Discharging = "Discharging",
  Charging = "Charging",
  NotCharging = "Not charging",
  Full = "Full",
  Invalid = "Invalid",
}

// my own battery service because the builtin doesnt work properly
class BatteryService extends Service {
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
        "battery-changed": [],
        "percentage-changed": ["float"],
        "state-changed": ["string"],
        "plugged-in-changed": ["boolean"],
        "icon-changed": ["string"],
      },
      {
        // 'kebab-cased-name': [type as a string from GObject.TYPE_<type>, 'r' | 'w' | 'rw']
        // 'r' means readable
        // 'w' means writable
        // guess what 'rw' means
        percentage: ["float", "r"],
        state: ["string", "r"],
        pluggedIn: ["boolean", "r"],
        icon: ["string", "r"],
      }
    );
  }

  // # prefix means private in JS
  #percentage = 0;

  #state: BatteryState = BatteryState.Invalid;

  #pluggedIn = false;

  #icon = "";

  // the getter has to be in snake_case
  get percentage() {
    return this.#percentage;
  }

  get state() {
    return this.#state;
  }

  get pluggedIn() {
    return this.#pluggedIn;
  }

  get icon() {
    return this.#icon;
  }

  constructor() {
    super();

    Utils.interval(2500, () => this.#onChange());

    // initialize
    this.#onChange();
  }

  #onChange() {
    const newPercentage = Number(
      Utils.exec("cat /sys/class/power_supply/BAT0/capacity")
    );
    const newState: BatteryState = Utils.exec(
      "cat /sys/class/power_supply/BAT0/status"
    );
    const newPluggedIn = Boolean(
      Number(Utils.exec("cat /sys/class/power_supply/AC/online"))
    );

    if (newPercentage !== this.#percentage)
      this.#percentageChanged(newPercentage);

    if (newState !== this.#state) this.#stateChanged(newState);

    if (newPluggedIn !== this.#pluggedIn) this.#pluggedInChanged(newPluggedIn);
  }

  #percentageChanged(newPercentage: number) {
    this.#percentage = newPercentage;
    this.changed("percentage");
    this.emit("percentage-changed", this.#percentage);

    let newIcon = symbolicStrength({
      value: this.#percentage,
      array: [" ", " ", " ", " ", " "],
    });
    if (this.#icon !== newIcon) this.#iconChanged(newIcon);

    this.emit("battery-changed");
  }

  #iconChanged(newIcon: string) {
    this.#icon = newIcon;
    this.changed("icon");
    this.emit("icon-changed", this.#icon);
  }

  #stateChanged(newState: BatteryState) {
    this.#state = newState;
    this.changed("state");
    this.emit("state-changed", this.#state);

    this.emit("battery-changed");
  }

  #pluggedInChanged(newPluggedIn: boolean) {
    this.#pluggedIn = newPluggedIn;
    this.changed("pluggedIn");
    this.emit("plugged-in-changed", this.#pluggedIn);

    this.emit("battery-changed");
  }

  // overwriting the connect method, let's you
  // change the default event that widgets connect to
  // connect(event = "battery-changed", callback) {
  // return super.connect(event, callback);
  // }
}

// the singleton instance
const service = new BatteryService();

// export to use in other modules
export default service;
