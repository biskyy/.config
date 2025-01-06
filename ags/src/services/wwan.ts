import { execAsync, GObject, interval, property, register } from "astal";
import AstalNetwork from "gi://AstalNetwork?version=0.1";

@register({ GTypeName: "WWAN" })
export default class WWAN extends GObject.Object {
  static instance: WWAN;

  static get_default() {
    if (!WWAN.instance) {
      WWAN.instance = new WWAN();
    }
    return WWAN.instance;
  }

  @property(String)
  declare modemID: string;

  @property(Number)
  declare internet: AstalNetwork.Internet;

  @property(Number)
  declare signalQuality: number; // Represents signal strength (0-100)

  @property(Number)
  declare updateFrequency: number;

  constructor() {
    // @ts-ignore
    super({
      internet: AstalNetwork.Internet.DISCONNECTED,
      signalQuality: 0,
      updateFrequency: 1000,
    } as any);

    interval(this.updateFrequency, async () => {
      await this.getModemID();
      await this.updateModemInfo();
    });
  }

  async getModemID() {
    try {
      const modemIDresult = await execAsync(
        `bash -c "mmcli -L | awk '{ print $1 }'"`,
      );
      if (modemIDresult.includes("/org/freedesktop/"))
        this.modemID = modemIDresult;
      else throw new Error("modem id invalid");

      //console.log(modemIDresult);
    } catch (err) {
      console.error(err);
    }
  }

  async updateModemInfo() {
    try {
      // Get the modem state
      const modemData = await execAsync(
        `mmcli -m ${this.modemID} --output-json`,
      );
      const parsedModemData = JSON.parse(modemData);

      // Update internet state
      const state = parsedModemData.modem.generic.state;
      //console.log(state);
      switch (state) {
        case "connected":
          this.internet = AstalNetwork.Internet.CONNECTED;
          break;
        case "connecting":
          this.internet = AstalNetwork.Internet.CONNECTING;
          break;
        case "registered":
          this.internet = AstalNetwork.Internet.DISCONNECTED;
          break;
      }

      // Update signal quality
      const signal = parsedModemData.modem.generic["signal-quality"].value;
      //console.log(signal);
      this.signalQuality = signal;
    } catch (error) {
      console.error("Error updating modem state:", error);
    }
  }

  async connectToInternet() {
    try {
      this.internet = AstalNetwork.Internet.CONNECTING;
      const modemMBIMName = await execAsync(
        `bash -c "nmcli d | grep wwan0 | awk '{ print $1 }'"`,
      );
      const result = await execAsync(`nmcli d connect ${modemMBIMName}`);
      console.log("Connection attempt result:", result);
    } catch (error) {
      console.error("Error connecting to internet:", error);
      this.internet = AstalNetwork.Internet.DISCONNECTED;
    }
  }

  async disconnectFromInternet() {
    try {
      const modemMBIMName = await execAsync(
        `bash -c "nmcli d | grep wwan0 | awk '{ print $1 }'"`,
      );
      const result = await execAsync(`nmcli d disconnect ${modemMBIMName}`);
      console.log("Disconnection attempt result: ", result);
    } catch (err) {
      console.error(err);
    }
  }
}
