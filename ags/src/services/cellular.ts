import Service from "resource:///com/github/Aylur/ags/service.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

export enum ConnectionState {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  UNAVAILABLE = "unavailable",
  UNKNOWN = "unknown",
}

class CellularService extends Service {
  static {
    Service.register(
      this,
      {
        "cellular-state-changed": ["boolean"],
        "connect-success": ["boolean"],
        "cellular-enabled-changed": ["boolean"],
        "cellular-hw-enabled-changed": ["boolean"],
        "cellular-changed": [],
      },
      {
        state: ["string", "r"],
        enabled: ["boolean", "rw"],
        "hw-enabled": ["boolean", "r"],
      }
    );
  }

  #modemName = Utils.exec(
    `bash -c "nmcli device | grep wwan | awk '{print \$1}'"`
  );

  #state: ConnectionState = ConnectionState.UNKNOWN;
  #enabled = false;
  #hwEnabled = false;

  get state() {
    return this.#state;
  }

  get enabled() {
    return this.#enabled;
  }

  get hwEnabled() {
    return this.#hwEnabled;
  }

  public connectToInternet() {
    const result = Utils.exec(`nmcli device connect ${this.#modemName}`);
    console.log(result);
  }

  public disconnectFromInternet() {
    const result = Utils.exec(`nmcli device disconnect ${this.#modemName}`);
    console.log(result);
  }

  public toggleInternet() {
    if (this.#state === ConnectionState.CONNECTED)
      this.disconnectFromInternet();
    else this.connectToInternet();
  }

  set enabled(value: boolean) {
    if (value !== this.#enabled) {
      if (value) Utils.exec(`nmcli radio wwan on`);
      else Utils.exec(`nmcli radio wwan off`);
    }
  }

  constructor() {
    super();

    // setup monitor
    Utils.interval(2500, () => this.#onChange());

    // initialize
    this.#onChange();
  }

  #onChange() {
    const newState: ConnectionState = Utils.exec(
      `bash -c "nmcli device status | grep wwan | awk '{print \$3}'"`
    );
    const newEnabled = Utils.exec(`nmcli r wwan`) === "enabled";

    const newHwEnabled =
      Utils.exec(`bash -c "nmcli r | sed -n '2{p;q}' | awk '{print \$3}'"`) ===
      "enabled";

    if (newState !== this.#state) this.#stateChanged(newState);

    if (newEnabled !== this.#enabled) this.#enabledChanged(newEnabled);

    if (newHwEnabled !== this.#hwEnabled) this.#hwEnabledChanged(newHwEnabled);

    // console.log(newState, newEnabled, newHwEnabled);
  }

  #stateChanged(newState: ConnectionState) {
    this.#state = newState;
    this.changed("state");
    this.emit("cellular-state-changed", this.#state);

    this.emit("cellular-changed");
  }

  #enabledChanged(newEnabled: boolean) {
    this.#enabled = newEnabled;
    this.changed("enabled");
    this.emit("cellular-enabled-changed", this.#enabled);

    this.emit("cellular-changed");
  }

  #hwEnabledChanged(newEnabled: boolean) {
    this.#hwEnabled = newEnabled;
    this.changed("hw-enabled");
    this.emit("cellular-hw-enabled-changed", this.#hwEnabled);

    this.emit("cellular-changed");
  }
}

// the singleton instance
const service = new CellularService();

// export to use in other modules
export default service;
